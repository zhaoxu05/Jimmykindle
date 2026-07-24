import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppSettings, WeatherData, City, ThemeMode, LayoutPreset, ResolutionPreset, ModuleId, ALL_MODULE_IDS } from './types';
import { DEFAULT_CITIES, fetchWeatherWithFallback } from './services/weatherService';
import { ClockDisplay } from './components/ClockDisplay';
import { QuoteDisplay } from './components/QuoteDisplay';
import { WorldClockMini } from './components/WorldClockMini';
import { LunarDisplay } from './components/LunarDisplay';
import { WeatherDisplay } from './components/WeatherDisplay';
import { HistoryTodayDisplay } from './components/HistoryTodayDisplay';
import { NewsHeadlinesDisplay } from './components/NewsHeadlinesDisplay';
import { SunTrackDisplay } from './components/SunTrackDisplay';
import { MoonPhaseDisplay } from './components/MoonPhaseDisplay';
import { TidesDisplay } from './components/TidesDisplay';
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
  Monitor,
  MapPin,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

const STORAGE_KEY = 'kindle_desk_standby_settings_v1';

const ensureCompleteModuleOrder = (order?: ModuleId[]): ModuleId[] => {
  if (!order || !Array.isArray(order) || order.length === 0) return [...ALL_MODULE_IDS];
  const existing = new Set(order);
  const missing = ALL_MODULE_IDS.filter((id) => !existing.has(id));
  return [...order, ...missing];
};

const DEFAULT_SETTINGS: AppSettings = {
  moduleOrder: ALL_MODULE_IDS,
  theme: 'eink',
  layoutPreset: 'auto',
  resolutionPreset: 'voyage',
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
  showNewsHeadlines: true,

  showTides: false,
  showSunTrack: false,
  showMoonPhase: false,

  controlBarPosition: 'collapsible',

  weatherRefreshMinutes: 30,
  autoSwitchSource: true,
  preferredSourceId: 'auto',

  showQuote: true,
  quoteSource: 'all',
  quoteRefreshInterval: 5,

  showWorldClock: true,
  worldClockCity: DEFAULT_CITIES[1], // Dublin

  autoKindleRefreshMinutes: 0,
  burnInProtection: false,
};

export default function App() {
  // Load settings from localStorage with Kindle auto-detection
  const [settings, setSettings] = useState<AppSettings>(() => {
    const isKindleUA = typeof navigator !== 'undefined' && /Kindle|Silk|Eink|E-Ink|Book|Voyage/i.test(navigator.userAgent);
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const isResetRequested = searchParams ? (searchParams.get('reset') === '1' || searchParams.get('kindle') === '1' || searchParams.get('mode') === 'eink') : false;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && !isResetRequested) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          theme: isKindleUA ? 'eink' : (parsed.theme || 'eink'),
          resolutionPreset: isKindleUA ? 'voyage' : (parsed.resolutionPreset || 'voyage'),
          showSunTrack: parsed.showSunTrack ?? false,
          showMoonPhase: parsed.showMoonPhase ?? false,
          showTides: parsed.showTides ?? false,
          showWorldClock: parsed.showWorldClock ?? true,
          worldClockCity: parsed.worldClockCity || DEFAULT_CITIES[1],
          moduleOrder: ensureCompleteModuleOrder(parsed.moduleOrder),
        };
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

  // Reset all settings to default
  const resetAllSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch {
      // Ignore
    }
  }, []);

  // One-click Reset & Lock into Kindle Voyage Optimal Eink Mode
  const resetToKindleMode = useCallback(() => {
    const kindleDefaults: AppSettings = {
      ...DEFAULT_SETTINGS,
      theme: 'eink',
      layoutPreset: 'auto',
      resolutionPreset: 'voyage',
      noAnimations: true,
      einkHighContrast: true,
    };
    setSettings(kindleDefaults);
    setSettingsOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(kindleDefaults));
    } catch {
      // Ignore
    }
  }, []);

  // Weather state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [sourcesStatus, setSourcesStatus] = useState<Record<string, { status: string; msg?: string }>>({});

  // UI Modals, Controls & Fullscreen
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'theme' | 'modules' | 'city' | 'weather' | 'kindle'>('theme');
  const [guideOpen, setGuideOpen] = useState(false);
  const [kindleFlashActive, setKindleFlashActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsExpanded, setControlsExpanded] = useState(false);

  const openCitySettings = useCallback(() => {
    setSettingsTab('city');
    setSettingsOpen(true);
  }, []);

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
      case 'parchment':
        return 'bg-[#F4ECD8] text-[#3E2C1C] border-[#D1BF9D]';
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
      case 'voyage':
        return 1.05;
      case 'iphone-15-promax':
        return 0.95;
      case 'mate-xt':
        return 1.35;
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
      case 'voyage':
        return 'max-w-5xl 2xl:max-w-6xl';
      case 'iphone-15-promax':
        return 'max-w-3xl md:max-w-4xl lg:max-w-5xl';
      case 'mate-xt':
        return 'max-w-[2000px]';
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

  const activeOrderedModules = useMemo(() => {
    const order = ensureCompleteModuleOrder(settings.moduleOrder);
    return order.filter((id) => {
      if (id === 'quote') return false; // Quote is always grouped directly under Clock
      switch (id) {
        case 'clock':
          return true;
        case 'weather':
          return true;
        case 'lunar':
          return settings.showLunar;
        case 'news':
          return settings.showNewsHeadlines;
        case 'history':
          return settings.showHistoryToday;
        case 'sunTrack':
          return settings.showSunTrack;
        case 'moonPhase':
          return settings.showMoonPhase;
        case 'tides':
          return settings.showTides;
        default:
          return true;
      }
    });
  }, [settings]);

  const leftColModules = useMemo(() => {
    const leftSet = new Set<ModuleId>(['clock', 'lunar', 'sunTrack']);
    return activeOrderedModules.filter((id) => leftSet.has(id));
  }, [activeOrderedModules]);

  const rightColModules = useMemo(() => {
    const leftSet = new Set<ModuleId>(['clock', 'lunar', 'sunTrack']);
    return activeOrderedModules.filter((id) => !leftSet.has(id));
  }, [activeOrderedModules]);

  const renderModule = useCallback(
    (id: ModuleId) => {
      switch (id) {
        case 'clock':
          return (
            <div key="clock-and-quote" className="w-full flex flex-col items-center justify-center space-y-2">
              <ClockDisplay
                key="clock"
                city={settings.timeCity}
                use24Hour={settings.use24Hour}
                showSeconds={settings.showSeconds}
                fontSizeScale={settings.fontSizeScale}
                isEink={isEink}
                resolutionScale={resolutionScale}
                onOpenCitySettings={openCitySettings}
              />
              {settings.showWorldClock && (
                <WorldClockMini
                  key="worldClock"
                  city={settings.worldClockCity || DEFAULT_CITIES[1]}
                  use24Hour={settings.use24Hour}
                  showSeconds={settings.showSeconds}
                  isEink={isEink}
                  fontSizeScale={settings.fontSizeScale}
                  onOpenCitySettings={openCitySettings}
                />
              )}
              {settings.showQuote && (
                <QuoteDisplay
                  key="quote"
                  source={settings.quoteSource}
                  refreshIntervalMinutes={settings.quoteRefreshInterval}
                  isEink={isEink}
                  fontSizeScale={settings.fontSizeScale}
                />
              )}
            </div>
          );
        case 'quote':
          if (!settings.showQuote) return null;
          return (
            <QuoteDisplay
              key="quote"
              source={settings.quoteSource}
              refreshIntervalMinutes={settings.quoteRefreshInterval}
              isEink={isEink}
              fontSizeScale={settings.fontSizeScale}
            />
          );
        case 'weather':
          return (
            <WeatherDisplay
              key="weather"
              weatherData={weatherData}
              loading={weatherLoading}
              weatherCity={settings.weatherCity}
              onRefresh={loadWeather}
              onOpenSourceModal={() => {
                setSettingsTab('weather');
                setSettingsOpen(true);
              }}
              onOpenCitySettings={openCitySettings}
              isEink={isEink}
              sourcesStatus={simpleSourcesStatus}
            />
          );
        case 'lunar':
          if (!settings.showLunar) return null;
          return (
            <div key="lunar" className="w-full">
              <LunarDisplay
                showYiJi={settings.showYiJi}
                showSolarTerms={settings.showSolarTerms}
                showNextHoliday={settings.showNextHoliday}
                isEink={isEink}
              />
            </div>
          );
        case 'news':
          if (!settings.showNewsHeadlines) return null;
          return <NewsHeadlinesDisplay key="news" isEink={isEink} />;
        case 'history':
          if (!settings.showHistoryToday) return null;
          return <HistoryTodayDisplay key="history" isEink={isEink} />;
        case 'sunTrack':
          if (!settings.showSunTrack) return null;
          return <SunTrackDisplay key="sunTrack" city={settings.weatherCity} isEink={isEink} />;
        case 'moonPhase':
          if (!settings.showMoonPhase) return null;
          return <MoonPhaseDisplay key="moonPhase" isEink={isEink} />;
        case 'tides':
          if (!settings.showTides) return null;
          return <TidesDisplay key="tides" isEink={isEink} />;
        default:
          return null;
      }
    },
    [settings, isEink, resolutionScale, weatherData, weatherLoading, loadWeather, simpleSourcesStatus]
  );

  return (
    <div
      id="standby-app-root"
      className={`min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 md:p-8 font-sans transition-colors duration-300 ${themeClasses}`}
      style={{
        transform: `translate(${driftOffset.x}px, ${driftOffset.y}px)`,
        fontSize: resolutionScale > 1 ? `${resolutionScale * 100}%` : undefined,
      }}
    >
      {/* Pinned Kindle Mode Quick Recovery Button */}
      <button
        onClick={resetToKindleMode}
        id="kindle-quick-recovery-btn"
        className={`fixed top-3 left-3 z-40 px-2.5 py-1 rounded-lg border-2 font-black text-xs shadow-md opacity-80 hover:opacity-100 flex items-center gap-1 transition cursor-pointer ${
          isEink
            ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-black text-black dark:text-white'
            : 'border-zinc-900 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 dark:border-white'
        }`}
        title="如在 Kindle 上误切其他主题或排版导致卡住，点击一秒还原并锁死为 Kindle 最佳高对比黑白模式"
      >
        <span>⚡ 还原Kindle屏</span>
      </button>

      {/* Floating Collapsible Control Trigger (if controlBarPosition === 'collapsible') */}
      {settings.controlBarPosition === 'collapsible' && (
        <div id="collapsible-controls-dock" className="fixed top-3 right-3 z-30 transition-all">
          {!controlsExpanded ? (
            <button
              onClick={() => setControlsExpanded(true)}
              className={`px-3 py-1.5 rounded-full border shadow-sm font-bold text-xs flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-all ${
                isEink
                  ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-black text-black dark:text-white border-2'
                  : 'border-current/30 bg-current/10 backdrop-blur-md text-current'
              }`}
              title="点击展开控制栏 (自动静默隐形，不挡屏)"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>设置 & 控制</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          ) : (
            <div
              className={`p-2.5 rounded-2xl border shadow-2xl flex flex-wrap items-center gap-2 text-xs sm:text-sm backdrop-blur-md max-w-xs sm:max-w-none ${
                isEink
                  ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-black text-black dark:text-white border-2'
                  : 'border-current/30 bg-black/80 text-white dark:bg-zinc-900/90'
              }`}
            >
              {/* Resolution Quick Switcher Pill */}
              <button
                onClick={() => {
                  const resList: ResolutionPreset[] = ['voyage', 'iphone-15-promax', 'mate-xt', 'auto', '1k', '2k', '3k', '4k'];
                  const nextIdx = (resList.indexOf(settings.resolutionPreset) + 1) % resList.length;
                  updateSettings({ resolutionPreset: resList[nextIdx] });
                }}
                className="px-2.5 py-1 rounded-xl border border-current/30 hover:bg-current/10 font-medium flex items-center gap-1 transition"
              >
                <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                <span>{settings.resolutionPreset.toUpperCase()}</span>
              </button>

              {/* Theme Switcher */}
              <button
                onClick={() => {
                  const themes: ThemeMode[] = ['eink', 'eink-inverted', 'sepia', 'parchment', 'dark', 'light'];
                  const nextIdx = (themes.indexOf(settings.theme) + 1) % themes.length;
                  updateSettings({ theme: themes[nextIdx] });
                }}
                className="px-2.5 py-1 rounded-xl border border-current/30 hover:bg-current/10 font-medium flex items-center gap-1 transition"
              >
                <span>主题: {settings.theme}</span>
              </button>

              {/* Layout Switcher */}
              <button
                onClick={() => {
                  const layouts: LayoutPreset[] = ['four-grid', 'auto', 'time-focus', 'split-dash', 'minimal-dock', 'vertical-stand'];
                  const nextIdx = (layouts.indexOf(settings.layoutPreset) + 1) % layouts.length;
                  updateSettings({ layoutPreset: layouts[nextIdx] });
                }}
                className="px-2.5 py-1 rounded-xl border border-current/30 hover:bg-current/10 font-medium flex items-center gap-1 transition"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>布局: {settings.layoutPreset}</span>
              </button>

              {/* City Switcher */}
              <button
                onClick={openCitySettings}
                className="px-2.5 py-1 rounded-xl border border-current/30 hover:bg-current/10 font-normal flex items-center gap-1 transition opacity-90 hover:opacity-100"
                title="城市与时区设置"
              >
                <MapPin className="w-3.5 h-3.5 opacity-70" />
                <span>城市: {settings.weatherCity.name}</span>
              </button>

              {/* Guide */}
              <button
                onClick={() => setGuideOpen(true)}
                className="p-1.5 rounded-xl border border-current/30 hover:bg-current/10 transition"
                title="部署指南"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* Settings Modal */}
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-1.5 rounded-xl border border-current/30 hover:bg-current/10 transition"
                title="完整偏好设置"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-xl border border-current/30 hover:bg-current/10 transition"
                title={isFullscreen ? '退出全屏' : '全屏显示'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Collapse Button */}
              <button
                onClick={() => setControlsExpanded(false)}
                className="px-2 py-1 rounded-xl bg-emerald-600 text-white font-bold flex items-center gap-1 text-xs ml-auto"
              >
                <span>收起</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Top Header Control Bar (if controlBarPosition === 'top') */}
      {settings.controlBarPosition === 'top' && (
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
              {settings.resolutionPreset === 'voyage' && 'Kindle Voyage 原生适配'}
              {settings.resolutionPreset === 'iphone-15-promax' && 'iPhone 15 Pro Max 适配'}
              {settings.resolutionPreset === 'mate-xt' && '华为 Mate XT 三折叠适配'}
              {settings.resolutionPreset !== 'voyage' && settings.resolutionPreset !== 'iphone-15-promax' && settings.resolutionPreset !== 'mate-xt' && `${settings.resolutionPreset.toUpperCase()} 适配`}
            </span>
          </div>

          <div id="standby-top-actions" className="flex items-center gap-2 text-xs sm:text-sm">
            <button
              onClick={() => {
                const resList: ResolutionPreset[] = ['voyage', 'iphone-15-promax', 'mate-xt', 'auto', '1k', '2k', '3k', '4k'];
                const nextIdx = (resList.indexOf(settings.resolutionPreset) + 1) % resList.length;
                updateSettings({ resolutionPreset: resList[nextIdx] });
              }}
              className="px-2.5 py-1.5 rounded-xl border border-current/30 hover:bg-current/10 font-medium flex items-center gap-1.5 transition"
            >
              <Monitor className="w-3.5 h-3.5 text-emerald-500" />
              <span>设备: {settings.resolutionPreset.toUpperCase()}</span>
            </button>

            <button
              onClick={() => {
                const themes: ThemeMode[] = ['eink', 'eink-inverted', 'sepia', 'parchment', 'dark', 'light'];
                const nextIdx = (themes.indexOf(settings.theme) + 1) % themes.length;
                updateSettings({ theme: themes[nextIdx] });
              }}
              className="px-2.5 py-1.5 rounded-xl border border-current/30 hover:bg-current/10 font-medium flex items-center gap-1.5 transition hidden sm:flex"
            >
              <span>主题: {settings.theme}</span>
            </button>

            <button
              onClick={() => setGuideOpen(true)}
              className="p-2 rounded-xl border border-current/30 hover:bg-current/10 transition"
              title="指南"
            >
              <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-xl border border-current/30 hover:bg-current/10 transition"
              title="偏好设置"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl border border-current/30 hover:bg-current/10 transition"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </header>
      )}

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

            {settings.showQuote && (
              <QuoteDisplay
                source={settings.quoteSource}
                refreshIntervalMinutes={settings.quoteRefreshInterval}
                isEink={isEink}
                fontSizeScale={settings.fontSizeScale}
              />
            )}

            {/* Other active modules rendered in user order */}
            {activeOrderedModules
              .filter((id) => id !== 'clock' && id !== 'quote')
              .map((id) => (
                <div key={id} className="w-full max-w-xl">
                  {renderModule(id)}
                </div>
              ))}
          </div>
        )}

        {/* LAYOUT 2: MINIMAL DOCK */}
        {settings.layoutPreset === 'minimal-dock' && (
          <div id="layout-minimal-dock" className="flex flex-col items-center justify-between gap-6 py-4">
            <div className="my-auto flex flex-col items-center justify-center space-y-3">
              <ClockDisplay
                city={settings.timeCity}
                use24Hour={settings.use24Hour}
                showSeconds={settings.showSeconds}
                fontSizeScale={settings.fontSizeScale * 1.1}
                isEink={isEink}
                resolutionScale={resolutionScale}
              />
              {settings.showQuote && (
                <QuoteDisplay
                  source={settings.quoteSource}
                  refreshIntervalMinutes={settings.quoteRefreshInterval}
                  isEink={isEink}
                  fontSizeScale={settings.fontSizeScale}
                />
              )}
            </div>

            {/* Bottom Horizontal Dock rendering active modules in user order */}
            <div className="w-full flex flex-col sm:flex-row flex-wrap gap-4 items-stretch justify-center p-4 rounded-3xl border border-current/20 bg-current/5">
              {activeOrderedModules
                .filter((id) => id !== 'clock' && id !== 'quote')
                .map((id) => (
                  <div key={id} className="flex-1 min-w-[280px]">
                    {renderModule(id)}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* LAYOUT: FOUR-GRID (四方格 2x2 均衡全屏) */}
        {settings.layoutPreset === 'four-grid' && (
          <div id="layout-four-grid" className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6 items-start w-full">
            {activeOrderedModules.map((id) => (
              <div key={id} className="w-full flex flex-col items-center">
                {renderModule(id)}
              </div>
            ))}
          </div>
        )}

        {/* LAYOUT 3: SPLIT DASHBOARD */}
        {settings.layoutPreset === 'split-dash' && (
          <div id="layout-split-dash" className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            <div className="lg:col-span-6 flex flex-col items-center justify-center p-2 space-y-4">
              {leftColModules.map((id) => (
                <div key={id} className="w-full flex justify-center">
                  {renderModule(id)}
                </div>
              ))}
            </div>
            <div className="lg:col-span-6 flex flex-col gap-4">
              {rightColModules.map((id) => (
                <div key={id} className="w-full flex justify-center">
                  {renderModule(id)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LAYOUT 4: VERTICAL STAND */}
        {settings.layoutPreset === 'vertical-stand' && (
          <div id="layout-vertical-stand" className="flex flex-col gap-5 items-center justify-center max-w-lg mx-auto w-full">
            {activeOrderedModules.map((id) => (
              <div key={id} className="w-full flex justify-center">
                {renderModule(id)}
              </div>
            ))}
          </div>
        )}

        {/* LAYOUT 5: AUTO RESPONSIVE */}
        {settings.layoutPreset === 'auto' && (
          isLandscape ? (
            <div id="landscape-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              <div className="lg:col-span-6 flex flex-col items-center justify-center p-2 space-y-4">
                {leftColModules.map((id) => (
                  <div key={id} className="w-full flex justify-center">
                    {renderModule(id)}
                  </div>
                ))}
              </div>

              <div className="lg:col-span-6 flex flex-col gap-4">
                {rightColModules.map((id) => (
                  <div key={id} className="w-full flex justify-center">
                    {renderModule(id)}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div id="portrait-stack" className="flex flex-col gap-6 items-center justify-center w-full max-w-md mx-auto">
              {activeOrderedModules.map((id) => (
                <div key={id} className="w-full">
                  {renderModule(id)}
                </div>
              ))}
            </div>
          )
        )}
      </main>

      {/* Bottom Control Dock (if controlBarPosition === 'bottom') */}
      {settings.controlBarPosition === 'bottom' && (
        <div id="bottom-controls-dock" className={`w-full ${containerMaxWidthClass} mx-auto my-2 p-3 rounded-2xl border shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm ${
          isEink
            ? 'border-zinc-900 dark:border-zinc-100 bg-white dark:bg-black text-black dark:text-white border-2'
            : 'border-current/20 bg-current/5 text-current'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            <Settings className="w-4 h-4 text-emerald-500" />
            <span>设置 & 控制台</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const resList: ResolutionPreset[] = ['voyage', 'iphone-15-promax', 'mate-xt', 'auto', '1k', '2k', '3k', '4k'];
                const nextIdx = (resList.indexOf(settings.resolutionPreset) + 1) % resList.length;
                updateSettings({ resolutionPreset: resList[nextIdx] });
              }}
              className="px-2.5 py-1 rounded-xl border border-current/30 hover:bg-current/10 transition"
            >
              设备: {settings.resolutionPreset.toUpperCase()}
            </button>

            <button
              onClick={() => {
                const themes: ThemeMode[] = ['eink', 'eink-inverted', 'sepia', 'parchment', 'dark', 'light'];
                const nextIdx = (themes.indexOf(settings.theme) + 1) % themes.length;
                updateSettings({ theme: themes[nextIdx] });
              }}
              className="px-2.5 py-1 rounded-xl border border-current/30 hover:bg-current/10 transition"
            >
              主题: {settings.theme}
            </button>

            <button
              onClick={() => {
                const layouts: LayoutPreset[] = ['four-grid', 'auto', 'time-focus', 'split-dash', 'minimal-dock', 'vertical-stand'];
                const nextIdx = (layouts.indexOf(settings.layoutPreset) + 1) % layouts.length;
                updateSettings({ layoutPreset: layouts[nextIdx] });
              }}
              className="px-2.5 py-1 rounded-xl border border-current/30 hover:bg-current/10 transition"
            >
              布局: {settings.layoutPreset}
            </button>

            <button
              onClick={() => setGuideOpen(true)}
              className="p-1.5 rounded-xl border border-current/30 hover:bg-current/10 transition"
              title="指南"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSettingsOpen(true)}
              className="p-1.5 rounded-xl border border-current/30 hover:bg-current/10 transition"
              title="完整偏好设置"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-xl border border-current/30 hover:bg-current/10 transition"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Footer Info Bar */}
      <footer id="standby-footer" className={`w-full ${containerMaxWidthClass} mx-auto pt-3 border-t border-current/15 flex flex-wrap items-center justify-between text-xs opacity-75 gap-2`}>
        <div id="footer-city-tags" className="flex items-center gap-2">
          <button
            onClick={openCitySettings}
            className="hover:underline flex items-center gap-1 font-normal opacity-90 hover:opacity-100 transition cursor-pointer"
            title="点击设置时间与天气城市"
          >
            <MapPin className="w-3 h-3 opacity-70" />
            <span>时间: {settings.timeCity.name}</span>
          </button>
          <span>•</span>
          <button
            onClick={openCitySettings}
            className="hover:underline flex items-center gap-1 font-normal opacity-90 hover:opacity-100 transition cursor-pointer"
            title="点击设置时间与天气城市"
          >
            <span>天气: {settings.weatherCity.name}</span>
          </button>
          {weatherData?.sourceName && (
            <>
              <span>•</span>
              <span className="font-mono">{weatherData.sourceName}</span>
            </>
          )}
        </div>

        <div id="footer-system-info" className="flex items-center gap-3">
          <button
            onClick={() => {
              setSettingsTab('theme');
              setSettingsOpen(true);
            }}
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
        onResetAllSettings={resetAllSettings}
        onResetToKindleMode={resetToKindleMode}
        initialTab={settingsTab}
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
