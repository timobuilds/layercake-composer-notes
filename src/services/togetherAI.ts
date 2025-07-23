export interface TogetherAIConfig {
  apiKey: string;
  baseUrl?: string;
}

export class TogetherAIService {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: TogetherAIConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.together.xyz/v1';
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-large-v3');

    const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.text;
  }

  async generateAISummary(transcript: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that summarizes voice notes. Provide a concise summary of the main points.',
          },
          {
            role: 'user',
            content: `Please summarize this voice note transcript: ${transcript}`,
          },
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI summary failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.choices[0]?.message?.content || '';
  }

  async extractActionItems(transcript: string): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts action items from voice notes. Return a JSON array of action items, or an empty array if none are found.',
          },
          {
            role: 'user',
            content: `Extract action items from this voice note transcript. Return only a JSON array: ${transcript}`,
          },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`Action item extraction failed: ${response.statusText}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content || '[]';
    
    try {
      return JSON.parse(content);
    } catch {
      // If parsing fails, try to extract items manually
      const lines = content.split('\n').filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'));
      return lines.map(line => line.replace(/^[-•]\s*/, '').trim()).filter(Boolean);
    }
  }

  async expandToFullNote(transcript: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that expands brief voice notes into well-structured, detailed notes. Maintain the original meaning while adding clarity and structure.',
          },
          {
            role: 'user',
            content: `Please expand this voice note transcript into a well-structured, detailed note: ${transcript}`,
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`Note expansion failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.choices[0]?.message?.content || transcript;
  }
}

// Singleton instance management
let togetherAIInstance: TogetherAIService | null = null;

export const getTogetherAI = (): TogetherAIService | null => {
  return togetherAIInstance;
};

export const initializeTogetherAI = (apiKey: string): TogetherAIService => {
  togetherAIInstance = new TogetherAIService({ apiKey });
  return togetherAIInstance;
};

export const isTogetherAIInitialized = (): boolean => {
  return togetherAIInstance !== null;
};