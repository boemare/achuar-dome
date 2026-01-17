import { Audio, AVPlaybackStatus } from 'expo-av';

let sound: Audio.Sound | null = null;
let playbackCallback: ((status: AVPlaybackStatus) => void) | null = null;

export async function loadAudio(uri: string): Promise<boolean> {
  try {
    await unloadAudio();

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: false },
      onPlaybackStatusUpdate
    );
    sound = newSound;
    return true;
  } catch (error) {
    console.error('Failed to load audio:', error);
    return false;
  }
}

function onPlaybackStatusUpdate(status: AVPlaybackStatus) {
  if (playbackCallback) {
    playbackCallback(status);
  }
}

export function setPlaybackCallback(callback: (status: AVPlaybackStatus) => void) {
  playbackCallback = callback;
}

export async function playAudio(): Promise<boolean> {
  if (!sound) {
    return false;
  }

  try {
    await sound.playAsync();
    return true;
  } catch (error) {
    console.error('Failed to play audio:', error);
    return false;
  }
}

export async function pauseAudio(): Promise<boolean> {
  if (!sound) {
    return false;
  }

  try {
    await sound.pauseAsync();
    return true;
  } catch (error) {
    console.error('Failed to pause audio:', error);
    return false;
  }
}

export async function stopAudio(): Promise<boolean> {
  if (!sound) {
    return false;
  }

  try {
    await sound.stopAsync();
    await sound.setPositionAsync(0);
    return true;
  } catch (error) {
    console.error('Failed to stop audio:', error);
    return false;
  }
}

export async function seekAudio(positionMs: number): Promise<boolean> {
  if (!sound) {
    return false;
  }

  try {
    await sound.setPositionAsync(positionMs);
    return true;
  } catch (error) {
    console.error('Failed to seek audio:', error);
    return false;
  }
}

export async function unloadAudio(): Promise<void> {
  if (sound) {
    try {
      await sound.unloadAsync();
    } catch (error) {
      console.error('Failed to unload audio:', error);
    }
    sound = null;
  }
  playbackCallback = null;
}

export async function getPlaybackStatus(): Promise<AVPlaybackStatus | null> {
  if (!sound) {
    return null;
  }

  try {
    return await sound.getStatusAsync();
  } catch (error) {
    console.error('Failed to get playback status:', error);
    return null;
  }
}
