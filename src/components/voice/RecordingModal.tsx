import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecording } from '../../hooks/useRecording';
import { uploadMedia } from '../../services/supabase/media';
import { transcribeAudio } from '../../services/ai/transcribe';
import { colors } from '../../constants/colors';

// Try to load native speech recognition; falls back to null in Expo Go
let SpeechModule: any = null;
try {
  SpeechModule = require('expo-speech-recognition').ExpoSpeechRecognitionModule;
} catch {
  // Native module not available — will fall back to Gemini transcription
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BAR_WIDTH = 2;
const BAR_GAP = 2;
const WAVEFORM_PADDING = 16;
const WAVEFORM_BARS = Math.floor((SCREEN_WIDTH - WAVEFORM_PADDING * 2) / (BAR_WIDTH + BAR_GAP));
const MAX_BAR_HEIGHT = 80;

interface RecordingModalProps {
  visible: boolean;
  onClose: () => void;
  onRecordingComplete: () => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  onTranscription?: (text: string) => void;
  userId?: string;
  autoStart?: boolean;
  recordingNumber?: number;
}

export interface RecordingModalRef {
  startRecording: () => void;
  stopAndClose: () => void;
}

function formatDurationWithCentiseconds(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
}

function normalizeLevel(db: number): number {
  const minDb = -60;
  const maxDb = 0;
  const normalized = (db - minDb) / (maxDb - minDb);
  return Math.max(0, Math.min(1, normalized));
}

function normalizeSpeechVolume(volume: number): number {
  const min = -2;
  const max = 10;
  return Math.max(0, Math.min(1, (volume - min) / (max - min)));
}

const RecordingModal = forwardRef<RecordingModalRef, RecordingModalProps>(({
  visible,
  onClose,
  onRecordingComplete,
  onRecordingStateChange,
  onTranscription,
  userId,
  autoStart = false,
  recordingNumber = 1,
}, ref) => {
  const insets = useSafeAreaInsets();
  const isDictation = !!onTranscription;
  // Use native speech recognition when available; otherwise fall back to Gemini
  const useNativeSpeech = isDictation && !!SpeechModule;
  const useGeminiFallback = isDictation && !SpeechModule;

  // --- Audio recording state (gallery mode + Gemini fallback) ---
  const {
    isRecording,
    durationMs,
    meteringLevel,
    start,
    stop,
    cancel,
    discard,
  } = useRecording();

  // --- Speech recognition state (native dictation mode) ---
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [dictationDurationMs, setDictationDurationMs] = useState(0);
  const dictationStartRef = useRef<number | null>(null);
  const dictationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef('');

  // --- Gemini fallback state ---
  const [geminiTranscribing, setGeminiTranscribing] = useState(false);

  const [saving, setSaving] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>(new Array(WAVEFORM_BARS).fill(0));
  const waveformRef = useRef<number[]>(new Array(WAVEFORM_BARS).fill(0));

  // Determine if actively running
  const isActive = useNativeSpeech ? recognizing : isRecording;
  const currentDurationMs = useNativeSpeech ? dictationDurationMs : durationMs;

  // --- Native speech recognition: imperative listeners (avoids hook-at-top-level issue) ---
  useEffect(() => {
    if (!SpeechModule || !visible || !isDictation) return;

    const listeners = [
      SpeechModule.addListener('start', () => setRecognizing(true)),
      SpeechModule.addListener('end', () => setRecognizing(false)),
      SpeechModule.addListener('result', (event: any) => {
        const text = event.results?.[0]?.transcript ?? '';
        transcriptRef.current = text;
        setTranscript(text);
      }),
      SpeechModule.addListener('error', (event: any) => {
        console.error('Speech recognition error:', event.error, event.message);
        if (event.error !== 'no-speech') {
          setRecognizing(false);
        }
      }),
      SpeechModule.addListener('volumechange', (event: any) => {
        const normalized = normalizeSpeechVolume(event.value);
        const newData = [...waveformRef.current.slice(1), normalized];
        waveformRef.current = newData;
        setWaveformData(newData);
      }),
    ];

    return () => {
      listeners.forEach((l: any) => l.remove());
    };
  }, [visible, isDictation]);

  // Notify parent of recording state changes
  useEffect(() => {
    onRecordingStateChange?.(isActive);
  }, [isActive, onRecordingStateChange]);

  // Dictation timer (native mode)
  useEffect(() => {
    if (recognizing) {
      dictationStartRef.current = Date.now();
      dictationTimerRef.current = setInterval(() => {
        if (dictationStartRef.current) {
          setDictationDurationMs(Date.now() - dictationStartRef.current);
        }
      }, 50);
    } else {
      if (dictationTimerRef.current) {
        clearInterval(dictationTimerRef.current);
        dictationTimerRef.current = null;
      }
    }
    return () => {
      if (dictationTimerRef.current) {
        clearInterval(dictationTimerRef.current);
      }
    };
  }, [recognizing]);

  const startDictation = useCallback(async () => {
    if (!SpeechModule) return;
    const result = await SpeechModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn('Speech recognition permissions not granted');
      return;
    }
    setTranscript('');
    transcriptRef.current = '';
    setDictationDurationMs(0);
    SpeechModule.start({
      lang: 'es-ES',
      interimResults: true,
      continuous: true,
      maxAlternatives: 1,
      addsPunctuation: true,
    });
  }, []);

  // Auto-start when modal becomes visible
  useEffect(() => {
    if (visible && autoStart && !hasAutoStarted && !isActive) {
      setHasAutoStarted(true);
      if (useNativeSpeech) {
        startDictation();
      } else {
        start();
      }
    }
    if (!visible) {
      setHasAutoStarted(false);
      setTranscript('');
      transcriptRef.current = '';
      setDictationDurationMs(0);
      setGeminiTranscribing(false);
      setWaveformData(new Array(WAVEFORM_BARS).fill(0));
      waveformRef.current = new Array(WAVEFORM_BARS).fill(0);
    }
  }, [visible, autoStart, hasAutoStarted, isActive, useNativeSpeech, start, startDictation]);

  // Update waveform from audio metering (gallery mode + Gemini fallback)
  useEffect(() => {
    if (!useNativeSpeech && isRecording) {
      const normalized = normalizeLevel(meteringLevel);
      const newData = [...waveformRef.current.slice(1), normalized];
      waveformRef.current = newData;
      setWaveformData(newData);
    }
  }, [meteringLevel, isRecording, useNativeSpeech]);

  // Stop and save/complete
  const stopSaveAndClose = async () => {
    if (!isActive && !geminiTranscribing) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      if (useNativeSpeech) {
        // Native: stop speech recognition and pass transcript
        SpeechModule.stop();
        await new Promise((r) => setTimeout(r, 300));
        const finalText = transcriptRef.current.trim();
        if (finalText) {
          onTranscription!(finalText);
        }
        onRecordingComplete();
        return;
      }

      // Stop audio recording (used by both gallery and Gemini fallback)
      const result = await stop();

      if (useGeminiFallback && result?.uri) {
        // Gemini fallback: transcribe the recorded audio via API
        setGeminiTranscribing(true);
        try {
          const text = await transcribeAudio(result.uri);

          // Upload audio + transcription to Supabase
          try {
            await uploadMedia(new Blob(), 'audio', {
              userId,
              duration: result.duration,
              transcription: text.trim(),
              fileUri: result.uri,
            });
          } catch (uploadErr) {
            console.warn('Audio upload failed (transcription still saved):', uploadErr);
          }

          discard();
          if (text.trim()) {
            onTranscription!(text.trim());
          }
          onRecordingComplete();
        } catch (error) {
          console.error('Gemini transcription failed:', error);
          discard();
          onClose();
        } finally {
          setGeminiTranscribing(false);
        }
        return;
      }

      // Gallery mode: upload actual audio file to Supabase
      if (result?.uri) {
        await uploadMedia(new Blob(), 'audio', {
          userId,
          duration: result.duration,
          fileUri: result.uri,
        });
      }

      discard();
      onRecordingComplete();
    } catch (error) {
      console.error('Failed to save recording:', error);
      discard();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // Expose imperative methods
  useImperativeHandle(ref, () => ({
    startRecording: () => {
      if (!isActive) {
        if (useNativeSpeech) {
          startDictation();
        } else {
          start();
        }
      }
    },
    stopAndClose: stopSaveAndClose,
  }), [isActive, useNativeSpeech, start, startDictation, stopSaveAndClose]);

  const handleClose = async () => {
    if (useNativeSpeech && recognizing) {
      SpeechModule.abort();
    } else if (isRecording) {
      await cancel();
    }
    if (!useNativeSpeech) discard();
    onClose();
  };

  const renderWaveform = () => (
    <View style={styles.waveformContainer}>
      {waveformData.map((level, index) => {
        const height = Math.max(2, level * MAX_BAR_HEIGHT);
        return (
          <View
            key={index}
            style={[styles.waveformBar, { height }]}
          />
        );
      })}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          <Text style={styles.title}>
            {isDictation ? 'Dictado de voz' : `New Recording ${recordingNumber}`}
          </Text>

          <Text style={styles.timer}>
            {formatDurationWithCentiseconds(currentDurationMs)}
          </Text>

          {/* Live transcript (native dictation) */}
          {useNativeSpeech && (
            <ScrollView style={styles.transcriptContainer} contentContainerStyle={styles.transcriptContent}>
              <Text style={styles.transcriptText}>
                {transcript || 'Escuchando...'}
              </Text>
            </ScrollView>
          )}

          {/* Gemini fallback: show waveform while recording, then spinner */}
          {useGeminiFallback && !geminiTranscribing && renderWaveform()}
          {geminiTranscribing && (
            <View style={styles.transcribingContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.transcribingText}>Transcribiendo...</Text>
            </View>
          )}

          {/* Gallery mode: waveform */}
          {!isDictation && renderWaveform()}

          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopSaveAndClose}
            activeOpacity={0.8}
            disabled={saving || geminiTranscribing}
          >
            <View style={styles.stopButtonInner} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    alignItems: 'center',
    minHeight: SCREEN_HEIGHT * 0.42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  timer: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textMuted,
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  transcriptContainer: {
    maxHeight: 100,
    width: SCREEN_WIDTH - 48,
    marginTop: 16,
    marginBottom: 8,
  },
  transcriptContent: {
    paddingHorizontal: 8,
  },
  transcriptText: {
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  transcribingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 24,
  },
  transcribingText: {
    fontSize: 15,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: MAX_BAR_HEIGHT,
    width: SCREEN_WIDTH,
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  waveformBar: {
    width: BAR_WIDTH,
    marginHorizontal: BAR_GAP / 2,
    backgroundColor: colors.primary,
    borderRadius: 1,
  },
  stopButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  stopButtonInner: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.recording || '#FF3B30',
  },
});

export default RecordingModal;
