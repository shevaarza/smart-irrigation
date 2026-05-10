// src/components/RefreshButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RefreshButtonProps {
  autoRefresh?: boolean;
}

export default function RefreshButton({ autoRefresh = false }: RefreshButtonProps) {
  const [spinning, setSpinning] = useState(false);
  const router = useRouter();

  const handleRefresh = () => {
    setSpinning(true);
    router.refresh();
    setTimeout(() => setSpinning(false), 800);
  };

  return (
    <button
      onClick={handleRefresh}
      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
    >
      <svg
        className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      Refresh
    </button>
  );
}
