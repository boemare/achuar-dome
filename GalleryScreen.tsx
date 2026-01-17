import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// This is the clean, single export your app needs
export default function GalleryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📸 Supabase Gallery</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fdf0d5', // Light yellow
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});