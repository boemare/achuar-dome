import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useVoiceRecording } from './useVoiceRecording';

export default function MapScreen() {
  const { isRecording, recordingTime, uploading, startRecording, stopRecording, uploadRecording, cancelRecording } = useVoiceRecording();

  const handleRecordPress = async () => {
    if (isRecording) {
      const uri = await stopRecording();
      if (uri) {
        await uploadRecording(uri);
      }
    } else {
      await startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>🗺️ Conservation Map</Text>
      
      <TouchableOpacity 
        style={[styles.recordBtn, isRecording && styles.recordingActive]}
        onPress={handleRecordPress}
        disabled={uploading}
      >
        <Text style={styles.recordIcon}>{isRecording ? '⏹️' : '🎤'}</Text>
      </TouchableOpacity>

      {isRecording && (
        <View style={styles.recordingInfo}>
          <Text style={styles.recordingText}>Recording... {recordingTime}s</Text>
          <TouchableOpacity onPress={cancelRecording}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e9edc9' },
  text: { fontSize: 24, fontWeight: 'bold' },
  recordBtn: { marginTop: 30, backgroundColor: '#ff6b6b', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  recordingActive: { backgroundColor: '#ff0000' },
  recordIcon: { fontSize: 24 },
  recordingInfo: { marginTop: 20, alignItems: 'center', gap: 10 },
  recordingText: { color: '#ff0000', fontWeight: 'bold' },
  cancelText: { color: '#999', textDecorationLine: 'underline' },
});