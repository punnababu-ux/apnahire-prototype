import { useState, useEffect, useCallback } from 'react';

export interface CoachStep {
  selector: string;
  title: string;
  body: string;
  cta: string;
  onCta?: () => void;
}

interface Rect { top: number; left: number; width: number; height: number; }

export function CoachMarks({ steps, onComplete }: { steps: CoachStep[]; onComplete: () => void }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const step = steps[stepIdx];
  const PAD = 10;

  const measure = useCallback(() => {
    const el = document.querySelector(step.selector) as HTMLElement | null;
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step.selector]);

  useEffect(() => {
    let cancelled = false;
    const el = document.querySelector(step.selector) as HTMLElement | null;

    // If this step's target isn't on the current screen, skip to the next
    // resolvable step instead of leaving the tour stuck on an invisible anchor.
    if (!el) {
      const skip = setTimeout(() => {
        if (cancelled) return;
        if (stepIdx < steps.length - 1) setStepIdx(i => i + 1);
        else onComplete();
      }, 120);
      return () => { cancelled = true; clearTimeout(skip); };
    }

    // Bring the target into view, then measure once it settles.
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const t = setTimeout(() => { if (!cancelled) measure(); }, 250);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      cancelled = true;
      clearTimeout(t);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [step.selector, stepIdx, steps.length, measure, onComplete]);

  function advance() {
    step.onCta?.();
    if (stepIdx < steps.length - 1) {
      setStepIdx(i => i + 1);
    } else {
      onComplete();
    }
  }

  if (!rect) return null;

  const spotTop    = rect.top    - PAD;
  const spotLeft   = rect.left   - PAD;
  const spotW      = rect.width  + PAD * 2;
  const spotH      = rect.height + PAD * 2;
  const spotRight  = spotLeft + spotW;
  const spotBottom = spotTop  + spotH;

  const BG = 'rgba(17, 24, 39, 0.70)';
  const Z  = 49;

  // Position tooltip above element when it's in the lower 55% of screen
  const showAbove = spotBottom > window.innerHeight * 0.55;
  const TOOLTIP_W = 292;
  const tooltipLeft = Math.max(16, Math.min(
    spotLeft + spotW / 2 - TOOLTIP_W / 2,
    window.innerWidth - TOOLTIP_W - 16,
  ));

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: tooltipLeft,
    width: TOOLTIP_W,
    zIndex: Z + 2,
  };
  if (showAbove) {
    tooltipStyle.bottom = window.innerHeight - spotTop + 14;
  } else {
    tooltipStyle.top = spotBottom + 14;
  }

  // Arrow tip pointing from tooltip toward the spotlight
  const arrowCenterX = spotLeft + spotW / 2;
  const arrowLeft = Math.min(Math.max(arrowCenterX - tooltipLeft - 7, 12), TOOLTIP_W - 26);
  const arrowStyle: React.CSSProperties = {
    position: 'absolute',
    left: arrowLeft,
    width: 14, height: 14,
    background: 'white',
    transform: 'rotate(45deg)',
    zIndex: -1,
  };
  if (showAbove) {
    arrowStyle.bottom = -7;
    arrowStyle.boxShadow = '2px 2px 4px rgba(0,0,0,0.08)';
  } else {
    arrowStyle.top = -7;
    arrowStyle.boxShadow = '-2px -2px 4px rgba(0,0,0,0.08)';
  }

  return (
    <>
      {/* 4-quadrant overlay — blocks clicks outside spotlight */}
      <div style={{ position: 'fixed', inset: 0, top: 0, left: 0, right: 0, height: Math.max(0, spotTop), background: BG, zIndex: Z }} onClick={onComplete} />
      <div style={{ position: 'fixed', top: spotTop, left: 0, width: Math.max(0, spotLeft), height: spotH, background: BG, zIndex: Z }} onClick={onComplete} />
      <div style={{ position: 'fixed', top: spotTop, left: spotRight, right: 0, height: spotH, background: BG, zIndex: Z }} onClick={onComplete} />
      <div style={{ position: 'fixed', top: spotBottom, left: 0, right: 0, bottom: 0, background: BG, zIndex: Z }} onClick={onComplete} />

      {/* Spotlight ring */}
      <div style={{
        position: 'fixed',
        top: spotTop - 2, left: spotLeft - 2,
        width: spotW + 4, height: spotH + 4,
        borderRadius: 12,
        border: '2px solid rgba(31, 130, 104, 0.75)',
        boxShadow: '0 0 0 1px rgba(31,130,104,0.2), 0 0 24px rgba(31,130,104,0.18)',
        zIndex: Z + 1,
        pointerEvents: 'none',
      }} />

      {/* Tooltip bubble */}
      <div role="dialog" aria-modal="true" aria-label={step.title} style={tooltipStyle} className="bg-white rounded-2xl shadow-2xl overflow-visible">
        <div style={arrowStyle} />

        <div className="p-4">
          {/* Progress dots + skip */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1.5 items-center">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{ width: i === stepIdx ? 16 : 6, background: i === stepIdx ? '#1f8268' : '#e5e7eb' }}
                />
              ))}
            </div>
            <button
              onClick={onComplete}
              className="text-[11px] text-gray-400 hover:text-gray-500 font-medium"
            >
              Skip tour
            </button>
          </div>

          <p className="text-[15px] font-bold text-gray-900 leading-snug">{step.title}</p>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{step.body}</p>

          <button
            onClick={advance}
            className="mt-4 w-full py-2.5 bg-[#1f8268] hover:bg-[#186b55] text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            {step.cta}
            {stepIdx < steps.length - 1 && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
