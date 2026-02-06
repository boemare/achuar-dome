import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useChatContext } from '../../context/ChatContext';
import { useChat } from '../../hooks/useChat';
import MessageBubble from '../../components/chat/MessageBubble';
import ChatInput from '../../components/chat/ChatInput';
import PatternLock from '../../components/auth/PatternLock';
import RecordingModal from '../../components/voice/RecordingModal';
import { ChatMessage } from '../../services/ai/chat';
import { uploadMedia } from '../../services/supabase/media';
import { colors } from '../../constants/colors';
import { t } from '../../i18n';
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

const TrashIcon = ({ color = colors.error, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 6H21"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M8 6V4C8 3.45 8.45 3 9 3H15C15.55 3 16 3.45 16 4V6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M6 6L7 20C7 20.55 7.45 21 8 21H16C16.55 21 17 20.55 17 20L18 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M10 11V17M14 11V17"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

// Test pattern for leader mode: L-shape (0, 3, 6, 7, 8)
const LEADER_PATTERN = [0, 3, 6, 7, 8];

const LOCAL_HISTORY_KEY = 'chat_history_v1';

type LocalConversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    audioUrl?: string;
    createdAt: string;
  }>;
};


export default function ChatScreen() {
  const { user, isElder, login, isReady } = useAuth();
  const { setHasMessages } = useChatContext();
  const {
    messages,
    loading,
    sending,
    send,
    startNewConversation,
    addUserMessage,
    conversationId,
    loadConversation,
    loadLocalConversation,
  } = useChat(user?.id, isReady);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();
  const [showPatternLock, setShowPatternLock] = useState(false);
  const [patternError, setPatternError] = useState(false);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [recordingNumber, setRecordingNumber] = useState(1);
  const [historyItems, setHistoryItems] = useState<LocalConversation[]>([]);
  const historyRef = useRef<LocalConversation[]>([]);
  const [transcribedText, setTranscribedText] = useState('');

  const handleTranscription = useCallback((text: string) => {
    setTranscribedText(text);
  }, []);

  const handleExternalTextConsumed = useCallback(() => {
    setTranscribedText('');
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
    // Update chat context when messages change
    setHasMessages(messages.length > 0);
  }, [messages.length, setHasMessages]);

  const loadLocalHistory = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(LOCAL_HISTORY_KEY);
      if (!stored) {
        setHistoryItems([]);
        historyRef.current = [];
        return;
      }
      const parsed: LocalConversation[] = JSON.parse(stored);
      setHistoryItems(parsed);
      historyRef.current = parsed;
    } catch (error) {
      console.error('Failed to load local chat history:', error);
    }
  }, []);

  const saveLocalHistory = useCallback(
    async (nextHistory: LocalConversation[]) => {
      setHistoryItems(nextHistory);
      historyRef.current = nextHistory;
      await AsyncStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(nextHistory));
    },
    []
  );

  const deleteLocalConversation = useCallback(
    async (id: string) => {
      const next = historyRef.current.filter((c) => c.id !== id);
      await saveLocalHistory(next);
    },
    [saveLocalHistory]
  );

  useEffect(() => {
    loadLocalHistory();
  }, [loadLocalHistory]);

  useEffect(() => {
    if (!conversationId || messages.length === 0) return;

    const firstUserMessage = messages.find((m) => m.role === 'user')?.content || '';
    const isPhotoMessage =
      /file:\/\/\S+|content:\/\/\S+/i.test(firstUserMessage) ||
      /https?:\/\/\S+\.(png|jpe?g|webp|heic|gif)\b/i.test(firstUserMessage);
    const assistantMessage = messages.find((m) => m.role === 'assistant')?.content || '';
    const match = assistantMessage.match(/Identificaci[oó]n:\s*([^\n\.]+)/i);
    const identifiedName = match?.[1]?.trim();
    const title = isPhotoMessage
      ? identifiedName
        ? t('photoTitleWithName', identifiedName)
        : t('photoTitle')
      : firstUserMessage.trim() || t('conversationFallback');

    const existing = historyRef.current.find((c) => c.id === conversationId);
    const conversation: LocalConversation = {
      id: conversationId,
      title,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        audioUrl: m.audioUrl,
        createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
      })),
    };

    const next = [
      conversation,
      ...historyRef.current.filter((c) => c.id !== conversationId),
    ].slice(0, 20);

    saveLocalHistory(next).catch((error) => {
      console.error('Failed to save local chat history:', error);
    });
  }, [conversationId, messages, saveLocalHistory]);

  // Track focus state to detect when user navigates away
  const isFocused = useIsFocused();
  const wasFocusedRef = useRef(isFocused);

  useEffect(() => {
    // When screen transitions from focused to unfocused, clear the chat
    if (wasFocusedRef.current && !isFocused && messages.length > 0) {
      startNewConversation();
      setHasMessages(false);
    }
    // Update the ref to track current focus state
    wasFocusedRef.current = isFocused;
  }, [isFocused, messages.length, startNewConversation, setHasMessages]);

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

  const handleMicPress = () => {
    setShowRecordingModal(true);
  };

  const handleRecordingComplete = () => {
    setShowRecordingModal(false);
    setRecordingNumber((prev) => prev + 1);
  };

  const handleSelectConversation = useCallback(
    async (id: string) => {
      const selected = historyItems.find((c) => c.id === id);
      if (!selected) {
        return;
      }
      const localMessages: ChatMessage[] = selected.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        audioUrl: m.audioUrl,
        createdAt: new Date(m.createdAt),
      }));

      loadLocalConversation(id, localMessages);
    },
    [historyItems, loadLocalConversation]
  );

  const handleAttachPress = async () => {
    try {
      if (!user?.id) {
      Alert.alert(t('signInRequiredTitle'), t('signInRequiredBody'));
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
      Alert.alert(t('permissionNeededTitle'), t('permissionNeededBody'));
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        // Use new MediaType API to avoid deprecation warnings
        mediaTypes: ['images'] as any,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];

      // Ensure we have a conversation to attach the message to
      let targetConversationId = conversationId;
      if (!targetConversationId) {
        targetConversationId = await startNewConversation();
      }

      if (!targetConversationId) {
        Alert.alert(t('chatNotReady'), t('tryAgainSoon'));
        return;
      }

      // Show the local image immediately in chat
      await addUserMessage(asset.uri, targetConversationId);

      const response = await fetch(asset.uri);
      const blob = await response.blob();

      const uploaded = await uploadMedia(blob, 'photo', { userId: user.id });
      if (!uploaded) {
        Alert.alert(t('uploadFailedTitle'), t('uploadFailedBody'));
        return;
      }
      // Trigger AI response with the local photo URI attached
      await send(t('identifyPhotoPrompt'), asset.uri);
    } catch (error) {
      console.error('Image upload error:', error);
      Alert.alert(t('uploadFailedTitle'), t('uploadErrorBody'));
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <MessageBubble message={item} />
  );

  const renderHistoryItem = ({ item }: { item: LocalConversation }) => (
    <View style={styles.historyItem}>
      <TouchableOpacity
        style={styles.historyItemContent}
        onPress={() => handleSelectConversation(item.id)}
        activeOpacity={0.7}
      >
    <Text style={styles.historyTitle}>{item.title || t('conversationFallback')}</Text>
        <Text style={styles.historyDate}>
          {new Date(item.updatedAt || item.createdAt).toLocaleString()}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.historyTrashButton}
        onPress={() => deleteLocalConversation(item.id)}
        activeOpacity={0.7}
      >
        <TrashIcon />
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('startingConversation')}</Text>
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
          {isElder ? t('leaderModeActive') : t('activateLeaderMode')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Pattern lock modal
  const PatternLockModal = () => (
    <Modal
      visible={showPatternLock}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => {}} // Prevent back button dismiss on Android
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
        <ScrollView
          contentContainerStyle={styles.welcomeContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and title section */}
          <View style={styles.welcomeHeader}>
            <ForestLogo size={90} />
            <Text style={styles.welcomeTitle}>Fauna Achuar</Text>
            <Text style={styles.welcomeSubtitle}>{t('rainforestCompanion')}</Text>
          </View>

          {/* Chat input - positioned for keyboard visibility */}
          <View style={styles.welcomeInputSection}>
        <ChatInput
          onSend={send}
          onMicPress={handleMicPress}
          onAttachPress={handleAttachPress}
          disabled={sending || loading}
          externalText={transcribedText}
          onExternalTextConsumed={handleExternalTextConsumed}
        />
            <Text style={styles.welcomeHint}>
              {t('askAboutAmazon')}
            </Text>
          </View>

          {historyItems.length > 0 && (
            <View style={styles.historyInline}>
              <Text style={styles.historyInlineTitle}>{t('chatHistory')}</Text>
              <ScrollView
                style={styles.historyScroll}
                contentContainerStyle={styles.historyScrollContent}
                showsVerticalScrollIndicator={true}
              >
                {historyItems.map((item) => (
                  <View key={item.id} style={styles.historyInlineItem}>
                    {renderHistoryItem({ item })}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        <PatternLockModal />
        <RecordingModal
          visible={showRecordingModal}
          onClose={() => setShowRecordingModal(false)}
          onRecordingComplete={handleRecordingComplete}
          onTranscription={handleTranscription}
          userId={user?.id}
          autoStart={true}
          recordingNumber={recordingNumber}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={insets.bottom}
      >
        <LeaderModeHeader compact />
        {hasMessages && (
          <View style={styles.header}>
            <TouchableOpacity
              onPress={startNewConversation}
              style={styles.exitButton}
              activeOpacity={0.7}
            >
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15 18L9 12L15 6"
                  stroke={colors.primary}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
            <View style={styles.headerCenter} pointerEvents="none">
              <View style={styles.headerDot} />
              <Text style={styles.headerTitle}>{t('assistantTitle')}</Text>
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
          ListHeaderComponent={
            historyItems.length > 0 && !hasMessages ? (
              <View style={styles.historyInline}>
              <Text style={styles.historyInlineTitle}>{t('chatHistory')}</Text>
                <ScrollView
                  style={styles.historyScroll}
                  contentContainerStyle={styles.historyScrollContent}
                  showsVerticalScrollIndicator={true}
                >
                  {historyItems.map((item) => (
                    <View key={item.id} style={styles.historyInlineItem}>
                      <TouchableOpacity
                        style={styles.historyItem}
                        onPress={() => handleSelectConversation(item.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.historyTitle}>
                          {item.title || t('conversationFallback')}
                        </Text>
                        <Text style={styles.historyDate}>
                          {new Date(item.updatedAt || item.createdAt).toLocaleString()}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : null
          }
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          alwaysBounceVertical={true}
          bounces={true}
          overScrollMode="always"
        />

        {sending && (
          <View style={styles.typingIndicator}>
            <View style={styles.typingDots}>
              <View style={[styles.typingDot, styles.typingDot1]} />
              <View style={[styles.typingDot, styles.typingDot2]} />
              <View style={[styles.typingDot, styles.typingDot3]} />
            </View>
          <Text style={styles.typingText}>{t('thinking')}</Text>
          </View>
        )}

        <View
          style={[
            styles.inputWrapper,
            { paddingBottom: Math.max(insets.bottom, spacing.sm) },
          ]}
        >
            <ChatInput
              onSend={send}
              onMicPress={handleMicPress}
              onAttachPress={handleAttachPress}
              disabled={sending || loading}
              externalText={transcribedText}
              onExternalTextConsumed={handleExternalTextConsumed}
            />
        </View>
        <PatternLockModal />
        <RecordingModal
          visible={showRecordingModal}
          onClose={() => setShowRecordingModal(false)}
          onRecordingComplete={handleRecordingComplete}
          onTranscription={handleTranscription}
          userId={user?.id}
          autoStart={true}
          recordingNumber={recordingNumber}
        />
      </KeyboardAvoidingView>
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
    position: 'relative',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  exitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
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
  historyInline: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  historyInlineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  historyScroll: {
    maxHeight: 240,
  },
  historyScrollContent: {
    paddingBottom: spacing.sm,
  },
  historyInlineItem: {
    paddingHorizontal: spacing.md,
  },
  historyItem: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyItemContent: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  historyTrashButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  historyDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  inputWrapper: {
    paddingBottom: spacing.sm,
  },
  keyboardContainer: {
    flex: 1,
  },
});
