import { supabase } from '../supabase/client';

const AI_API_URL = process.env.EXPO_PUBLIC_AI_API_URL || 'https://api.perplexity.ai';
const AI_API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY || '';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  audioUrl?: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  title?: string;
  messages: ChatMessage[];
  createdAt: Date;
}

const SYSTEM_PROMPT = `You are an AI assistant for the Achuar Dome wildlife monitoring app, used by the Achuar community in the Ecuadorian Amazon. Your role is to:

1. Help identify wildlife species based on descriptions
2. Provide information about local flora and fauna
3. Answer questions about wildlife conservation
4. Assist with understanding animal behaviors and habitats
5. Help document observations accurately

Be respectful of indigenous knowledge and traditions. Provide responses that are:
- Clear and concise
- Culturally sensitive
- Scientifically accurate
- Practical for field use

When uncertain, acknowledge limitations and suggest consulting local elders or experts.`;

export async function sendMessage(
  conversationId: string,
  userMessage: string,
  previousMessages: ChatMessage[]
): Promise<string> {
  if (!AI_API_KEY) {
    return "AI service not configured. Please add your API key to the .env file.";
  }

  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...previousMessages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    const response = await fetch(`${AI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response received';
  } catch (error) {
    console.error('AI chat error:', error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
}

export async function createConversation(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }

  return data.id;
}

export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  audioUrl?: string
): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content,
      audio_url: audioUrl,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving message:', error);
    return null;
  }

  return {
    id: data.id,
    role: data.role,
    content: data.content,
    audioUrl: data.audio_url,
    createdAt: new Date(data.created_at),
  };
}

export async function getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return (data || []).map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    audioUrl: m.audio_url,
    createdAt: new Date(m.created_at),
  }));
}

export async function getRecentConversations(userId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return (data || []).map((c) => ({
    id: c.id,
    title: c.title,
    messages: [],
    createdAt: new Date(c.created_at),
  }));
}
