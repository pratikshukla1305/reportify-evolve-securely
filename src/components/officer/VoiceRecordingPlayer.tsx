
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Clean up audio element on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const handlePlayPause = async () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(recordingUrl);
        
        // Add event listeners
        audioRef.current.addEventListener('ended', () => {
          setIsPlaying(false);
        });
        
        audioRef.current.addEventListener('error', (e) => {
          console.error('Audio error:', e);
          toast({
            title: "Audio Error",
            description: "Could not play the voice recording. Please try again later.",
            variant: "destructive",
          });
          setIsPlaying(false);
        });
      }
      
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          // Force reload the source to address potential stale references
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
                toast({
                  title: "Audio Error",
                  description: "Could not play the voice recording. Please try again later.",
                  variant: "destructive",
                });
              });
          }
        } catch (error) {
          console.error("Error setting up audio playback:", error);
          toast({
            title: "Audio Error",
            description: "Failed to set up audio playback.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("VoiceRecordingPlayer error:", error);
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
      className="border-purple-500 text-purple-600 hover:bg-purple-50"
    >
      {isPlaying ? (
        <>
          <Pause className="h-4 w-4 mr-1" />
          Pause {label}
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
