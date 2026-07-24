import React from 'react';
import { WeatherData, City, WeatherSourceConfig } from '../types';
import { WeatherIcon } from './WeatherIcons';
import { RefreshCw, MapPin, Droplets, Wind, ShieldCheck, AlertTriangle, Clock } from 'lucide-react';

interface WeatherDisplayProps {
  weatherData: WeatherData | null;
  loading: boolean;
  weatherCity: City;
  onRefresh: () => void;
  onOpenSourceModal: () => void;
  onOpenCitySettings?: () => void;
  isEink: boolean;
  sourcesStatus?: Record<string, string>;
}

export const WeatherDisplay: React.FC<WeatherDisplayProps> = ({
  weatherData,
  loading,
  weatherCity,
  onRefresh,
  onOpenSourceModal,
  onOpenCitySettings,
  isEink,
}) => {
  if (loading && !weatherData) {
    return (
      <div id="weather-loading-card" className="w-full flex flex-col items-center justify-center p-6 rounded-2xl border min-h-[220px]">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-emerald-500" />
        <p className="text-sm font-medium">正在获取 [{weatherCity.name}] 最新天气...</p>
        <p className="text-xs opacity-70 mt-1">多源 5 秒超时自动备用机制已启用</p>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div id="weather-error-card" className="w-full flex flex-col items-center justify-center p-6 rounded-2xl border text-center">
        <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
        <p className="text-base font-bold mb-1">未能获取 [{weatherCity.name}] 天气</p>
        <p className="text-xs opacity-70 mb-3">多源请求失败，点击下方按钮重试</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 rounded-xl border font-bold text-xs flex items-center gap-1.5 hover:bg-black/5 dark:hover:bg-white/10"
        >
          <RefreshCw className="w-3.5 h-3.5" /> 重新加载天气
        </button>
      </div>
    );
  }

  const { current, forecast, sourceName, fetchedAt, latencyMs } = weatherData;

  const timeStr = fetchedAt
    ? `${fetchedAt.getHours().toString().padStart(2, '0')}:${fetchedAt.getMinutes().toString().padStart(2, '0')}`
    : '';

  return (
    <div id="weather-display-card" className="w-full flex flex-col p-4 sm:p-5 rounded-2xl border transition-all">
      {/* Header: City Name & Refresh / Source Badge */}
      <div id="weather-card-header" className="flex items-center justify-between pb-3 border-b mb-3">
        <div id="weather-city-badge" className="flex items-center gap-2">
          <button
            onClick={onOpenCitySettings}
            className="flex items-center gap-1.5 hover:bg-current/10 p-1.5 rounded-xl border border-transparent hover:border-current/20 transition text-left cursor-pointer group"
            title="点击切换时间与天气城市"
          >
            <MapPin className="w-4 h-4 opacity-75 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-base sm:text-lg">{weatherCity.name}天气</span>
            {weatherCity.admin1 && (
              <span className="text-xs opacity-60 font-normal">({weatherCity.admin1})</span>
            )}
            <span className="text-xs px-1.5 py-0.5 rounded border border-current/20 opacity-75 font-normal ml-1">
              切换
            </span>
          </button>
        </div>

        {/* Source & Refresh Buttons */}
        <div id="weather-actions" className="flex items-center gap-2 text-xs">
          <button
            onClick={onOpenSourceModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border hover:bg-black/5 dark:hover:bg-white/10 font-medium transition"
            title="查看多源 5s 切源健康状态"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">{sourceName}</span>
            <span className="sm:hidden">源</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-lg border hover:bg-black/5 dark:hover:bg-white/10 transition disabled:opacity-50"
            title="刷新天气"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Current Weather Hero Area */}
      <div id="weather-current-area" className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
        {/* Left: Big Temp & Icon */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl border bg-black/5 dark:bg-white/5">
            <WeatherIcon iconName={current.iconName} className="w-12 h-12 sm:w-14 sm:h-14" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight">
                {current.temp}°
              </span>
              <span className="text-base sm:text-lg font-bold ml-1">{current.text}</span>
            </div>
            <div className="text-xs sm:text-sm opacity-80 mt-1 flex items-center gap-2 font-medium">
              <span>体感 {current.feelsLike}°</span>
              <span>•</span>
              <span>
                {current.tempMin}° ~ {current.tempMax}°
              </span>
            </div>
          </div>
        </div>

        {/* Right: Metrics Pills (Humidity, Wind) */}
        <div className="flex sm:flex-col items-center sm:items-end gap-3 text-xs sm:text-sm font-medium border-t sm:border-t-0 sm:border-l pt-2 sm:pt-0 sm:pl-4 w-full sm:w-auto justify-around">
          <div className="flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-sky-500 shrink-0" />
            <span>湿度: {current.humidity}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              {current.windDirection} {current.windSpeed} km/h
            </span>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast Grid */}
      {forecast && forecast.length > 0 && (
        <div id="weather-forecast-grid" className="mt-4 pt-3 border-t">
          <div className="text-xs font-bold opacity-70 mb-2 flex items-center justify-between">
            <span>未来预报</span>
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Clock className="w-3 h-3" /> {timeStr} 更新 ({latencyMs}ms)
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {forecast.map((day, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center p-2 rounded-xl border text-center text-xs"
              >
                <span className="font-bold">{day.dayOfWeek}</span>
                <span className="text-[11px] opacity-70 mt-0.5">{day.text}</span>
                <span className="font-mono font-bold mt-1 text-xs">
                  {day.tempMin}° / {day.tempMax}°
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
