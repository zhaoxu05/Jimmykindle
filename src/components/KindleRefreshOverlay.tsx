import React, { useEffect } from 'react';

interface KindleRefreshOverlayProps {
  active: boolean;
  onFinish: () => void;
}

export const KindleRefreshOverlay: React.FC<KindleRefreshOverlayProps> = ({ active, onFinish }) => {
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => {
        onFinish();
      }, 1000); // 1 second flash
      return () => clearTimeout(timer);
    }
  }, [active, onFinish]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-100 bg-white animate-[ping_0.5s_infinite] dark:bg-black flex items-center justify-center">
      <div className="text-black dark:text-white font-mono font-bold text-xl uppercase tracking-widest p-4 border-4 border-current">
        E-INK REFRESH
      </div>
    </div>
  );
};
