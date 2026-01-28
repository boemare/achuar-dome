import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import MediaGrid from '../../components/gallery/MediaGrid';
import { useMedia } from '../../hooks/useMedia';
import { MediaItem, MediaType } from '../../types/media';
import { colors } from '../../constants/colors';
import { t } from '../../i18n';
import { spacing, borderRadius } from '../../constants/spacing';
import { typography } from '../../constants/typography';

type FilterType = 'all' | MediaType;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: t('filterAll') },
  { key: 'photo', label: t('filterPhotos') },
  { key: 'video', label: t('filterVideos') },
  { key: 'audio', label: t('filterAudio') },
];

export default function GalleryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { media, loading, error, refresh, setFilter } = useMedia();

  const handleFilterPress = (filterKey: FilterType) => {
    setActiveFilter(filterKey);
    setFilter(filterKey === 'all' ? undefined : { type: filterKey });
  };

  const handleMediaPress = (item: MediaItem) => {
    navigation.navigate('MediaDetail', { mediaId: item.id, mediaType: item.type });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('galleryTitle')}</Text>
      </View>

      <View style={styles.filterContainer}>
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              activeFilter === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => handleFilterPress(filter.key)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <MediaGrid
        media={media}
        loading={loading}
        error={error}
        onRefresh={refresh}
        onMediaPress={handleMediaPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  filterButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.textLight,
    fontWeight: '600',
  },
});
