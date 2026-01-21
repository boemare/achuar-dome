import 'react-native-gesture-handler';
import React, { useState, useRef, useCallback } from 'react';
import { View, LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ChatProvider, useChatContext } from './src/context/ChatContext';
import RootNavigator from './src/navigation/RootNavigator';
import VoiceButton from './src/components/voice/VoiceButton';
import RecordingModal, { RecordingModalRef } from './src/components/voice/RecordingModal';
import { colors } from './src/constants/colors';

LogBox.ignoreLogs([
  '[expo-av]: Expo AV has been deprecated and will be removed in SDK 54.',
  '[expo-image-picker] `ImagePicker.MediaTypeOptions` have been deprecated.',
]);

// Filter specific deprecation warnings from console output
const originalWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const first = args[0];
  if (typeof first === 'string') {
    if (first.includes('[expo-av]: Expo AV has been deprecated')) return;
    if (first.includes('[expo-image-picker] `ImagePicker.MediaTypeOptions`')) return;
  }
  originalWarn(...args);
};

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const { hasMessages: chatHasMessages } = useChatContext();
  const [recordingModalVisible, setRecordingModalVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recordingModalRef = useRef<RecordingModalRef>(null);

  const handleVoicePress = useCallback(() => {
    if (isRecording) {
      // Already recording - stop and close
      recordingModalRef.current?.stopAndClose();
    } else {
      // Not recording - open modal and start recording
      setRecordingModalVisible(true);
      // Recording will start automatically when modal opens
    }
  }, [isRecording]);

  const handleRecordingStateChange = useCallback((recording: boolean) => {
    setIsRecording(recording);
  }, []);

  const handleModalClose = useCallback(() => {
    setRecordingModalVisible(false);
    setIsRecording(false);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <RootNavigator />

      {isAuthenticated && (
        <>
          {!chatHasMessages && (
            <VoiceButton onPress={handleVoicePress} isRecording={isRecording} />
          )}
          <RecordingModal
            ref={recordingModalRef}
            visible={recordingModalVisible}
            onClose={handleModalClose}
            onRecordingComplete={handleModalClose}
            onRecordingStateChange={handleRecordingStateChange}
            userId={user?.id}
            autoStart={true}
          />
        </>
      )}
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ChatProvider>
            <NavigationContainer>
              <AppContent />
            </NavigationContainer>
          </ChatProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
