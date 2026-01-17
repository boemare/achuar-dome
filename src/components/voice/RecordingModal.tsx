import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRecording } from '../../hooks/useRecording';
import { supabase } from '../../services/supabase/client';
import { uploadMedia } from '../../services/supabase/media';
import { Species } from '../../types/observation';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { formatDuration } from '../../utils/formatters';

interface RecordingModalProps {
  visible: boolean;
  onClose: () => void;
  onRecordingComplete: () => void;
  userId?: string;
}

export default function RecordingModal({
  visible,
  onClose,
  onRecordingComplete,
  userId,
}: RecordingModalProps) {
  const {
    isRecording,
    isPreviewing,
    isPlaying,
    duration,
    recordingUri,
    start,
    stop,
    cancel,
    preview,
    discard,
  } = useRecording();

  const [species, setSpecies] = useState<Species[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadingSpecies, setLoadingSpecies] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchSpecies();
    }
  }, [visible]);

  const fetchSpecies = async () => {
    setLoadingSpecies(true);
    const { data, error } = await supabase
      .from('species')
      .select('*')
      .order('name');

    if (!error && data) {
      setSpecies(data);
    }
    setLoadingSpecies(false);
  };

  const handleRecordPress = async () => {
    if (isRecording) {
      await stop();
    } else {
      await start();
    }
  };

  const handleSave = async () => {
    if (!recordingUri) return;

    setUploading(true);
    try {
      const response = await fetch(recordingUri);
      const blob = await response.blob();

      await uploadMedia(blob, 'audio', {
        userId,
        speciesId: selectedSpecies || undefined,
        duration,
      });

      onRecordingComplete();
      handleClose();
    } catch (error) {
      console.error('Failed to upload recording:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    discard();
    setSelectedSpecies(null);
    onClose();
  };

  const handleCancel = async () => {
    await cancel();
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
          <Text style={styles.title}>Voice Recording</Text>
          <View style={styles.closeButton} />
        </View>

        {!isPreviewing ? (
          <View style={styles.recordingSection}>
            <View style={styles.timerContainer}>
              <Text style={styles.timer}>{formatDuration(duration)}</Text>
              {isRecording && <Text style={styles.recordingLabel}>Recording...</Text>}
            </View>

            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.recordButtonActive]}
              onPress={handleRecordPress}
              activeOpacity={0.8}
            >
              <View style={[styles.recordInner, isRecording && styles.recordInnerActive]} />
            </TouchableOpacity>

            {isRecording && (
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.previewSection}>
            <View style={styles.previewCard}>
              <Text style={styles.previewDuration}>{formatDuration(duration)}</Text>
              <TouchableOpacity
                style={styles.playButton}
                onPress={preview}
                activeOpacity={0.8}
              >
                <Text style={styles.playButtonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.speciesLabel}>Select Species (Optional)</Text>
            {loadingSpecies ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.speciesList}
              >
                {species.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.speciesChip,
                      selectedSpecies === s.id && styles.speciesChipSelected,
                    ]}
                    onPress={() =>
                      setSelectedSpecies(selectedSpecies === s.id ? null : s.id)
                    }
                  >
                    <Text
                      style={[
                        styles.speciesText,
                        selectedSpecies === s.id && styles.speciesTextSelected,
                      ]}
                    >
                      {s.nameAchuar || s.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.discardButton}
                onPress={discard}
                disabled={uploading}
              >
                <Text style={styles.discardText}>Discard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, uploading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color={colors.textLight} />
                ) : (
                  <Text style={styles.saveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

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
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  cancelText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  previewSection: {
    flex: 1,
    padding: spacing.xl,
  },
  previewCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  previewDuration: {
    fontSize: 48,
    fontWeight: '300',
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  playButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.full,
  },
  playButtonText: {
    ...typography.button,
    color: colors.text,
  },
  speciesLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  speciesList: {
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  speciesChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  speciesChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  speciesText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  speciesTextSelected: {
    color: colors.textLight,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
  discardButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  discardText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    ...typography.button,
    color: colors.textLight,
  },
});
