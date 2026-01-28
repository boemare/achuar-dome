import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { fetchMediaById } from '../../services/supabase/media';
import { MediaItem, MediaType } from '../../types/media';
import { colors } from '../../constants/colors';
import { t } from '../../i18n';
import { spacing, borderRadius } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { formatDateTime, formatDuration } from '../../utils/formatters';

type MediaDetailParams = {
  MediaDetail: { mediaId: string; mediaType: MediaType };
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MediaDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<MediaDetailParams, 'MediaDetail'>>();
  const { mediaId, mediaType } = route.params || {};

  const [media, setMedia] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (mediaId && mediaType) {
      loadMedia();
    }
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [mediaId, mediaType]);

  const loadMedia = async () => {
    setLoading(true);
    const item = await fetchMediaById(mediaId, mediaType);
    setMedia(item);
    setLoading(false);
  };

  const togglePlayback = async () => {
    if (!media || media.type !== 'audio') return;

    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
    } else {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: media.url },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        }
      );
      setSound(newSound);
      setIsPlaying(true);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (!media) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('mediaNotFound')}</Text>
        </View>
      );
    }

    switch (media.type) {
      case 'photo':
        return (
          <Image
            source={{ uri: media.url }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        );
      case 'video':
        return (
          <View style={styles.videoContainer}>
            <Image
              source={{ uri: media.thumbnailUrl || media.url }}
              style={styles.fullImage}
              resizeMode="contain"
            />
            <View style={styles.videoOverlay}>
              <Text style={styles.videoPlayIcon}>{t('play')}</Text>
              <Text style={styles.videoNote}>{t('videoComingSoon')}</Text>
            </View>
          </View>
        );
      case 'audio':
        return (
          <View style={styles.audioContainer}>
            <View style={styles.audioWaveform}>
              <Text style={styles.audioIcon}>Audio</Text>
            </View>
            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayback}
              activeOpacity={0.8}
            >
              <Text style={styles.playButtonText}>
                {isPlaying ? t('pause') : t('play')}
              </Text>
            </TouchableOpacity>
            {media.duration && (
              <Text style={styles.durationText}>
                {t('durationLabel')}: {formatDuration(media.duration)}
              </Text>
            )}
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {media?.type ? media.type.charAt(0).toUpperCase() + media.type.slice(1) : 'Media'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.contentContainer}>{renderContent()}</View>

      {media && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoDate}>{formatDateTime(media.createdAt)}</Text>
          {media.speciesId && (
            <Text style={styles.infoSpecies}>Species observation</Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  backButtonText: {
    ...typography.button,
    color: colors.textLight,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textLight,
  },
  headerSpacer: {
    width: 60,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.textLight,
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
  },
  videoContainer: {
    position: 'relative',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  videoPlayIcon: {
    fontSize: 64,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  videoNote: {
    ...typography.caption,
    color: colors.textLight,
  },
  audioContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  audioWaveform: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  audioIcon: {
    fontSize: 64,
    color: colors.textLight,
  },
  playButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  playButtonText: {
    ...typography.button,
    color: colors.text,
  },
  durationText: {
    ...typography.body,
    color: colors.textLight,
  },
  infoContainer: {
    padding: spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  infoDate: {
    ...typography.body,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  infoSpecies: {
    ...typography.caption,
    color: colors.accent,
    textAlign: 'center',
  },
});
