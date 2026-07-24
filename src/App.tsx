import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppSettings, WeatherData, City, ThemeMode, LayoutPreset, ResolutionPreset } from './types';
import { DEFAULT_CITIES, fetchWeatherWithFallback } from './services/weatherService';
import { ClockDisplay } from './components/ClockDisplay';
import { LunarDisplay } from './components/LunarDisplay';
import { WeatherDisplay } from './components/WeatherDisplay';
import { SettingsModal } from './components/SettingsModal';
import { KindleRefreshOverlay } from './components/KindleRefreshOverlay';
import { ExportGuideModal } from './components/ExportGuideModal';
import { WeatherIcon } from './components/WeatherIcons';
import {
  Settings,
  Maximize2,
  Minimize2,
  HelpCircle,
  RefreshCw,
  Sun,
  Moon,
  Smartphone,
  Tv,
  LayoutGrid,
  Calendar,
  CloudSun,
  Sparkles,
  Monitor,
} from 'lucide-react';

const STORAGE_KEY = 'kindle_desk_standby_settings_v1';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'eink',
  layoutPreset: 'auto',
  resolutionPreset: 'auto',
  fontSizeScale: 1.0,
  showSeconds: true,
  use24Hour: true,
  einkHighContrast: true,
  noAnimations: true,

  timeCity: DEFAULT_CITIES[0], // Beijing
  weatherCity: DEFAULT_CITIES[0], // Beijing
  syncCities: true,

  showLunar: true,
  showYiJi: true,
  showSolarTerms: true,
  showNextHoliday: true,
  showHistoryToday: true,

  weatherRefreshMinutes: 30,
  autoSwitchSource: true,
  preferredSourceId: 'auto',

  autoKindleRefreshMinutes: 0,
  burnInProtection: false,
};

export default function App() {
  // Load settings from localStorage
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore
    }
    return DEFAULT_SETTINGS;
  });

  // Save settings on update
  const updateSettings = useCallback((newPartial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  }, []);

  // Weather state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [sourcesStatus, setSourcesStatus] = useState<Record<string, { status: string; msg?: string }>>({});

  // UI Modals & Fullscreen
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [kindleFlashActive, setKindleFlashActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Screen layout detection
  const [isLandscape, setIsLandscape] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : true
  );

  // OLED Drift offset
  const [driftOffset, setDriftOffset] = useState({ x: 0, y: 0 });

  // Simple mapped source status string object
  const simpleSourcesStatus = useMemo(() => {
    const res: Record<string, string> = {};
    Object.entries(sourcesStatus).forEach(([k, v]) => {
      if (v) res[k] = (v as { status: string }).status;
    });
    return res;
  }, [sourcesStatus]);

  // Handle window resize & orientation
  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Weather fetch logic with 5-second auto switch failover
  const loadWeather = useCallback(async () => {
    setWeatherLoading(true);
    try {
      const data = await fetchWeatherWithFallback(settings.weatherCity, (sourceId, status, msg) => {
        setSourcesStatus((prev) => ({
          ...prev,
          [sourceId]: { status, msg },
        }));
      });
      setWeatherData(data);
    } catch (err) {
      console.error('Weather load error:', err);
    } finally {
      setWeatherLoading(false);
    }
  }, [settings.weatherCity]);

  // Initial & interval weather reload
  useEffect(() => {
    loadWeather();
    const intervalMs = settings.weatherRefreshMinutes * 60 * 1000;
    const timer = setInterval(() => {
      loadWeather();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [loadWeather, settings.weatherRefreshMinutes]);

  // Auto Kindle Refresh Flash timer
  useEffect(() => {
    if (settings.autoKindleRefreshMinutes > 0) {
      const intervalMs = settings.autoKindleRefreshMinutes * 60 * 1000;
      const timer = setInterval(() => {
        setKindleFlashActive(true);
      }, intervalMs);
      return () => clearInterval(timer);
    }
  }, [settings.autoKindleRefreshMinutes]);

  // OLED Burn-in pixel drift timer
  useEffect(() => {
    if (settings.burnInProtection) {
      const timer = setInterval(() => {
        const dx = (Math.random() - 0.5) * 4; // -2px to +2px
        const dy = (Math.random() - 0.5) * 4;
        setDriftOffset({ x: dx, y: dy });
      }, 10 * 60 * 1000); // every 10 min
      return () => clearInterval(timer);
    } else {
      setDriftOffset({ x: 0, y: 0 });
    }
  }, [settings.burnInProtection]);

  // Derive theme style classes
  const themeClasses = useMemo(() => {
    switch (settings.theme) {
      case 'eink':
        return 'bg-white text-black border-black select-none eink-mode';
      case 'eink-inverted':
        return 'bg-black text-white border-white select-none eink-mode';
      case 'sepia':
        return 'bg-[#F7F4EA] text-[#3D312A] border-[#D9CEBA]';
      case 'dark':
        return 'bg-black text-zinc-100 border-zinc-800';
      case 'light':
      default:
        return 'bg-zinc-50 text-zinc-900 border-zinc-200';
    }
  }, [settings.theme]);

  const isEink = settings.theme === 'eink' || settings.theme === 'eink-inverted';

  const resolutionScale = useMemo(() => {
    switch (settings.resolutionPreset) {
      case '1k':
        return 1.0;
      case '2k':
        return 1.3;
      case '3k':
        return 1.65;
      case '4k':
        return 2.1;
      case 'auto':
      default:
        return 1.0;
    }
  }, [settings.resolutionPreset]);

  const containerMaxWidthClass = useMemo(() => {
    switch (settings.resolutionPreset) {
      case '1k':
        return 'max-w-7xl';
      case '2k':
        return 'max-w-[1800px]';
      case '3k':
        return 'max-w-[2400px]';
      case '4k':
        return 'max-w-[3200px]';
      case 'auto':
      default:
        return 'max-w-7xl 2xl:max-w-[2200px]';
    }
  }, [settings.resolutionPreset]);

  return (
    <div
      id="standby-app-root"
      className={`min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans transition-colors duration-300 ${themeClasses}`}
      style={{
        transform: `translate(${driftOffset.x}px, ${driftOffset.y}px)`,
        fontSize: resolutionScale > 1 ? `${resolutionScale * 100}%` : undefined,
      }}
    >
      {/* Top Floating Control Bar */}
      <header id="standby-header" className={`w-full ${containerMaxWidthClass} mx-auto flex items-center justify-between pb-4 border-b border-current/15`}>
        <div id="standby-app-title" className="flex items-center gap-2 font-bold text-base sm:text-lg tracking-wide">
          {settings.theme === 'eink' || settings.theme === 'eink-inverted' ? (
            <Smartphone className="w-5 h-5 shrink-0" />
          ) : settings.theme === 'sepia' ? (
            <Sun className="w-5 h-5 text-amber-600 shrink-0" />
          ) : (
            <Tv className="w-5 h-5 text-emerald-500 shrink-0" />
          )}
          <span>待机时钟</span>
          <span className="text-xs px-2 py-0.5 rounded border border-current/30 opacity-75 font-normal hidden sm:inline">
            Kindle / 桌面 / {settings.resolutionPreset.toUpperCase()} 适配
          </span>
        </div>

        {/* Action Buttons */}
        <div id="standby-top-actions" className="flex items-center gap-2 text-xs sm:text-sm">
          {/* Resolution Quick Switcher Pill */}
          <button
            onClick={() => {
              const resList: ResolutionPreset[] = ['auto', '1k', '2k', '3k', '4k'];
              const nextIdx = (resList.indexOf(settings.resolutionPreset) + 1) % resList.length;
              updateSettings({ resolutionPreset: resList[nextIdx] });
            }}
            className="px-2.5 py-1.5 rounded-xl border border-current/30 hover:bg-current/10 font-medium flex items-center gap-1.5 transition"
            title="手动切换 1K / 2K / 3K / 4K 或 智能自适应"
          >
            <Monitor className="w-3.5 h-3.5 text-emerald-500" />
            {settings.resolutionPreset === 'auto' && <span>屏幕: 智能自适应</span>}
            {settings.resolutionPreset === '1k' && <span>屏幕: 1K 1080P</span>}
            {settings.resolutionPreset === '2k' && <span>屏幕: 2K 高清</span>}
            {settings.resolutionPreset === '3k' && <span>屏幕: 3K 超清</span>}
            {settings.resolutionPreset === '4k' && <span>屏幕: 4K 巨幕</span>}
          </button>

          {/* Theme Quick Switcher Pill */}
          <button
            onClick={() => {
              const themes: ThemeMode[] = ['eink', 'eink-inverted', 'sepia', 'dark', 'light'];
              const nextIdx = (themes.indexOf(settings.theme) + 1) % themes.length;
              updateSettings({ theme: themes[nextIdx] });
            }}
            className="px-2.5 py-1.5 rounded-xl border border-current/30 hover:bg-current/10 font-medium flex items-center gap-1.5 transition hidden sm:flex"
            title="点击轮播切换 5 种配色主题"
          >
            {settings.theme === 'eink' && <span>主题: 墨水屏白</span>}
            {settings.theme === 'eink-inverted' && <span>主题: 墨水屏黑</span>}
            {settings.theme === 'sepia' && <span>主题: 暖阳复古</span>}
            {settings.theme === 'dark' && <span>主题: OLED纯黑</span>}
            {settings.theme === 'light' && <span>主题: 现代明亮</span>}
          </button>

          {/* Layout Quick Switcher Pill */}
          <button
            onClick={() => {
              const layouts: LayoutPreset[] = ['auto', 'time-focus', 'split-dash', 'minimal-dock', 'vertical-stand'];
              const nextIdx = (layouts.indexOf(settings.layoutPreset) + 1) % layouts.length;
              updateSettings({ layoutPreset: layouts[nextIdx] });
            }}
            className="px-2.5 py-1.5 rounded-xl border border-current/30 hover:bg-current/10 font-medium flex items-center gap-1.5 transition hidden md:flex"
            title="点击轮播切换 5 种布局结构"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            {settings.layoutPreset === 'auto' && <span>布局: 智能自适应</span>}
            {settings.layoutPreset === 'time-focus' && <span>布局: 巨型 Focus</span>}
            {settings.layoutPreset === 'split-dash' && <span>布局: 左右分屏</span>}
            {settings.layoutPreset === 'minimal-dock' && <span>布局: 底栏 Dock</span>}
            {settings.layoutPreset === 'vertical-stand' && <span>布局: 竖屏支架</span>}
          </button>

          {/* Guide / Deploy */}
          <button
            onClick={() => setGuideOpen(true)}
            className="p-2 rounded-xl border border-current/30 hover:bg-current/10 transition"
            title="Kindle 部署与使用指南"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Settings Trigger */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-xl border border-current/30 hover:bg-current/10 transition"
            title="偏好设置"
          >
            <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl border border-current/30 hover:bg-current/10 transition"
            title={isFullscreen ? '退出全屏' : '全屏显示'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Main Adaptive Workspace Body */}
      <main id="standby-main-container" className={`w-full ${containerMaxWidthClass} mx-auto my-auto py-4 sm:py-6 flex-1 flex flex-col justify-center`}>
        {/* LAYOUT 1: TIME FOCUS */}
        {settings.layoutPreset === 'time-focus' && (
          <div id="layout-time-focus" className="flex flex-col items-center justify-center text-center space-y-6">
            <ClockDisplay
              city={settings.timeCity}
              use24Hour={settings.use24Hour}
              showSeconds={settings.showSeconds}
              fontSizeScale={settings.fontSizeScale * 1.25}
              isEink={isEink}
              resolutionScale={resolutionScale}
            />

            {/* Micro info strip */}
            <div className="flex flex-wrap items-center justify-center gap-3 px-4 py-2.5 rounded-2xl border border-current/20 bg-current/5 text-xs sm:text-sm font-semibold">
              {settings.showLunar && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 opacity-80" />
                  <span>农历 {settings.timeCity.name === settings.weatherCity.name ? '' : settings.timeCity.name}</span>
                </div>
              )}

              {weatherData && (
                <div className="flex items-center gap-2 border-l border-current/20 pl-3">
                  <WeatherIcon iconName={weatherData.current.iconName} className="w-4 h-4" />
                  <span>
                    {settings.weatherCity.name} {weatherData.current.temp}°C {weatherData.current.text}
                  </span>
                  <span className="opacity-70 text-[11px]">
                    ({weatherData.current.tempMin}°~{weatherData.current.tempMax}°)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* LAYOUT 2: MINIMAL DOCK */}
        {settings.layoutPreset === 'minimal-dock' && (
          <div id="layout-minimal-dock" className="flex flex-col items-center justify-between gap-6 py-4">
            <div className="my-auto">
              <ClockDisplay
                city={settings.timeCity}
                use24Hour={settings.use24Hour}
                showSeconds={settings.showSeconds}
                fontSizeScale={settings.fontSizeScale * 1.1}
                isEink={isEink}
                resolutionScale={resolutionScale}
              />
            </div>

            {/* Bottom Floating Horizontal Dock */}
            <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-3xl border border-current/20 bg-current/5">
              <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-current/15 pb-3 md:pb-0 md:pr-4">
                {settings.showLunar && (
                  <LunarDisplay
                    showYiJi={settings.showYiJi}
                    showSolarTerms={settings.showSolarTerms}
                    showNextHoliday={settings.showNextHoliday}
                    showHistoryToday={settings.showHistoryToday}
                    isEink={isEink}
                  />
                )}
              </div>
              <div className="md:col-span-7">
                <WeatherDisplay
                  weatherData={weatherData}
                  loading={weatherLoading}
                  weatherCity={settings.weatherCity}
                  onRefresh={loadWeather}
                  onOpenSourceModal={() => setSettingsOpen(true)}
                  isEink={isEink}
                  sourcesStatus={simpleSourcesStatus}
                />
              </div>
            </div>
          </div>
        )}

        {/* LAYOUT 3: SPLIT DASHBOARD */}
        {settings.layoutPreset === 'split-dash' && (
          <div id="layout-split-dash" className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-7 flex flex-col items-center justify-center p-4">
              <ClockDisplay
                city={settings.timeCity}
                use24Hour={settings.use24Hour}
                showSeconds={settings.showSeconds}
                fontSizeScale={settings.fontSizeScale}
                isEink={isEink}
                resolutionScale={resolutionScale}
              />
            </div>
            <div className="lg:col-span-5 flex flex-col gap-4">
              {settings.showLunar && (
                <LunarDisplay
                  showYiJi={settings.showYiJi}
                  showSolarTerms={settings.showSolarTerms}
                  showNextHoliday={settings.showNextHoliday}
                  showHistoryToday={settings.showHistoryToday}
                  isEink={isEink}
                />
              )}
              <WeatherDisplay
                weatherData={weatherData}
                loading={weatherLoading}
                weatherCity={settings.weatherCity}
                onRefresh={loadWeather}
                onOpenSourceModal={() => setSettingsOpen(true)}
                isEink={isEink}
                sourcesStatus={simpleSourcesStatus}
              />
            </div>
          </div>
        )}

        {/* LAYOUT 4: VERTICAL STAND */}
        {settings.layoutPreset === 'vertical-stand' && (
          <div id="layout-vertical-stand" className="flex flex-col gap-5 items-center justify-center max-w-lg mx-auto w-full">
            <ClockDisplay
              city={settings.timeCity}
              use24Hour={settings.use24Hour}
              showSeconds={settings.showSeconds}
              fontSizeScale={settings.fontSizeScale}
              isEink={isEink}
              resolutionScale={resolutionScale}
            />

            {settings.showLunar && (
              <div className="w-full">
                <LunarDisplay
                  showYiJi={settings.showYiJi}
                  showSolarTerms={settings.showSolarTerms}
                  showNextHoliday={settings.showNextHoliday}
                  showHistoryToday={settings.showHistoryToday}
                  isEink={isEink}
                />
              </div>
            )}

            <div className="w-full">
              <WeatherDisplay
                weatherData={weatherData}
                loading={weatherLoading}
                weatherCity={settings.weatherCity}
                onRefresh={loadWeather}
                onOpenSourceModal={() => setSettingsOpen(true)}
                isEink={isEink}
                sourcesStatus={simpleSourcesStatus}
              />
            </div>
          </div>
        )}

        {/* LAYOUT 5: AUTO RESPONSIVE */}
        {settings.layoutPreset === 'auto' && (
          isLandscape ? (
            <div id="landscape-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              <div className="lg:col-span-7 flex flex-col items-center justify-center p-4">
                <ClockDisplay
                  city={settings.timeCity}
                  use24Hour={settings.use24Hour}
                  showSeconds={settings.showSeconds}
                  fontSizeScale={settings.fontSizeScale}
                  isEink={isEink}
                  resolutionScale={resolutionScale}
                />
              </div>

              <div className="lg:col-span-5 flex flex-col gap-4">
                {settings.showLunar && (
                  <LunarDisplay
                    showYiJi={settings.showYiJi}
                    showSolarTerms={settings.showSolarTerms}
                    showNextHoliday={settings.showNextHoliday}
                    showHistoryToday={settings.showHistoryToday}
                    isEink={isEink}
                  />
                )}

                <WeatherDisplay
                  weatherData={weatherData}
                  loading={weatherLoading}
                  weatherCity={settings.weatherCity}
                  onRefresh={loadWeather}
                  onOpenSourceModal={() => setSettingsOpen(true)}
                  isEink={isEink}
                  sourcesStatus={simpleSourcesStatus}
                />
              </div>
            </div>
          ) : (
            <div id="portrait-stack" className="flex flex-col gap-6 items-center justify-center">
              <ClockDisplay
                city={settings.timeCity}
                use24Hour={settings.use24Hour}
                showSeconds={settings.showSeconds}
                fontSizeScale={settings.fontSizeScale}
                isEink={isEink}
                resolutionScale={resolutionScale}
              />

              {settings.showLunar && (
                <div className="w-full max-w-md">
                  <LunarDisplay
                    showYiJi={settings.showYiJi}
                    showSolarTerms={settings.showSolarTerms}
                    showNextHoliday={settings.showNextHoliday}
                    showHistoryToday={settings.showHistoryToday}
                    isEink={isEink}
                  />
                </div>
              )}

              <div className="w-full max-w-md">
                <WeatherDisplay
                  weatherData={weatherData}
                  loading={weatherLoading}
                  weatherCity={settings.weatherCity}
                  onRefresh={loadWeather}
                  onOpenSourceModal={() => setSettingsOpen(true)}
                  isEink={isEink}
                  sourcesStatus={simpleSourcesStatus}
                />
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer Info Bar */}
      <footer id="standby-footer" className={`w-full ${containerMaxWidthClass} mx-auto pt-3 border-t border-current/15 flex flex-wrap items-center justify-between text-xs opacity-75 gap-2`}>
        <div id="footer-city-tags" className="flex items-center gap-3">
          <span>时间: {settings.timeCity.name}</span>
          <span>•</span>
          <span>天气: {settings.weatherCity.name}</span>
          {weatherData?.sourceName && (
            <>
              <span>•</span>
              <span className="font-mono">{weatherData.sourceName}</span>
            </>
          )}
        </div>

        <div id="footer-system-info" className="flex items-center gap-3">
          <button
            onClick={() => setSettingsOpen(true)}
            className="underline hover:opacity-100 transition"
          >
            设置
          </button>
          <span>•</span>
          <button
            onClick={() => setKindleFlashActive(true)}
            className="underline hover:opacity-100 transition"
          >
            刷屏清残影
          </button>
        </div>
      </footer>

      {/* Modals & Overlays */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onManualRefreshWeather={loadWeather}
        sourcesStatus={sourcesStatus}
        onTriggerKindleFlash={() => setKindleFlashActive(true)}
      />

      <ExportGuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
      />

      <KindleRefreshOverlay
        active={kindleFlashActive}
        onFinish={() => setKindleFlashActive(false)}
      />
    </div>
  );
}
