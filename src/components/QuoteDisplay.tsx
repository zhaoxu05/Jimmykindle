import React, { useState, useEffect, useCallback } from 'react';
import { Quote, QuoteSourceType, fetchQuote } from '../services/quoteService';
import { Quote as QuoteIcon, RefreshCw, Sparkles } from 'lucide-react';

interface QuoteDisplayProps {
  source: QuoteSourceType;
  refreshIntervalMinutes: number; // 0 for manual only, or 1, 5, 15, 30
  isEink: boolean;
  fontSizeScale?: number;
}

export const QuoteDisplay: React.FC<QuoteDisplayProps> = ({
  source,
  refreshIntervalMinutes,
  isEink,
  fontSizeScale = 1.0,
}) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const loadNextQuote = useCallback(async () => {
    setLoading(true);
    const q = await fetchQuote(source);
    setQuote(q);
    setLoading(false);
  }, [source]);

  // Initial load
  useEffect(() => {
    loadNextQuote();
  }, [loadNextQuote]);

  // Periodic interval timer
  useEffect(() => {
    if (refreshIntervalMinutes <= 0) return;
    const intervalMs = refreshIntervalMinutes * 60 * 1000;
    const timer = setInterval(() => {
      loadNextQuote();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [refreshIntervalMinutes, loadNextQuote]);

  if (!quote) return null;

  return (
    <div
      id="quote-display-container"
      onClick={loadNextQuote}
      className={`group cursor-pointer max-w-2xl mx-auto px-4 py-2.5 rounded-xl border transition-all select-none text-center relative ${
        isEink
          ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-2'
          : 'border-current/20 bg-current/5 hover:bg-current/10 text-current'
      }`}
      title="点击随机更换名言"
      style={{
        fontSize: `${fontSizeScale * 0.95}rem`,
      }}
    >
      <div className="flex flex-col items-center justify-center gap-1.5">
        {/* Quote Content */}
        <div className="flex items-center justify-center gap-2 font-medium tracking-wide leading-relaxed">
          <QuoteIcon className={`w-4 h-4 shrink-0 opacity-70 ${isEink ? 'text-current' : 'text-amber-500'}`} />
          <span className="italic">“{quote.text}”</span>
        </div>

        {/* Author & Source Tag */}
        <div className="flex items-center justify-center gap-2 text-xs opacity-80 font-bold mt-0.5">
          <span>—— {quote.author}</span>
          {quote.sourceName && (
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-extrabold border ${
                isEink
                  ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                  : 'border-current/30 bg-current/10'
              }`}
            >
              {quote.sourceName}
            </span>
          )}
          <RefreshCw
            className={`w-3 h-3 transition-transform duration-500 ${
              loading ? 'animate-spin opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
