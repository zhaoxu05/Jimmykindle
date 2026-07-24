import React, { useState, useEffect } from 'react';
import { City } from '../types';

interface ClockDisplayProps {
  city: City;
  use24Hour: boolean;
  showSeconds: boolean;
  fontSizeScale: number;
  isEink: boolean;
  resolutionScale?: number;
}

export const ClockDisplay: React.FC<ClockDisplayProps> = ({
  city,
  use24Hour,
  showSeconds,
  fontSizeScale,
  isEink,
  resolutionScale = 1.0,
}) => {
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    // Tick every second or minute based on showSeconds
    const intervalMs = showSeconds ? 1000 : 5000;
    const timer = setInterval(() => {
      setNow(new Date());
    }, intervalMs);
    return () => clearInterval(timer);
  }, [showSeconds]);

  // Format time in city's timezone
  const getTimeString = () => {
    try {
      const formatter = new Intl.DateTimeFormat('zh-CN', {
        timeZone: city.timezone || 'Asia/Shanghai',
        hour12: !use24Hour,
        hour: '2-digit',
        minute: '2-digit',
        second: showSeconds ? '2-digit' : undefined,
      });

      const parts = formatter.formatToParts(now);
      let hour = '';
      let minute = '';
      let second = '';
      let dayPeriod = '';

      parts.forEach((p) => {
        if (p.type === 'hour') hour = p.value;
        if (p.type === 'minute') minute = p.value;
        if (p.type === 'second') second = p.value;
        if (p.type === 'dayPeriod') dayPeriod = p.value;
      });

      return { hour, minute, second, dayPeriod };
    } catch {
      // Fallback
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const s = now.getSeconds().toString().padStart(2, '0');
      return { hour: h, minute: m, second: s, dayPeriod: '' };
    }
  };

  // Format full date in city's timezone
  const getDateString = () => {
    try {
      const formatter = new Intl.DateTimeFormat('zh-CN', {
        timeZone: city.timezone || 'Asia/Shanghai',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
      return formatter.format(now);
    } catch {
      const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${days[now.getDay()]}`;
    }
  };

  const { hour, minute, second, dayPeriod } = getTimeString();
  const dateStr = getDateString();
  const finalScale = fontSizeScale * resolutionScale;

  return (
    <div id="clock-display-container" className="flex flex-col items-center justify-center text-center select-none py-2">
      {/* City Badge / Label */}
      <div id="clock-city-badge" className="flex items-center gap-2 mb-2 px-3 py-1 rounded-full border text-xs sm:text-sm font-medium tracking-wide">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>{city.name}时间</span>
        <span className="opacity-70 text-[11px]">({city.timezone?.split('/')[1] || city.name})</span>
      </div>

      {/* Main Big Time Digits */}
      <div
        id="clock-digits"
        className={`font-mono font-extrabold tracking-tight flex items-baseline justify-center leading-none ${
          isEink ? '' : 'transition-all duration-300'
        }`}
        style={{
          fontSize: `calc(${finalScale * 5.5}rem + 2.5vw)`,
        }}
      >
        <span>{hour}</span>
        <span className="mx-[0.1em] opacity-80 animate-pulse">:</span>
        <span>{minute}</span>
        {showSeconds && (
          <span
            className="text-[0.4em] font-normal opacity-80 ml-2 font-mono"
            style={{ fontSize: `calc(${finalScale * 2.2}rem + 1vw)` }}
          >
            :{second}
          </span>
        )}
        {!use24Hour && dayPeriod && (
          <span className="text-[0.25em] font-medium ml-3 uppercase tracking-wider opacity-90">
            {dayPeriod}
          </span>
        )}
      </div>

      {/* Gregorian Calendar Date */}
      <div id="clock-gregorian-date" className="mt-2 sm:mt-3 text-base sm:text-lg md:text-xl font-medium tracking-wide opacity-90">
        {dateStr}
      </div>
    </div>
  );
};
