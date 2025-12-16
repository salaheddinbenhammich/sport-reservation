import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import clsx from "clsx";

export type SelectOption<T extends string = string> = {
  label: string;
  value: T;
  disabled?: boolean;
};

type Size = "sm" | "md" | "lg";

interface SelectProps<T extends string = string> {
  options: SelectOption<T>[];
  value: T;
  onChange: (val: T) => void;
  placeholder?: string;
  className?: string;
  size?: Size;
  label?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

const sizeStyles: Record<Size, { button: string; text: string; item: string }> = {
  sm: { button: "px-3 py-1.5 text-sm", text: "text-sm", item: "px-3 py-1.5" },
  md: { button: "px-4 py-2", text: "text-base", item: "px-4 py-2" },
  lg: { button: "px-5 py-3 text-lg", text: "text-lg", item: "px-5 py-3" },
};

export default function Select<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = "Select…",
  className,
  size = "md",
  label,
  ariaLabel,
  disabled = false,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState<number>(-1);
  const [openUp, setOpenUp] = useState(false);

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [menuPos, setMenuPos] = useState<{ top?: number; bottom?: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 0,
  });

  const current = useMemo(() => options.find((o) => o.value === value), [options, value]);
  const enabledOptions = options.filter((o) => !o.disabled);

  const positionMenu = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const gap = 6;
    const viewportH = window.innerHeight;
    const spaceBelow = viewportH - rect.bottom - gap;
    const shouldFlipUp = spaceBelow < 160 && rect.top > spaceBelow;

    setOpenUp(shouldFlipUp);
    setMenuPos(
      shouldFlipUp
        ? { bottom: viewportH - rect.top + gap, left: rect.left, width: rect.width }
        : { top: rect.bottom + gap, left: rect.left, width: rect.width }
    );
  };

  useEffect(() => {
    if (!open) return;
    positionMenu();

    const handleScroll = () => setOpen(false);
    const handleResize = () => setOpen(false);
    const handleDocMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleDocMouseDown);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleDocMouseDown);
    };
  }, [open]);

  const moveFocus = (dir: 1 | -1) => {
    if (!enabledOptions.length) return;
    setFocusIdx((prev) => {
      const next =
        prev === -1
          ? dir === 1
            ? 0
            : enabledOptions.length - 1
          : (prev + dir + enabledOptions.length) % enabledOptions.length;
      return next;
    });
  };

  const commitFocused = () => {
    if (focusIdx < 0) return;
    const opt = enabledOptions[focusIdx];
    if (opt) {
      onChange(opt.value);
      setOpen(false);
      btnRef.current?.focus();
    }
  };

  return (
    <div className={clsx("w-full", className)}>
      {label && (
        <label className="block text-xs text-gray-500 dark:text-emerald-300 mb-1">{label}</label>
      )}

      <div className="relative">
        <button
          ref={btnRef}
          type="button"
          disabled={disabled}
          className={clsx(
            "w-full inline-flex items-center justify-between rounded-xl border shadow-sm transition-all duration-300",
            "bg-white/70 text-gray-700 border-emerald-100",
            "dark:bg-emerald-950/40 dark:text-emerald-100 dark:border-emerald-800",
            "focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-emerald-400 dark:hover:border-emerald-600",
            disabled && "opacity-60 cursor-not-allowed",
            sizeStyles[size].button
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={label ? undefined : ariaLabel}
          onClick={() => {
            if (disabled) return;
            const next = !open;
            setOpen(next);
            if (next) {
              setFocusIdx(-1);
              positionMenu();
            }
          }}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              if (!open) setOpen(true);
              moveFocus(1);
              positionMenu();
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              if (!open) setOpen(true);
              moveFocus(-1);
              positionMenu();
            }
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!open) {
                setOpen(true);
                positionMenu();
              } else {
                commitFocused();
              }
            }
            if (e.key === "Escape") {
              setOpen(false);
            }
          }}
        >
          <span
            className={clsx(
              "truncate",
              current
                ? "text-sm font-medium text-gray-800 dark:text-emerald-100"
                : "text-gray-400 dark:text-emerald-400/60 text-xs"
            )}
          >
            {current ? current.label : placeholder}
          </span>

          <ChevronDown
            className={clsx(
              "w-4 h-4 ml-2 opacity-70 transition-transform text-emerald-600 dark:text-emerald-400",
              open && "rotate-180"
            )}
          />
        </button>
      </div>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className={clsx(
              "fixed z-[9999] rounded-xl border max-h-64 overflow-auto shadow-2xl ring-1 ring-black/5 animate-[fadeSlide_120ms_ease-out] origin-top transition-colors duration-300",
              "bg-white/90 border-emerald-100 text-gray-700",
              "dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-100 dark:shadow-emerald-900/40"
            )}
            style={{
              top: menuPos.top,
              left: menuPos.left,
              bottom: menuPos.bottom,
              width: menuPos.width,
            }}
            role="listbox"
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                moveFocus(1);
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                moveFocus(-1);
              }
              if (e.key === "Enter") {
                e.preventDefault();
                commitFocused();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setOpen(false);
                btnRef.current?.focus();
              }
            }}
          >
            {options.map((opt) => {
              const selected = opt.value === value;
              const disabledItem = !!opt.disabled;
              const indexAmongEnabled = enabledOptions.findIndex((o) => o.value === opt.value);
              const focused = indexAmongEnabled !== -1 && focusIdx === indexAmongEnabled;

              return (
                <div
                  key={opt.value}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={disabledItem}
                  onMouseEnter={() => {
                    if (disabledItem) return;
                    setFocusIdx(indexAmongEnabled);
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    if (disabledItem) return;
                    onChange(opt.value);
                    setOpen(false);
                    btnRef.current?.focus();
                  }}
                  className={clsx(
                    "flex items-center justify-between cursor-pointer transition-all duration-200",
                    sizeStyles[size].item,
                    disabledItem && "opacity-40 cursor-not-allowed",
                    focused && !disabledItem && "bg-emerald-50 dark:bg-emerald-900/30",
                    selected &&
                      "font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {selected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                </div>
              );
            })}
          </div>,
          document.body
        )}

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(${openUp ? "-6px" : "6px"}); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
