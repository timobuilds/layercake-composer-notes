import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface RealTimeTranscriptProps {
  isRecording: boolean;
  finalTranscript?: string;
  className?: string;
}

export const RealTimeTranscript: React.FC<RealTimeTranscriptProps> = ({
  isRecording,
  finalTranscript,
  className
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

    const phrases = [
      "This is a sample",
      "voice note transcription",
      "happening in real-time",
      "as you speak into",
      "the microphone",
      "and the AI processes",
      "your speech"
    ];

    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let accumulatedText = '';

    const typeText = () => {
      if (currentPhraseIndex >= phrases.length) {
        setIsTyping(false);
        return;
      }

      setIsTyping(true);
      const currentPhrase = phrases[currentPhraseIndex];
      
      if (currentCharIndex < currentPhrase.length) {
        accumulatedText += currentPhrase[currentCharIndex];
        setCurrentText(accumulatedText);
        currentCharIndex++;
        
        // Vary typing speed for more natural feel
        const delay = Math.random() * 100 + 50;
        setTimeout(typeText, delay);
      } else {
        // Finished current phrase, move to next
        accumulatedText += ' ';
        setCurrentText(accumulatedText);
        currentPhraseIndex++;
        currentCharIndex = 0;
        
        // Pause between phrases
        setTimeout(typeText, 300 + Math.random() * 500);
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