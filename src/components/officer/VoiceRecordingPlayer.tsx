
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, AlertTriangle } from 'lucide-react';
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

  // Log when recordingUrl changes to help debug
  useEffect(() => {
    console.log('VoiceRecordingPlayer received URL:', recordingUrl);
  }, [recordingUrl]);

  // Create audio element when component mounts
  useEffect(() => {
    const audio = new Audio();
    
    // Add event listeners
    audio.addEventListener('ended', () => setIsPlaying(false));
    audio.addEventListener('canplaythrough', () => {
      console.log('Audio can play through');
      setIsLoading(false);
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e, audio.error);
      setError(`Failed to load audio: ${audio.error?.message || 'Unknown error'}`);
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
      console.log('Setting audio source to:', recordingUrl);
      audioRef.current.src = recordingUrl;
      setError(null);
    }
  }, [recordingUrl]);

  const handlePlayPause = () => {
    if (!audioRef.current) {
      console.error('Audio ref is null');
      return;
    }
    
    if (!recordingUrl) {
      console.error('No recording URL provided');
      toast({
        title: "Missing Audio",
        description: "No voice recording URL was provided.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (isPlaying) {
        console.log('Pausing audio');
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        console.log('Attempting to play audio from:', recordingUrl);
        setIsLoading(true);
        setError(null);
        
        // Ensure we're using the latest URL
        audioRef.current.src = recordingUrl;
        
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Audio playing successfully');
              setIsPlaying(true);
              toast({
                title: "Playing Recording",
                description: "Voice recording is now playing.",
              });
            })
            .catch(err => {
              console.error("Error playing audio:", err);
              setError(`Failed to play audio: ${err.message}`);
              setIsLoading(false);
              
              toast({
                title: "Audio Error",
                description: "Could not play the voice recording. The file may be missing or corrupted.",
                variant: "destructive",
              });
            });
        }
      }
    } catch (error: any) {
      console.error("VoiceRecordingPlayer error:", error);
      setError(`An unexpected error occurred: ${error.message}`);
      setIsLoading(false);
      
      toast({
        title: "Error",
        description: "An unexpected error occurred with the audio player.",
        variant: "destructive",
      });
    }
  };

  // If URL is empty, show a different state
  if (!recordingUrl) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        disabled={true}
        className="border-gray-300 text-gray-400"
      >
        <AlertTriangle className="h-4 w-4 mr-1" />
        No Recording Available
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handlePlayPause}
      disabled={isLoading || !!error}
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
          <AlertTriangle className="h-4 w-4 mr-1" />
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
