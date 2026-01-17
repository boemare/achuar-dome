import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  FlatList, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useVoiceRecording } from './useVoiceRecording';

export default function MainScreen() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { id: '1', text: '¡Hola! I am your Achuar Guide. Ask me anything about rainforest wildlife.', sender: 'bot' }
  ]);
  const [loading, setLoading] = useState(false);
  const { isRecording, recordingTime, uploading, startRecording, stopRecording, uploadRecording, cancelRecording } = useVoiceRecording();

  const GEMINI_API_KEY = "AIzaSyBzU6coZVfp_OX2IEwTLPEjaeU9qou6jMo";
  
  // FIX: Using the v1 endpoint with gemini-2.0-flash which is a supported model
  const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const sendMessage = async () => {
    if (inputText.trim() === '') return;

    const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = inputText;
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "You are a scientific Achuar rainforest guide. Provide scientific facts, species names, and ecological information. Keep answers to 2-4 sentences but prioritize accurate scientific content over brevity." },
              { text: currentInput }
            ]
          }]
        })
      });

      const data = await response.json();
      
      // If the model name is wrong, this log will show the exact reason
      if (data.error) {
        console.error("DETAILED ERROR:", JSON.stringify(data.error, null, 2));
        throw new Error(data.error.message);
      }

      const botResponse = data.candidates[0].content.parts[0].text;

      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        text: botResponse, 
        sender: 'bot' 
      }]);
    } catch (error) {
      console.error("App Catch Error:", error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        text: "The rainforest connection is still failing. Check your terminal for the error code.", 
        sender: 'bot' 
      }]);
    } finally {
      setLoading(false);
    }
  };

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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>🤖 Achuar Chatbot</Text>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.msgBox, item.sender === 'user' ? styles.userMsg : styles.botMsg]}>
            <Text style={styles.msgText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      {loading && <ActivityIndicator color="#007AFF" style={{ marginBottom: 10 }} />}
      
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about wildlife..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={[styles.recordBtn, isRecording && styles.recordingActive]}
          onPress={handleRecordPress}
          disabled={uploading}
        >
          <Text style={styles.recordIcon}>{isRecording ? '⏹️' : '🎤'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={isRecording || uploading}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
      {isRecording && (
        <View style={styles.recordingInfo}>
          <Text style={styles.recordingText}>Recording... {recordingTime}s</Text>
          <TouchableOpacity onPress={cancelRecording}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdf0d5' },
  header: { paddingTop: 60, paddingBottom: 20, alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  headerText: { fontSize: 20, fontWeight: 'bold' },
  listContent: { padding: 20, paddingBottom: 40 },
  msgBox: { padding: 15, borderRadius: 20, marginVertical: 8, maxWidth: '85%' },
  userMsg: { alignSelf: 'flex-end', backgroundColor: '#007AFF' },
  botMsg: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  msgText: { fontSize: 16, color: '#333' },
  inputContainer: { flexDirection: 'row', padding: 15, backgroundColor: '#fff', alignItems: 'center', paddingBottom: Platform.OS === 'ios' ? 30 : 15 },
  input: { flex: 1, height: 45, borderWidth: 1, borderColor: '#ddd', borderRadius: 25, paddingHorizontal: 20, backgroundColor: '#fafafa' },
  recordBtn: { marginLeft: 10, backgroundColor: '#ff6b6b', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  recordingActive: { backgroundColor: '#ff0000' },
  recordIcon: { fontSize: 20 },
  sendBtn: { marginLeft: 10, backgroundColor: '#007AFF', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
  sendText: { color: '#fff', fontWeight: 'bold' },
  recordingInfo: { backgroundColor: '#fff', padding: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 15 },
  recordingText: { color: '#ff0000', fontWeight: 'bold' },
  cancelText: { color: '#999', textDecorationLine: 'underline' },
});