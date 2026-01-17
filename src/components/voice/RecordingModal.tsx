import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecording } from '../../hooks/useRecording';
import { uploadMedia } from '../../services/supabase/media';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { formatDuration } from '../../utils/formatters';

interface RecordingModalProps {
  visible: boolean;
  onClose: () => void;
  onRecordingComplete: () => void;
  onRecordingStateChange?: (isRecording: boolean) => void;
  userId?: string;
  autoStart?: boolean;
}

export interface RecordingModalRef {
  startRecording: () => void;
  stopAndClose: () => void;
}

const RecordingModal = forwardRef<RecordingModalRef, RecordingModalProps>(({
  visible,
  onClose,
  onRecordingComplete,
  onRecordingStateChange,
  userId,
  autoStart = false,
}, ref) => {
  const {
    isRecording,
    duration,
    start,
    stop,
    cancel,
    discard,
  } = useRecording();

  const [saving, setSaving] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

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
    }
  }, [visible, autoStart, hasAutoStarted, isRecording, start]);

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Recording</Text>
          <View style={styles.closeButton} />
        </View>

        <View style={styles.recordingSection}>
          <View style={styles.timerContainer}>
            <Text style={styles.timer}>{formatDuration(duration)}</Text>
            {isRecording && <Text style={styles.recordingLabel}>Recording...</Text>}
            {saving && <Text style={styles.savingLabel}>Saving...</Text>}
          </View>

          {saving ? (
            <View style={styles.savingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordButtonActive]}
              onPress={stopSaveAndClose}
              activeOpacity={0.8}
              disabled={saving}
            >
              <View style={[styles.recordInner, isRecording && styles.recordInnerActive]} />
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  closeButton: {
    width: 60,
    paddingVertical: spacing.sm,
  },
  closeText: {
    ...typography.button,
    color: colors.primary,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  recordingSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  timer: {
    fontSize: 64,
    fontWeight: '200',
    color: colors.text,
  },
  recordingLabel: {
    ...typography.body,
    color: colors.recording,
    marginTop: spacing.sm,
  },
  savingLabel: {
    ...typography.body,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  savingContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.recording,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  recordButtonActive: {
    borderColor: colors.recording,
  },
  recordInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.recording,
  },
  recordInnerActive: {
    width: 30,
    height: 30,
    borderRadius: 4,
  },
});

export default RecordingModal;
