import { HistoryEvent } from '../types';

// Curated Offline Fallback Database for key dates to guarantee offline reliability
const OFFLINE_HISTORICAL_EVENTS: Record<string, HistoryEvent[]> = {
  // 7-24 (Jul 24)
  '7-24': [
    { year: '1969年', title: '阿波罗11号乘组安全返回地球，完成人类首次登月任务' },
    { year: '1911年', title: '美国探险家海勒姆·班厄姆三世在秘鲁安第斯山脉发现马丘比丘遗址' },
    { year: '1901年', title: '《辛丑条约》谈判期间，清政府设立外务部' },
    { year: '1802年', title: '法国著名作家大仲马（Alexandre Dumas）出生' },
  ],
  // 1-1
  '1-1': [
    { year: '1912年', title: '中华民国临时政府在南京成立，孙中山宣誓就任临时大总统' },
    { year: '1995年', title: '世界贸易组织（WTO）正式成立' },
  ],
  // 10-1
  '10-1': [
    { year: '1949年', title: '中华人民共和国开国大典在北京天安门广场隆重举行' },
    { year: '1908年', title: '福特汽车公司推出T型车，开启全球汽车工业流水线时代' },
  ]
};

export async function fetchHistoryToday(date: Date = new Date()): Promise<HistoryEvent[]> {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateKey = `${month}-${day}`;

  // Attempt 1: Fetch from Wikimedia REST API
  try {
    const res = await fetch(`https://zh.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.events) && data.events.length > 0) {
        return data.events.slice(0, 5).map((evt: { year: number; text: string }) => ({
          year: `${evt.year}年`,
          title: evt.text,
        }));
      }
    }
  } catch (err) {
    console.warn('Wikimedia history fetch failed:', err);
  }

  // Attempt 2: Try Open China API fallback
  try {
    const res = await fetch(`https://api.oick.cn/today/api.php`);

    if (res.ok) {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        const list = json.result || json.data || json;
        if (Array.isArray(list) && list.length > 0) {
          return list.slice(0, 5).map((item: any) => ({
            year: item.year ? `${item.year}年` : (item.date || ''),
            title: item.title || item.event || item,
          }));
        }
      } catch {
        // text parse failed
      }
    }
  } catch {
    // API failed
  }

  // Attempt 3: Return offline curated database for today or generic historical facts
  if (OFFLINE_HISTORICAL_EVENTS[dateKey]) {
    return OFFLINE_HISTORICAL_EVENTS[dateKey];
  }

  // Generic fallback
  return [
    { year: `${date.getFullYear()}年`, title: `历史上今天的重大事件正在同步中...` },
    { year: '1969年', title: '人类首次登月，开启星际探索新纪元' },
    { year: '1905年', title: '爱因斯坦提出狭义相对论，重塑现代物理学视角' },
  ];
}
