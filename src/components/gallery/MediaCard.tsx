import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MediaItem } from '../../types/media';
import { colors } from '../../constants/colors';
import { t } from '../../i18n';
import { spacing, borderRadius } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { formatDuration } from '../../utils/formatters';

interface MediaCardProps {
  item: MediaItem;
  onPress: () => void;
  size?: number;
}

export default function MediaCard({ item, onPress, size = 120 }: MediaCardProps) {
  const renderContent = () => {
    switch (item.type) {
      case 'photo':
        return (
          <Image
            source={{ uri: item.thumbnailUrl || item.url }}
            style={[styles.image, { width: size, height: size }]}
            resizeMode="cover"
          />
        );
      case 'video':
        return (
          <View style={[styles.mediaPlaceholder, { width: size, height: size }]}>
            <Image
              source={{ uri: item.thumbnailUrl || item.url }}
              style={[styles.image, { width: size, height: size }]}
              resizeMode="cover"
            />
            <View style={styles.videoOverlay}>
              <Text style={styles.playIcon}>{t('play')}</Text>
              {item.duration && (
                <Text style={styles.duration}>{formatDuration(item.duration)}</Text>
              )}
            </View>
          </View>
        );
      case 'audio':
        return (
          <View style={[styles.audioCard, { width: size, height: size }]}>
            <Text style={styles.audioIcon}>Audio</Text>
            {item.duration && (
              <Text style={styles.audioDuration}>{formatDuration(item.duration)}</Text>
            )}
          </View>
        );
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: size, height: size }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {renderContent()}
      <View style={styles.typeIndicator}>
        <Text style={styles.typeText}>
          {item.type === 'photo'
            ? t('filterPhotos').slice(0, -1)
            : item.type === 'video'
            ? t('filterVideos')
            : t('filterAudio')}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    backgroundColor: colors.backgroundDark,
  },
  mediaPlaceholder: {
    backgroundColor: colors.backgroundDark,
    position: 'relative',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 32,
    color: colors.textLight,
  },
  duration: {
    ...typography.caption,
    color: colors.textLight,
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  audioCard: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioIcon: {
    fontSize: 32,
    color: colors.textLight,
    marginBottom: spacing.xs,
  },
  audioDuration: {
    ...typography.caption,
    color: colors.textLight,
  },
  typeIndicator: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeText: {
    ...typography.caption,
    color: colors.textLight,
    fontSize: 10,
  },
});
