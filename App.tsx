import 'react-native-gesture-handler';
import React, { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import VoiceButton from './src/components/voice/VoiceButton';
import RecordingModal from './src/components/voice/RecordingModal';
import { colors } from './src/constants/colors';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [recordingModalVisible, setRecordingModalVisible] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleVoicePress = () => {
    setRecordingModalVisible(true);
  };

  const handleRecordingComplete = () => {
    setRecordingModalVisible(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <RootNavigator />

      {isAuthenticated && (
        <>
          <VoiceButton onPress={handleVoicePress} isRecording={isRecording} />
          <RecordingModal
            visible={recordingModalVisible}
            onClose={() => setRecordingModalVisible(false)}
            onRecordingComplete={handleRecordingComplete}
            userId={user?.id}
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
          <NavigationContainer>
            <AppContent />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
