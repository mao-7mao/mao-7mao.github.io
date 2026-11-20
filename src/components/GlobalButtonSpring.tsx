import { useEffect } from 'react';
import { animate } from 'framer-motion';

type AnimationControls = ReturnType<typeof animate>;

const INTERACTIVE_SELECTOR =
  'button:not(:disabled):not([data-no-global-spring="true"]), a[data-spring-button="true"]';

/**
 * Splits a CSS box-shadow string into individual shadow layers without splitting inside parentheses.
 */
function splitShadowLayers(shadow: string): string[] {
  const layers: string[] = [];
  let current = '';
  let depth = 0;

  for (let i = 0; i < shadow.length; i++) {
    const ch = shadow[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);

    if (ch === ',' && depth === 0) {
      if (current.trim()) layers.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) layers.push(current.trim());
  return layers;
}

/**
 * Weakens a computed CSS box-shadow string by reducing blur/offset lengths and color opacity.
 * Handles rgba(), rgb(), oklab(), oklch(), color(), and multi-layer shadows safely.
 */
function weakenBoxShadow(computedShadow: string): string {
  if (!computedShadow || computedShadow === 'none') return '';

  const layers = splitShadowLayers(computedShadow);
  const weakened = layers.map((layer) => {
    // Scale px lengths down to ~40% so shadow hugs closer to the surface when pressed
    let out = layer.replace(/(-?\d*\.?\d+)px/g, (_, numStr) => {
      const val = parseFloat(numStr);
      if (Number.isNaN(val) || val === 0) return '0px';
      const scaled = Math.round(val * 0.4 * 100) / 100;
      return `${scaled}px`;
    });

    // Reduce alpha in modern slash syntax: rgb(... / 0.25), oklab(... / 0.1), etc.
    let alphaAdjusted = false;
    out = out.replace(/(\/\s*)(\d*\.?\d+)(%?)\s*\)/g, (_, slash, numStr, pct) => {
      alphaAdjusted = true;
      const val = parseFloat(numStr);
      const next = Math.round(val * 0.45 * 1000) / 1000;
      return `${slash}${next}${pct})`;
    });

    // Reduce alpha in legacy rgba(r, g, b, a)
    if (!alphaAdjusted) {
      out = out.replace(
        /rgba\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/gi,
        (_, r, g, b, a) => {
          alphaAdjusted = true;
          const nextA = Math.round(parseFloat(a) * 0.45 * 1000) / 1000;
          return `rgba(${r}, ${g}, ${b}, ${nextA})`;
        }
      );
    }

    // Add reduced alpha to opaque rgb(r, g, b)
    if (!alphaAdjusted) {
      out = out.replace(
        /rgb\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/gi,
        (_, r, g, b) => `rgba(${r}, ${g}, ${b}, 0.45)`
      );
    }

    return out;
  });

  return weakened.join(', ');
}

/**
 * Global spring press-and-rebound controller for all regular buttons across the application.
 * - Press: scales down to 0.94 and weakens box-shadow.
 * - Release: springs back to 1 with stiffness 260, damping 12 (slight natural overshoot).
 */
export default function GlobalButtonSpring() {
  useEffect(() => {
    const activeAnimations = new WeakMap<HTMLElement, AnimationControls>();
    const releaseGen = new WeakMap<HTMLElement, number>();
    let currentPressed: HTMLElement | null = null;
    let keyboardPressed: HTMLElement | null = null;

    const getTargetButton = (target: EventTarget | null): HTMLElement | null => {
      if (!(target instanceof Element)) return null;
      const el = target.closest(INTERACTIVE_SELECTOR) as HTMLElement | null;
      if (!el) return null;
      if ((el as HTMLButtonElement).disabled) return null;
      if (el.closest('[data-no-global-spring="true"]')) return null;
      return el;
    };

    const pressElement = (el: HTMLElement) => {
      const prevAnim = activeAnimations.get(el);
      if (prevAnim) prevAnim.stop();

      const nextGen = (releaseGen.get(el) ?? 0) + 1;
      releaseGen.set(el, nextGen);

      // Capture resting shadow before marking pressed
      if (!el.hasAttribute('data-spring-active')) {
        const computedShadow = window.getComputedStyle(el).boxShadow;
        if (computedShadow && computedShadow !== 'none') {
          el.dataset.springHasShadow = 'true';
          el.style.boxShadow = weakenBoxShadow(computedShadow);
        } else {
          delete el.dataset.springHasShadow;
        }
      }

      el.setAttribute('data-spring-active', 'true');

      const anim = animate(
        el,
        { scale: 0.94 },
        { duration: 0.1, ease: [0.2, 0, 0, 1] }
      );
      activeAnimations.set(el, anim);
    };

    const releaseElement = (el: HTMLElement) => {
      const prevAnim = activeAnimations.get(el);
      if (prevAnim) prevAnim.stop();

      const gen = (releaseGen.get(el) ?? 0) + 1;
      releaseGen.set(el, gen);

      // Restore original box-shadow (CSS transitions it smoothly back)
      if (el.dataset.springHasShadow === 'true') {
        el.style.boxShadow = '';
        delete el.dataset.springHasShadow;
      }

      const anim = animate(
        el,
        { scale: 1 },
        {
          type: 'spring',
          stiffness: 260,
          damping: 12,
        }
      );
      activeAnimations.set(el, anim);

      anim.finished
        .then(() => {
          if (releaseGen.get(el) === gen) {
            el.style.transform = '';
            el.removeAttribute('data-spring-active');
          }
        })
        .catch(() => {
          // Animation was interrupted by a new press
        });
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const el = getTargetButton(e.target);
      if (!el) return;

      if (currentPressed && currentPressed !== el) {
        releaseElement(currentPressed);
      }
      currentPressed = el;
      pressElement(el);
    };

    const handlePointerRelease = () => {
      if (!currentPressed) return;
      const el = currentPressed;
      currentPressed = null;
      releaseElement(el);
    };

    const handlePointerOut = (e: PointerEvent) => {
      if (!currentPressed) return;
      if (e.pointerType !== 'mouse') return;
      const related = e.relatedTarget as Node | null;
      if (related && currentPressed.contains(related)) return;
      const el = currentPressed;
      currentPressed = null;
      releaseElement(el);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key !== ' ' && e.key !== 'Enter') return;
      const el = getTargetButton(e.target);
      if (!el) return;
      keyboardPressed = el;
      pressElement(el);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!keyboardPressed) return;
      if (e.key !== ' ' && e.key !== 'Enter') return;
      const el = keyboardPressed;
      keyboardPressed = null;
      releaseElement(el);
    };

    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerRelease, { passive: true });
    window.addEventListener('pointercancel', handlePointerRelease, { passive: true });
    window.addEventListener('blur', handlePointerRelease);
    document.addEventListener('pointerout', handlePointerOut, { passive: true });
    document.addEventListener('keydown', handleKeyDown, { passive: true });
    window.addEventListener('keyup', handleKeyUp, { passive: true });

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerRelease);
      window.removeEventListener('pointercancel', handlePointerRelease);
      window.removeEventListener('blur', handlePointerRelease);
      document.removeEventListener('pointerout', handlePointerOut);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return null;
}
