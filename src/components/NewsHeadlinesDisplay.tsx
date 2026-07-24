import React, { useState, useEffect } from 'react';
import { fetchNewsHeadlines, NewsHeadline } from '../services/newsService';
import { Newspaper, RefreshCw, ChevronRight, Globe, Flame, Radio } from 'lucide-react';

interface NewsHeadlinesDisplayProps {
  isEink: boolean;
}

export const NewsHeadlinesDisplay: React.FC<NewsHeadlinesDisplayProps> = ({ isEink }) => {
  const [headlines, setHeadlines] = useState<NewsHeadline[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const loadHeadlines = async () => {
    setLoading(true);
    try {
      const items = await fetchNewsHeadlines();
      setHeadlines(items);
      setActiveIndex(0);
    } catch {
      // Handled in service
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHeadlines();
  }, []);

  const currentNews = headlines[activeIndex];

  return (
    <div
      id="news-headlines-card"
      className={`w-full flex flex-col p-4 sm:p-5 rounded-2xl border transition-all ${
        isEink
          ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-black text-black dark:text-white border-2 shadow-none'
          : 'border-current/20 bg-current/5 text-current'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between text-xs font-bold mb-3">
        <div className="flex items-center gap-2">
          <Newspaper className={`w-4 h-4 ${isEink ? 'text-current' : 'text-amber-600 dark:text-amber-400'}`} />
          <span className="font-extrabold text-base tracking-wide flex items-center gap-1.5">
            今日头条
            <span className="px-1.5 py-0.2 text-[10px] rounded border border-current/30 opacity-70 font-mono">
              国内外混合源
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadHeadlines}
            disabled={loading}
            className="p-1 rounded hover:bg-current/10 transition"
            title="刷新头条资讯"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {headlines.length > 1 && (
            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % headlines.length)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border-1.5 font-bold transition text-xs ${
                isEink
                  ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  : 'border-current/30 hover:bg-current/10'
              }`}
              title="阅读下一条头条"
            >
              <span>换一条 ({activeIndex + 1}/{headlines.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Headline Content */}
      {loading ? (
        <div className="text-xs opacity-70 py-3 flex items-center justify-center gap-2 font-medium">
          <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
          <span>正在拉取国内外最新头条资讯...</span>
        </div>
      ) : currentNews ? (
        <div
          className={`p-3.5 rounded-xl border-2 text-xs sm:text-sm flex flex-col gap-2 font-bold ${
            isEink
              ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
              : 'border-current/20 bg-current/5 text-current'
          }`}
        >
          {/* Headline Title */}
          <div className="flex items-start gap-2.5">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-black shrink-0 border ${
                isEink
                  ? 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900'
                  : currentNews.category === 'international'
                  ? 'bg-sky-600 text-white border-sky-700 dark:bg-sky-500'
                  : currentNews.category === 'tech'
                  ? 'bg-purple-600 text-white border-purple-700 dark:bg-purple-500'
                  : 'bg-red-600 text-white border-red-700 dark:bg-red-500'
              }`}
            >
              {currentNews.category === 'international' && '🌐 国际'}
              {currentNews.category === 'domestic' && '🇨🇳 国内'}
              {currentNews.category === 'tech' && '⚡ 科技'}
              {currentNews.category === 'brief' && '📰 简报'}
            </span>

            <p className="leading-relaxed pt-0.5 font-bold text-sm sm:text-base">
              {currentNews.title}
            </p>
          </div>

          {/* Footer Info: Source & Time */}
          <div className="flex items-center justify-between text-xs opacity-75 pt-1 border-t border-current/10 mt-1 font-medium">
            <span className="flex items-center gap-1">
              <Radio className="w-3 h-3 text-red-500 animate-pulse" />
              <span>来源：{currentNews.source}</span>
            </span>
            {currentNews.timeAgo && (
              <span className="text-[11px] opacity-80">{currentNews.timeAgo}</span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-xs opacity-60 text-center py-2">暂无新闻数据</div>
      )}
    </div>
  );
};
