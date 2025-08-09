// IntersectionObserver-based reveal-on-scroll hook
// Adds 'is-visible' class when the element enters the viewport.
// Respects reduced motion by revealing immediately.
import { useEffect } from 'react';

export default function useRevealOnScroll(ref, { rootMargin = '0px 0px -10% 0px', threshold = 0.1 } = {}) {
  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    // If reduced motion, reveal immediately
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.classList.add('reveal');
    if (prefersReduced) {
      el.classList.add('is-visible');
      return;
    }

    let ob;
    try {
      ob = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Once visible, we can unobserve to save work
            ob.unobserve(entry.target);
          }
        }
      }, { root: null, rootMargin, threshold });
      ob.observe(el);
    } catch (_) {
      // Fallback: reveal immediately
      el.classList.add('is-visible');
    }

    return () => {
      try { ob && ob.disconnect(); } catch {}
    };
  }, [ref, rootMargin, threshold]);
}
