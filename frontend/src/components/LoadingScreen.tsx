// LoadingScreen.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';  // Mengimpor ikon Loader2 dari lucide-react

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center justify-center">
        {/* Loader2 dengan animasi berputar */}
        <Loader2 className="animate-spin text-gray-700" size={50} />
        <p className="mt-4 text-lg text-gray-700">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
