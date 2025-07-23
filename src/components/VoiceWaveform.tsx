import React, { useEffect, useRef, useState } from 'react';

interface VoiceWaveformProps {
  isRecording: boolean;
  audioStream?: MediaStream;
  className?: string;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  isRecording,
  audioStream,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode>();
  const dataArrayRef = useRef<Uint8Array>();
  const [bars, setBars] = useState<number[]>(new Array(32).fill(0));

  useEffect(() => {
    if (!isRecording || !audioStream) {
      // Stop animation and reset bars
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      setBars(new Array(32).fill(0));
      return;
    }

    // Create audio context and analyser
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(audioStream);
    
    analyser.fftSize = 64;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    source.connect(analyser);
    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    const animate = () => {
      if (!analyserRef.current || !dataArrayRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      
      // Convert frequency data to bar heights
      const newBars = Array.from(dataArrayRef.current).map(value => {
        return Math.max(0.1, (value / 255) * 100);
      });
      
      setBars(newBars);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [isRecording, audioStream]);

  return (
    <div className={`flex items-center justify-center space-x-1 h-16 ${className}`}>
      {bars.map((height, index) => (
        <div
          key={index}
          className="bg-primary transition-all duration-75 ease-out rounded-full"
          style={{
            height: `${Math.max(4, height)}%`,
            width: '3px',
            opacity: isRecording ? 0.8 : 0.3,
          }}
        />
      ))}
    </div>
  );
};