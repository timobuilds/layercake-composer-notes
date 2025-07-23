export interface TogetherAIConfig {
  apiKey: string;
  baseUrl?: string;
}

export class TogetherAIService {
  private apiKey: string;
  private baseUrl: string;
  private isDummyMode: boolean;

  constructor(config: TogetherAIConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.together.xyz/v1';
    this.isDummyMode = config.apiKey === 'dummy-api-key-for-testing';
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    // Return mock transcription for dummy mode
    if (this.isDummyMode) {
      await this.simulateDelay(1000, 3000); // Simulate API delay
      const mockTranscripts = [
        "This is a sample voice note transcription. The audio has been converted to text using AI.",
        "I need to remember to buy groceries tomorrow: milk, bread, and eggs.",
        "Meeting notes: Discussed the project timeline and decided to push the deadline by one week.",
        "Great idea for the app: add voice notes to each node so users can record thoughts quickly.",
        "Don't forget to call the dentist to schedule an appointment for next month."
      ];
      return mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
    }

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
    // Return mock summary for dummy mode
    if (this.isDummyMode) {
      await this.simulateDelay(800, 2000);
      return `Summary: ${transcript.slice(0, 100)}${transcript.length > 100 ? '...' : ''} - Key points extracted and condensed for quick reference.`;
    }

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
    // Return mock action items for dummy mode
    if (this.isDummyMode) {
      await this.simulateDelay(600, 1500);
      const mockActions = [
        "Schedule follow-up meeting",
        "Send summary email to team",
        "Review and update project timeline",
        "Complete pending tasks by Friday"
      ];
      // Return 1-3 random action items
      const numActions = Math.floor(Math.random() * 3) + 1;
      return mockActions.slice(0, numActions);
    }

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
    // Return mock expanded note for dummy mode
    if (this.isDummyMode) {
      await this.simulateDelay(1000, 2500);
      return `# Expanded Note\n\nBased on the voice recording, here's a structured expansion:\n\n## Main Points\n- ${transcript.slice(0, 50)}...\n\n## Additional Context\nThis note has been expanded with relevant details and structure to make it more comprehensive and actionable.\n\n## Next Steps\n- Review the content\n- Add any missing information\n- Share with relevant stakeholders`;
    }

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

  private async simulateDelay(min: number, max: number): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Singleton instance management
let togetherAIInstance: TogetherAIService | null = null;

export const getTogetherAI = (): TogetherAIService | null => {
  return togetherAIInstance;
};

export const initializeTogetherAI = (apiKey: string = 'dummy-api-key-for-testing'): TogetherAIService => {
  togetherAIInstance = new TogetherAIService({ apiKey });
  return togetherAIInstance;
};

export const isTogetherAIInitialized = (): boolean => {
  return togetherAIInstance !== null;
};

// Initialize with dummy key by default for development
if (!togetherAIInstance) {
  initializeTogetherAI();
}