import React, { useState, useEffect, useMemo } from 'react';
import { City } from '../types';
import { Globe } from 'lucide-react';

interface WorldClockMiniProps {
  city: City;
  use24Hour?: boolean;
  showSeconds?: boolean;
  isEink?: boolean;
  fontSizeScale?: number;
  onOpenCitySettings?: () => void;
}

function checkIsDst(date: Date, timeZone: string): boolean {
  try {
    const getOffsetMinutes = (d: Date) => {
      const utcDate = new Date(d.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(d.toLocaleString('en-US', { timeZone }));
      return (tzDate.getTime() - utcDate.getTime()) / 60000;
    };

    const currentOffset = getOffsetMinutes(date);
    const janOffset = getOffsetMinutes(new Date(date.getFullYear(), 0, 1));
    const julOffset = getOffsetMinutes(new Date(date.getFullYear(), 6, 1));

    if (janOffset !== julOffset) {
      const maxOffset = Math.max(janOffset, julOffset);
      return currentOffset === maxOffset;
    }
    return false;
  } catch {
    return false;
  }
}

export const WorldClockMini: React.FC<WorldClockMiniProps> = ({
  city,
  use24Hour = true,
  showSeconds = false,
  isEink = false,
  fontSizeScale = 1.0,
  onOpenCitySettings,
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const currentDate = new Date();
      setNow(currentDate);
      try {
        const tz = city.timezone || 'Europe/Dublin';
        const options: Intl.DateTimeFormatOptions = {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          ...(showSeconds ? { second: '2-digit' } : {}),
          hour12: !use24Hour,
        };
        const formatter = new Intl.DateTimeFormat('zh-CN', options);
        setTimeStr(formatter.format(currentDate));
      } catch {
        setTimeStr('--:--');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [city, use24Hour, showSeconds]);

  const isDst = useMemo(() => {
    if (!city.timezone) return false;
    return checkIsDst(now, city.timezone);
  }, [city.timezone, now]);

  const locationText = city.country ? `${city.country} · ${city.name}` : city.name;

  return (
    <div
      onClick={onOpenCitySettings}
      id="world-clock-mini"
      className={`group cursor-pointer px-3 py-1 my-0.5 rounded-full border inline-flex items-center justify-center gap-2 transition-all select-none text-xs shrink-0 ${
        isEink
          ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border'
          : 'border-current/15 bg-current/5 hover:bg-current/10 text-current'
      }`}
      title={`点击切换异地时钟 (当前: ${locationText}${isDst ? ' - 夏令时' : ''})`}
      style={{
        fontSize: `${fontSizeScale * 0.8}rem`,
      }}
    >
      <Globe className="w-3 h-3 shrink-0 opacity-70" />
      <span className="font-normal opacity-85 whitespace-nowrap">{locationText}</span>
      {isDst && (
        <span className="px-1 py-0.2 rounded text-[10px] font-normal border border-current/20 opacity-75 whitespace-nowrap">
          夏令时
        </span>
      )}
      <span className="font-mono font-medium tracking-wider">{timeStr}</span>
    </div>
  );
};
