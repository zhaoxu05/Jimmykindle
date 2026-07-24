import React, { useState } from 'react';
import { X, Tag, History, Sparkles, CheckCircle2, Calendar, Smartphone, Layers } from 'lucide-react';

export interface VersionLog {
  version: string;
  date: string;
  title: string;
  badge?: string;
  isLatest?: boolean;
  highlights: string[];
  details: string[];
}

export const VERSION_LOGS: VersionLog[] = [
  {
    version: 'v1.4.0',
    date: '2026-07-24',
    title: 'Kindle 原生 ES5 全卡片桌面与浅仿古羊皮纸 (#F7EDD3) 升级',
    badge: '最新大版本',
    isLatest: true,
    highlights: [
      '完美移植古诗词金句、历史上的今天、世界时钟与倒计时到 Kindle Voyage 引擎',
      '时间与日期字号震撼自适应放大，全屏充满不再留白',
      '采用浅仿古羊皮纸 HEX: #F7EDD3 (RGB 247, 237, 211) 精准质感配色',
      '内置全屏黑白反转刷屏功能，有效消除 Ink 墨水屏残影'
    ],
    details: [
      '全面优化 Kindle Voyage、Paperwhite 等早期 Kindle 设备的静态 ES5 独立引擎。',
      '在无高版本 JS 引擎前提下，完美实现时间居中震撼放大、浅仿古羊皮纸纹理、诗词金句轮播、世界时钟与倒计时全功能渲染。',
      '静态 HTML 层内置独立离线天气、农历二十四节气与防残影刷屏冲刷机制。'
    ]
  },
  {
    version: 'v1.3.0',
    date: '2026-07-20',
    title: '多源天气容灾与墨水屏防残影刷屏增强',
    highlights: [
      '集成 Open-Meteo / wttr.in 多数据源自动容灾',
      '支持 1/5/10/30 分钟全屏黑白反转闪烁刷屏',
      '农历黄历算法与节假日倒计时升级'
    ],
    details: [
      '天气服务引入智能故障自动切换，当主 API 不可用时无感回退至备用节点。',
      '专门针对 E-ink 电子墨水屏物理特性提供多档定时刷屏选项，有效消除电泳颗粒残影。',
      '增强中国农历六曜、二十四节气与法定假日精准算法。'
    ]
  },
  {
    version: 'v1.2.0',
    date: '2026-07-15',
    title: '世界时钟、诗词金句与 Ink 主题套件',
    highlights: [
      '支持副时区（世界时钟）对比显示',
      '集成精选古诗词与励志金句卡片',
      '新增 Eink 高对比度黑白与羊皮纸等主题'
    ],
    details: [
      '可自定全球主要城市作为副时钟显示，方便跨时区关注。',
      '提供诗词与金句定时轮播，增添书桌氛围感。',
      '优化了针对单色墨水屏与彩色显示屏的不同对比度主题样式。'
    ]
  },
  {
    version: 'v1.1.0',
    date: '2026-07-08',
    title: '历史上的今天与模块自由排版',
    highlights: [
      '新增“历史上的今天”经典回顾模块',
      '自由勾选/隐藏各个功能卡片',
      '支持四宫格与紧凑型自适应布局'
    ],
    details: [
      '每日自动获取历史重大事件，丰富桌面上看时间之外的阅读趣味。',
      '提供完全模块化的配置面板，自由组合属于你自己的专属待机桌面。'
    ]
  },
  {
    version: 'v1.0.0',
    date: '2026-07-01',
    title: 'Kindle Desk Standby 电子书桌待机时钟首发',
    highlights: [
      '大字体无干扰数字数字时钟与日期',
      '全屏网页适配与低功耗极简设计'
    ],
    details: [
      '专为 Kindle 浏览器与旧平板闲置利用打造的电子桌面时钟应用。'
    ]
  }
];

interface VersionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VersionModal: React.FC<VersionModalProps> = ({ isOpen, onClose }) => {
  const [selectedVersion, setSelectedVersion] = useState<string>(VERSION_LOGS[0].version);

  if (!isOpen) return null;

  const activeLog = VERSION_LOGS.find((log) => log.version === selectedVersion) || VERSION_LOGS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2 font-bold text-lg">
            <History className="w-5 h-5 text-emerald-500" />
            <span>版本更新历史与日志 (Changelog)</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left Version List */}
          <div className="w-full md:w-52 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800 p-3 space-y-1.5 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950/30 shrink-0">
            <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 px-3 py-1 uppercase tracking-wider">
              历史版本
            </div>
            {VERSION_LOGS.map((log) => {
              const isSelected = log.version === selectedVersion;
              return (
                <button
                  key={log.version}
                  onClick={() => setSelectedVersion(log.version)}
                  className={`w-full text-left px-3 py-2.5 rounded-2xl transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500 text-white font-bold shadow-md'
                      : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-mono">{log.version}</span>
                    <span className={`text-[11px] ${isSelected ? 'text-emerald-100' : 'text-zinc-400 dark:text-zinc-500'}`}>
                      {log.date}
                    </span>
                  </div>
                  {log.isLatest && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-white text-emerald-600' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      最新
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Log Detail View */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5">
            {/* Version Title Banner */}
            <div className="space-y-2 pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-2xl font-extrabold font-mono tracking-tight text-emerald-600 dark:text-emerald-400">
                  {activeLog.version}
                </span>
                {activeLog.badge && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    {activeLog.badge}
                  </span>
                )}
                <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 ml-auto">
                  <Calendar className="w-3.5 h-3.5" />
                  {activeLog.date}
                </span>
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {activeLog.title}
              </h3>
            </div>

            {/* Highlights List */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>核心更新要点</span>
              </div>
              <div className="grid gap-2">
                {activeLog.highlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/50 flex items-start gap-2 text-xs sm:text-sm font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-500" />
                <span>详细改进记录</span>
              </div>
              <ul className="space-y-2 list-disc list-inside text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                {activeLog.details.map((detail, idx) => (
                  <li key={idx} className="pl-1">
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            {/* Note for Kindle users */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Smartphone className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>所有旧款 Kindle（如 Voyage / Paperwhite 3 等）均已支持自动降级至独立 ES5 引擎，确保无脚本报错。</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between text-xs text-zinc-500">
          <div>当前最佳兼容版本: <strong className="font-mono text-zinc-800 dark:text-zinc-200">v1.4.0 (2026-07-24)</strong></div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold hover:opacity-90 transition cursor-pointer"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};
