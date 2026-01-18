import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRecording } from '../../hooks/useRecording';
import { uploadMedia } from '../../services/supabase/media';
import { colors } from '../../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const WAVEFORM_BARS = 60;
const BAR_WIDTH = 2;
const BAR_GAP = 2;
const MAX_BAR_HEIGHT = 80;

interface RecordingModalProps {
  visible: boolean;
  onClose: () => void;
  onRecordingComplete: () => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  userId?: string;
  autoStart?: boolean;
  recordingNumber?: number;
}

export interface RecordingModalRef {
  startRecording: () => void;
  stopAndClose: () => void;
}

// Format duration as MM:SS.CC
function formatDurationWithCentiseconds(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
}

// Convert dB level (-160 to 0) to normalized value (0 to 1)
function normalizeLevel(db: number): number {
  // Typical speech is around -20 to -10 dB
  // Silence is around -160 dB
  const minDb = -60;
  const maxDb = 0;
  const normalized = (db - minDb) / (maxDb - minDb);
  return Math.max(0, Math.min(1, normalized));
}

const RecordingModal = forwardRef<RecordingModalRef, RecordingModalProps>(({
  visible,
  onClose,
  onRecordingComplete,
  onRecordingStateChange,
  userId,
  autoStart = false,
  recordingNumber = 1,
}, ref) => {
  const insets = useSafeAreaInsets();
  const {
    isRecording,
    durationMs,
    meteringLevel,
    start,
    stop,
    cancel,
    discard,
  } = useRecording();

  const [saving, setSaving] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>(new Array(WAVEFORM_BARS).fill(0));
  const waveformRef = useRef<number[]>(new Array(WAVEFORM_BARS).fill(0));

  // Notify parent of recording state changes
  useEffect(() => {
    onRecordingStateChange?.(isRecording);
  }, [isRecording, onRecordingStateChange]);

  // Auto-start recording when modal becomes visible
  useEffect(() => {
    if (visible && autoStart && !hasAutoStarted && !isRecording) {
      setHasAutoStarted(true);
      start();
    }
    if (!visible) {
      setHasAutoStarted(false);
      setWaveformData(new Array(WAVEFORM_BARS).fill(0));
      waveformRef.current = new Array(WAVEFORM_BARS).fill(0);
    }
  }, [visible, autoStart, hasAutoStarted, isRecording, start]);

  // Update waveform data when metering changes
  useEffect(() => {
    if (isRecording) {
      const normalized = normalizeLevel(meteringLevel);
      // Shift waveform data and add new value
      const newData = [...waveformRef.current.slice(1), normalized];
      waveformRef.current = newData;
      setWaveformData(newData);
    }
  }, [meteringLevel, isRecording]);

  // Stop and save recording, then close
  const stopSaveAndClose = async () => {
    if (!isRecording) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      const result = await stop();

      if (result?.uri) {
        // Upload immediately
        const response = await fetch(result.uri);
        const blob = await response.blob();
        await uploadMedia(blob, 'audio', {
          userId,
          duration: result.duration,
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
      if (!isRecording) {
        start();
      }
    },
    stopAndClose: stopSaveAndClose,
  }), [isRecording, start, stopSaveAndClose]);

  const handleClose = async () => {
    if (isRecording) {
      await cancel();
    }
    discard();
    onClose();
  };

  // Render waveform bars
  const renderWaveform = () => {
    return (
      <View style={styles.waveformContainer}>
        {waveformData.map((level, index) => {
          // Add some variation and minimum height
          const height = Math.max(2, level * MAX_BAR_HEIGHT);
          return (
            <View
              key={index}
              style={[
                styles.waveformBar,
                { height },
              ]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Tap backdrop to cancel */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Bottom sheet */}
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          {/* Handle bar */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Title */}
          <Text style={styles.title}>New Recording {recordingNumber}</Text>

          {/* Timer */}
          <Text style={styles.timer}>
            {formatDurationWithCentiseconds(durationMs)}
          </Text>

          {/* Waveform */}
          {renderWaveform()}

          {/* Stop button */}
          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopSaveAndClose}
            activeOpacity={0.8}
            disabled={saving}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    alignItems: 'center',
    minHeight: SCREEN_HEIGHT * 0.42,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#5C5C5E',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  timer: {
    fontSize: 16,
    fontWeight: '400',
    color: '#8E8E93',
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: MAX_BAR_HEIGHT,
    width: SCREEN_WIDTH - 40,
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
    backgroundColor: '#3A3A3C',
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
