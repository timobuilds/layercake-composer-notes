export interface RecordingState {
  isRecording: boolean;
  isPlaying: boolean;
  duration: number;
  audioBlob?: Blob;
  audioUrl?: string;
  mediaStream?: MediaStream;
}

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private startTime: number = 0;

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.chunks = [];
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      throw new Error(`Failed to start recording: ${error}`);
    }
  }

  async stopRecording(): Promise<{ audioBlob: Blob; duration: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.chunks, { type: 'audio/webm' });
        const duration = Date.now() - this.startTime;
        
        // Clean up
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }
        this.mediaRecorder = null;
        
        resolve({ audioBlob, duration });
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  cancelRecording(): void {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.chunks = [];
  }

  getCurrentStream(): MediaStream | null {
    return this.stream;
  }
}

// Utility functions for audio playback
export const createAudioPlayer = (audioBlob: Blob): HTMLAudioElement => {
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  return audio;
};

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};