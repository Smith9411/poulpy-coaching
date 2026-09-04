'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

interface AudioMessagePlayerProps {
  src: string;
  isMine: boolean;
}

export default function AudioMessagePlayer({ src, isMine }: AudioMessagePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<1 | 1.5 | 2>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const toggleRate = () => {
    const nextRate: 1 | 1.5 | 2 = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex items-center gap-3 py-1 min-w-[240px] max-w-[320px]">
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md ${
          isMine
            ? 'bg-white text-purple-600 hover:bg-gray-100'
            : 'bg-gradient-to-br from-purple-600 to-cyan-500 text-white hover:opacity-95'
        }`}
        aria-label={isPlaying ? 'Pause' : 'Lecture'}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
      </button>

      {/* Progress & Waveform */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 h-5 mb-1">
          {/* Animated visualizer bars */}
          {[40, 70, 90, 60, 100, 50, 80, 45, 95, 65, 85, 40, 75, 55, 90, 60].map((h, i) => {
            const progress = duration > 0 ? (currentTime / duration) * 16 : 0;
            const isPassed = i <= progress;
            return (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all duration-150 ${
                  isPassed
                    ? isMine ? 'bg-white' : 'bg-purple-400'
                    : isMine ? 'bg-white/30' : 'bg-white/15'
                } ${isPlaying ? 'animate-pulse' : ''}`}
                style={{
                  height: `${h}%`,
                }}
              />
            );
          })}
        </div>

        {/* Range Slider for seeking */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
        />

        {/* Timer display */}
        <div className={`flex items-center justify-between text-[10px] mt-1 ${isMine ? 'text-white/80' : 'text-gray-400'}`}>
          <span>{formatTime(currentTime)}</span>
          <span>{duration > 0 ? formatTime(duration) : 'Note vocale'}</span>
        </div>
      </div>

      {/* Speed Button */}
      <button
        type="button"
        onClick={toggleRate}
        className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors shrink-0 ${
          isMine
            ? 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
        }`}
        title="Vitesse de lecture"
      >
        {playbackRate}x
      </button>
    </div>
  );
}
