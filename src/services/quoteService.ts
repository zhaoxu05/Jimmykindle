export interface Quote {
  text: string;
  author: string;
  sourceName?: string;
  category?: string;
}

export type QuoteSourceType = 'all' | 'hitokoto' | 'shici' | 'quotable' | 'local';

// Curated offline fallback library for high durability & offline Kindle mode
export const LOCAL_QUOTES: Quote[] = [
  { text: "博学之，审问之，慎思之，明辨之，笃行之。", author: "《礼记·中庸》", sourceName: "国学经典", category: "哲学" },
  { text: "天下风云出我辈，一入江湖岁月催。", author: "金庸", sourceName: "名家名作", category: "文学" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs", sourceName: "名人名言", category: "励志" },
  { text: "海纳百川，有容乃大；壁立千仞，无欲则刚。", author: "林则徐", sourceName: "格言警句", category: "修养" },
  { text: "路漫漫其修远兮，吾将上下而求索。", author: "屈原《离骚》", sourceName: "国学经典", category: "诗词" },
  { text: "生活就像骑自行车，想保持平衡，就必须不断前进。", author: "阿尔伯特·爱因斯坦", sourceName: "名人名言", category: "科学" },
  { text: "黑夜给了我黑色的眼睛，我却用它寻找光明。", author: "顾城", sourceName: "现代诗歌", category: "文学" },
  { text: "星光不问赶路人，岁月不负有心人。", author: "佚名", sourceName: "网络佳句", category: "励志" },
  { text: "知人者智，自知者明。胜人者有力，自胜者强。", author: "老子《道德经》", sourceName: "国学经典", category: "哲学" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", sourceName: "名人名言", category: "事业" },
  { text: "凡是过往，皆为序章。", author: "莎士比亚《暴风雨》", sourceName: "世界名著", category: "文学" },
  { text: "纸上得来终觉浅，绝知此事要躬行。", author: "陆游《冬夜读书示子聿》", sourceName: "国学经典", category: "诗词" },
  { text: "种一棵树最好的时间是十年前，其次就是现在。", author: "Dambisa Moyo", sourceName: "非洲谚语", category: "励志" },
  { text: "苟日新，日日新，又日新。", author: "《礼记·大学》", sourceName: "国学经典", category: "修身" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", sourceName: "名人名言", category: "艺术" },
];

/**
 * Fetch a quote from open-source APIs with automatic fallback
 */
export async function fetchQuote(source: QuoteSourceType = 'all'): Promise<Quote> {
  const chosenSource = source === 'all' 
    ? (['hitokoto', 'shici', 'quotable', 'local'][Math.floor(Math.random() * 4)] as QuoteSourceType)
    : source;

  try {
    if (chosenSource === 'hitokoto') {
      const res = await fetch('https://v1.hitokoto.cn/?c=i&c=d&c=h&c=k', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        return {
          text: data.hitokoto,
          author: data.from_who || data.from || '一言',
          sourceName: 'Hitokoto 一言',
          category: data.type,
        };
      }
    } else if (chosenSource === 'shici') {
      const res = await fetch('https://v1.jinrishici.com/all.json', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        return {
          text: data.content,
          author: `${data.author}《${data.origin}》`,
          sourceName: '今日诗词',
          category: data.category || '诗词',
        };
      }
    } else if (chosenSource === 'quotable') {
      const res = await fetch('https://api.quotable.io/random', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        return {
          text: data.content,
          author: data.author,
          sourceName: 'Quotable 名言库',
          category: 'World Quotes',
        };
      }
    }
  } catch (err) {
    console.warn('Quote API fetch failed, switching to local offline quote:', err);
  }

  // Fallback to local curated list
  const randomIdx = Math.floor(Math.random() * LOCAL_QUOTES.length);
  return LOCAL_QUOTES[randomIdx];
}
