import * as FileSystem from 'expo-file-system/legacy';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const AI_API_KEY = process.env.EXPO_PUBLIC_AI_API_KEY || '';

const TRANSCRIPTION_PROMPT =
  'Transcribe the following audio exactly as spoken. Return only the transcribed text, nothing else. The audio is most likely in Spanish.';

const MODELS_TO_TRY = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-flash-latest',
];

export async function transcribeAudio(uri: string): Promise<string> {
  if (!AI_API_KEY) {
    throw new Error('AI service not configured.');
  }

  const fs = FileSystem as any;
  const base64 = await fs.readAsStringAsync(uri, { encoding: 'base64' });

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: TRANSCRIPTION_PROMPT },
          { inlineData: { mimeType: 'audio/m4a', data: base64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 500,
    },
  };

  let lastError: any = null;

  for (const model of MODELS_TO_TRY) {
    const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${AI_API_KEY}`;

    try {
      let response: Response | null = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });
          break;
        } catch (err) {
          lastError = err;
          if (err instanceof TypeError && String(err).includes('Network request failed')) {
            await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
            continue;
          }
          throw err;
        }
      }

      if (!response) {
        throw lastError || new Error('Network request failed');
      }

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) return text;
        throw new Error('Empty transcription response');
      }

      if ([400, 403, 404].includes(response.status)) {
        lastError = await response.text().catch(() => '');
        console.log(`Transcribe: model ${model} returned ${response.status}, trying next...`);
        continue;
      }

      lastError = await response.text().catch(() => '');
      continue;
    } catch (error) {
      console.error(`Transcribe error with ${model}:`, error);
      lastError = error;
      if (error instanceof TypeError && String(error).includes('Network request failed')) {
        break;
      }
      continue;
    }
  }

  throw new Error(
    lastError instanceof TypeError && String(lastError).includes('Network request failed')
      ? 'Network request failed. Please check your connection.'
      : 'Transcription failed. Please try again.'
  );
}
