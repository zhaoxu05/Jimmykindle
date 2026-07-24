import React, { useState } from 'react';
import { AppSettings, City, ThemeMode } from '../types';
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
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onManualRefreshWeather: () => void;
  sourcesStatus: Record<string, { status: string; msg?: string }>;
  onTriggerKindleFlash: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onManualRefreshWeather,
  sourcesStatus,
  onTriggerKindleFlash,
}) => {
  const [activeTab, setActiveTab] = useState<'theme' | 'city' | 'weather' | 'kindle'>('theme');
  const [timeCitySearch, setTimeCitySearch] = useState('');
  const [weatherCitySearch, setWeatherCitySearch] = useState('');
  const [searchResultsTime, setSearchResultsTime] = useState<City[]>(DEFAULT_CITIES);
  const [searchResultsWeather, setSearchResultsWeather] = useState<City[]>(DEFAULT_CITIES);
  const [isSearchingTime, setIsSearchingTime] = useState(false);
  const [isSearchingWeather, setIsSearchingWeather] = useState(false);

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
    { id: 'sepia', name: '暖阳复古 (暖色纸张)', desc: '柔和暖护眼底色，桌面摆件推荐', icon: <Sun className="w-5 h-5" /> },
    { id: 'dark', name: 'OLED 纯黑 (深色夜间)', desc: '纯黑背景，省电防灼屏，适合 iPad/PC', icon: <Tv className="w-5 h-5" /> },
    { id: 'light', name: '现代极简 (亮色通用)', desc: '通透白净，适合电脑桌面全屏待机', icon: <Sun className="w-5 h-5" /> },
  ];

  const layouts: { id: AppSettings['layoutPreset']; name: string; desc: string; icon: React.ReactNode }[] = [
    { id: 'auto', name: '智能自适应 (自动辨识屏型)', desc: '横屏自动双栏分屏，竖屏自动单栏垂直排列', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'time-focus', name: '巨型时间 Focus (床头/Kindle极简)', desc: '居中超大时间，农历与天气收纳为底部微型标签', icon: <Clock className="w-5 h-5" /> },
    { id: 'split-dash', name: '左右分屏 Dashboard (工作台大屏)', desc: '左侧大时钟 + 右侧完整农历宜忌与5日天气卡片', icon: <Sliders className="w-5 h-5" /> },
    { id: 'minimal-dock', name: '底栏极简 Dock (精致摆件)', desc: '顶部清爽时间，底部横向整齐 Dock 收纳栏', icon: <Tv className="w-5 h-5" /> },
    { id: 'vertical-stand', name: '竖屏桌面支架 (手机/平板竖放)', desc: '针对纵向屏幕最佳阅读比例设计的垂直堆叠', icon: <Smartphone className="w-5 h-5" /> },
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
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CITIES & TIMEZONE */}
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
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
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
