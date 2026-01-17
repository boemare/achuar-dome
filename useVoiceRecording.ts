import { useState, useRef } from 'react';
import { Audio } from 'expo-av';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xvasxijhtpavtnyxzsgr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Hi7y3g-BzL29ZK0eq8GNzg_KpaNM8Qp';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const useVoiceRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = async () => {
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        alert('Recording permission not granted');
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      const interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Store interval ID for cleanup
      recording.intervalId = interval as any;
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to start recording');
    }
  };

  const stopRecording = async (): Promise<string | null> => {
    try {
      if (!recordingRef.current) return null;

      const recording = recordingRef.current;
      if (recording.intervalId) {
        clearInterval(recording.intervalId);
      }

      await recording.stopAndUnloadAsync();
      setIsRecording(false);

      const uri = recording.getURI();
      return uri;
    } catch (error) {
      console.error('Failed to stop recording:', error);
      alert('Failed to stop recording');
      return null;
    }
  };

  const uploadRecording = async (uri: string | null): Promise<boolean> => {
    if (!uri) return false;

    try {
      setUploading(true);

      // Read file
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generate filename
      const timestamp = new Date().getTime();
      const filename = `recording_${timestamp}.m4a`;

      // Upload to Supabase
      const { error } = await supabase.storage
        .from('voicerecordings')
        .upload(filename, blob, {
          contentType: 'audio/m4a',
        });

      if (error) {
        console.error('Upload error:', error);
        alert('Failed to upload recording');
        return false;
      }

      alert('Recording uploaded successfully!');
      return true;
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload recording');
      return false;
    } finally {
      setUploading(false);
      recordingRef.current = null;
    }
  };

  const cancelRecording = async () => {
    try {
      if (!recordingRef.current) return;

      const recording = recordingRef.current;
      if (recording.intervalId) {
        clearInterval(recording.intervalId);
      }

      await recording.stopAndUnloadAsync();
      setIsRecording(false);
      setRecordingTime(0);
      recordingRef.current = null;
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    }
  };

  return {
    isRecording,
    recordingTime,
    uploading,
    startRecording,
    stopRecording,
    uploadRecording,
    cancelRecording,
  };
};
