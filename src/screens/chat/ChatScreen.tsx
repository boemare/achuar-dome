import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../hooks/useChat';
import MessageBubble from '../../components/chat/MessageBubble';
import ChatInput from '../../components/chat/ChatInput';
import { ChatMessage } from '../../services/ai/chat';
import { colors } from '../../constants/colors';
import { spacing, borderRadius } from '../../constants/spacing';
import { typography } from '../../constants/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Leaf/Nature-inspired logo
const ForestLogo = ({ size = 80 }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <Svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
        fill={colors.primaryLight}
        opacity={0.2}
      />
      <Path
        d="M17 9C17 13 14 17 12 17C10 17 7 13 7 9C7 5 9.5 3 12 3C14.5 3 17 5 17 9Z"
        fill={colors.primary}
      />
      <Path
        d="M12 17V21"
        stroke={colors.secondary}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M12 9C12 9 10 11 10 13"
        stroke={colors.textLight}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={0.6}
      />
    </Svg>
  </View>
);

// Suggestion card icons
const BirdIcon = ({ color = colors.primary, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 8C14 8 16 6 18 6C20 6 21 8 21 10C21 14 16 18 12 20C8 18 3 14 3 10C3 8 4 6 6 6C8 6 10 8 12 8Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const PawIcon = ({ color = colors.primary, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="14" r="4" stroke={color} strokeWidth={1.5} />
    <Circle cx="7" cy="8" r="2" fill={color} />
    <Circle cx="17" cy="8" r="2" fill={color} />
    <Circle cx="5" cy="13" r="1.5" fill={color} />
    <Circle cx="19" cy="13" r="1.5" fill={color} />
  </Svg>
);

const WaterIcon = ({ color = colors.primary, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C12 2 5 10 5 14C5 18 8 21 12 21C16 21 19 18 19 14C19 10 12 2 12 2Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function ChatScreen() {
  const { user } = useAuth();
  const { messages, loading, sending, send, startNewConversation } = useChat(user?.id);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <MessageBubble message={item} />
  );

  const SuggestionCard = ({
    icon,
    title,
    query,
  }: {
    icon: React.ReactNode;
    title: string;
    query: string;
  }) => (
    <TouchableOpacity
      style={styles.suggestionCard}
      onPress={() => send(query)}
      activeOpacity={0.7}
    >
      <View style={styles.suggestionIconContainer}>{icon}</View>
      <Text style={styles.suggestionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Starting conversation...</Text>
        </View>
      );
    }

    return (
      <View style={styles.welcomeContainer}>
        <ForestLogo size={100} />

        <Text style={styles.welcomeTitle}>Achuar Wildlife</Text>
        <Text style={styles.welcomeSubtitle}>Your rainforest companion</Text>

        <Text style={styles.welcomeDescription}>
          Ask about species, behaviors, tracks, or anything about the Amazon's wildlife
        </Text>

        <View style={styles.suggestionsGrid}>
          <SuggestionCard
            icon={<BirdIcon />}
            title="Amazon birds"
            query="What birds are common in the Amazon rainforest?"
          />
          <SuggestionCard
            icon={<PawIcon />}
            title="Jaguar tracks"
            query="How can I identify a jaguar from its tracks?"
          />
          <SuggestionCard
            icon={<WaterIcon />}
            title="River otters"
            query="Tell me about the giant river otter"
          />
        </View>
      </View>
    );
  };

  const hasMessages = messages.length > 0;

  // ChatGPT-style: when no messages, show centered welcome with input
  if (!hasMessages && !loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centeredContainer}>
          <ForestLogo size={100} />

          <Text style={styles.welcomeTitle}>Achuar Wildlife</Text>
          <Text style={styles.welcomeSubtitle}>Your rainforest companion</Text>

          <View style={styles.centeredInputWrapper}>
            <ChatInput onSend={send} disabled={sending || loading} />
          </View>

          <Text style={styles.welcomeDescription}>
            Ask about species, behaviors, tracks, or anything about the Amazon's wildlife
          </Text>

          <View style={styles.suggestionsGrid}>
            <SuggestionCard
              icon={<BirdIcon />}
              title="Amazon birds"
              query="What birds are common in the Amazon rainforest?"
            />
            <SuggestionCard
              icon={<PawIcon />}
              title="Jaguar tracks"
              query="How can I identify a jaguar from its tracks?"
            />
            <SuggestionCard
              icon={<WaterIcon />}
              title="River otters"
              query="Tell me about the giant river otter"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {hasMessages && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerDot} />
            <Text style={styles.headerTitle}>Wildlife Assistant</Text>
          </View>
          <TouchableOpacity
            onPress={startNewConversation}
            style={styles.newChatButton}
            activeOpacity={0.7}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 5V19M5 12H19"
                stroke={colors.primary}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messageList,
          !hasMessages && styles.messageListEmpty,
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {sending && (
        <View style={styles.typingIndicator}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
          <Text style={styles.typingText}>Thinking...</Text>
        </View>
      )}

      <View style={styles.inputWrapper}>
        <ChatInput onSend={send} disabled={sending || loading} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  centeredInputWrapper: {
    width: '100%',
    maxWidth: 400,
    marginVertical: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
  },
  newChatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageListEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: 15,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: 60,
  },
  logoContainer: {
    borderRadius: 50,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    letterSpacing: 0.2,
  },
  welcomeDescription: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
    maxWidth: 280,
  },
  suggestionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    maxWidth: SCREEN_WIDTH - spacing.xl * 2,
  },
  suggestionCard: {
    width: (SCREEN_WIDTH - spacing.xl * 2 - spacing.sm * 2) / 3,
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  suggestionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    opacity: 0.4,
  },
  typingDot1: {
    opacity: 0.8,
  },
  typingDot2: {
    opacity: 0.5,
  },
  typingDot3: {
    opacity: 0.3,
  },
  typingText: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  inputWrapper: {
    paddingBottom: spacing.sm,
  },
});
