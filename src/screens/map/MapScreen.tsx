import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  PanResponder,
  Animated,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useObservations } from '../../hooks/useObservations';
import { ObservationWithMedia } from '../../services/supabase/observations';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { formatDateTime } from '../../utils/formatters';

const EDGE_SWIPE_THRESHOLD = 40; // Width of edge swipe zone
const SWIPE_VELOCITY_THRESHOLD = 0.3; // Minimum velocity to trigger navigation
const SWIPE_DISTANCE_THRESHOLD = 80; // Minimum distance to trigger navigation

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Default to Achuar territory in Ecuador
const INITIAL_REGION: Region = {
  latitude: -2.5,
  longitude: -77.5,
  latitudeDelta: 1,
  longitudeDelta: 1,
};

const PIN_COLORS: Record<string, string> = {
  wildlife: colors.primary,
  boat: colors.warning,
  human: colors.error,
  other: colors.textSecondary,
};

export default function MapScreen() {
  const { isElder } = useAuth();
  const { observations, loading, refresh, selectedObservation, selectObservation, clearSelection } =
    useObservations(undefined, isElder);
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const navigation = useNavigation();
  const edgeSwipeIndicator = useRef(new Animated.Value(0)).current;

  // Edge swipe gesture to navigate to Chat (like Snapchat)
  const edgeSwipePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (evt) => {
          // Only capture if touch starts from right edge
          const { pageX } = evt.nativeEvent;
          return pageX >= SCREEN_WIDTH - EDGE_SWIPE_THRESHOLD;
        },
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          // Capture if swiping left from right edge
          return gestureState.dx < -10 && gestureState.moveX >= SCREEN_WIDTH - EDGE_SWIPE_THRESHOLD * 2;
        },
        onPanResponderGrant: () => {
          // Show swipe indicator
          Animated.timing(edgeSwipeIndicator, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderMove: (evt, gestureState) => {
          // Update indicator based on swipe progress
          const progress = Math.min(Math.abs(gestureState.dx) / SWIPE_DISTANCE_THRESHOLD, 1);
          edgeSwipeIndicator.setValue(progress);
        },
        onPanResponderRelease: (evt, gestureState) => {
          // Check if swipe was fast enough or far enough
          const shouldNavigate =
            gestureState.vx < -SWIPE_VELOCITY_THRESHOLD ||
            Math.abs(gestureState.dx) > SWIPE_DISTANCE_THRESHOLD;

          if (shouldNavigate) {
            // Navigate to Chat tab
            navigation.navigate('Chat' as never);
          }

          // Hide indicator
          Animated.timing(edgeSwipeIndicator, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.timing(edgeSwipeIndicator, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start();
        },
      }),
    [navigation, edgeSwipeIndicator]
  );

  const handleMarkerPress = useCallback(
    (observation: ObservationWithMedia) => {
      selectObservation(observation.id);
    },
    [selectObservation]
  );

  const handleMapPress = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const centerOnObservation = useCallback((obs: ObservationWithMedia) => {
    mapRef.current?.animateToRegion(
      {
        latitude: obs.latitude,
        longitude: obs.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      500
    );
  }, []);

  const renderMarker = (observation: ObservationWithMedia) => {
    const pinColor = PIN_COLORS[observation.type] || colors.textSecondary;

    return (
      <Marker
        key={observation.id}
        coordinate={{
          latitude: observation.latitude,
          longitude: observation.longitude,
        }}
        pinColor={pinColor}
        onPress={() => handleMarkerPress(observation)}
      />
    );
  };

  const renderDetailCard = () => {
    if (!selectedObservation) return null;

    const obs = selectedObservation;
    const hasMedia = obs.photoUrls.length > 0 || obs.videoUrls.length > 0;

    return (
      <View style={styles.detailCard}>
        <View style={styles.detailHeader}>
          <View style={styles.detailType}>
            <View style={[styles.typeIndicator, { backgroundColor: PIN_COLORS[obs.type] }]} />
            <Text style={styles.typeText}>
              {obs.type.charAt(0).toUpperCase() + obs.type.slice(1)}
            </Text>
          </View>
          <TouchableOpacity onPress={clearSelection} style={styles.closeButton}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>
        </View>

        {obs.species && (
          <Text style={styles.speciesName}>
            {obs.species.nameAchuar || obs.species.name}
          </Text>
        )}

        <Text style={styles.dateText}>{formatDateTime(obs.createdAt)}</Text>

        {obs.notes && <Text style={styles.notesText}>{obs.notes}</Text>}

        {hasMedia && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.mediaScroll}
          >
            {obs.photoUrls.map((url, index) => (
              <Image
                key={`photo-${index}`}
                source={{ uri: url }}
                style={styles.mediaThumbnail}
              />
            ))}
            {obs.videoUrls.map((url, index) => (
              <View key={`video-${index}`} style={styles.videoThumbnail}>
                <Text style={styles.videoIcon}>Video</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {obs.voiceUrls.length > 0 && (
          <View style={styles.audioIndicator}>
            <Text style={styles.audioIcon}>Audio</Text>
            <Text style={styles.audioText}>{obs.voiceUrls.length} recording(s)</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        mapType="satellite"
        initialRegion={INITIAL_REGION}
        onMapReady={() => setMapReady(true)}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton
      >
        {mapReady && observations.map(renderMarker)}
      </MapView>

      <SafeAreaView style={styles.overlay} edges={['top']} pointerEvents="box-none">
        <View style={styles.header} pointerEvents="auto">
          <Text style={styles.title}>Observations</Text>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Wildlife</Text>
            </View>
            {isElder && (
              <>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                  <Text style={styles.legendText}>Boat</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
                  <Text style={styles.legendText}>Human</Text>
                </View>
              </>
            )}
          </View>
        </View>
      </SafeAreaView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {renderDetailCard()}

      <TouchableOpacity style={styles.refreshButton} onPress={refresh} activeOpacity={0.8}>
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>

      {/* Edge swipe zone for navigation to Chat */}
      <View
        style={styles.edgeSwipeZone}
        {...edgeSwipePanResponder.panHandlers}
      >
        <Animated.View
          style={[
            styles.edgeSwipeIndicator,
            {
              opacity: edgeSwipeIndicator,
              transform: [
                {
                  translateX: edgeSwipeIndicator.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  detailCard: {
    position: 'absolute',
    bottom: 100,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  detailType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  typeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  typeText: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  closeButton: {
    padding: spacing.xs,
  },
  closeText: {
    ...typography.body,
    color: colors.textMuted,
  },
  speciesName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  dateText: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  notesText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  mediaScroll: {
    marginBottom: spacing.sm,
  },
  mediaThumbnail: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  videoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  videoIcon: {
    fontSize: 24,
    color: colors.textLight,
  },
  audioIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  audioIcon: {
    fontSize: 20,
  },
  audioText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  refreshButton: {
    position: 'absolute',
    bottom: 110,
    right: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  refreshText: {
    ...typography.button,
    color: colors.textLight,
  },
  edgeSwipeZone: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: EDGE_SWIPE_THRESHOLD,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  edgeSwipeIndicator: {
    width: 6,
    height: 60,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    marginRight: 2,
  },
});
