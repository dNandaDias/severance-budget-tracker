import { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reveals a card shortly before it scrolls into view, so it has finished fading in by the time it is seen.
// A dragged scrollbar or a fast flick can jump past a card without it ever intersecting, so a scroll
// listener also reveals anything now above the bottom of the viewport. With reduced motion, always shown.
export function useInView(rootMargin = '0px 0px 35% 0px') {
  const ref = useRef(null);
  const [inView, setInView] = useState(prefersReducedMotion);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return undefined;

    const reveal = () => {
      setInView(true);
      observer.disconnect();
      window.removeEventListener('scroll', check);
    };
    const check = () => {
      if (node.getBoundingClientRect().top < window.innerHeight * 1.35) reveal();
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) reveal();
    }, { rootMargin });

    observer.observe(node);
    window.addEventListener('scroll', check, { passive: true });
    check();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', check);
    };
  }, [rootMargin, inView]);

  return [ref, inView];
}
