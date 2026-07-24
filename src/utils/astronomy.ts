import { Solar } from 'lunar-javascript';

export interface SunTrackData {
  sunriseStr: string;
  sunsetStr: string;
  solarNoonStr: string;
  dayLengthStr: string;
  currentElevationAngle: number; // in degrees
  progress: number; // 0.0 at sunrise, 0.5 at noon, 1.0 at sunset, -1 if night
  sunState: string; // '夜间' | '日出升起' | '日落黄昏' | '正午高悬' | '白昼'
  isDaytime: boolean;
}

export interface MoonPhaseData {
  lunarDayNum: number;
  moonAge: number; // e.g. 9.5 天
  phaseName: string; // e.g. "上弦月"
  phaseDesc: string; // e.g. "月面右半侧明亮，于傍晚高悬"
  illumination: number; // 0 - 100%
  isWaxing: boolean; // 渐盈 vs 渐亏
  daysToFullMoon: number; // 距离满月还有多少天
  daysToNewMoon: number; // 距离新月还有多少天
  svgPhaseRatio: number; // -1 (new) to 0 (quarter) to +1 (full) for SVG rendering
}

export interface TideEvent {
  timeStr: string;
  type: 'high' | 'low';
  heightCm: number;
  label: string;
}

export interface TideData {
  tideType: string; // '大潮' | '中潮' | '小潮'
  tideDesc: string; // e.g. "农历初十 · 潮流充沛"
  currentHeightCm: number;
  currentTrend: 'rising' | 'falling';
  trendDesc: string;
  nextPeakLabel: string;
  nextPeakMinutesLeft: number;
  todayEvents: TideEvent[];
  hourlyCurve: { hour: number; heightCm: number }[]; // 0-23 hours for rendering tidal wave line
}

/**
 * Calculate Sun Track information for a given date and location
 */
export function getSunTrackData(date: Date = new Date(), lat: number = 39.9, lng: number = 116.4): SunTrackData {
  try {
    const dayOfYear = getDayOfYear(date);
    const timezoneOffset = -date.getTimezoneOffset() / 60; // hours from UTC

    // Fractional year in radians
    const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (date.getHours() - 12) / 24);

    // Equation of Time (EoT) in minutes
    const eot = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));

    // Solar Declination in radians
    const decl = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma) - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);

    const latRad = (lat * Math.PI) / 180;

    // Hour angle at sunrise/sunset
    const cosH0 = (Math.cos((90.833 * Math.PI) / 180) - Math.sin(latRad) * Math.sin(decl)) / (Math.cos(latRad) * Math.cos(decl));

    let h0 = Math.PI / 2;
    if (cosH0 >= 1) {
      h0 = 0; // Polar night
    } else if (cosH0 <= -1) {
      h0 = Math.PI; // Polar day
    } else {
      h0 = Math.acos(cosH0);
    }

    const h0Deg = (h0 * 180) / Math.PI;

    // Solar noon in minutes from midnight local time
    const solarNoonMin = 720 - 4 * (lng - timezoneOffset * 15) - eot;

    const sunriseMin = solarNoonMin - h0Deg * 4;
    const sunsetMin = solarNoonMin + h0Deg * 4;

    const sunriseStr = minutesToTimeString(sunriseMin);
    const sunsetStr = minutesToTimeString(sunsetMin);
    const solarNoonStr = minutesToTimeString(solarNoonMin);

    const dayLengthMin = Math.max(0, sunsetMin - sunriseMin);
    const dayHours = Math.floor(dayLengthMin / 60);
    const dayMins = Math.round(dayLengthMin % 60);
    const dayLengthStr = `${dayHours}小时${dayMins}分`;

    const currentLocalMin = date.getHours() * 60 + date.getMinutes();
    const isDaytime = currentLocalMin >= sunriseMin && currentLocalMin <= sunsetMin;

    let progress = -1;
    let sunState = '夜间';

    if (isDaytime && dayLengthMin > 0) {
      progress = (currentLocalMin - sunriseMin) / dayLengthMin;
      if (progress < 0.1) sunState = '日出升起';
      else if (progress > 0.42 && progress < 0.58) sunState = '正午高悬';
      else if (progress > 0.9) sunState = '日落黄昏';
      else sunState = '白昼运行';
    }

    // Solar elevation angle calculation
    const hourAngleRad = (((currentLocalMin - solarNoonMin) / 4) * Math.PI) / 180;
    const sinAlt = Math.sin(latRad) * Math.sin(decl) + Math.cos(latRad) * Math.cos(decl) * Math.cos(hourAngleRad);
    const elevationRad = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
    const currentElevationAngle = Math.round(((elevationRad * 180) / Math.PI) * 10) / 10;

    return {
      sunriseStr,
      sunsetStr,
      solarNoonStr,
      dayLengthStr,
      currentElevationAngle,
      progress,
      sunState,
      isDaytime,
    };
  } catch {
    return {
      sunriseStr: '06:00',
      sunsetStr: '19:00',
      solarNoonStr: '12:30',
      dayLengthStr: '13小时0分',
      currentElevationAngle: 45,
      progress: 0.5,
      sunState: '白昼运行',
      isDaytime: true,
    };
  }
}

/**
 * Calculate Moon Phase information for a given date
 */
export function getMoonPhaseData(date: Date = new Date()): MoonPhaseData {
  try {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();
    const lunarDayNum = lunar.getDay(); // 1 to 30

    const moonAge = Math.max(0.1, Math.min(29.53, lunarDayNum - 0.5));

    // Illumination percentage: 0% at day 1, 100% at day 15
    const angleRad = ((lunarDayNum - 1) / 29.53) * 2 * Math.PI;
    const illumination = Math.round(((1 - Math.cos(angleRad)) / 2) * 100);

    const isWaxing = lunarDayNum <= 15;

    let phaseName = '新月';
    let phaseDesc = '月球背向地球，夜空幽暗';

    if (lunarDayNum === 1 || lunarDayNum === 30) {
      phaseName = '朔月 / 新月';
      phaseDesc = '农历月始，月面几乎完全不可见';
    } else if (lunarDayNum >= 2 && lunarDayNum <= 6) {
      phaseName = '蛾眉月';
      phaseDesc = '傍晚西方天空现细窄月牙';
    } else if (lunarDayNum >= 7 && lunarDayNum <= 9) {
      phaseName = '上弦月';
      phaseDesc = '月面右半侧明亮，于傍晚高悬';
    } else if (lunarDayNum >= 10 && lunarDayNum <= 13) {
      phaseName = '盈凸月';
      phaseDesc = '大半月面明亮，夜间辉映';
    } else if (lunarDayNum >= 14 && lunarDayNum <= 16) {
      phaseName = '望月 / 满月';
      phaseDesc = '农历十五/十六，月如银盘全通透';
    } else if (lunarDayNum >= 17 && lunarDayNum <= 21) {
      phaseName = '亏凸月';
      phaseDesc = '满月后月面左侧渐亏';
    } else if (lunarDayNum >= 22 && lunarDayNum <= 24) {
      phaseName = '下弦月';
      phaseDesc = '月面左半侧明亮，于清晨高悬';
    } else if (lunarDayNum >= 25 && lunarDayNum <= 28) {
      phaseName = '残月';
      phaseDesc = '黎明前东方天空可见弯弯残月';
    } else {
      phaseName = '晦月';
      phaseDesc = '农历月末，月影潜隐';
    }

    const daysToFullMoon = (15 - lunarDayNum + 30) % 30;
    const daysToNewMoon = (30 - lunarDayNum + 30) % 30;

    // Ratio for SVG crescent rendering: -1 (new) -> 0 (half) -> 1 (full) -> 0 -> -1
    const svgPhaseRatio = Math.sin(angleRad - Math.PI / 2);

    return {
      lunarDayNum,
      moonAge,
      phaseName,
      phaseDesc,
      illumination,
      isWaxing,
      daysToFullMoon,
      daysToNewMoon,
      svgPhaseRatio,
    };
  } catch {
    return {
      lunarDayNum: 15,
      moonAge: 14.8,
      phaseName: '望月 / 满月',
      phaseDesc: '月如银盘全通透',
      illumination: 100,
      isWaxing: false,
      daysToFullMoon: 0,
      daysToNewMoon: 15,
      svgPhaseRatio: 1,
    };
  }
}

/**
 * Calculate Coastal Tides for a given date & lunar day
 */
export function getTideData(date: Date = new Date()): TideData {
  try {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();
    const D = lunar.getDay(); // 1 to 30

    // Tide type classification
    let tideType = '中潮';
    let tideDesc = `农历${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} · 潮流平稳`;

    if (D === 1 || D === 2 || D === 15 || D === 16) {
      tideType = '大潮';
      tideDesc = `农历${lunar.getDayInChinese()} · 朔望日月同辉，引潮力最大`;
    } else if (D === 7 || D === 8 || D === 22 || D === 23) {
      tideType = '小潮';
      tideDesc = `农历${lunar.getDayInChinese()} · 上下弦月，潮差达到极小`;
    }

    // Semi-diurnal tide peak calculation (~12.42 hour interval)
    // Shift base time slightly according to lunar day
    const lunarShiftMin = ((D - 1) * 50) % 720; // Lunar day shifts ~50 mins per day
    const high1Min = (180 + lunarShiftMin) % 1440;
    const low1Min = (high1Min + 372) % 1440;
    const high2Min = (high1Min + 745) % 1440;
    const low2Min = (low1Min + 745) % 1440;

    // Amplitude factor based on lunar day
    const ampFactor = tideType === '大潮' ? 1.4 : tideType === '小潮' ? 0.7 : 1.0;
    const baseHigh = Math.round(380 * ampFactor);
    const baseLow = Math.round(80 / ampFactor);

    const todayEvents: TideEvent[] = [
      { timeStr: minutesToTimeString(high1Min), type: 'high' as const, heightCm: baseHigh, label: '满潮 (高潮一)' },
      { timeStr: minutesToTimeString(low1Min), type: 'low' as const, heightCm: baseLow, label: '干潮 (低潮一)' },
      { timeStr: minutesToTimeString(high2Min), type: 'high' as const, heightCm: Math.round(baseHigh * 0.95), label: '满潮 (高潮二)' },
      { timeStr: minutesToTimeString(low2Min), type: 'low' as const, heightCm: Math.round(baseLow * 1.05), label: '干潮 (低潮二)' },
    ].sort((a, b) => timeToMinutes(a.timeStr) - timeToMinutes(b.timeStr));

    // Current local time
    const currentMin = date.getHours() * 60 + date.getMinutes();

    // Generate 24-hour curve
    const hourlyCurve: { hour: number; heightCm: number }[] = [];
    for (let h = 0; h < 24; h++) {
      const min = h * 60;
      // Double sine wave
      const wave = Math.sin((((min - high1Min) / 745) * 2 * Math.PI));
      const hCm = Math.round(baseLow + ((baseHigh - baseLow) / 2) * (1 + wave));
      hourlyCurve.push({ hour: h, heightCm: hCm });
    }

    // Current height
    const currentWave = Math.sin((((currentMin - high1Min) / 745) * 2 * Math.PI));
    const currentHeightCm = Math.round(baseLow + ((baseHigh - baseLow) / 2) * (1 + currentWave));

    // Derivative to determine rising vs falling
    const nextWave = Math.sin((((currentMin + 15 - high1Min) / 745) * 2 * Math.PI));
    const currentTrend: 'rising' | 'falling' = nextWave >= currentWave ? 'rising' : 'falling';

    // Find next peak
    let nextPeak = todayEvents.find((e) => timeToMinutes(e.timeStr) > currentMin);
    if (!nextPeak) nextPeak = todayEvents[0]; // Roll to tomorrow first peak

    let diffMin = timeToMinutes(nextPeak.timeStr) - currentMin;
    if (diffMin < 0) diffMin += 1440;

    const hoursLeft = Math.floor(diffMin / 60);
    const minsLeft = diffMin % 60;
    const timeLeftStr = hoursLeft > 0 ? `${hoursLeft}小时${minsLeft}分` : `${minsLeft}分钟`;

    const trendDesc = currentTrend === 'rising' ? `涨潮中 (距${nextPeak.label}还剩 ${timeLeftStr})` : `退潮中 (距${nextPeak.label}还剩 ${timeLeftStr})`;

    return {
      tideType,
      tideDesc,
      currentHeightCm,
      currentTrend,
      trendDesc,
      nextPeakLabel: nextPeak.label,
      nextPeakMinutesLeft: diffMin,
      todayEvents,
      hourlyCurve,
    };
  } catch {
    return {
      tideType: '中潮',
      tideDesc: '潮流稳定',
      currentHeightCm: 250,
      currentTrend: 'rising',
      trendDesc: '涨潮中',
      nextPeakLabel: '满潮',
      nextPeakMinutesLeft: 90,
      todayEvents: [
        { timeStr: '04:12', type: 'high' as const, heightCm: 360, label: '满潮一' },
        { timeStr: '10:30', type: 'low' as const, heightCm: 90, label: '干潮一' },
        { timeStr: '16:45', type: 'high' as const, heightCm: 340, label: '满潮二' },
        { timeStr: '22:50', type: 'low' as const, heightCm: 100, label: '干潮二' },
      ],
      hourlyCurve: Array.from({ length: 24 }, (_, i) => ({ hour: i, heightCm: 200 + Math.sin(i / 2) * 100 })),
    };
  }
}

// Helpers
function getDayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function minutesToTimeString(mins: number): string {
  let normalized = Math.round(mins) % 1440;
  if (normalized < 0) normalized += 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
