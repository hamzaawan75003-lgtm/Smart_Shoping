'use client';

import React, { memo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface LoadingSkeletonProps {
  variant?: 'card' | 'text' | 'title' | 'avatar';
  count?: number;
  className?: string;
}

// ─── Single Skeleton Block ────────────────────────────────────────────────────
const SkeletonBlock = ({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) => (
  <div
    className={`relative overflow-hidden bg-gray-200 rounded ${className}`}
    style={style}
    aria-hidden="true"
  >
    {/* Shimmer sweep */}
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite]"
      style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
      }}
    />
  </div>
);

// ─── Card Skeleton — matches ProductCard dimensions ───────────────────────────
const CardSkeleton = () => (
  <div className="flex flex-col gap-3 animate-pulse">
    {/* Image placeholder — 3:4 ratio */}
    <SkeletonBlock className="w-full rounded-md" style={{ aspectRatio: '3/4' } as React.CSSProperties} />
    {/* Name line */}
    <SkeletonBlock className="h-4 w-3/4 rounded" />
    {/* Price + category row */}
    <div className="flex items-center justify-between">
      <SkeletonBlock className="h-4 w-1/4 rounded" />
      <SkeletonBlock className="h-3 w-1/5 rounded" />
    </div>
  </div>
);

// ─── Text Skeleton — paragraph lines ─────────────────────────────────────────
const TextSkeleton = () => (
  <div className="flex flex-col gap-2 animate-pulse">
    <SkeletonBlock className="h-3 w-full rounded" />
    <SkeletonBlock className="h-3 w-5/6 rounded" />
    <SkeletonBlock className="h-3 w-4/6 rounded" />
  </div>
);

// ─── Title Skeleton ───────────────────────────────────────────────────────────
const TitleSkeleton = () => (
  <div className="flex flex-col gap-2 animate-pulse">
    <SkeletonBlock className="h-7 w-2/3 rounded" />
    <SkeletonBlock className="h-5 w-1/2 rounded" />
  </div>
);

// ─── Avatar Skeleton ──────────────────────────────────────────────────────────
const AvatarSkeleton = () => (
  <div className="flex items-center gap-3 animate-pulse">
    <SkeletonBlock className="h-12 w-12 rounded-full flex-shrink-0" />
    <div className="flex flex-col gap-2 flex-1">
      <SkeletonBlock className="h-4 w-1/3 rounded" />
      <SkeletonBlock className="h-3 w-1/2 rounded" />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const LoadingSkeleton = memo(({
  variant = 'card',
  count = 1,
  className = '',
}: LoadingSkeletonProps) => {
  const items = Array.from({ length: count }, (_, i) => i);

  const SkeletonVariant = () => {
    switch (variant) {
      case 'text':   return <TextSkeleton />;
      case 'title':  return <TitleSkeleton />;
      case 'avatar': return <AvatarSkeleton />;
      default:       return <CardSkeleton />;
    }
  };

  // Card variant: render in a responsive grid
  if (variant === 'card' && count > 1) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 ${className}`}>
        {items.map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Other variants: render stacked
  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {items.map((i) => (
        <SkeletonVariant key={i} />
      ))}
    </div>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';

export default LoadingSkeleton;
