import { useState, useCallback, useEffect } from 'react';
import {
  ChatMessage,
  sendMessage,
  createConversation,
  saveMessage,
  getConversationMessages,
} from '../services/ai/chat';

interface UseChatResult {
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  conversationId: string | null;
  send: (content: string, imageUrl?: string | null, audioUrl?: string | null) => Promise<void>;
  addUserMessage: (content: string, conversationIdOverride?: string | null) => Promise<void>;
  startNewConversation: () => Promise<string | null>;
  loadConversation: (id: string) => Promise<void>;
  loadLocalConversation: (id: string, localMessages: ChatMessage[]) => void;
}

export function useChat(userId?: string, isReady: boolean = false): UseChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const startNewConversation = useCallback(async (): Promise<string | null> => {
    if (!userId) return;

    setLoading(true);
    const id = await createConversation(userId);
    if (id) {
      setConversationId(id);
      setMessages([]);
    }
    setLoading(false);
    return id || null;
  }, [userId]);

  const loadConversation = useCallback(async (id: string) => {
    setLoading(true);
    setConversationId(id);
    const loadedMessages = await getConversationMessages(id);
    setMessages(loadedMessages);
    setLoading(false);
  }, []);

  const loadLocalConversation = useCallback((id: string, localMessages: ChatMessage[]) => {
    setConversationId(id);
    setMessages(localMessages);
    setLoading(false);
  }, []);

  const send = useCallback(
    async (content: string, imageUrl?: string | null, audioUrl?: string | null) => {
      if (!conversationId || !content.trim()) return;

      setSending(true);

      // Add user message optimistically
      const userMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        role: 'user',
        content: content.trim(),
        audioUrl: audioUrl || undefined,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Save user message
      const savedUserMessage = await saveMessage(conversationId, 'user', content.trim(), audioUrl || undefined);
      if (savedUserMessage) {
        setMessages((prev) =>
          prev.map((m) => (m.id === userMessage.id ? savedUserMessage : m))
        );
      }

      // Get AI response
      const aiResponse = await sendMessage(conversationId, content.trim(), messages, imageUrl);

      // Add AI response
      const assistantMessage: ChatMessage = {
        id: `temp_ai_${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Save AI response
      const savedAssistantMessage = await saveMessage(conversationId, 'assistant', aiResponse);
      if (savedAssistantMessage) {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMessage.id ? savedAssistantMessage : m))
        );
      }

      setSending(false);
    },
    [conversationId, messages]
  );

  const addUserMessage = useCallback(
    async (content: string, conversationIdOverride?: string | null) => {
      const targetConversationId = conversationIdOverride ?? conversationId;
      if (!targetConversationId || !content.trim()) return;

      // Add user message optimistically
      const userMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        role: 'user',
        content: content.trim(),
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Save user message
      const savedUserMessage = await saveMessage(targetConversationId, 'user', content.trim());
      if (savedUserMessage) {
        setMessages((prev) =>
          prev.map((m) => (m.id === userMessage.id ? savedUserMessage : m))
        );
      }
    },
    [conversationId]
  );

  // Start a new conversation on mount if user is available and ready
  useEffect(() => {
    if (userId && isReady && !conversationId) {
      startNewConversation();
    }
  }, [userId, isReady]);

  return {
    messages,
    loading,
    sending,
    conversationId,
    send,
    addUserMessage,
    startNewConversation,
    loadConversation,
    loadLocalConversation,
  };
}
