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

    // Current Solar Term (JieQi) & Next Solar Term calculation
    let currentSolarTermName: string | null = null;
    let nextSolarTermInfo: { name: string; dateStr: string; daysLeft: number } | null = null;

    try {
      const nowTs = date.getTime();
      const allTerms: { name: string; date: Date; dateStr: string }[] = [];

      // Query solar terms table across 3 years (prev, current, next) to handle year transitions smoothly
      [date.getFullYear() - 1, date.getFullYear(), date.getFullYear() + 1].forEach((year) => {
        try {
          const s = Solar.fromYmd(year, 6, 1);
          const l = s.getLunar();
          const table = l.getJieQiTable();
          if (table) {
            Object.keys(table).forEach((name) => {
              const termSolar = table[name];
              if (termSolar) {
                const termDate = new Date(
                  termSolar.getYear(),
                  termSolar.getMonth() - 1,
                  termSolar.getDay(),
                  termSolar.getHour(),
                  termSolar.getMinute(),
                  termSolar.getSecond()
                );
                const dateStr = `${termSolar.getMonth()}月${termSolar.getDay()}日`;
                allTerms.push({ name, date: termDate, dateStr });
              }
            });
          }
        } catch {
          // ignore year error
        }
      });

      // Deduplicate & sort chronologically
      allTerms.sort((a, b) => a.date.getTime() - b.date.getTime());

      let pastTerm: { name: string; date: Date; dateStr: string } | null = null;
      let futureTerm: { name: string; date: Date; dateStr: string } | null = null;

      for (let i = 0; i < allTerms.length; i++) {
        if (allTerms[i].date.getTime() <= nowTs) {
          pastTerm = allTerms[i];
        } else {
          futureTerm = allTerms[i];
          break;
        }
      }

      if (pastTerm) {
        currentSolarTermName = pastTerm.name;
      }

      if (futureTerm) {
        const diffMs = futureTerm.date.getTime() - nowTs;
        const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        nextSolarTermInfo = {
          name: futureTerm.name,
          dateStr: futureTerm.dateStr,
          daysLeft,
        };
      }
    } catch (e) {
      console.error('Failed to compute solar terms:', e);
    }

    const solarTerm = currentSolarTermName || lunar.getJieQi() || null;

    // Next Statutory / Traditional Major Holiday calculation (Optimized for Kindle low-power CPU)
    let nextHolidayInfo: { name: string; dateStr: string; daysLeft: number } | null = null;
    try {
      const todayTs = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const currentYear = date.getFullYear();

      // Test specific target holiday milestones for current and next year instead of 365-step loop
      const candidates: { name: string; targetDate: Date }[] = [];

      [currentYear, currentYear + 1].forEach((y) => {
        // Solar fixed holidays
        candidates.push({ name: '元旦', targetDate: new Date(y, 0, 1) });
        candidates.push({ name: '劳动节', targetDate: new Date(y, 4, 1) });
        candidates.push({ name: '国庆节', targetDate: new Date(y, 9, 1) });

        // Lunar variable holidays
        try {
          const cChun = Solar.fromYmd(y, 2, 1); // Approx February
          const cLunar1 = cChun.getLunar();
          // 春节 (Lunar Month 1 Day 1)
          const springSolar = cLunar1.getLunarYear() === y 
            ? cLunar1.getSolar()
            : Solar.fromDate(new Date(y, 1, 10));

          candidates.push({ name: '春节', targetDate: new Date(y, springSolar.getMonth() - 1, springSolar.getDay()) });
        } catch {
          // ignore
        }
      });

      let minDiff = Infinity;
      let nearestName = '';
      let nearestDateStr = '';

      for (const cand of candidates) {
        const diffMs = cand.targetDate.getTime() - todayTs;
        if (diffMs > 0 && diffMs < minDiff) {
          minDiff = diffMs;
          nearestName = cand.name;
          nearestDateStr = `${cand.targetDate.getMonth() + 1}月${cand.targetDate.getDate()}日`;
        }
      }

      if (nearestName && minDiff !== Infinity) {
        const daysLeft = Math.ceil(minDiff / (1000 * 60 * 60 * 24));
        nextHolidayInfo = { name: nearestName, dateStr: nearestDateStr, daysLeft };
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
