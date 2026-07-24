import React, { useState } from 'react';
import { AppSettings, City, ThemeMode, ModuleId, ALL_MODULE_IDS, MODULE_NAMES } from '../types';
import { DEFAULT_CITIES, searchCities, WEATHER_SOURCES } from '../services/weatherService';
import {
  X,
  Smartphone,
  Sun,
  Moon,
  Tv,
  Check,
  Search,
  MapPin,
  Clock,
  Shield,
  RotateCw,
  Zap,
  Sliders,
  Sparkles,
  Monitor,
  Maximize2,
  LayoutGrid,
  Quote as QuoteIcon,
  BookOpen,
  Newspaper,
  PanelTop,
  Waves,
  ChevronUp,
  ChevronDown,
  ListOrdered,
  RotateCcw,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onManualRefreshWeather: () => void;
  sourcesStatus: Record<string, { status: string; msg?: string }>;
  onTriggerKindleFlash: () => void;
  onResetAllSettings?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onManualRefreshWeather,
  sourcesStatus,
  onTriggerKindleFlash,
  onResetAllSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'theme' | 'modules' | 'city' | 'weather' | 'kindle'>('theme');
  const [timeCitySearch, setTimeCitySearch] = useState('');
  const [weatherCitySearch, setWeatherCitySearch] = useState('');
  const [searchResultsTime, setSearchResultsTime] = useState<City[]>(DEFAULT_CITIES);
  const [searchResultsWeather, setSearchResultsWeather] = useState<City[]>(DEFAULT_CITIES);
  const [isSearchingTime, setIsSearchingTime] = useState(false);
  const [isSearchingWeather, setIsSearchingWeather] = useState(false);

  const currentModuleOrder = settings.moduleOrder && settings.moduleOrder.length > 0
    ? settings.moduleOrder
    : ALL_MODULE_IDS;

  const handleMoveModule = (idx: number, direction: 'up' | 'down') => {
    const list = [...currentModuleOrder];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    onUpdateSettings({ moduleOrder: list });
  };

  const handleResetModuleOrder = () => {
    onUpdateSettings({ moduleOrder: [...ALL_MODULE_IDS] });
  };

  const isModuleToggleable = (id: ModuleId): boolean => {
    return id !== 'clock' && id !== 'weather';
  };

  const getModuleActiveState = (id: ModuleId): boolean => {
    switch (id) {
      case 'clock':
        return true;
      case 'weather':
        return true;
      case 'quote':
        return settings.showQuote;
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
  };

  const toggleModuleActiveState = (id: ModuleId, active: boolean) => {
    switch (id) {
      case 'quote':
        onUpdateSettings({ showQuote: active });
        break;
      case 'lunar':
        onUpdateSettings({ showLunar: active });
        break;
      case 'news':
        onUpdateSettings({ showNewsHeadlines: active });
        break;
      case 'history':
        onUpdateSettings({ showHistoryToday: active });
        break;
      case 'sunTrack':
        onUpdateSettings({ showSunTrack: active });
        break;
      case 'moonPhase':
        onUpdateSettings({ showMoonPhase: active });
        break;
      case 'tides':
        onUpdateSettings({ showTides: active });
        break;
    }
  };

  if (!isOpen) return null;

  const handleSearchTimeCity = async (q: string) => {
    setTimeCitySearch(q);
    setIsSearchingTime(true);
    const res = await searchCities(q);
    setSearchResultsTime(res);
    setIsSearchingTime(false);
  };

  const handleSearchWeatherCity = async (q: string) => {
    setWeatherCitySearch(q);
    setIsSearchingWeather(true);
    const res = await searchCities(q);
    setSearchResultsWeather(res);
    setIsSearchingWeather(false);
  };

  const themes: { id: ThemeMode; name: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'eink', name: 'Kindle 电子墨水屏 (高对比白底)', desc: '极简黑白，无动画，防残影，Kindle 首选', icon: <Smartphone className="w-5 h-5" /> },
    { id: 'eink-inverted', name: 'Kindle 反色 (黑底白字)', desc: '适合 Kindle 夜间阅读或低光环境', icon: <Moon className="w-5 h-5" /> },
    { id: 'sepia', name: '暖阳复古 (暖色护眼纸张)', desc: '柔和暖护眼底色，桌面摆件推荐', icon: <Sun className="w-5 h-5" /> },
    { id: 'parchment', name: '羊皮纸古风 (古典典雅)', desc: '淡黄质感羊皮纸底色与深赭字迹，静谧典雅', icon: <BookOpen className="w-5 h-5 text-amber-700" /> },
    { id: 'dark', name: 'OLED 纯黑 (深色夜间)', desc: '纯黑背景，省电防灼屏，适合 iPad/PC', icon: <Tv className="w-5 h-5" /> },
    { id: 'light', name: '现代极简 (亮色通用)', desc: '通透白净，适合电脑桌面全屏待机', icon: <Sun className="w-5 h-5" /> },
  ];

  const layouts: { id: AppSettings['layoutPreset']; name: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'auto', name: '智能自适应 (自动辨识屏型)', desc: '横屏自动双栏分屏，竖屏自动单栏垂直排列', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'four-grid', name: '四方格均衡屏 (2×2 一屏全览)', desc: '左上时间 / 左下农历与名言 / 右上天气 / 右下预报，均衡无溢出', icon: <LayoutGrid className="w-5 h-5 text-emerald-500" /> },
    { id: 'time-focus', name: '巨型时间 Focus (床头/Kindle极简)', desc: '居中超大时间，农历与天气收纳为底部微型标签', icon: <Clock className="w-5 h-5" /> },
    { id: 'split-dash', name: '左右双栏 Dashboard (大屏精细)', desc: '左侧时间与农历宜忌 + 右侧完整天气预报', icon: <Sliders className="w-5 h-5" /> },
    { id: 'minimal-dock', name: '底栏极简 Dock (精致摆件)', desc: '顶部清爽时间，底部横向整齐 Dock 收纳栏', icon: <Tv className="w-5 h-5" /> },
    { id: 'vertical-stand', name: '竖屏桌面支架 (手机/平板竖放)', desc: '针对纵向屏幕最佳阅读比例设计的垂直堆叠', icon: <Smartphone className="w-5 h-5" /> },
  ];

  const resolutions: { id: AppSettings['resolutionPreset']; name: string; desc: string; tag: string; icon: React.ReactNode }[] = [
    { id: 'voyage', name: 'Kindle Voyage (默认主力)', desc: '1440×1080 300PPI 6寸墨水屏，高对比黑白防揉影排版', tag: '300PPI', icon: <Smartphone className="w-5 h-5 text-emerald-500" /> },
    { id: 'iphone-15-promax', name: 'iPhone 15 Pro Max', desc: '2796×1290 6.7寸 灵动岛长屏，针对纵向屏幕字号缩放', tag: '6.7寸', icon: <Smartphone className="w-5 h-5 text-sky-500" /> },
    { id: 'mate-xt', name: '华为 Mate XT 三折叠', desc: '3184×2232 10.2寸展开大屏，宽幅多栏平铺展示', tag: '10.2寸', icon: <Maximize2 className="w-5 h-5 text-rose-500" /> },
    { id: 'auto', name: '智能自适应', desc: '实时感知窗口及屏高尺寸，自动平滑响应', tag: 'AUTO', icon: <Sparkles className="w-5 h-5 text-amber-500" /> },
    { id: '1k', name: '1K / 1080P 显示器', desc: '适配通用 1080P 桌面显示屏与底座', tag: '1080P', icon: <Monitor className="w-5 h-5 text-zinc-500" /> },
    { id: '2k', name: '2K / 1440P 高清屏', desc: '适配 iPad Pro、2K 桌面显示屏，等比扩大元素', tag: '1440P', icon: <Maximize2 className="w-5 h-5 text-indigo-500" /> },
    { id: '3k', name: '3K 超清屏', desc: '适配 3K MacBook Pro / 高清电子画框', tag: '3K', icon: <Tv className="w-5 h-5 text-purple-500" /> },
    { id: '4k', name: '4K / 2160P 巨幕屏', desc: '适配 4K 客厅电视及 4K 大型墨水屏', tag: '4K', icon: <Sparkles className="w-5 h-5 text-rose-500" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Sliders className="w-5 h-5 text-emerald-500" />
            <span>待机面板偏好设置</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-4 pt-2 gap-2 text-sm font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('theme')}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 transition whitespace-nowrap ${
              activeTab === 'theme'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            显示与主题
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'modules'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>模块顺序与显示</span>
          </button>
          <button
            onClick={() => setActiveTab('city')}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 transition whitespace-nowrap ${
              activeTab === 'city'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            城市与时区
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 transition whitespace-nowrap ${
              activeTab === 'weather'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            天气多源 (5s切源)
          </button>
          <button
            onClick={() => setActiveTab('kindle')}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 transition whitespace-nowrap ${
              activeTab === 'kindle'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-white dark:bg-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Kindle 专享优化
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* TAB 1: DISPLAY & THEME */}
          {activeTab === 'theme' && (
            <div className="space-y-5">
              <div>
                <label className="font-bold text-base block mb-2">切换预设配色主题</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onUpdateSettings({ theme: t.id })}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                        settings.theme === t.id
                          ? 'border-emerald-500 bg-emerald-500/10 font-medium'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0">
                        {t.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold flex items-center justify-between">
                          <span>{t.name}</span>
                          {settings.theme === t.id && <Check className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Layout Presets Selection */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <label className="font-bold text-base block mb-2">切换布局设计结构</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {layouts.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => onUpdateSettings({ layoutPreset: l.id })}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                        settings.layoutPreset === l.id
                          ? 'border-emerald-500 bg-emerald-500/10 font-medium'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0">
                        {l.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold flex items-center justify-between">
                          <span>{l.name}</span>
                          {settings.layoutPreset === l.id && <Check className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{l.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution & Display Mode Selection */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-base block">分辨率屏型适配模式</label>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    当前: {
                      settings.resolutionPreset === 'voyage' ? 'Kindle Voyage' :
                      settings.resolutionPreset === 'iphone-15-promax' ? 'iPhone 15 Pro Max' :
                      settings.resolutionPreset === 'mate-xt' ? '华为 Mate XT' :
                      settings.resolutionPreset === 'auto' ? '智能自适应' :
                      settings.resolutionPreset.toUpperCase()
                    }
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {resolutions.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => onUpdateSettings({ resolutionPreset: r.id })}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition ${
                        settings.resolutionPreset === r.id
                          ? 'border-emerald-500 bg-emerald-500/10 font-medium'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0">
                        {r.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span>{r.name}</span>
                          </span>
                          {settings.resolutionPreset === r.id && <Check className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{r.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Scaling */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold">时间字体缩放倍率</label>
                  <span className="font-mono text-emerald-500 font-bold">
                    {Math.round(settings.fontSizeScale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.4"
                  step="0.05"
                  value={settings.fontSizeScale}
                  onChange={(e) => onUpdateSettings({ fontSizeScale: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500"
                />
              </div>

              {/* Display Options */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <label className="font-bold block">显示内容开关</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer">
                    <span>显示秒数</span>
                    <input
                      type="checkbox"
                      checked={settings.showSeconds}
                      onChange={(e) => onUpdateSettings({ showSeconds: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer">
                    <span>24 小时制</span>
                    <input
                      type="checkbox"
                      checked={settings.use24Hour}
                      onChange={(e) => onUpdateSettings({ use24Hour: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer">
                    <span>显示中国农历信息</span>
                    <input
                      type="checkbox"
                      checked={settings.showLunar}
                      onChange={(e) => onUpdateSettings({ showLunar: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer">
                    <span>显示农历【宜 / 忌】</span>
                    <input
                      type="checkbox"
                      checked={settings.showYiJi}
                      onChange={(e) => onUpdateSettings({ showYiJi: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer">
                    <span>显示二十四节气及倒计时</span>
                    <input
                      type="checkbox"
                      checked={settings.showSolarTerms}
                      onChange={(e) => onUpdateSettings({ showSolarTerms: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer">
                    <span>显示下个法定假期倒计时</span>
                    <input
                      type="checkbox"
                      checked={settings.showNextHoliday}
                      onChange={(e) => onUpdateSettings({ showNextHoliday: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer">
                    <span>显示【历史上的今天】</span>
                    <input
                      type="checkbox"
                      checked={settings.showHistoryToday}
                      onChange={(e) => onUpdateSettings({ showHistoryToday: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-amber-500/40 bg-amber-500/5 cursor-pointer font-bold">
                    <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                      <Newspaper className="w-4 h-4" />
                      <span>显示【今日头条 (国内外混合源)】</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.showNewsHeadlines}
                      onChange={(e) => onUpdateSettings({ showNewsHeadlines: e.target.checked })}
                      className="w-4 h-4 accent-amber-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-cyan-500/40 bg-cyan-500/5 cursor-pointer font-bold">
                    <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                      <Waves className="w-4 h-4" />
                      <span>显示【潮汐潮落与高低潮位】 (默认关)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.showTides}
                      onChange={(e) => onUpdateSettings({ showTides: e.target.checked })}
                      className="w-4 h-4 accent-cyan-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-amber-500/40 bg-amber-500/5 cursor-pointer font-bold">
                    <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                      <Sun className="w-4 h-4" />
                      <span>显示【太阳轨迹与日出日落】 (默认关)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.showSunTrack}
                      onChange={(e) => onUpdateSettings({ showSunTrack: e.target.checked })}
                      className="w-4 h-4 accent-amber-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-sky-500/40 bg-sky-500/5 cursor-pointer font-bold">
                    <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                      <Moon className="w-4 h-4" />
                      <span>显示【月相天象与亮面比例】 (默认关)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.showMoonPhase}
                      onChange={(e) => onUpdateSettings({ showMoonPhase: e.target.checked })}
                      className="w-4 h-4 accent-sky-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5 cursor-pointer font-bold sm:col-span-2">
                    <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <QuoteIcon className="w-4 h-4" />
                      <span>在时间下方显示名人名言 / 每日一言</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={settings.showQuote}
                      onChange={(e) => onUpdateSettings({ showQuote: e.target.checked })}
                      className="w-4 h-4 accent-emerald-500"
                    />
                  </label>
                </div>
              </div>

              {/* Control Bar Position Option */}
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold flex items-center gap-2">
                    <PanelTop className="w-4 h-4 text-emerald-500" />
                    <span>设置控制栏位置与显隐方式</span>
                  </label>
                  <span className="text-xs text-zinc-500">不挡大屏，极简床头屏首选</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'collapsible', name: '悬浮折叠隐形 (推荐)', desc: '平时收起为微型图标，悬停或点击展开，无死角全屏' },
                    { id: 'bottom', name: '底部统一固定 Dock 栏', desc: '整齐收纳在屏幕最底部，不遮挡主时间与天气' },
                    { id: 'top', name: '顶部平铺展开', desc: '传统顶部横栏显示所有设备与控制按钮' },
                  ].map((pos) => (
                    <button
                      key={pos.id}
                      onClick={() => onUpdateSettings({ controlBarPosition: pos.id as any })}
                      className={`p-3 rounded-xl border text-left transition ${
                        settings.controlBarPosition === pos.id
                          ? 'border-emerald-500 bg-emerald-500/10 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{pos.name}</span>
                        {settings.controlBarPosition === pos.id && <Check className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{pos.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quotes Options Detail */}
              {settings.showQuote && (
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-bold flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-500" />
                      <span>名言开源数据源设置</span>
                    </label>
                    <span className="text-xs text-zinc-500">自动离线备用，全网跨域兼容</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: 'all', name: '全源随机交替 (推荐)', desc: '融合 一言/古诗词/世界名言/离线精选' },
                      { id: 'hitokoto', name: 'Hitokoto 一言 API', desc: '动漫、哲学、现代诗歌名句' },
                      { id: 'shici', name: '今日诗词 API', desc: '中国古代经典名句与诗词歌赋' },
                      { id: 'quotable', name: 'Quotable 世界名言', desc: '英文哲理名言与思想家金句' },
                      { id: 'local', name: '离线精选名言库', desc: '无需网络， Kind1e 离线待机首选' },
                    ].map((qs) => (
                      <button
                        key={qs.id}
                        onClick={() => onUpdateSettings({ quoteSource: qs.id as any })}
                        className={`p-3 rounded-xl border text-left transition ${
                          settings.quoteSource === qs.id
                            ? 'border-emerald-500 bg-emerald-500/10 font-bold'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{qs.name}</span>
                          {settings.quoteSource === qs.id && <Check className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{qs.desc}</p>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400">名言定时自动轮播切换频率：</label>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { min: 0, label: '手动点击' },
                        { min: 1, label: '每 1 分钟' },
                        { min: 5, label: '每 5 分钟' },
                        { min: 15, label: '每 15 分钟' },
                        { min: 30, label: '每 30 分钟' },
                      ].map((item) => (
                        <button
                          key={item.min}
                          onClick={() => onUpdateSettings({ quoteRefreshInterval: item.min })}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                            settings.quoteRefreshInterval === item.min
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MODULE ORDER & VISIBILITY */}
          {activeTab === 'modules' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
                <div>
                  <h4 className="font-bold text-base flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <ListOrdered className="w-5 h-5" />
                    <span>自定义模块显隐与自由排序</span>
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    点击【▲/▼】微调模块上下顺位，主界面布局与竖屏单栏均将按照您设定的全局顺位呈现。
                  </p>
                </div>
                <button
                  onClick={handleResetModuleOrder}
                  className="px-3 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>恢复默认顺序</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {currentModuleOrder.map((id, idx) => {
                  const isActive = getModuleActiveState(id);
                  const toggleable = isModuleToggleable(id);

                  return (
                    <div
                      key={id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                        isActive
                          ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 shadow-xs'
                          : 'border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-100/40 dark:bg-zinc-900/30 opacity-60'
                      }`}
                    >
                      {/* Left: Rank badge & Module name */}
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="flex items-center gap-2 font-bold text-sm">
                          <span>{MODULE_NAMES[id] || id}</span>
                          {!toggleable && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                              核心常亮
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Toggle & Ordering Controls */}
                      <div className="flex items-center gap-3">
                        {/* Toggle switch for optional modules */}
                        {toggleable ? (
                          <label className="flex items-center gap-1.5 cursor-pointer select-none">
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
                              {isActive ? '已启用' : '已关闭'}
                            </span>
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={(e) => toggleModuleActiveState(id, e.target.checked)}
                              className="w-4 h-4 accent-emerald-500"
                            />
                          </label>
                        ) : (
                          <span className="text-xs text-zinc-400 dark:text-zinc-500">常亮显示</span>
                        )}

                        {/* Up & Down buttons */}
                        <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-800 pl-3">
                          <button
                            onClick={() => handleMoveModule(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
                            title="向上移动"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveModule(idx, 'down')}
                            disabled={idx === currentModuleOrder.length - 1}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
                            title="向下移动"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CITIES & TIMEZONE */}
          {activeTab === 'city' && (
            <div className="space-y-6">
              {/* Sync Cities Switch */}
              <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
                <div>
                  <div className="font-bold">同步时间城市与天气城市</div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    开启后，选择时间城市将同时作为天气观测城市
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.syncCities}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    onUpdateSettings({
                      syncCities: checked,
                      ...(checked ? { weatherCity: settings.timeCity } : {}),
                    });
                  }}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Time City Config */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <span>时间所属城市 (当前: {settings.timeCity.name})</span>
                  </label>
                  <span className="text-xs font-mono opacity-70">{settings.timeCity.timezone}</span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 opacity-50" />
                  <input
                    type="text"
                    placeholder="搜索时间城市 (如: 伦敦, 东京, 纽约, 深圳)..."
                    value={timeCitySearch}
                    onChange={(e) => handleSearchTimeCity(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-hidden focus:border-emerald-500"
                  />
                  {isSearchingTime && (
                    <RotateCw className="w-4 h-4 absolute right-3 top-3 animate-spin text-emerald-500" />
                  )}
                </div>

                {/* City Chips */}
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                  {searchResultsTime.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onUpdateSettings({
                          timeCity: c,
                          ...(settings.syncCities ? { weatherCity: c } : {}),
                        });
                      }}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition ${
                        settings.timeCity.name === c.name
                          ? 'border-emerald-500 bg-emerald-500 text-white font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                      }`}
                    >
                      <MapPin className="w-3 h-3" />
                      <span>{c.name}</span>
                      <span className="opacity-70 text-[10px]">({c.country})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather City Config (if not synced) */}
              {!settings.syncCities && (
                <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <label className="font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>天气观测城市 (当前: {settings.weatherCity.name})</span>
                    </label>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 opacity-50" />
                    <input
                      type="text"
                      placeholder="独立搜索天气城市..."
                      value={weatherCitySearch}
                      onChange={(e) => handleSearchWeatherCity(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-hidden focus:border-amber-500"
                    />
                    {isSearchingWeather && (
                      <RotateCw className="w-4 h-4 absolute right-3 top-3 animate-spin text-amber-500" />
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                    {searchResultsWeather.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => onUpdateSettings({ weatherCity: c })}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1 transition ${
                          settings.weatherCity.name === c.name
                            ? 'border-amber-500 bg-amber-500 text-white font-bold'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                        }`}
                      >
                        <MapPin className="w-3 h-3" />
                        <span>{c.name}</span>
                        <span className="opacity-70 text-[10px]">({c.country})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WEATHER SOURCES & 5s FAILOVER */}
          {activeTab === 'weather' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  <Shield className="w-5 h-5" />
                  <span>5 秒超时多源自动切源机制已激活</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  系统默认会优先尝试主源，如果在 <strong>5 秒内</strong> 无响应或网络失败，将无缝自动切换到备用开源天气节点（如 wttr.in），保障 Kindle / 桌面待机面板无缝运行。
                </p>
              </div>

              {/* Source List & Status Monitor */}
              <div className="space-y-3">
                <label className="font-bold block">天气数据源实时监控</label>
                {WEATHER_SOURCES.map((s) => {
                  const statusInfo = sourcesStatus[s.id];
                  return (
                    <div
                      key={s.id}
                      className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          <span>{s.name}</span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{s.description}</p>
                        {statusInfo?.msg && (
                          <div className="text-[11px] font-mono mt-1 text-emerald-600 dark:text-emerald-400">
                            状态: {statusInfo.msg}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border bg-zinc-100 dark:bg-zinc-800">
                        {statusInfo?.status === 'success' ? (
                          <span className="text-emerald-500">在线 (已可用)</span>
                        ) : statusInfo?.status === 'trying' ? (
                          <span className="text-amber-500 animate-pulse">请求中...</span>
                        ) : statusInfo?.status === 'failed' ? (
                          <span className="text-rose-500">连接超时</span>
                        ) : (
                          <span>待命备用</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Refresh Interval */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <label className="font-bold block mb-2">定时自动刷新天气</label>
                <div className="grid grid-cols-3 gap-2">
                  {[15, 30, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => onUpdateSettings({ weatherRefreshMinutes: mins })}
                      className={`py-2 rounded-xl border font-bold text-xs ${
                        settings.weatherRefreshMinutes === mins
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-zinc-200 dark:border-zinc-800'
                      }`}
                    >
                      每 {mins} 分钟
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={onManualRefreshWeather}
                className="w-full py-3 rounded-xl border border-emerald-500 font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2 hover:bg-emerald-500/10 transition"
              >
                <RotateCw className="w-4 h-4" /> 立即手动触发多源天气检测与刷新
              </button>
            </div>
          )}

          {/* TAB 4: KINDLE OPTIMIZATIONS */}
          {activeTab === 'kindle' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="font-bold flex items-center gap-2 text-base">
                  <Smartphone className="w-5 h-5 text-emerald-500" />
                  <span>Kindle 电子墨水屏防残影刷屏</span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  墨水屏长时间显示静态图像可能会留下“鬼影”。此功能会自动黑白闪烁 1 秒以彻底清屏。
                </p>

                <div className="flex items-center justify-between pt-2">
                  <span className="font-bold text-xs">自动清屏刷屏间隔:</span>
                  <select
                    value={settings.autoKindleRefreshMinutes}
                    onChange={(e) =>
                      onUpdateSettings({ autoKindleRefreshMinutes: parseInt(e.target.value, 10) })
                    }
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent font-medium text-xs"
                  >
                    <option value={0}>禁用自动刷屏</option>
                    <option value={15}>每 15 分钟闪烁刷屏</option>
                    <option value={30}>每 30 分钟闪烁刷屏</option>
                    <option value={60}>每 60 分钟闪烁刷屏</option>
                  </select>
                </div>

                <button
                  onClick={onTriggerKindleFlash}
                  className="w-full py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-xs flex items-center justify-center gap-2 mt-2"
                >
                  <Sparkles className="w-4 h-4" /> 立即触发 1 秒强制黑白刷新 (消除鬼影)
                </button>
              </div>

              {/* OLED Burn-in */}
              <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                <div className="font-bold text-sm">OLED / PC 屏幕防灼屏微漂移</div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  每隔 10 分钟平滑微调 2 像素位置，防止电脑/iPad/OLED屏幕发光点老化。
                </p>
                <label className="flex items-center gap-2 pt-1 font-bold text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.burnInProtection}
                    onChange={(e) => onUpdateSettings({ burnInProtection: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500"
                  />
                  <span>启用防灼屏位移保护</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (window.confirm('是否确定一键恢复所有面板设置、城市与模块排序至初始默认状态？')) {
                onResetAllSettings?.();
              }
            }}
            className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>恢复全局默认设置</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition"
          >
            完成并保存
          </button>
        </div>
      </div>
    </div>
  );
};
