import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Text,
  ActivityIndicator,
} from 'react-native';
import { MediaItem } from '../../types/media';
import MediaCard from './MediaCard';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/spacing';
import { typography } from '../../constants/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const CARD_GAP = spacing.sm;
const CARD_SIZE = (SCREEN_WIDTH - spacing.md * 2 - CARD_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

interface MediaGridProps {
  media: MediaItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onMediaPress: (item: MediaItem) => void;
}

export default function MediaGrid({
  media,
  loading,
  error,
  onRefresh,
  onMediaPress,
}: MediaGridProps) {
  const renderItem = ({ item }: { item: MediaItem }) => (
    <View style={styles.cardContainer}>
      <MediaCard item={item} onPress={() => onMediaPress(item)} size={CARD_SIZE} />
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>Loading media...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorIcon}>!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText}>Pull down to retry</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>Empty</Text>
        <Text style={styles.emptyText}>No media yet</Text>
        <Text style={styles.emptySubtext}>Record voice notes or take photos to get started</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={media}
      renderItem={renderItem}
      keyExtractor={(item) => `${item.type}-${item.id}`}
      numColumns={NUM_COLUMNS}
      contentContainerStyle={styles.listContent}
      columnWrapperStyle={styles.row}
      refreshControl={
        <RefreshControl
          refreshing={loading && media.length > 0}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  row: {
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },
  cardContainer: {
    flex: 1,
    maxWidth: CARD_SIZE,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
    opacity: 0.5,
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  retryText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
