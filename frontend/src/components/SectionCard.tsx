import React from "react";

const SectionCard: React.FC<{
  title?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className }) => {
  return (
    <section
      className={`
        rounded-3xl border border-neutral-200 dark:border-emerald-800
        bg-white/70 dark:bg-emerald-900/40 backdrop-blur
        p-6 shadow-sm dark:shadow-emerald-950/30
        transition-colors duration-500
        ${className ?? ""}
      `}
    >
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-neutral-800 dark:text-emerald-100 transition-colors duration-300">
          {title}
        </h3>
      )}
      {children}
    </section>
  );
};

export default SectionCard;
