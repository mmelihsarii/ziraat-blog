/**
 * Dosyanın görevi: Galeri videolarını tarayıcının ham oynatıcı sayfasına yönlendirmeden özel kontrollü arayüzde oynatır.
 * Kullanıldığı yerler: components/GalleryExperience.tsx
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react';

interface CustomVideoPlayerProps {
  src: string;
  poster?: string | null;
  label: string;
}

/** Saniyeyi kısa dakika:saniye etiketine dönüştürür. */
function formatTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '0:00';
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

/** Video, zaman çizgisi, ses ve tam ekran durumlarını tek erişilebilir oynatıcıda yönetir. */
export default function CustomVideoPlayer({ src, poster, label }: CustomVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [src]);

  /** Oynatma durumunu kullanıcı hareketiyle güvenli biçimde değiştirir. */
  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) await video.play();
    else video.pause();
  };

  /** Klavye ile oynatma ve kısa ileri/geri sarma sağlar. */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;
    if (event.key === ' ') {
      event.preventDefault();
      void togglePlayback();
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      video.currentTime = Math.max(0, video.currentTime - 5);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
    }
  };

  /** Oynatıcı yüzeyini desteklenen tarayıcılarda tam ekrana geçirir. */
  const enterFullscreen = async () => {
    if (containerRef.current?.requestFullscreen) await containerRef.current.requestFullscreen();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black overflow-hidden select-none"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`${label} video oynatıcı`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster || undefined}
        preload="metadata"
        playsInline
        disablePictureInPicture
        controlsList="nodownload noplaybackrate noremoteplayback"
        className="h-full w-full object-contain"
        onClick={() => void togglePlayback()}
        onContextMenu={(event) => event.preventDefault()}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setWaiting(true)}
        onPlaying={() => setWaiting(false)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
        onEnded={() => setPlaying(false)}
      />

      {!playing && !waiting && (
        <button
          type="button"
          onClick={() => void togglePlayback()}
          className="absolute inset-0 m-auto w-16 h-16 flex items-center justify-center bg-emerald-600/95 hover:bg-emerald-500 text-white rounded-full shadow-xl transition-colors"
          aria-label="Videoyu oynat"
        >
          <Play className="w-7 h-7 ml-1" fill="currentColor" />
        </button>
      )}
      {waiting && <Loader2 className="absolute inset-0 m-auto w-9 h-9 text-white animate-spin" />}

      <div className="absolute inset-x-0 bottom-0 bg-black/85 border-t border-white/10 px-3 py-3 md:px-4">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step="0.05"
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => {
            if (videoRef.current) videoRef.current.currentTime = Number(event.target.value);
          }}
          className="block w-full h-1 accent-emerald-500 cursor-pointer"
          aria-label="Video zamanı"
        />
        <div className="mt-2 flex items-center gap-2 text-white">
          <button type="button" onClick={() => void togglePlayback()} className="w-9 h-9 flex items-center justify-center hover:text-emerald-400" aria-label={playing ? 'Duraklat' : 'Oynat'} title={playing ? 'Duraklat' : 'Oynat'}>
            {playing ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5" fill="currentColor" />}
          </button>
          <button
            type="button"
            onClick={() => {
              const nextVolume = volume > 0 ? 0 : 1;
              setVolume(nextVolume);
              if (videoRef.current) videoRef.current.volume = nextVolume;
            }}
            className="w-9 h-9 flex items-center justify-center hover:text-emerald-400"
            aria-label={volume > 0 ? 'Sesi kapat' : 'Sesi aç'}
            title={volume > 0 ? 'Sesi kapat' : 'Sesi aç'}
          >
            {volume > 0 ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(event) => {
              const nextVolume = Number(event.target.value);
              setVolume(nextVolume);
              if (videoRef.current) videoRef.current.volume = nextVolume;
            }}
            className="hidden sm:block w-20 h-1 accent-emerald-500 cursor-pointer"
            aria-label="Ses düzeyi"
          />
          <span className="text-xs font-sans tabular-nums text-white/75 whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <button type="button" onClick={() => void enterFullscreen()} className="ml-auto w-9 h-9 flex items-center justify-center hover:text-emerald-400" aria-label="Tam ekran" title="Tam ekran">
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
