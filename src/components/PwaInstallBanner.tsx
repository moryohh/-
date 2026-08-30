import React from 'react';
import { Download, X, Share, Smartphone } from 'lucide-react';
import { usePwaInstallPrompt } from '../hooks/usePwaInstallPrompt';

interface PwaInstallBannerProps {
  isAuthenticated: boolean;
  isHome: boolean;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ isAuthenticated, isHome }) => {
  const { canInstall, canShowInstallControl, isIos, requestInstall } = usePwaInstallPrompt(isAuthenticated);
  const [isVisible, setIsVisible] = React.useState(false);
  const [wasDismissed, setWasDismissed] = React.useState(false);
  const [showIosHelp, setShowIosHelp] = React.useState(false);

  // The bottom prompt starts a single 30-second lifetime whenever the user reaches Home.
  React.useEffect(() => {
    if (!isHome || !canShowInstallControl || wasDismissed) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const timeoutId = window.setTimeout(() => setIsVisible(false), 30_000);
    return () => window.clearTimeout(timeoutId);
  }, [isHome, canShowInstallControl, wasDismissed]);

  const handleDismiss = () => {
    setWasDismissed(true);
    setIsVisible(false);
  };

  const handleInstall = async () => {
    if (isIos) {
      setShowIosHelp(true);
      return;
    }
    await requestInstall();
  };

  if (!isAuthenticated || !canShowInstallControl) return null;

  return (
    <>
      {/* Permanent install affordance in the header area for authenticated users. */}
      <button
        type="button"
        onClick={handleInstall}
        className="fixed right-3 top-[4.25rem] z-[79] flex h-9 w-9 items-center justify-center rounded-full border border-sky-300/40 bg-[#08152e]/95 text-sky-300 shadow-lg backdrop-blur-md transition hover:bg-sky-400/15 focus:outline-none focus:ring-2 focus:ring-sky-300/70"
        aria-label="تثبيت البرنامج على الهاتف"
        title="تثبيت البرنامج على الهاتف"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
      </button>

      {isHome && isVisible && (
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
      )}

      {showIosHelp && (
        <div className="fixed inset-x-4 bottom-5 z-[90] mx-auto max-w-sm rounded-2xl border border-sky-300/40 bg-[#08152e] p-4 text-right text-white shadow-2xl" dir="rtl" role="dialog" aria-label="طريقة تثبيت البرنامج">
          <div className="flex items-start gap-3">
            <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black">لتثبيت البرنامج على iPhone</p>
              <p className="mt-1 text-xs leading-6 text-slate-300">
                اضغط زر المشاركة <Share className="mx-1 inline h-3.5 w-3.5 text-sky-300" aria-hidden="true" /> ثم اختر «إضافة إلى الشاشة الرئيسية».
              </p>
            </div>
            <button type="button" onClick={() => setShowIosHelp(false)} className="rounded-full p-1 text-slate-300 hover:bg-white/10" aria-label="إغلاق">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
