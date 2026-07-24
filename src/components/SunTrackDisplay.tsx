import React, { useMemo } from 'react';
import { getSunTrackData } from '../utils/astronomy';
import { Sun, Sunset, Sunrise, Compass, Clock } from 'lucide-react';
import { City } from '../types';

interface SunTrackDisplayProps {
  city: City;
  isEink: boolean;
}

export const SunTrackDisplay: React.FC<SunTrackDisplayProps> = ({ city, isEink }) => {
  const sunData = useMemo(() => getSunTrackData(new Date(), city.lat, city.lng), [city]);

  return (
    <div
      id="sun-track-card"
      className={`w-full flex flex-col p-4 sm:p-5 rounded-2xl border transition-all ${
        isEink
          ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-black text-black dark:text-white border-2 shadow-none'
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm'
      }`}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between text-xs font-bold mb-3">
        <div className="flex items-center gap-2">
          <Sun className={`w-4 h-4 ${isEink ? 'text-current' : 'text-amber-500 font-bold'}`} />
          <span className="font-extrabold text-base tracking-wide text-zinc-900 dark:text-zinc-100">太阳轨迹与日出日落</span>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono font-bold">
          {city.name} ({city.lat > 0 ? `${city.lat}°N` : `${Math.abs(city.lat)}°S`})
        </span>
      </div>

      {/* Sun Arc Trajectory Visualization */}
      <div className="relative w-full h-24 my-1 flex items-center justify-center">
        <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100">
          {/* Horizon line */}
          <line x1="10" y1="80" x2="290" y2="80" stroke="#71717a" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="4 4" />

          {/* Daylight Sun Path Arc */}
          <path
            d="M 20 80 A 130 65 0 0 1 280 80"
            fill="none"
            stroke={isEink ? 'currentColor' : '#d97706'}
            strokeWidth="3"
          />

          {/* Current Sun Position on Arc */}
          {sunData.isDaytime && sunData.progress >= 0 && (
            <g transform={`translate(${20 + sunData.progress * 260}, ${80 - Math.sin(sunData.progress * Math.PI) * 65})`}>
              <circle r="9" fill={isEink ? 'currentColor' : '#f59e0b'} stroke="#b45309" strokeWidth="2.5" />
              <circle r="4" fill="#ffffff" />
            </g>
          )}

          {/* Sunrise Point */}
          <circle cx="20" cy="80" r="5" fill={isEink ? 'currentColor' : '#ea580c'} />
          <text x="20" y="96" textAnchor="middle" className="text-[11px] font-extrabold" fill="currentColor">
            {sunData.sunriseStr}
          </text>

          {/* Solar Noon Point */}
          <text x="150" y="22" textAnchor="middle" className="text-[11px] font-black" fill="currentColor">
            正午 {sunData.solarNoonStr}
          </text>

          {/* Sunset Point */}
          <circle cx="280" cy="80" r="5" fill={isEink ? 'currentColor' : '#9333ea'} />
          <text x="280" y="96" textAnchor="middle" className="text-[11px] font-extrabold" fill="currentColor">
            {sunData.sunsetStr}
          </text>
        </svg>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs font-bold text-center">
        <div className="flex flex-col items-center p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80">
          <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 mb-0.5 font-bold">
            <Sunrise className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>日出</span>
          </div>
          <span className="font-extrabold text-sm font-mono text-zinc-900 dark:text-zinc-100">{sunData.sunriseStr}</span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80">
          <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 mb-0.5 font-bold">
            <Clock className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>昼长</span>
          </div>
          <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">{sunData.dayLengthStr}</span>
        </div>

        <div className="flex flex-col items-center p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/80">
          <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 mb-0.5 font-bold">
            <Sunset className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>日落</span>
          </div>
          <span className="font-extrabold text-sm font-mono text-zinc-900 dark:text-zinc-100">{sunData.sunsetStr}</span>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-xs mt-3 pt-1 font-bold text-zinc-700 dark:text-zinc-300">
        <span className="flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-zinc-500" />
          <span>当前高度角：<strong className="text-zinc-900 dark:text-zinc-100 font-mono text-sm">{sunData.currentElevationAngle}°</strong></span>
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-extrabold">
          {sunData.sunState}
        </span>
      </div>
    </div>
  );
};

