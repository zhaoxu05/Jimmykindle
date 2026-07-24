import React, { useMemo } from 'react';
import { getTideData } from '../utils/astronomy';
import { Waves, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface TidesDisplayProps {
  isEink: boolean;
}

export const TidesDisplay: React.FC<TidesDisplayProps> = ({ isEink }) => {
  const tideData = useMemo(() => getTideData(new Date()), []);

  return (
    <div
      id="tides-card"
      className={`w-full flex flex-col p-4 sm:p-5 rounded-2xl border transition-all ${
        isEink
          ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-black text-black dark:text-white border-2 shadow-none'
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-bold mb-3">
        <div className="flex items-center gap-2">
          <Waves className={`w-4 h-4 ${isEink ? 'text-current' : 'text-cyan-500 font-bold'}`} />
          <span className="font-extrabold text-base tracking-wide text-zinc-900 dark:text-zinc-100">潮汐潮落与高低潮位</span>
        </div>
        <span
          className={`px-2.5 py-1 rounded-lg text-xs font-black border ${
            tideData.tideType === '大潮'
              ? 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/40'
              : tideData.tideType === '小潮'
              ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/40'
              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
          }`}
        >
          {tideData.tideType}
        </span>
      </div>

      {/* Main Status */}
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80 my-1">
        <div className="flex items-center gap-3">
          {tideData.currentTrend === 'rising' ? (
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
              <ArrowUpRight className="w-5 h-5 font-bold" />
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              <ArrowDownRight className="w-5 h-5 font-bold" />
            </div>
          )}

          <div>
            <div className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{tideData.tideDesc}</div>
            <div className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 mt-0.5">
              <span>{tideData.trendDesc}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block font-bold">即时潮位估算</span>
          <span className="text-xl font-black font-mono text-cyan-700 dark:text-cyan-300">
            {tideData.currentHeightCm} <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">cm</span>
          </span>
        </div>
      </div>

      {/* 24-Hour Tidal Wave Polyline Graphic */}
      <div className="relative w-full h-16 my-2">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 240 50" preserveAspectRatio="none">
          {/* Base line */}
          <line x1="0" y1="45" x2="240" y2="45" stroke="#71717a" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Wave Path */}
          {(() => {
            const points = tideData.hourlyCurve.map((pt) => {
              const x = (pt.hour / 23) * 240;
              // Map height (80 - 400cm) to y (40 - 5px)
              const y = 45 - ((pt.heightCm - 60) / 340) * 38;
              return `${x},${y}`;
            });
            return (
              <path
                d={`M 0,45 L ${points.join(' L ')} L 240,45 Z`}
                fill={isEink ? 'currentColor' : '#0891b2'}
                fillOpacity={isEink ? '0.15' : '0.25'}
                stroke={isEink ? 'currentColor' : '#0284c7'}
                strokeWidth="2.5"
              />
            );
          })()}
        </svg>

        <div className="flex justify-between text-[10px] text-zinc-600 dark:text-zinc-400 font-mono font-bold mt-1">
          <span>00:00</span>
          <span>06:00</span>
          <span>12:00</span>
          <span>18:00</span>
          <span>24:00</span>
        </div>
      </div>

      {/* High/Low Tides List */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1 text-xs font-bold">
        {tideData.todayEvents.map((evt, idx) => (
          <div
            key={idx}
            className={`p-2.5 rounded-xl border text-center flex flex-col justify-between ${
              evt.type === 'high'
                ? 'border-cyan-500/40 bg-cyan-500/10 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-200'
                : 'border-amber-500/40 bg-amber-500/10 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
            }`}
          >
            <span className="text-[11px] font-bold opacity-90">{evt.label}</span>
            <span className="font-mono text-sm font-black text-zinc-900 dark:text-zinc-100 my-0.5">{evt.timeStr}</span>
            <span className="text-xs font-extrabold">{evt.heightCm} cm</span>
          </div>
        ))}
      </div>
    </div>
  );
};

