import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
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
  const urlMatch = message.content.match(/https?:\/\/\S+|file:\/\/\S+|content:\/\/\S+/i);
  const imageUrl = urlMatch?.[0] || null;
  const [imageError, setImageError] = useState(false);
  const displayText = imageUrl
    ? message.content.replace(imageUrl, '').replace(/\s+/g, ' ').trim()
    : message.content;

  const bubbleStyle = imageUrl ? styles.imageBubble : isUser ? styles.userBubble : styles.assistantBubble;

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, bubbleStyle]}>
        {imageUrl && !imageError && (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageError(true)}
          />
        )}
        <Markdown
          style={isUser ? styles.userMarkdown : styles.assistantMarkdown}
        >
          {displayText}
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
  imageBubble: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
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
  image: {
    width: 220,
    height: 160,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.borderLight,
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
