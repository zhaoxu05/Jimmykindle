import React, { useState } from 'react';
import { X, BookOpen, ExternalLink, Copy, Check, Smartphone, Monitor } from 'lucide-react';

interface ExportGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
}

export const ExportGuideModal: React.FC<ExportGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 font-bold text-lg">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            <span>Kindle & 免费 HTML 部署与使用指南</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Current URL Box */}
          <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
            <div className="font-bold flex items-center justify-between">
              <span className="text-emerald-700 dark:text-emerald-300">当前可直接访问的 HTML 网页地址:</span>
              <button
                onClick={handleCopyUrl}
                className="px-3 py-1 rounded-lg bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 hover:bg-emerald-600 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制' : '复制网址'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 font-mono text-xs break-all border border-zinc-200 dark:border-zinc-800 select-all">
              {currentUrl}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              提示：该地址为纯 HTML5/React 构建，支持任何支持现代 WebKit 的浏览器访问，完全无需后台 Server！
            </p>
          </div>

          {/* Kindle Step-by-Step Guide */}
          <div className="space-y-3">
            <div className="font-bold text-base flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-emerald-500" />
              <span>如何在 Kindle 上设置待机时钟？</span>
            </div>
            <ol className="list-decimal list-inside space-y-2 text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed pl-1">
              <li>连接 Wi-Fi，打开 Kindle 主界面的 <strong>“体验版浏览器” (Experimental Browser)</strong>。</li>
              <li>在地址栏中输入上面的网址，或使用手机/电脑发送该链接到 Kindle。</li>
              <li>加载页面后，点击顶部⚙️设置图标，选择 <strong>“Kindle 电子墨水屏 (高对比白底)”</strong> 模式。</li>
              <li>点击右上角 <strong>“全屏显示”</strong> 图标（或使用 Kindle 浏览器菜单放置在书签中）。</li>
              <li>Kindle 会自动适应屏幕尺寸，并保持时间、天气与农历实时无缝更新！</li>
            </ol>
          </div>

          {/* PC & Tablet Guide */}
          <div className="space-y-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <div className="font-bold text-base flex items-center gap-2">
              <Monitor className="w-5 h-5 text-emerald-500" />
              <span>电脑 / 平板 (iPad) 待机模式技巧</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
              <li>按键盘 <kbd className="px-1.5 py-0.5 border rounded bg-zinc-100 dark:bg-zinc-800">F11</kbd> 开启浏览器原生全屏模式。</li>
              <li>推荐在设置中开启 <strong>“OLED 纯黑”</strong> 或 <strong>“暖阳复古”</strong> 主题。</li>
              <li>建议开启 <strong>“防灼屏位移保护”</strong> 确保长时间待机安全。</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold hover:opacity-90 transition"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};
