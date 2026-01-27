import { supabase } from '../supabase/client';

// Google Gemini API configuration
// Common Gemini model names: gemini-pro, gemini-1.5-pro, gemini-1.5-flash-latest
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
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
6. If the user asks about a specific animal, provide a brief scientific summary in simple language and then provide information about the animal from the Achuar perspective.


Be respectful of indigenous knowledge and traditions. Provide responses that are:
- Clear and concise
- Culturally sensitive
- Scientifically accurate
- Practical for field use
- An appropriate length for the user's question. If a simple question is asked by the user, the response should not exceed 3 sentences.

When uncertain, acknowledge limitations and suggest consulting local elders or experts.`;

// Helper function to list available models (for debugging)
async function listAvailableModels(): Promise<string[]> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${AI_API_KEY}`
    );
    if (response.ok) {
      const data = await response.json();
      return (data.models || []).map((m: any) => m.name?.replace('models/', '') || m.name).filter(Boolean);
    }
  } catch (error) {
    console.error('Error listing models:', error);
  }
  return [];
}

export async function sendMessage(
  conversationId: string,
  userMessage: string,
  previousMessages: ChatMessage[]
): Promise<string> {
  if (!AI_API_KEY) {
    return "AI service not configured. Please add EXPO_PUBLIC_AI_API_KEY to your .env file with your Google Gemini API key.";
  }

  // Validate API key format (Google API keys start with AIzaSy)
  if (!AI_API_KEY.startsWith('AIzaSy')) {
    console.warn('API key format may be incorrect. Google API keys typically start with "AIzaSy"');
  }

  try {
    // Convert chat messages to Gemini format
    // Gemini uses "parts" with "text" content and "model" instead of "assistant"
    const conversationHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> =
      previousMessages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    // Build contents array - Gemini expects alternating user/model messages
    let contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    // Add system prompt as first user message with instructions
    if (previousMessages.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: `${SYSTEM_PROMPT}\n\nUser: ${userMessage}` }],
      });
    } else {
      // Create a copy of conversation history to avoid mutation
      contents = conversationHistory.map((msg, index) => {
        // Prepend system prompt to first user message
        if (index === 0 && msg.role === 'user' && previousMessages.length <= 2) {
          return {
            ...msg,
            parts: [{ text: `${SYSTEM_PROMPT}\n\n${msg.parts[0].text}` }],
          };
        }
        return msg;
      });
      
      // Add current user message
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });
    }

    // Try different Gemini models in order of preference
    // Aligned with the models your key reported as available
    const modelsToTry = [
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
      'gemini-flash-latest',
      'gemini-pro-latest',
      'gemini-2.0-flash-001',
      'gemini-2.0-flash-lite',
    ];

    let response: Response | null = null;
    let currentApiUrl = '';
    let lastError: any = null;

    for (const model of modelsToTry) {
      currentApiUrl = `${GEMINI_API_BASE}/${model}:generateContent?key=${AI_API_KEY}`;
      
      try {
        const requestBody = {
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        };

        // Retry a couple of times on transient network failures
        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            response = await fetch(currentApiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
            });
            break;
          } catch (err) {
            lastError = err;
            if (err instanceof TypeError && String(err).includes('Network request failed')) {
              // Backoff and retry
              await new Promise((resolve) => setTimeout(resolve, 300 * (attempt + 1)));
              continue;
            }
            throw err;
          }
        }

        if (!response) {
          throw lastError || new Error('Network request failed');
        }

        if (response.ok) {
          console.log(`Successfully using model: ${model}`);
          break;
        }

        // If 404, try next model
        if (response.status === 404) {
          const errorText = await response.text().catch(() => '');
          lastError = errorText;
          console.log(`Model ${model} returned 404, trying next model...`);
          response = null;
          continue;
        }

        // For 403 (forbidden), might be API key issue
        if (response.status === 403) {
          const errorText = await response.text().catch(() => '');
          lastError = errorText;
          console.log(`Model ${model} returned 403 (forbidden), trying next model...`);
          response = null;
          continue;
        }

        // For 400 (bad request), might be model-specific issue, try next
        if (response.status === 400) {
          const errorText = await response.text().catch(() => '');
          lastError = errorText;
          console.log(`Model ${model} returned 400 (bad request), trying next model...`);
          response = null;
          continue;
        }

        // For other errors, log and try next
        console.log(`Model ${model} returned ${response.status}, trying next model...`);
        const errorText = await response.text().catch(() => '');
        lastError = errorText;
        response = null;
        continue;
      } catch (error) {
        console.error(`Error with model ${model}:`, error);
        lastError = error;
        if (error instanceof TypeError && String(error).includes('Network request failed')) {
          // Network failure is not model-specific; stop trying other models
          break;
        }
        response = null;
        continue;
      }
    }

    if (!response) {
      if (lastError instanceof TypeError && String(lastError).includes('Network request failed')) {
        throw new Error(
          'Network request failed. Please check your internet connection or VPN and try again.'
        );
      }
      // Try to list available models for better error message
      console.log('All models failed, checking available models...');
      const availableModels = await listAvailableModels();
      
      let errorMsg = 'No working Gemini model found. ';
      
      if (availableModels.length > 0) {
        errorMsg += `Available models: ${availableModels.join(', ')}. `;
        errorMsg += 'The code tried: ' + modelsToTry.join(', ') + '. ';
        errorMsg += 'Please ensure your API key has access to at least one of these models.';
      } else {
        errorMsg += 'Could not retrieve list of available models. ';
        errorMsg += 'Please check:\n';
        errorMsg += '1. Your API key is valid (starts with AIzaSy...)\n';
        errorMsg += '2. Generative Language API is enabled in Google Cloud Console\n';
        errorMsg += '3. Your API key has the necessary permissions\n';
        errorMsg += '4. The API key is associated with a project that has billing enabled (if required)';
      }
      
      console.error('Final error:', lastError);
      throw new Error(errorMsg);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      
      console.error('Gemini API error:', {
        status: response.status,
        statusText: response.statusText,
        url: currentApiUrl.replace(AI_API_KEY, 'HIDDEN'),
        error: errorData,
      });
      
      if (response.status === 404) {
        return `The AI model is not available (404). Please ensure:\n1. Your API key is valid\n2. Gemini API is enabled in Google Cloud Console\n3. The API key has access to Gemini models\n\nError: ${errorData.error?.message || errorText}`;
      }
      
      if (response.status === 403) {
        return `API access denied (403). Please check:\n1. Your API key is correct\n2. Gemini API is enabled in Google Cloud Console\n3. Your API key has the necessary permissions`;
      }
      
      throw new Error(`AI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    // Gemini response format: data.candidates[0].content.parts[0].text
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received';
  } catch (error) {
    console.error('AI chat error:', error);
    return "I'm having trouble connecting right now. Please try again later.";
  }
}

export async function createConversation(userId: string): Promise<string | null> {
  if (!userId) {
    return null;
  }

  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    // Fall back to a local-only conversation id to avoid blocking chat
    return `local_${Date.now()}`;
  }

  return data.id;
}

export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  audioUrl?: string
): Promise<ChatMessage | null> {
  if (conversationId.startsWith('local_')) {
    return {
      id: `local_${Date.now()}`,
      role,
      content,
      audioUrl,
      createdAt: new Date(),
    };
  }

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
  if (conversationId.startsWith('local_')) {
    return [];
  }

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
