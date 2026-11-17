"use client";

import { useEffect, useState } from "react";

interface AnimatedStatValueProps {
  value: number;
}

export default function AnimatedStatValue({
  value,
}: AnimatedStatValueProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out animation
      const easedProgress =
        1 - Math.pow(1 - progress, 3);

      const currentValue = Math.round(
        easedProgress * value
      );

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <>{displayValue.toLocaleString()}</>;
}