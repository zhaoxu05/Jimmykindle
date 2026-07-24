export type ThemeMode = 'eink' | 'eink-inverted' | 'dark' | 'sepia' | 'light';

export type LayoutPreset = 'auto' | 'four-grid' | 'time-focus' | 'split-dash' | 'minimal-dock' | 'vertical-stand';

export type ResolutionPreset = 'voyage' | 'iphone-15-promax' | 'mate-xt' | 'auto' | '1k' | '2k' | '3k' | '4k';

export type ScreenOrientation = 'landscape' | 'portrait';

export interface City {
  id: string;
  name: string; // e.g. "北京" or "Beijing"
  country: string; // e.g. "中国"
  lat: number;
  lng: number;
  timezone: string; // e.g. "Asia/Shanghai"
  admin1?: string; // e.g. "北京市"
}

export interface WeatherCondition {
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  code: number;
  text: string;
  iconName: string;
}

export interface ForecastDay {
  date: string;
  dayOfWeek: string;
  tempMax: number;
  tempMin: number;
  text: string;
  code: number;
}

export interface WeatherData {
  city: City;
  current: WeatherCondition;
  forecast: ForecastDay[];
  sourceName: string;
  sourceId: string;
  fetchedAt: Date;
  latencyMs: number;
}

export interface WeatherSourceConfig {
  id: string;
  name: string;
  endpoint: string;
  description: string;
  status: 'active' | 'trying' | 'failed' | 'idle';
  lastError?: string;
}

export interface HistoryEvent {
  year: string;
  title: string;
  description?: string;
  link?: string;
}

export interface LunarInfo {
  lunarYear: string; // 丙午年
  zodiac: string; // 马
  lunarMonth: string; // 六月
  lunarDay: string; // 初十
  lunarMonthDay: string; // 六月初十
  solarTerm: string | null; // 大暑
  nextSolarTerm: { name: string; dateStr: string; daysLeft: number } | null;
  nextHoliday: { name: string; dateStr: string; daysLeft: number } | null;
  festivals: string[]; // 中秋节, 教师节 etc
  yi: string[]; // 宜
  ji: string[]; // 忌
  weekDayCN: string; // 星期五
  gregorianStr: string; // 2026年7月24日
}

export interface AppSettings {
  // Theme & Appearance
  theme: ThemeMode;
  layoutPreset: LayoutPreset;
  resolutionPreset: ResolutionPreset;
  fontSizeScale: number; // 0.8 ~ 1.4
  showSeconds: boolean;
  use24Hour: boolean;
  einkHighContrast: boolean;
  noAnimations: boolean;
  
  // Cities
  timeCity: City;
  weatherCity: City;
  syncCities: boolean; // if true, timeCity and weatherCity stay equal

  // Lunar, News & Holiday
  showLunar: boolean;
  showYiJi: boolean;
  showSolarTerms: boolean;
  showNextHoliday: boolean;
  showHistoryToday: boolean;
  showNewsHeadlines: boolean;

  // Header & Controls
  controlBarPosition: 'collapsible' | 'bottom' | 'top';

  // Weather
  weatherRefreshMinutes: number; // e.g. 15, 30, 60
  autoSwitchSource: boolean; // 5s failover
  preferredSourceId: string; // 'auto' or specific source ID

  // Quote / Motto Settings
  showQuote: boolean;
  quoteSource: 'all' | 'hitokoto' | 'shici' | 'quotable' | 'local';
  quoteRefreshInterval: number; // 0 = manual, 1, 5, 15, 30 min

  // Standby & Kindle features
  autoKindleRefreshMinutes: number; // 0 = disabled, 15, 30, 60 min screen inversion to clear eink ghosting
  burnInProtection: boolean; // subtle pixel drift for OLED/PC
}
