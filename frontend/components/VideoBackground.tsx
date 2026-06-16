'use client';

import React, { useRef, useEffect, useState, memo } from 'react';

interface VideoBackgroundProps {
  /** Optional dark overlay opacity 0–1. Defaults to 0.55 */
  overlayOpacity?: number;
  /** Optional extra class on the container */
  className?: string;
}

const VideoBackground = memo(({ overlayOpacity = 0.55, className = '' }: VideoBackgroundProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoOpacity, setVideoOpacity] = useState(1);

  // Attempt autoplay — browsers may block it; gracefully degrade
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {
      // If autoplay fails just show the fallback gradient
      setVideoFailed(true);
    });

    let rAFId: number;
    let fadeTarget = 1;
    let fadeStartVal = 1;
    let fadeStartTime = 0;
    let fadeDuration = 0;
    let isFading = false;
    let hasReset = false;
    let currentOpacity = 1;

    const fadeTo = (target: number, duration: number) => {
      fadeTarget = target;
      fadeStartVal = currentOpacity;
      fadeStartTime = performance.now();
      fadeDuration = duration;
      isFading = true;
    };

    const checkLoop = (now: number) => {
      if (video.duration && !video.paused) {
        const remainingTime = video.duration - video.currentTime;

        // Exactly 0.55 seconds before completion, smoothly transition opacity to 0
        if (remainingTime <= 0.55 && !isFading && !hasReset) {
          fadeTo(0, 550);
          hasReset = true;
        }

        if (isFading) {
          const elapsed = now - fadeStartTime;
          const progress = Math.min(elapsed / fadeDuration, 1);
          // Smooth interpolation
          const nextOpacity = fadeStartVal + (fadeTarget - fadeStartVal) * progress;
          currentOpacity = nextOpacity;
          setVideoOpacity(nextOpacity);

          if (progress >= 1) {
            isFading = false;
            if (fadeTarget === 0) {
              // Reset playhead, play, and fade back to 1
              video.currentTime = 0;
              video.play().catch(() => {});
              fadeTo(1, 550);
              hasReset = false;
            }
          }
        }
      }
      rAFId = requestAnimationFrame(checkLoop);
    };

    rAFId = requestAnimationFrame(checkLoop);

    return () => {
      cancelAnimationFrame(rAFId);
    };
  }, []);

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}>
      {/* ── Video element ── */}
      {!videoFailed && (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-75"
          style={{
            animation: 'videoBgZoom 10s ease-in-out infinite alternate',
            opacity: videoOpacity,
          }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
      )}

      {/* ── Fallback: dark gradient when video is missing / failed ── */}
      {videoFailed && (
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: 'linear-gradient(135deg, #0D0D0D 0%, #1a1a2e 40%, #16213e 70%, #0D0D0D 100%)',
            animation: 'videoBgZoom 10s ease-in-out infinite alternate',
          }}
        />
      )}

      {/* ── Dark overlay ── */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
      />

      {/* ── Zoom keyframe injected inline (avoids global CSS dependency) ── */}
      <style jsx>{`
        @keyframes videoBgZoom {
          from { transform: scale(1);    }
          to   { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
});

VideoBackground.displayName = 'VideoBackground';

export default VideoBackground;
