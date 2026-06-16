'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-transparent p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="font-playfair text-3xl font-bold text-text-primary dark:text-white">Something went wrong</h1>
        <p className="font-inter text-gray-500">
          We encountered an unexpected error while rendering this page.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gold text-bg-dark font-bold uppercase tracking-widest text-sm rounded-sm hover:bg-gold-light transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link href="/">
            <button className="w-full px-8 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold uppercase tracking-widest text-sm rounded-sm hover:border-gold hover:text-gold transition-colors">
              Go Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
