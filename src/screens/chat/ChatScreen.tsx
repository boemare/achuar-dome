import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Modal,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../hooks/useChat';
import MessageBubble from '../../components/chat/MessageBubble';
import ChatInput from '../../components/chat/ChatInput';
import PatternLock from '../../components/auth/PatternLock';
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

// Leader/Shield icon for leader mode button
const LeaderIcon = ({ color = colors.primary, size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L3 7V12C3 16.97 6.84 21.66 12 23C17.16 21.66 21 16.97 21 12V7L12 2Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 8V12L15 14"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Test pattern for leader mode: L-shape (0, 3, 6, 7, 8)
const LEADER_PATTERN = [0, 3, 6, 7, 8];

export default function ChatScreen() {
  const { user, isElder, login, isReady } = useAuth();
  const { messages, loading, sending, send, startNewConversation } = useChat(user?.id, isReady);
  const flatListRef = useRef<FlatList>(null);
  const [showPatternLock, setShowPatternLock] = useState(false);
  const [patternError, setPatternError] = useState(false);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handlePatternComplete = async (pattern: number[]) => {
    // Check if the pattern matches
    if (JSON.stringify(pattern) === JSON.stringify(LEADER_PATTERN)) {
      setShowPatternLock(false);
      setPatternError(false);
      // Login as elder/leader
      await login('elder');
    } else {
      setPatternError(true);
      setTimeout(() => setPatternError(false), 1000);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <MessageBubble message={item} />
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

    return null;
  };

  const hasMessages = messages.length > 0;

  // Leader mode header component - centered and larger
  const LeaderModeHeader = ({ compact = false }: { compact?: boolean }) => (
    <View style={[styles.leaderHeader, compact && styles.leaderHeaderCompact]}>
      <TouchableOpacity
        style={[
          styles.leaderButton,
          isElder && styles.leaderButtonActive,
          compact && styles.leaderButtonCompact,
        ]}
        onPress={() => !isElder && setShowPatternLock(true)}
        activeOpacity={0.7}
      >
        <LeaderIcon color={isElder ? colors.textLight : colors.primary} size={compact ? 18 : 22} />
        <Text style={[
          styles.leaderButtonText,
          isElder && styles.leaderButtonTextActive,
          compact && styles.leaderButtonTextCompact,
        ]}>
          {isElder ? 'Leader Mode Active' : 'Activate Leader Mode'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Pattern lock modal
  const PatternLockModal = () => (
    <Modal
      visible={showPatternLock}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowPatternLock(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => setShowPatternLock(false)}
            style={styles.closeButton}
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 6L6 18M6 6L18 18"
                stroke={colors.text}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Leader Access</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.patternContainer}>
          <Text style={styles.patternInstructions}>
            Draw the pattern to activate leader mode
          </Text>
          {patternError && (
            <Text style={styles.patternErrorText}>Incorrect pattern, try again</Text>
          )}
          <PatternLock onPatternComplete={handlePatternComplete} />
        </View>
      </SafeAreaView>
    </Modal>
  );

  // Welcome screen with better layout for keyboard visibility
  if (!hasMessages && !loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Leader button at top center */}
        <LeaderModeHeader />

        {/* Main content area */}
        <View style={styles.welcomeContent}>
          {/* Logo and title section */}
          <View style={styles.welcomeHeader}>
            <ForestLogo size={90} />
            <Text style={styles.welcomeTitle}>Achuar Wildlife</Text>
            <Text style={styles.welcomeSubtitle}>Your rainforest companion</Text>
          </View>

          {/* Chat input - positioned for keyboard visibility */}
          <View style={styles.welcomeInputSection}>
            <ChatInput onSend={send} disabled={sending || loading} />
            <Text style={styles.welcomeHint}>
              Ask about species, behaviors, tracks, or anything about Amazon wildlife
            </Text>
          </View>
        </View>

        <PatternLockModal />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LeaderModeHeader compact />
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
      <PatternLockModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  welcomeContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  welcomeHeader: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  welcomeInputSection: {
    paddingTop: spacing.md,
  },
  welcomeHint: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    lineHeight: 20,
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
    letterSpacing: 0.2,
  },
  leaderHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  leaderHeaderCompact: {
    paddingVertical: spacing.sm,
    alignItems: 'flex-end',
  },
  leaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  leaderButtonCompact: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    shadowOpacity: 0,
    elevation: 0,
  },
  leaderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  leaderButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  leaderButtonTextCompact: {
    fontSize: 13,
    fontWeight: '500',
  },
  leaderButtonTextActive: {
    color: colors.textLight,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  patternContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  patternInstructions: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  patternErrorText: {
    fontSize: 14,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
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
