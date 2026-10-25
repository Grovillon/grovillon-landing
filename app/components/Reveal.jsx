'use client';

import { useEffect, useRef } from 'react';

const SLOPE = Math.tan(Math.PI / 6);

// Media opens once from its top-left corner, its edge on the relief's 30deg crease angle.
export default function Reveal({ className, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined' || typeof el.animate !== 'function') return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    // Never hide what the reader can already see.
    if (el.getBoundingClientRect().top < window.innerHeight) return undefined;

    el.dataset.reveal = 'pending';
    let animation = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const { width, height } = el.getBoundingClientRect();
        // Long enough that the final edge passes through the far corner.
        const reach = width + height / SLOPE;
        animation = el.animate(
          {
            clipPath: [
              'polygon(0px 0px, 0px 0px, 0px 0px)',
              `polygon(0px 0px, ${reach}px 0px, 0px ${reach * SLOPE}px)`,
            ],
          },
          { duration: 700, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' }
        );
        delete el.dataset.reveal;
      },
      { rootMargin: '0px 0px -12% 0px' }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      animation?.cancel();
      delete el.dataset.reveal;
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
