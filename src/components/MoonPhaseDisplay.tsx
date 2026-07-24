import React, { useMemo } from 'react';
import { getMoonPhaseData } from '../utils/astronomy';
import { Moon, Sparkles, Calendar, Eye } from 'lucide-react';

interface MoonPhaseDisplayProps {
  isEink: boolean;
}

export const MoonPhaseDisplay: React.FC<MoonPhaseDisplayProps> = ({ isEink }) => {
  const moonData = useMemo(() => getMoonPhaseData(new Date()), []);

  return (
    <div
      id="moon-phase-card"
      className={`w-full flex flex-col p-4 sm:p-5 rounded-2xl border transition-all ${
        isEink
          ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-black text-black dark:text-white border-2 shadow-none'
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between text-xs font-bold mb-3">
        <div className="flex items-center gap-2">
          <Moon className={`w-4 h-4 ${isEink ? 'text-current' : 'text-sky-500 font-bold'}`} />
          <span className="font-extrabold text-base tracking-wide text-zinc-900 dark:text-zinc-100">月相与天象</span>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono font-bold">
          月龄 {moonData.moonAge.toFixed(1)} 天
        </span>
      </div>

      {/* Main Moon Visualization and Information */}
      <div className="flex items-center gap-4 py-1">
        {/* SVG Moon Phase Graphic */}
        <div className="relative shrink-0 w-20 h-20 flex items-center justify-center rounded-full bg-slate-950 border-2 border-slate-700 shadow-md overflow-hidden">
          {/* Base dark moon disk */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background unlit surface */}
            <circle cx="50" cy="50" r="46" fill="#0f172a" stroke="#334155" strokeWidth="2" />

            {/* Illuminated portion */}
            {moonData.illumination > 0 && (
              <g>
                {moonData.illumination >= 98 ? (
                  <circle cx="50" cy="50" r="45" fill="#fef08a" />
                ) : moonData.isWaxing ? (
                  /* Waxing (right illuminated) */
                  <path
                    d={`M 50 5 A 45 45 0 0 1 50 95 A ${45 * Math.abs(moonData.svgPhaseRatio)} 45 0 0 ${moonData.svgPhaseRatio >= 0 ? 1 : 0} 50 5`}
                    fill="#fef08a"
                  />
                ) : (
                  /* Waning (left illuminated) */
                  <path
                    d={`M 50 5 A 45 45 0 0 0 50 95 A ${45 * Math.abs(moonData.svgPhaseRatio)} 45 0 0 ${moonData.svgPhaseRatio >= 0 ? 0 : 1} 50 5`}
                    fill="#fef08a"
                  />
                )}
              </g>
            )}

            {/* Subtle crater details */}
            <circle cx="38" cy="35" r="6" fill="black" fillOpacity="0.12" />
            <circle cx="62" cy="55" r="8" fill="black" fillOpacity="0.12" />
            <circle cx="48" cy="68" r="5" fill="black" fillOpacity="0.12" />
          </svg>
        </div>

        {/* Phase Details */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-black text-lg text-amber-600 dark:text-amber-300">
              {moonData.phaseName}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold">
              {moonData.isWaxing ? '渐盈 (Waxing)' : '渐亏 (Waning)'}
            </span>
          </div>

          <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1.5 leading-relaxed font-semibold">
            {moonData.phaseDesc}
          </p>

          <div className="flex items-center gap-3 mt-2 text-xs font-bold">
            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-extrabold">
              <Eye className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>亮面比例 {moonData.illumination}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Footer countdowns */}
      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>距满月: <strong className="font-mono text-sm text-zinc-900 dark:text-zinc-100 font-black">{moonData.daysToFullMoon}</strong> 天</span>
        </div>
        <div className="flex items-center gap-1.5 justify-end">
          <Calendar className="w-4 h-4 text-sky-500 shrink-0" />
          <span>距新月: <strong className="font-mono text-sm text-zinc-900 dark:text-zinc-100 font-black">{moonData.daysToNewMoon}</strong> 天</span>
        </div>
      </div>
    </div>
  );
};

