import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { typography } from '../../constants/typography';

interface ChatInputProps {
  onSend: (message: string) => void;
  onMicPress?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

// Send arrow icon
const SendIcon = ({ color = colors.textLight, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 2L15 22L11 13L2 9L22 2Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Microphone icon
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

export default function ChatInput({
  onSend,
  onMicPress,
  disabled = false,
  placeholder = 'Ask about wildlife...',
}: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  const canSend = text.trim() && !disabled;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={styles.container}>
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            {/* Mic button */}
            {onMicPress && (
              <TouchableOpacity
                style={styles.micButton}
                onPress={onMicPress}
                disabled={disabled}
                activeOpacity={0.7}
              >
                <MicIcon
                  color={disabled ? colors.textMuted : colors.primary}
                  size={22}
                />
              </TouchableOpacity>
            )}
            <TextInput
              style={[styles.input, onMicPress && styles.inputWithMic]}
              value={text}
              onChangeText={setText}
              placeholder={placeholder}
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={1000}
              editable={!disabled}
              returnKeyType="default"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                canSend && styles.sendButtonActive,
              ]}
              onPress={handleSend}
              disabled={!canSend}
              activeOpacity={0.7}
            >
              <SendIcon
                color={canSend ? colors.textLight : colors.textMuted}
                size={20}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.surface,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.primaryMuted,
    minHeight: 60,
    maxHeight: 180,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.text,
    paddingVertical: spacing.md,
    paddingRight: spacing.sm,
    maxHeight: 160,
    fontSize: 17,
    lineHeight: 24,
  },
  inputWithMic: {
    paddingLeft: spacing.xs,
  },
  micButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginBottom: 2,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sendButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
