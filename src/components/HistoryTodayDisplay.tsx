import React, { useState, useEffect } from 'react';
import { fetchHistoryToday } from '../services/historyService';
import { HistoryEvent } from '../types';
import { History, RefreshCw, ChevronRight } from 'lucide-react';

interface HistoryTodayDisplayProps {
  isEink: boolean;
}

export const HistoryTodayDisplay: React.FC<HistoryTodayDisplayProps> = ({ isEink }) => {
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(0);

  useEffect(() => {
    let mounted = true;
    setHistoryLoading(true);
    fetchHistoryToday(new Date())
      .then((events) => {
        if (mounted) {
          setHistoryEvents(events);
          setHistoryLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setHistoryLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div
      id="history-today-card"
      className={`w-full flex flex-col p-4 sm:p-5 rounded-2xl border transition-all ${
        isEink
          ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-black text-black dark:text-white border-2 shadow-none'
          : 'border-current/20 bg-current/5 text-current'
      }`}
    >
      <div className="flex items-center justify-between text-xs font-bold mb-3">
        <div className="flex items-center gap-2">
          <History className={`w-4 h-4 ${isEink ? 'text-current' : 'text-emerald-600 dark:text-emerald-400'}`} />
          <span className="font-extrabold text-base tracking-wide">历史上的今天</span>
        </div>
        {historyEvents.length > 1 && (
          <button
            onClick={() => setActiveHistoryIndex((prev) => (prev + 1) % historyEvents.length)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border-1.5 font-bold transition text-xs ${
              isEink
                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                : 'border-current/30 hover:bg-current/10'
            }`}
            title="切换另一条历史事件"
          >
            <span>换一条 ({activeHistoryIndex + 1}/{historyEvents.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {historyLoading ? (
        <div className="text-xs opacity-70 py-3 flex items-center justify-center gap-2 font-medium">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>正在加载历史事件...</span>
        </div>
      ) : historyEvents.length > 0 ? (
        <div
          className={`p-3.5 rounded-xl border-2 text-xs sm:text-sm flex items-start gap-3 font-bold ${
            isEink
              ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
              : 'border-current/20 bg-current/5 text-current'
          }`}
        >
          <span
            className={`px-2.5 py-1 rounded-md font-black shrink-0 text-xs border ${
              isEink
                ? 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900'
                : 'bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white border-emerald-800'
            }`}
          >
            {historyEvents[activeHistoryIndex]?.year}
          </span>
          <p className="leading-relaxed pt-0.5">
            {historyEvents[activeHistoryIndex]?.title}
          </p>
        </div>
      ) : (
        <div className="text-xs opacity-60 text-center py-2">暂无历史事件数据</div>
      )}
    </div>
  );
};
