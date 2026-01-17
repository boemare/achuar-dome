import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, StyleSheet, View, Animated, Easing } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors } from '../../constants/colors';

interface VoiceButtonProps {
  onPress: () => void;
  isRecording?: boolean;
}

const MicIcon = ({ color = colors.textLight, size = 28 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 1C10.34 1 9 2.34 9 4V12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12V4C15 2.34 13.66 1 12 1Z"
      fill={color}
    />
    <Path
      d="M17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12H5C5 15.53 7.61 18.43 11 18.92V22H13V18.92C16.39 18.43 19 15.53 19 12H17Z"
      fill={color}
    />
  </Svg>
);

const StopIcon = ({ color = colors.textLight, size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 7H17C17.55 7 18 7.45 18 8V16C18 16.55 17.55 17 17 17H7C6.45 17 6 16.55 6 16V8C6 7.45 6.45 7 7 7Z"
      fill={color}
    />
  </Svg>
);

export default function VoiceButton({ onPress, isRecording = false }: VoiceButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      // Pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.4,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isRecording]);

  return (
    <View style={styles.container}>
      {/* Outer glow rings */}
      {isRecording && (
        <>
          <Animated.View
            style={[
              styles.glowRing,
              styles.glowRingOuter,
              {
                opacity: glowAnim,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.glowRing,
              styles.glowRingMiddle,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.2, 0.6],
                }),
              },
            ]}
          />
        </>
      )}

      {/* Main button */}
      <Animated.View
        style={[
          styles.buttonWrapper,
          isRecording && {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.button, isRecording && styles.buttonRecording]}
          onPress={onPress}
          activeOpacity={0.85}
        >
          <View style={styles.iconContainer}>
            {isRecording ? (
              <StopIcon color={colors.textLight} size={26} />
            ) : (
              <MicIcon color={colors.textLight} size={30} />
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const BUTTON_SIZE = 68;
const GLOW_OUTER = BUTTON_SIZE + 40;
const GLOW_MIDDLE = BUTTON_SIZE + 20;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderRadius: 100,
  },
  glowRingOuter: {
    width: GLOW_OUTER,
    height: GLOW_OUTER,
    backgroundColor: colors.recordingPulse,
  },
  glowRingMiddle: {
    width: GLOW_MIDDLE,
    height: GLOW_MIDDLE,
    backgroundColor: colors.recordingGlow,
  },
  buttonWrapper: {
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  buttonRecording: {
    backgroundColor: colors.recording,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
