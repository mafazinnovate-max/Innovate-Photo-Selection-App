
"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

type BlurTextProps = {
  text: string;
  effect?: "blur" | "fade";
  animateBy?: "words" | "characters";
  direction?: "top" | "bottom";
  staggerFrom?: "start" | "end" | "center";
  trigger?: "view" | "mount";
  delay?: number;
  stepDuration?: number;
  blur?: number;
  distance?: number;
  onAnimationComplete?: () => void;
  className?: string;
};

export default function BlurText({
  text,
  effect = "blur",
  animateBy = "words",
  direction = "bottom",
  staggerFrom = "start",
  trigger = "view",
  delay = 0,
  stepDuration = 0.35,
  blur = 10,
  distance = 40,
  onAnimationComplete,
  className = "",
}: BlurTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const isInView = useInView(ref, {
    once: true,
    amount: 0.2,
  });

  const shouldAnimate = trigger === "mount" || isInView;

  const items =
    animateBy === "characters"
      ? Array.from(text)
      : text.split(" ");

  const orderedItems = items.map((_, index) => {
    if (staggerFrom === "end") {
      return items.length - index - 1;
    }

    if (staggerFrom === "center") {
      return Math.abs(index - (items.length - 1) / 2);
    }

    return index;
  });

  return (
    <motion.span
      ref={ref}
      className={className}
      initial="hidden"
      animate={shouldAnimate ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay / 1000,
            staggerChildren: stepDuration,
          },
        },
      }}
      onAnimationComplete={() => {
        if (shouldAnimate) onAnimationComplete?.();
      }}
    >
      {items.map((item, index) => (
        <span
          key={`${index}-${item}`}
          className="inline-block whitespace-pre"
        >
          <motion.span
            className="inline-block"
            variants={{
              hidden: {
                opacity: 0,
                y: direction === "bottom" ? distance : -distance,
                filter:
                  effect === "blur"
                    ? `blur(${blur}px)`
                    : "blur(0px)",
              },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: {
                  duration: 0.7,
                  ease: [0.2, 0.7, 0.2, 1],
                },
              },
            }}
          >
            {item}
          </motion.span>

          {animateBy === "words" && index < items.length - 1
            ? " "
            : ""}
        </span>
      ))}
    </motion.span>
  );
}
