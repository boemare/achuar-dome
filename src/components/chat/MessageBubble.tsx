import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { ChatMessage } from '../../services/ai/chat';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { typography } from '../../constants/typography';
import { formatTime } from '../../utils/formatters';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Markdown
          style={isUser ? styles.userMarkdown : styles.assistantMarkdown}
        >
          {message.content}
        </Markdown>
      </View>
      <Text style={[styles.time, isUser ? styles.userTime : styles.assistantTime]}>
        {formatTime(message.createdAt)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.sm,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  content: {
    ...typography.body,
  },
  userContent: {
    color: colors.textLight,
  },
  assistantContent: {
    color: colors.text,
  },
  userMarkdown: {
    body: {
      ...typography.body,
      color: colors.textLight,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 0,
    },
  },
  assistantMarkdown: {
    body: {
      ...typography.body,
      color: colors.text,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 0,
    },
  },
  time: {
    ...typography.caption,
    fontSize: 10,
    marginTop: spacing.xs,
  },
  userTime: {
    color: colors.textMuted,
  },
  assistantTime: {
    color: colors.textMuted,
  },
});
