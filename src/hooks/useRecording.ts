import { useState, useCallback, useEffect, useRef } from 'react';
import {
  startRecording,
  stopRecording,
  cancelRecording,
  requestPermissions,
  getMeteringLevel,
  RecordingResult,
} from '../services/audio/recorder';
import {
  loadAudio,
  playAudio,
  pauseAudio,
  stopAudio,
  unloadAudio,
  setPlaybackCallback,
} from '../services/audio/player';

interface UseRecordingResult {
  isRecording: boolean;
  isPreviewing: boolean;
  isPlaying: boolean;
  duration: number;
  durationMs: number;
  meteringLevel: number;
  recordingUri: string | null;
  hasPermission: boolean;
  start: () => Promise<boolean>;
  stop: () => Promise<RecordingResult | null>;
  cancel: () => Promise<void>;
  preview: () => Promise<void>;
  stopPreview: () => Promise<void>;
  discard: () => void;
}

export function useRecording(): UseRecordingResult {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [meteringLevel, setMeteringLevel] = useState(-160);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const meteringInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkPermission();
    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
      if (meteringInterval.current) {
        clearInterval(meteringInterval.current);
      }
      unloadAudio();
    };
  }, []);

  const checkPermission = async () => {
    const granted = await requestPermissions();
    setHasPermission(granted);
  };

  const start = useCallback(async (): Promise<boolean> => {
    if (!hasPermission) {
      const granted = await requestPermissions();
      setHasPermission(granted);
      if (!granted) return false;
    }

    const success = await startRecording();
    if (success) {
      setIsRecording(true);
      setDuration(0);
      setDurationMs(0);
      setMeteringLevel(-160);
      setRecordingUri(null);

      // Update duration every 50ms for smooth timer
      const startTime = Date.now();
      durationInterval.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        setDurationMs(elapsed);
        setDuration(Math.floor(elapsed / 1000));
      }, 50);

      // Update metering every 50ms for smooth waveform
      meteringInterval.current = setInterval(async () => {
        const level = await getMeteringLevel();
        setMeteringLevel(level);
      }, 50);
    }
    return success;
  }, [hasPermission]);

  const stop = useCallback(async (): Promise<RecordingResult | null> => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
    if (meteringInterval.current) {
      clearInterval(meteringInterval.current);
      meteringInterval.current = null;
    }

    const result = await stopRecording();
    setIsRecording(false);

    if (result) {
      setRecordingUri(result.uri);
      setDuration(result.duration);
      setIsPreviewing(true);

      await loadAudio(result.uri);
      setPlaybackCallback((status) => {
        if (status.isLoaded) {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      });
    }

    return result;
  }, []);

  const cancel = useCallback(async (): Promise<void> => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
    if (meteringInterval.current) {
      clearInterval(meteringInterval.current);
      meteringInterval.current = null;
    }

    await cancelRecording();
    setIsRecording(false);
    setDuration(0);
    setDurationMs(0);
    setMeteringLevel(-160);
    setRecordingUri(null);
    setIsPreviewing(false);
    setIsPlaying(false);
    await unloadAudio();
  }, []);

  const preview = useCallback(async (): Promise<void> => {
    if (isPlaying) {
      await pauseAudio();
      setIsPlaying(false);
    } else {
      await playAudio();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const stopPreview = useCallback(async (): Promise<void> => {
    await stopAudio();
    setIsPlaying(false);
  }, []);

  const discard = useCallback((): void => {
    setRecordingUri(null);
    setDuration(0);
    setIsPreviewing(false);
    setIsPlaying(false);
    unloadAudio();
  }, []);

  return {
    isRecording,
    isPreviewing,
    isPlaying,
    duration,
    durationMs,
    meteringLevel,
    recordingUri,
    hasPermission,
    start,
    stop,
    cancel,
    preview,
    stopPreview,
    discard,
  };
}
