
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecordingPlayerProps {
  recordingUrl: string;
  label?: string;
}

const VoiceRecordingPlayer: React.FC<VoiceRecordingPlayerProps> = ({
  recordingUrl,
  label = "Recording"
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Create audio element when component mounts
  useEffect(() => {
    const audio = new Audio();
    
    // Add event listeners
    audio.addEventListener('ended', () => setIsPlaying(false));
    audio.addEventListener('canplaythrough', () => setIsLoading(false));
    
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setError('Failed to load audio file');
      setIsPlaying(false);
      setIsLoading(false);
      
      toast({
        title: "Audio Error",
        description: "Could not play the voice recording. The file may be missing or in an unsupported format.",
        variant: "destructive",
      });
    });
    
    audioRef.current = audio;
    
    // Clean up on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
        audioRef.current.removeEventListener('canplaythrough', () => setIsLoading(false));
        audioRef.current.removeEventListener('error', () => {});
      }
    };
  }, [toast]);

  // Update audio source when recordingUrl changes
  useEffect(() => {
    if (audioRef.current && recordingUrl) {
      audioRef.current.src = recordingUrl;
      setError(null);
    }
  }, [recordingUrl]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        setError(null);
        
        // Ensure we're using the latest URL
        audioRef.current.src = recordingUrl;
        
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              toast({
                title: "Playing Recording",
                description: "Voice recording is now playing.",
              });
            })
            .catch(err => {
              console.error("Error playing audio:", err);
              setError("Failed to play audio");
              setIsLoading(false);
              
              toast({
                title: "Audio Error",
                description: "Could not play the voice recording. The file may be missing or corrupted.",
                variant: "destructive",
              });
            });
        }
      }
    } catch (error) {
      console.error("VoiceRecordingPlayer error:", error);
      setError("An unexpected error occurred");
      setIsLoading(false);
      
      toast({
        title: "Error",
        description: "An unexpected error occurred with the audio player.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handlePlayPause}
      disabled={isLoading || !!error || !recordingUrl}
      className={`${error ? 'border-red-500 text-red-600 hover:bg-red-50' : 'border-purple-500 text-purple-600 hover:bg-purple-50'}`}
    >
      {isLoading ? (
        <span className="flex items-center">
          <span className="animate-spin h-4 w-4 mr-2 border-2 border-purple-600 border-t-transparent rounded-full" />
          Loading...
        </span>
      ) : isPlaying ? (
        <>
          <Pause className="h-4 w-4 mr-1" />
          Pause {label}
        </>
      ) : error ? (
        <>
          <span className="h-4 w-4 mr-1">⚠️</span>
          Audio Unavailable
        </>
      ) : (
        <>
          <Play className="h-4 w-4 mr-1" />
          Play {label}
        </>
      )}
    </Button>
  );
};

export default VoiceRecordingPlayer;
