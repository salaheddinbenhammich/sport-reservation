import React from "react";

interface ChipProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const Chip: React.FC<ChipProps> = ({ children, icon }) => {
  return (
    <span className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white/70 px-3 py-1 text-sm shadow-sm backdrop-blur hover:shadow transition">
      {icon}
      <span className="font-medium text-neutral-700">{children}</span>
    </span>
  );
};

export default Chip;
