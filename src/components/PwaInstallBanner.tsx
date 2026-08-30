import React from 'react';
import { Download, X } from 'lucide-react';
import { usePwaInstallPrompt } from '../hooks/usePwaInstallPrompt';

interface PwaInstallBannerProps {
  isAuthenticated: boolean;
  isHome: boolean;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ isAuthenticated, isHome }) => {
  const enabled = isAuthenticated && isHome;
  const { canInstall, requestInstall } = usePwaInstallPrompt(enabled);
  const [isVisible, setIsVisible] = React.useState(false);
  const [wasDismissed, setWasDismissed] = React.useState(false);

  React.useEffect(() => {
    if (!canInstall || wasDismissed) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const timeoutId = window.setTimeout(() => setIsVisible(false), 30_000);
    return () => window.clearTimeout(timeoutId);
  }, [canInstall, wasDismissed]);

  const handleDismiss = () => {
    setWasDismissed(true);
    setIsVisible(false);
  };

  const handleInstall = async () => {
    await requestInstall();
  };

  if (!isVisible || !enabled || !canInstall) return null;

  return (
    <div
      className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-[80] mx-auto max-w-xl rounded-2xl border border-sky-300/30 bg-[#08152e]/95 px-3 py-3 text-white shadow-[0_16px_45px_rgba(0,0,0,0.45)] backdrop-blur-md"
      dir="rtl"
      role="dialog"
      aria-label="تثبيت البرنامج"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-1 text-right transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-sky-300/70"
          aria-label="قم بتنزيل البرنامج في الهاتف"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-400/15 text-sky-300">
            <Download className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="truncate text-sm font-black">قم بتنزيل البرنامج في الهاتف</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-300/70"
          aria-label="إغلاق"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
