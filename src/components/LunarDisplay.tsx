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
    <div id="lunar-display-card" className={`w-full flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5 ${
      isEink 
        ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-black text-black dark:text-white border-2 shadow-none' 
        : 'border-current/20 bg-current/5 text-current'
    }`}>
      {/* Primary Lunar Header */}
      <div id="lunar-main-header" className="flex flex-wrap items-center justify-center gap-2.5 text-center">
        {/* Zodiac & Year Badge */}
        <div id="lunar-year-badge" className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-bold text-sm sm:text-base ${
          isEink 
            ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-1.5' 
            : 'border-current/30 bg-current/10 text-current'
        }`}>
          <Compass className="w-4 h-4 opacity-90" />
          <span>{lunarInfo.lunarYear}</span>
          <span className={`px-1.5 py-0.5 rounded text-xs border font-extrabold ${
            isEink ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900' : 'border-current/40 bg-current/15'
          }`}>
            【{lunarInfo.zodiac}年】
          </span>
        </div>

        {/* Lunar Month & Day */}
        <div id="lunar-month-day" className="flex items-center gap-2 text-xl sm:text-2xl font-black tracking-wider">
          <Calendar className="w-5 h-5 opacity-90" />
          <span>农历 {lunarInfo.lunarMonthDay}</span>
        </div>

        {/* Current Solar Term */}
        {showSolarTerms && lunarInfo.solarTerm && (
          <div id="solar-term-current" className={`px-3 py-1 rounded-lg border-2 font-black text-sm ${
            isEink
              ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-100 border-amber-500 shadow-xs'
          }`}>
            节气：{lunarInfo.solarTerm}
          </div>
        )}
      </div>

      {/* Countdowns Row: Next Holiday & Next Solar Term */}
      <div id="lunar-countdowns-row" className="w-full flex flex-wrap items-center justify-center gap-2.5 text-xs pt-1">
        {/* Next Holiday Countdown */}
        {showNextHoliday && lunarInfo.nextHoliday && (
          <div id="next-holiday-badge" className={`px-3 py-1.5 rounded-xl border-2 flex items-center gap-1.5 font-bold shadow-xs ${
            isEink
              ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
              : 'bg-purple-100 dark:bg-purple-950 text-purple-950 dark:text-purple-100 border-purple-400'
          }`}>
            <PartyPopper className={`w-4 h-4 shrink-0 ${isEink ? 'text-current' : 'text-purple-700 dark:text-purple-300'}`} />
            <span>
              距下个假期【<strong>{lunarInfo.nextHoliday.name}</strong>】({lunarInfo.nextHoliday.dateStr}) 还有 <strong className="font-black text-sm underline underline-offset-2">{lunarInfo.nextHoliday.daysLeft}</strong> 天
            </span>
          </div>
        )}

        {/* Next Solar Term Countdown */}
        {showSolarTerms && lunarInfo.nextSolarTerm && (
          <div id="solar-term-next" className={`px-3 py-1.5 rounded-xl border-2 flex items-center gap-1.5 font-bold shadow-xs ${
            isEink
              ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
              : 'bg-amber-100 dark:bg-amber-950 text-amber-950 dark:text-amber-100 border-amber-400'
          }`}>
            <Sparkles className={`w-4 h-4 shrink-0 ${isEink ? 'text-current' : 'text-amber-700 dark:text-amber-300'}`} />
            <span>
              距节气【<strong>{lunarInfo.nextSolarTerm.name}</strong>】({lunarInfo.nextSolarTerm.dateStr}) 还有 <strong className="font-black text-sm underline underline-offset-2">{lunarInfo.nextSolarTerm.daysLeft}</strong> 天
            </span>
          </div>
        )}
      </div>

      {/* Traditional Festivals if present */}
      {lunarInfo.festivals.length > 0 && (
        <div id="lunar-festivals-list" className="flex flex-wrap items-center justify-center gap-2">
          {lunarInfo.festivals.map((fest, idx) => (
            <span key={idx} className={`px-3 py-1 rounded-lg text-xs font-black border-2 ${
              isEink
                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-rose-100 dark:bg-rose-950 text-rose-950 dark:text-rose-100 border-rose-500'
            }`}>
              🏮 {fest}
            </span>
          ))}
        </div>
      )}

      {/* Suits & Taboos (宜 / 忌) */}
      {showYiJi && (
        <div id="lunar-yiji-section" className="w-full pt-3 border-t border-current/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          {/* Yi (宜) */}
          <div id="lunar-yi-box" className={`flex items-start gap-2.5 p-3 rounded-xl border-2 ${
            isEink
              ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
              : 'bg-emerald-100/90 dark:bg-emerald-950/90 border-emerald-500 text-emerald-950 dark:text-emerald-50'
          }`}>
            <div className={`px-2.5 py-1 rounded-md font-black text-xs shrink-0 tracking-wider shadow-xs ${
              isEink
                ? 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-emerald-700 text-white dark:bg-emerald-500 dark:text-black border border-emerald-800'
            }`}>
              宜
            </div>
            <div className="flex flex-wrap gap-1.5 font-bold leading-relaxed">
              {lunarInfo.yi.length > 0 ? (
                lunarInfo.yi.map((item, idx) => (
                  <span key={idx} className="after:content-['•'] last:after:content-none after:ml-1.5 after:opacity-60">
                    {item}
                  </span>
                ))
              ) : (
                <span>诸事吉宜</span>
              )}
            </div>
          </div>

          {/* Ji (忌) */}
          <div id="lunar-ji-box" className={`flex items-start gap-2.5 p-3 rounded-xl border-2 ${
            isEink
              ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
              : 'bg-rose-100/90 dark:bg-rose-950/90 border-rose-500 text-rose-950 dark:text-rose-50'
          }`}>
            <div className={`px-2.5 py-1 rounded-md font-black text-xs shrink-0 tracking-wider shadow-xs ${
              isEink
                ? 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                : 'bg-rose-700 text-white dark:bg-rose-500 dark:text-black border border-rose-800'
            }`}>
              忌
            </div>
            <div className="flex flex-wrap gap-1.5 font-bold leading-relaxed">
              {lunarInfo.ji.length > 0 ? (
                lunarInfo.ji.map((item, idx) => (
                  <span key={idx} className="after:content-['•'] last:after:content-none after:ml-1.5 after:opacity-60">
                    {item}
                  </span>
                ))
              ) : (
                <span>百无禁忌</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Today in History (历史上的今天) Section */}
      {showHistoryToday && (
        <div id="history-today-section" className="w-full pt-3 border-t border-current/20">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <div className="flex items-center gap-1.5">
              <History className={`w-4 h-4 ${isEink ? 'text-current' : 'text-emerald-600 dark:text-emerald-400'}`} />
              <span className="font-extrabold text-sm">历史上的今天</span>
            </div>
            {historyEvents.length > 1 && (
              <button
                onClick={() => setActiveHistoryIndex((prev) => (prev + 1) % historyEvents.length)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border-1.5 font-bold transition text-xs ${
                  isEink
                    ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                    : 'border-current/30 hover:bg-current/10'
                }`}
                title="换一条历史事件"
              >
                <span>换一条 ({activeHistoryIndex + 1}/{historyEvents.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {historyLoading ? (
            <div className="text-xs opacity-70 py-1 flex items-center gap-2 font-medium">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>正在获取历史上的今天...</span>
            </div>
          ) : historyEvents.length > 0 ? (
            <div className={`p-3 rounded-xl border-2 text-xs sm:text-sm flex items-start gap-2.5 font-bold ${
              isEink
                ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100'
                : 'border-current/20 bg-current/5 text-current'
            }`}>
              <span className={`px-2.5 py-1 rounded-md font-black shrink-0 text-xs border ${
                isEink
                  ? 'bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900'
                  : 'bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white border-emerald-800'
              }`}>
                {historyEvents[activeHistoryIndex]?.year}
              </span>
              <p className="leading-relaxed pt-0.5">
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
