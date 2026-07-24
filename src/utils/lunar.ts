import { Solar } from 'lunar-javascript';
import { LunarInfo } from '../types';

export function getLunarInfo(date: Date = new Date()): LunarInfo {
  try {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();

    // Year in GanZhi & Zodiac
    const lunarYear = `${lunar.getYearInGanZhiByLiChun()}年`;
    const zodiac = lunar.getYearShengXiaoByLiChun();

    // Month & Day
    const lunarMonth = `${lunar.getMonthInChinese()}月`;
    const lunarDay = lunar.getDayInChinese();
    const lunarMonthDay = `${lunarMonth}${lunarDay}`;

    // Current Solar Term (JieQi)
    const jieQi = lunar.getJieQi();
    const solarTerm = jieQi || null;

    // Next Solar Term calculation
    let nextSolarTermInfo: { name: string; dateStr: string; daysLeft: number } | null = null;
    try {
      const jieQiTable = lunar.getJieQiTable();
      const nowTs = date.getTime();
      let smallestDiffMs = Infinity;
      let nextName = '';
      let nextDateStr = '';

      if (jieQiTable) {
        const keys = Object.keys(jieQiTable);
        for (const name of keys) {
          const termSolar = jieQiTable[name];
          if (termSolar) {
            const termDate = new Date(
              termSolar.getYear(),
              termSolar.getMonth() - 1,
              termSolar.getDay(),
              termSolar.getHour(),
              termSolar.getMinute()
            );
            const diffMs = termDate.getTime() - nowTs;
            if (diffMs > 0 && diffMs < smallestDiffMs) {
              smallestDiffMs = diffMs;
              nextName = name;
              nextDateStr = `${termSolar.getMonth()}月${termSolar.getDay()}日`;
            }
          }
        }
      }

      if (nextName && smallestDiffMs !== Infinity) {
        const daysLeft = Math.ceil(smallestDiffMs / (1000 * 60 * 60 * 24));
        nextSolarTermInfo = { name: nextName, dateStr: nextDateStr, daysLeft };
      }
    } catch {
      // Fallback
    }

    // Next Statutory / Traditional Major Holiday calculation
    let nextHolidayInfo: { name: string; dateStr: string; daysLeft: number } | null = null;
    try {
      const todayYear = date.getFullYear();
      const todayTs = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

      // Check upcoming 365 days to find nearest major holiday
      let minHolidayDiffMs = Infinity;
      let foundHolidayName = '';
      let foundHolidayDateStr = '';

      for (let i = 1; i <= 365; i++) {
        const checkDate = new Date(todayTs + i * 24 * 60 * 60 * 1000);
        const checkSolar = Solar.fromDate(checkDate);
        const checkLunar = checkSolar.getLunar();

        const lunarFestivals = checkLunar.getFestivals() || [];
        const solarFestivals = checkSolar.getFestivals() || [];

        // Core Chinese statutory holidays
        let matchedName = '';
        if (checkSolar.getMonth() === 1 && checkSolar.getDay() === 1) matchedName = '元旦';
        else if (checkLunar.getMonth() === 1 && checkLunar.getDay() === 1) matchedName = '春节';
        else if (checkLunar.getJieQi() === '清明') matchedName = '清明节';
        else if (checkSolar.getMonth() === 5 && checkSolar.getDay() === 1) matchedName = '劳动节';
        else if (checkLunar.getMonth() === 5 && checkLunar.getDay() === 5) matchedName = '端午节';
        else if (checkLunar.getMonth() === 8 && checkLunar.getDay() === 15) matchedName = '中秋节';
        else if (checkSolar.getMonth() === 10 && checkSolar.getDay() === 1) matchedName = '国庆节';
        else if (lunarFestivals.includes('除夕')) matchedName = '除夕';

        if (matchedName) {
          const diffMs = checkDate.getTime() - todayTs;
          if (diffMs < minHolidayDiffMs) {
            minHolidayDiffMs = diffMs;
            foundHolidayName = matchedName;
            foundHolidayDateStr = `${checkSolar.getMonth()}月${checkSolar.getDay()}日`;
            break; // found nearest
          }
        }
      }

      if (foundHolidayName && minHolidayDiffMs !== Infinity) {
        const daysLeft = Math.ceil(minHolidayDiffMs / (1000 * 60 * 60 * 24));
        nextHolidayInfo = { name: foundHolidayName, dateStr: foundHolidayDateStr, daysLeft };
      }
    } catch {
      // Fallback
    }

    // Festivals
    const lunarFestivals = lunar.getFestivals() || [];
    const solarFestivals = solar.getFestivals() || [];
    const festivals = Array.from(new Set([...lunarFestivals, ...solarFestivals]));

    // Yi / Ji
    let yi: string[] = [];
    let ji: string[] = [];
    try {
      yi = lunar.getDayYi() || [];
      ji = lunar.getDayJi() || [];
    } catch {
      yi = ['平治道涂', '祭祀'];
      ji = ['诸事不宜'];
    }

    // Weekday
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekDayCN = weekDays[date.getDay()];

    // Gregorian string
    const gregorianStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;

    return {
      lunarYear,
      zodiac,
      lunarMonth,
      lunarDay,
      lunarMonthDay,
      solarTerm,
      nextSolarTerm: nextSolarTermInfo,
      nextHoliday: nextHolidayInfo,
      festivals,
      yi: yi.slice(0, 6),
      ji: ji.slice(0, 6),
      weekDayCN,
      gregorianStr,
    };
  } catch (err) {
    console.error('Failed to compute lunar info:', err);
    // Safe fallback
    return {
      lunarYear: '农历',
      zodiac: '马',
      lunarMonth: '',
      lunarDay: '',
      lunarMonthDay: '农历日期',
      solarTerm: null,
      nextSolarTerm: null,
      nextHoliday: null,
      festivals: [],
      yi: ['安居', '祈福'],
      ji: ['动土'],
      weekDayCN: '星期五',
      gregorianStr: `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`,
    };
  }
}
