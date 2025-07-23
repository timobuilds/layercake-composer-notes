import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface RealTimeTranscriptProps {
  isRecording: boolean;
  finalTranscript?: string;
  className?: string;
  onSentenceComplete?: (sentence: string) => void;
}

export const RealTimeTranscript: React.FC<RealTimeTranscriptProps> = ({
  isRecording,
  finalTranscript,
  className,
  onSentenceComplete
}) => {
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Simulate real-time transcription with dummy text
  useEffect(() => {
    if (!isRecording) {
      setCurrentText('');
      setIsTyping(false);
      return;
    }

    const sentences = [
      "This is a sample sentence for testing.",
      "Voice notes create nested nodes automatically.",
      "Each sentence becomes a separate child node.",
      "Real-time transcription makes note-taking seamless."
    ];

    let currentSentenceIndex = 0;
    let currentCharIndex = 0;
    let currentSentenceText = '';

    const typeText = () => {
      if (currentSentenceIndex >= sentences.length) {
        setIsTyping(false);
        return;
      }

      setIsTyping(true);
      const currentSentence = sentences[currentSentenceIndex];
      
      if (currentCharIndex < currentSentence.length) {
        currentSentenceText += currentSentence[currentCharIndex];
        setCurrentText(currentSentenceText);
        currentCharIndex++;
        
        // Vary typing speed for more natural feel
        const delay = Math.random() * 100 + 50;
        setTimeout(typeText, delay);
      } else {
        // Finished current sentence, trigger node creation
        if (onSentenceComplete) {
          onSentenceComplete(currentSentence);
        }
        
        currentSentenceIndex++;
        currentCharIndex = 0;
        currentSentenceText = '';
        setCurrentText('');
        
        // Pause between sentences
        setTimeout(typeText, 800 + Math.random() * 500);
      }
    };

    // Start typing after a short delay
    const startDelay = setTimeout(typeText, 500);

    return () => {
      clearTimeout(startDelay);
      setIsTyping(false);
    };
  }, [isRecording]);

  // Show final transcript if available
  const displayText = finalTranscript || currentText;

  if (!displayText && !isRecording) {
    return null;
  }

  return (
    <div className={cn("min-h-[60px] p-4 bg-muted/50 rounded-lg", className)}>
      <div className="text-sm text-muted-foreground mb-1">
        {isRecording ? 'Real-time transcription:' : 'Transcript:'}
      </div>
      <div className="text-foreground leading-relaxed">
        {displayText}
        {isTyping && isRecording && (
          <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
        )}
      </div>
    </div>
  );
};