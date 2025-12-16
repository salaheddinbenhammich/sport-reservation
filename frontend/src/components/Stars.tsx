import React from "react";
import { Star } from "lucide-react";

interface StarsProps {
  value: number;            // average or selected value (0..5)
  onChange?: (v: number) => void; // if provided, makes it interactive
  size?: number;            // icon size (default: 18)
}

const Stars: React.FC<StarsProps> = ({ value, onChange, size = 18 }) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = value >= i + 1;
        const half = value > i && value < i + 1; // simple half logic if needed

        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange?.(i + 1)}
            className={`p-0.5 ${onChange ? "cursor-pointer" : "cursor-default"}`}
            aria-label={`Rate ${i + 1} star`}
          >
            <Star
              width={size}
              height={size}
              className={`transition ${
                filled ? "fill-yellow-400 stroke-yellow-500" : "stroke-neutral-400"
              } ${half ? "opacity-80" : ""}`}
            />
          </button>
        );
      })}
    </div>
  );
};

export default Stars;
