import { Audio } from 'expo-av';

export interface RecordingResult {
  uri: string;
  duration: number;
}

let recording: Audio.Recording | null = null;

export async function requestPermissions(): Promise<boolean> {
  const { status } = await Audio.requestPermissionsAsync();
  return status === 'granted';
}

export async function startRecording(): Promise<boolean> {
  try {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      console.warn('Audio recording permission not granted');
      return false;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Enable metering for waveform visualization
    const recordingOptions = {
      ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
      isMeteringEnabled: true,
    };

    const { recording: newRecording } = await Audio.Recording.createAsync(
      recordingOptions
    );
    recording = newRecording;
    return true;
  } catch (error) {
    console.error('Failed to start recording:', error);
    return false;
  }
}

// Get current metering level (-160 to 0 dB, where 0 is loudest)
export async function getMeteringLevel(): Promise<number> {
  if (!recording) return -160;
  try {
    const status = await recording.getStatusAsync();
    return status.metering ?? -160;
  } catch {
    return -160;
  }
}

export async function stopRecording(): Promise<RecordingResult | null> {
  if (!recording) {
    return null;
  }

  try {
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const uri = recording.getURI();
    const status = await recording.getStatusAsync();
    const duration = Math.round((status.durationMillis || 0) / 1000);

    recording = null;

    if (!uri) {
      return null;
    }

    return { uri, duration };
  } catch (error) {
    console.error('Failed to stop recording:', error);
    recording = null;
    return null;
  }
}

export async function cancelRecording(): Promise<void> {
  if (recording) {
    try {
      await recording.stopAndUnloadAsync();
    } catch (error) {
      console.error('Failed to cancel recording:', error);
    }
    recording = null;
  }
}

export function isRecording(): boolean {
  return recording !== null;
}
