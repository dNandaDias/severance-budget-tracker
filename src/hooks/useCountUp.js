import { useEffect, useRef, useState } from 'react';

export function useCountUp(target, duration = 700) {
  const [value, setValue] = useState(target);
  const prevTarget = useRef(target);
  const rafRef = useRef(null);
  useEffect(() => {
    const start = prevTarget.current;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + (target - start) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        prevTarget.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return value;
}
