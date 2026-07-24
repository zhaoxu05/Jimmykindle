import React, { useMemo, useState, useEffect } from 'react';
import { getLunarInfo } from '../utils/lunar';
import { Calendar, Compass, Sparkles, PartyPopper, History, RefreshCw, ChevronRight } from 'lucide-react';
import { fetchHistoryToday } from '../services/historyService';
import { HistoryEvent } from '../types';

interface LunarDisplayProps {
  showYiJi: boolean;
  showSolarTerms: boolean;
  showNextHoliday?: boolean;
  showHistoryToday?: boolean;
  isEink: boolean;
}

export const LunarDisplay: React.FC<LunarDisplayProps> = ({
  showYiJi,
  showSolarTerms,
  showNextHoliday = true,
  showHistoryToday = true,
  isEink,
}) => {
  const lunarInfo = useMemo(() => getLunarInfo(new Date()), []);
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeHistoryIndex, setActiveHistoryIndex] = useState(0);

  useEffect(() => {
    if (!showHistoryToday) return;
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
  }, [showHistoryToday]);

  return (
    <div id="lunar-display-card" className="w-full flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border transition-all space-y-3">
      {/* Primary Lunar Header */}
      <div id="lunar-main-header" className="flex flex-wrap items-center justify-center gap-2.5 text-center">
        {/* Zodiac & Year Badge */}
        <div id="lunar-year-badge" className="flex items-center gap-1.5 px-3 py-1 rounded-lg border font-semibold text-sm sm:text-base">
          <Compass className="w-4 h-4 opacity-80" />
          <span>{lunarInfo.lunarYear}</span>
          <span className="px-1.5 py-0.5 rounded text-xs border font-bold">
            【{lunarInfo.zodiac}年】
          </span>
        </div>

        {/* Lunar Month & Day */}
        <div id="lunar-month-day" className="flex items-center gap-2 text-xl sm:text-2xl font-bold tracking-wider">
          <Calendar className="w-5 h-5 opacity-80" />
          <span>农历 {lunarInfo.lunarMonthDay}</span>
        </div>

        {/* Current Solar Term */}
        {showSolarTerms && lunarInfo.solarTerm && (
          <div id="solar-term-current" className="px-3 py-1 rounded-lg border font-bold text-sm bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400">
            节气：{lunarInfo.solarTerm}
          </div>
        )}
      </div>

      {/* Countdowns Row: Next Holiday & Next Solar Term */}
      <div id="lunar-countdowns-row" className="w-full flex flex-wrap items-center justify-center gap-2 text-xs pt-1">
        {/* Next Holiday Countdown */}
        {showNextHoliday && lunarInfo.nextHoliday && (
          <div id="next-holiday-badge" className="px-3 py-1 rounded-xl border bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300 flex items-center gap-1.5 font-medium shadow-xs">
            <PartyPopper className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span>
              距下个假期【{lunarInfo.nextHoliday.name}】({lunarInfo.nextHoliday.dateStr}) 还有 <strong className="font-bold text-sm underline">{lunarInfo.nextHoliday.daysLeft}</strong> 天
            </span>
          </div>
        )}

        {/* Next Solar Term Countdown */}
        {showSolarTerms && lunarInfo.nextSolarTerm && (
          <div id="solar-term-next" className="px-3 py-1 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center gap-1.5 font-medium shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              距节气【{lunarInfo.nextSolarTerm.name}】({lunarInfo.nextSolarTerm.dateStr}) 还有 <strong className="font-bold text-sm underline">{lunarInfo.nextSolarTerm.daysLeft}</strong> 天
            </span>
          </div>
        )}
      </div>

      {/* Traditional Festivals if present */}
      {lunarInfo.festivals.length > 0 && (
        <div id="lunar-festivals-list" className="flex flex-wrap items-center justify-center gap-2">
          {lunarInfo.festivals.map((fest, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded-md text-xs font-bold border border-red-500/40 text-red-600 dark:text-red-400 bg-red-500/10">
              🏮 {fest}
            </span>
          ))}
        </div>
      )}

      {/* Suits & Taboos (宜 / 忌) */}
      {showYiJi && (
        <div id="lunar-yiji-section" className="w-full pt-3 border-t border-current/15 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm">
          {/* Yi (宜) */}
          <div id="lunar-yi-box" className="flex items-start gap-2 p-2.5 rounded-xl border bg-emerald-500/5 border-emerald-500/20">
            <div className="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold text-xs shrink-0">
              宜
            </div>
            <div className="flex flex-wrap gap-1.5 text-emerald-800 dark:text-emerald-200 font-medium">
              {lunarInfo.yi.length > 0 ? (
                lunarInfo.yi.map((item, idx) => (
                  <span key={idx} className="after:content-['•'] last:after:content-none after:ml-1">
                    {item}
                  </span>
                ))
              ) : (
                <span>诸事吉宜</span>
              )}
            </div>
          </div>

          {/* Ji (忌) */}
          <div id="lunar-ji-box" className="flex items-start gap-2 p-2.5 rounded-xl border bg-rose-500/5 border-rose-500/20">
            <div className="px-2 py-0.5 rounded bg-rose-500 text-white font-bold text-xs shrink-0">
              忌
            </div>
            <div className="flex flex-wrap gap-1.5 text-rose-800 dark:text-rose-200 font-medium">
              {lunarInfo.ji.length > 0 ? (
                lunarInfo.ji.map((item, idx) => (
                  <span key={idx} className="after:content-['•'] last:after:content-none after:ml-1">
                    {item}
                  </span>
                ))
              ) : (
                <span>无百无禁忌</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Today in History (历史上的今天) Section */}
      {showHistoryToday && (
        <div id="history-today-section" className="w-full pt-3 border-t border-current/15">
          <div className="flex items-center justify-between text-xs font-bold mb-2 opacity-90">
            <div className="flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-500" />
              <span>历史上的今天</span>
            </div>
            {historyEvents.length > 1 && (
              <button
                onClick={() => setActiveHistoryIndex((prev) => (prev + 1) % historyEvents.length)}
                className="flex items-center gap-1 px-2 py-0.5 rounded border border-current/20 hover:bg-current/10 transition text-[11px]"
                title="换一条历史事件"
              >
                <span>换一条 ({activeHistoryIndex + 1}/{historyEvents.length})</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {historyLoading ? (
            <div className="text-xs text-zinc-400 py-1 flex items-center gap-2 animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>正在获取历史上的今天...</span>
            </div>
          ) : historyEvents.length > 0 ? (
            <div className="p-2.5 rounded-xl border border-current/15 bg-current/5 text-xs sm:text-sm flex items-start gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold shrink-0 text-xs">
                {historyEvents[activeHistoryIndex]?.year}
              </span>
              <p className="font-medium leading-snug">
                {historyEvents[activeHistoryIndex]?.title}
              </p>
            </div>
          ) : (
            <div className="text-xs opacity-60">暂无历史今日记录</div>
          )}
        </div>
      )}
    </div>
  );
};
