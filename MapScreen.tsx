import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useVoiceRecording } from './useVoiceRecording';

export default function MapScreen() {
  const { isRecording, recordingTime, uploading, startRecording, stopRecording, uploadRecording, cancelRecording } = useVoiceRecording();

  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let loopAnim;
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
      <View style={styles.content}>
        <Text style={styles.text}>🗺️ Conservation Map</Text>
      </View>
      
      <View style={styles.footerContainer}>
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
  container: { flex: 1, backgroundColor: '#e9edc9' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 24, fontWeight: 'bold' },
  footerContainer: { backgroundColor: '#fff', padding: 15, alignItems: 'center', paddingBottom: 30, borderTopWidth: 1, borderTopColor: '#eee' },
  recordBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#ff6b6b', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3, elevation: 5 },
  recordingActive: { backgroundColor: '#ff0000' },
  recordIcon: { fontSize: 20 },
  recordingInfo: { marginTop: 20, alignItems: 'center', gap: 10 },
  recordingText: { color: '#ff0000', fontWeight: 'bold' },
  cancelText: { color: '#999', textDecorationLine: 'underline' },
});