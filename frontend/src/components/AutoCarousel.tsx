import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface AutoCarouselProps {
  images: string[];
  intervalMs?: number;
  className?: string;
}

const AutoCarousel: React.FC<AutoCarouselProps> = ({
  images,
  intervalMs = 4000,
  className,
}) => {
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);

  const resetTimer = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
  };

  useEffect(() => {
    resetTimer();
    return () => timer.current && clearInterval(timer.current);
  }, [images.length, intervalMs]);

  const go = (dir: 1 | -1) => {
    resetTimer();
    setIndex((i) => (i + dir + images.length) % images.length);
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-neutral-200 bg-black/90 ${className ?? ""}`}
    >
      {/* True Cross-Fade */}
      <div className="relative h-full w-full">
        {images.map((img, i) => (
          <motion.img
            key={i}
            src={img}
            alt={`Stadium ${i + 1}`}
            className="absolute top-0 left-0 h-full w-full object-cover"
            initial={false}
            animate={{
              opacity: i === index ? 1 : 0,
              scale: i === index ? 1 : 1.03,
            }}
            transition={{
              duration: 0.85,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ zIndex: i === index ? 10 : 5 }}
          />
        ))}
      </div>

      {/* Arrows fixed on top layer */}
      <button
        onClick={() => go(-1)}
        className="absolute z-20 left-3 top-1/2 -translate-y-1/2 rounded-2xl bg-white/80 p-2 shadow opacity-0 group-hover:opacity-100 transition"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={() => go(1)}
        className="absolute z-20 right-3 top-1/2 -translate-y-1/2 rounded-2xl bg-white/80 p-2 shadow opacity-0 group-hover:opacity-100 transition"
      >
        <ChevronRight />
      </button>

      {/* Dots fixed with higher z-index */}
      <div className="absolute z-20 inset-x-0 bottom-0 flex items-end justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/75 px-3 py-1.5 shadow">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                resetTimer();
                setIndex(i);
              }}
              className={`h-2.5 rounded-full transition-all ${
                i === index
                  ? "w-6 bg-neutral-900"
                  : "w-2.5 bg-neutral-400 hover:scale-110"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AutoCarousel;
