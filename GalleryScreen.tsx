import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  Image, TouchableOpacity, Dimensions 
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { useVoiceRecording } from './useVoiceRecording';

// Initialize Supabase with your project credentials
const SUPABASE_URL = 'https://xvasxijhtpavtnyxzsgr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Hi7y3g-BzL29ZK0eq8GNzg_KpaNM8Qp';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  bucket: string;
}

// Empty mock data - will only show Supabase content
const ECUADOR_ANIMALS: MediaItem[] = [];

const windowWidth = Dimensions.get('window').width;
const itemWidth = (windowWidth - 50) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf0d5', paddingTop: 60 },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  listContent: { padding: 15, paddingBottom: 40 },
  mediaItem: { width: itemWidth, marginHorizontal: 10, marginBottom: 15, alignItems: 'center' },
  thumbnail: { width: itemWidth, height: itemWidth, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  videoPlaceholder: { backgroundColor: '#e0e0e0' },
  audioPlaceholder: { backgroundColor: '#d8d8d8' },
  imagePlaceholder: { backgroundColor: '#f0f0f0' },
  playIcon: { fontSize: 32 },
  audioIcon: { fontSize: 32 },
  imageIcon: { fontSize: 32 },
  mediaName: { marginTop: 8, fontSize: 12, color: '#666', maxWidth: itemWidth },
  infoContainer: { padding: 12, alignItems: 'center', marginHorizontal: 15, marginTop: 10, backgroundColor: '#e3f2fd', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#2196f3' },
  infoText: { color: '#1976d2', textAlign: 'center', fontSize: 13, fontWeight: '500' },
  errorContainer: { padding: 20, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#d32f2f', textAlign: 'center', marginBottom: 10, fontSize: 14 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#007AFF', borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#999', marginBottom: 5 },
  emptySubText: { fontSize: 14, color: '#bbb' },
  recordBtn: { backgroundColor: '#ff6b6b', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  recordingActive: { backgroundColor: '#ff0000' },
  recordIcon: { fontSize: 18 },
  recordingInfo: { padding: 10, alignItems: 'center', gap: 8 },
  recordingText: { color: '#ff0000', fontWeight: 'bold', fontSize: 12 },
  cancelText: { color: '#999', textDecorationLine: 'underline', fontSize: 12 },
});

// Media item wrapper component for proper hooks handling
function MediaItemWrap({ item }: { item: MediaItem }) {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity style={styles.mediaItem}>
      {item.type === 'image' && (
        !imageError ? (
          <Image
            source={{ uri: item.url }}
            style={styles.thumbnail}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={[styles.thumbnail, styles.imagePlaceholder]}>
            <Text style={styles.imageIcon}>🖼️</Text>
          </View>
        )
      )}
      {item.type === 'video' && (
        <View style={[styles.thumbnail, styles.videoPlaceholder]}>
          <Text style={styles.playIcon}>▶️</Text>
        </View>
      )}
      {item.type === 'audio' && (
        <View style={[styles.thumbnail, styles.audioPlaceholder]}>
          <Text style={styles.audioIcon}>🎵</Text>
        </View>
      )}
      <Text style={styles.mediaName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );
}

export default function GalleryScreen() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMediaFromSupabase();
  }, []);

  const fetchMediaFromSupabase = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let allMedia: MediaItem[] = [];

      // Fetch files from the 'media' bucket
      const { data: mediaFiles, error: mediaError } = await supabase
        .storage
        .from('media')
        .list();

      if (!mediaError && mediaFiles) {
        const mediaItems: MediaItem[] = mediaFiles
          .filter(file => !file.name.startsWith('.'))
          .map(file => {
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            let type: 'image' | 'video' | 'audio' = 'image';
            
            if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) {
              type = 'video';
            } else if (['mp3', 'wav', 'm4a', 'aac'].includes(ext)) {
              type = 'audio';
            }

            const { data } = supabase.storage
              .from('media')
              .getPublicUrl(file.name);

            return {
              id: file.name,
              name: file.name,
              url: data?.publicUrl || '',
              type,
              bucket: 'media'
            };
          });
        allMedia = allMedia.concat(mediaItems);
      }

      // Fetch files from the 'voicerecordings' bucket
      const { data: voiceFiles, error: voiceError } = await supabase
        .storage
        .from('voicerecordings')
        .list();

      if (!voiceError && voiceFiles) {
        const voiceItems: MediaItem[] = voiceFiles
          .filter(file => !file.name.startsWith('.'))
          .map(file => {
            const { data } = supabase.storage
              .from('voicerecordings')
              .getPublicUrl(file.name);

            return {
              id: file.name,
              name: file.name,
              url: data?.publicUrl || '',
              type: 'audio',
              bucket: 'voicerecordings'
            };
          });
        allMedia = allMedia.concat(voiceItems);
      }

      if (allMedia.length > 0) {
        setMedia(allMedia);
      } else {
        setMedia(ECUADOR_ANIMALS);
        setError('No media yet. Upload photos or record voice messages.');
      }
    } catch (err) {
      console.error('Supabase Error:', err);
      setMedia(ECUADOR_ANIMALS);
      setError('Error loading media.');
    } finally {
      setLoading(false);
    }
  };

  const renderMediaItem = useCallback(({ item }: { item: MediaItem }) => {
    // Can't use useState in a callback - use local component instead
    return <MediaItemWrap item={item} />;
  }, []);

  const { isRecording, recordingTime, uploading, startRecording, stopRecording, uploadRecording, cancelRecording } = useVoiceRecording();

  const handleRecordPress = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      if (uri) {
        await uploadRecording(uri);
        // Refresh media list after upload
        setTimeout(() => fetchMediaFromSupabase(), 1000);
      }
    } else {
      await startRecording();
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>📸 Achuar Gallery</Text>
        <TouchableOpacity 
          style={[styles.recordBtn, isRecording && styles.recordingActive]}
          onPress={handleRecordPress}
          disabled={uploading}
        >
          <Text style={styles.recordIcon}>🎤</Text>
        </TouchableOpacity>
      </View>
      
      {error && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>{error}</Text>
        </View>
      )}

      {isRecording && (
        <View style={styles.recordingInfo}>
          <Text style={styles.recordingText}>Recording... {recordingTime}s</Text>
          <TouchableOpacity onPress={cancelRecording}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {media.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No media yet</Text>
          <Text style={styles.emptySubText}>Upload photos to your 'media' bucket in Supabase</Text>
        </View>
      ) : (
        <FlatList
          data={media}
          keyExtractor={(item) => item.id}
          renderItem={renderMediaItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}