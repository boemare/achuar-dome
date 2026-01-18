import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  Image, TouchableOpacity, Dimensions, Animated
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
  type: 'image' | 'video' | 'audio' | 'folder';
  bucket: string;
  path?: string;
}

// Empty mock data - will only show Supabase content
const ECUADOR_ANIMALS: MediaItem[] = [];

const windowWidth = Dimensions.get('window').width;
const itemWidth = (windowWidth - 100) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf0d5' },
  header: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  headerContainer: { paddingTop: 60, paddingHorizontal: 20, marginBottom: 10 },
  filterContainerTop: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 20, gap: 30, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  contentArea: { flex: 1 },
  filterContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, width: '100%' },
  filterBtn: { width: 130, height: 130, borderRadius: 12, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'transparent' },
  filterBtnActive: { backgroundColor: '#fff', borderColor: '#007AFF' },
  filterIcon: { fontSize: 48, marginBottom: 8 },
  filterText: { fontSize: 16, fontWeight: '600', color: '#666' },
  filterTextActive: { color: '#007AFF' },
  listContent: { padding: 15, paddingBottom: 40, justifyContent: 'center' },
  mediaItem: { width: itemWidth, marginHorizontal: 10, marginBottom: 15, alignItems: 'center' },
  thumbnail: { width: itemWidth, height: itemWidth, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  videoPlaceholder: { backgroundColor: '#e0e0e0' },
  audioPlaceholder: { backgroundColor: '#d8d8d8' },
  imagePlaceholder: { backgroundColor: '#f0f0f0' },
  folderPlaceholder: { backgroundColor: '#fff3cd' },
  playIcon: { fontSize: 32 },
  audioIcon: { fontSize: 32 },
  imageIcon: { fontSize: 32 },
  folderIcon: { fontSize: 40 },
  mediaName: { marginTop: 8, fontSize: 12, color: '#666', maxWidth: itemWidth },
  backButton: { paddingHorizontal: 35, paddingVertical: 16, backgroundColor: '#007AFF', borderRadius: 8, marginHorizontal: 15, marginTop: 10, alignSelf: 'flex-start' },
  backButtonText: { color: '#fff', fontWeight: '600' },
  infoContainer: { padding: 12, alignItems: 'center', marginHorizontal: 15, marginTop: 10, backgroundColor: '#e3f2fd', borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#2196f3' },
  infoText: { color: '#1976d2', textAlign: 'center', fontSize: 13, fontWeight: '500' },
  errorContainer: { padding: 20, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#d32f2f', textAlign: 'center', marginBottom: 10, fontSize: 14 },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 8, backgroundColor: '#007AFF', borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  emptyTextContainer: { marginBottom: 40, alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#999', marginBottom: 5 },
  emptySubText: { fontSize: 14, color: '#bbb' },
  recordBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#ff6b6b', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3, elevation: 5 },
  recordingActive: { backgroundColor: '#ff0000' },
  recordIcon: { fontSize: 20 },
  recordingInfo: { padding: 10, alignItems: 'center', gap: 8 },
  recordingText: { color: '#ff0000', fontWeight: 'bold', fontSize: 12 },
  cancelText: { color: '#999', textDecorationLine: 'underline', fontSize: 12 },
  footerContainer: { backgroundColor: '#fff', padding: 15, alignItems: 'center', paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#eee' },
});

// Media item wrapper component for proper hooks handling
function MediaItemWrap({ item, onPress }: { item: MediaItem; onPress?: () => void }) {
  const [imageError, setImageError] = useState(false);

  return (
    <TouchableOpacity style={styles.mediaItem} onPress={onPress}>
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
      {item.type === 'folder' && (
        <View style={[styles.thumbnail, styles.folderPlaceholder]}>
          <Text style={styles.folderIcon}>📁</Text>
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
  const [filterType, setFilterType] = useState<'photos' | 'recordings'>('photos');
  const [currentPath, setCurrentPath] = useState<string>('');
  const { isRecording, recordingTime, uploading, startRecording, stopRecording, uploadRecording, cancelRecording } = useVoiceRecording();

  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let loopAnim: Animated.CompositeAnimation | undefined;
    if (isRecording) {
      loopAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.12, duration: 550, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.0, duration: 550, useNativeDriver: true }),
        ])
      );
      loopAnim.start();
    } else {
      Animated.timing(scale, { toValue: 1, duration: 150, useNativeDriver: true }).start();
      if (loopAnim) loopAnim.stop();
    }
    return () => { if (loopAnim) loopAnim.stop(); };
  }, [isRecording, scale]);

  const filteredMedia = media.filter(item => 
    filterType === 'photos' 
      ? (item.type === 'image' || item.type === 'folder' || item.type === 'video')
      : item.type === 'audio'
  );

  useEffect(() => {
    console.log('GalleryScreen mounted, fetching media...');
    fetchMediaFromSupabase();
  }, [currentPath]);

  const fetchMediaFromSupabase = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let allMedia: MediaItem[] = [];

      // Fetch files from the 'media' bucket
      const { data: mediaFiles, error: mediaError } = await supabase
        .storage
        .from('media')
        .list(currentPath, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
          search: ''
        });

      if (mediaError) {
        console.error('Media fetch error:', mediaError);
      }

      if (mediaFiles) {
        console.log('Raw files from Supabase:', JSON.stringify(mediaFiles, null, 2));
        const mediaItems: MediaItem[] = mediaFiles
          .filter(file => !file.name.startsWith('.')) // Filter out hidden files
          .map(file => {
            console.log('Processing file:', file.name, 'has id:', !!file.id, 'metadata:', file.metadata);
            // Check if this is a folder (no id means it's a folder)
            if (!file.id) {
              console.log('Detected folder:', file.name);
              const folderPath = currentPath ? `${currentPath}/${file.name}` : file.name;
              return {
                id: file.name,
                name: file.name,
                url: '',
                type: 'folder' as const,
                bucket: 'media',
                path: folderPath
              };
            }

            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            let type: 'image' | 'video' | 'audio' = 'image';
            
            if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) {
              type = 'video';
            } else if (['mp3', 'wav', 'm4a', 'aac'].includes(ext)) {
              type = 'audio';
            }

            const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
            const { data } = supabase.storage
              .from('media')
              .getPublicUrl(filePath);

            return {
              id: file.name,
              name: file.name,
              url: data?.publicUrl || '',
              type,
              bucket: 'media',
              path: filePath
            };
          });
        console.log('Media items fetched:', mediaItems.length);
        allMedia = allMedia.concat(mediaItems);
      }

      // Fetch files from the 'voicerecordings' bucket
      const { data: voiceFiles, error: voiceError } = await supabase
        .storage
        .from('voicerecordings')
        .list();

      if (voiceError) {
        console.error('Voice recordings fetch error:', voiceError);
      }

      if (voiceFiles) {
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
        console.log('Voice items fetched:', voiceItems.length);
        allMedia = allMedia.concat(voiceItems);
      }

      console.log('Total media items:', allMedia.length);
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

  const handleItemPress = (item: MediaItem) => {
    if (item.type === 'folder' && item.path) {
      setCurrentPath(item.path);
    }
  };

  const handleBackPress = () => {
    const pathParts = currentPath.split('/');
    pathParts.pop();
    setCurrentPath(pathParts.join('/'));
  };

  const renderMediaItem = useCallback(({ item }: { item: MediaItem }) => {
    return <MediaItemWrap item={item} onPress={() => handleItemPress(item)} />;
  }, [currentPath]);

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
      </View>

      {error && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>{error}</Text>
        </View>
      )}

      <View style={styles.filterContainerTop}>
        <TouchableOpacity
          style={[styles.filterBtn, filterType === 'photos' && styles.filterBtnActive]}
          onPress={() => { setFilterType('photos'); setCurrentPath(''); }}
        >
          <Text style={styles.filterIcon}>📷</Text>
          <Text style={[styles.filterText, filterType === 'photos' && styles.filterTextActive]}>Photos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filterType === 'recordings' && styles.filterBtnActive]}
          onPress={() => { setFilterType('recordings'); setCurrentPath(''); }}
        >
          <Text style={styles.filterIcon}>🎵</Text>
          <Text style={[styles.filterText, filterType === 'recordings' && styles.filterTextActive]}>Recordings</Text>
        </TouchableOpacity>
      </View>

      {currentPath !== '' && (
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}

      <View style={styles.contentArea}>
        {filteredMedia.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {filterType === 'photos' ? 'photos' : 'recordings'} yet</Text>
          </View>
        ) : (
          <FlatList
            data={filteredMedia}
            keyExtractor={(item) => item.id}
            renderItem={renderMediaItem}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={{ justifyContent: 'center' }}
          />
        )}
      </View>

      <View style={styles.footerContainer}>
        {isRecording && (
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.recordingText}>Recording... {recordingTime}s</Text>
            <TouchableOpacity onPress={cancelRecording}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity
            style={[styles.recordBtn, isRecording && styles.recordingActive]}
            onPress={handleRecordPress}
            disabled={uploading}
          >
            <Text style={styles.recordIcon}>{isRecording ? '⏹️' : '●'}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}