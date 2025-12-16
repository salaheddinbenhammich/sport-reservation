import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ArtisticCalendarProps {
  valueISO: string;
  onChange: (iso: string) => void;
  disablePastDates?: boolean;
}

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const toISO = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const addMonths = (d: Date, m: number) =>
  new Date(d.getFullYear(), d.getMonth() + m, 1);

const weekdayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ArtisticCalendar: React.FC<ArtisticCalendarProps> = ({
  valueISO,
  onChange,
  disablePastDates,
}) => {
  const [cursor, setCursor] = useState(() => {
    const [y, m] = valueISO.split("-").map(Number);
    return new Date(y, m - 1, 1);
  });

  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const matrix = useMemo(() => {
    const start = startOfMonth(cursor);
    const end = endOfMonth(cursor);
    const firstWeekday = (start.getDay() + 6) % 7;
    const daysInMonth = end.getDate();

    const cells: { day: number; inMonth: boolean; iso: string }[] = [];

    for (let i = 0; i < firstWeekday; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() - (firstWeekday - i));
      cells.push({ day: d.getDate(), inMonth: false, iso: toISO(d) });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(cursor);
      d.setDate(day);
      cells.push({ day, inMonth: true, iso: toISO(d) });
    }

    while (cells.length % 7 !== 0) {
      const last = new Date(cells[cells.length - 1].iso);
      last.setDate(last.getDate() + 1);
      cells.push({ day: last.getDate(), inMonth: false, iso: toISO(last) });
    }

    return cells;
  }, [cursor]);

  const years = useMemo(() => {
    const currentYear = cursor.getFullYear();
    const startYear = Math.floor(currentYear / 12) * 12;
    return Array.from({ length: 12 }, (_, i) => startYear + i);
  }, [cursor]);

  const handleYearSelect = (year: number) => {
    setCursor(new Date(year, cursor.getMonth(), 1));
    setViewMode("months");
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCursor(new Date(cursor.getFullYear(), monthIndex, 1));
    setViewMode("days");
  };

  const titleMonth = monthNames[cursor.getMonth()];
  const titleYear = cursor.getFullYear();

  return (
    <div className="rounded-3xl border border-emerald-200/70 dark:border-emerald-800 bg-white/70 dark:bg-emerald-950/70 backdrop-blur-xl shadow-lg p-4 select-none transition-colors duration-500">
      {/* header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-800 dark:text-emerald-100">
          <Calendar className="opacity-80 text-emerald-600 dark:text-emerald-400" />
          <div className="flex gap-1 font-semibold">
            <span
              className="capitalize cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-300 transition"
              onClick={() => setViewMode("months")}
            >
              {titleMonth}
            </span>
            <span
              className="cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-300 transition"
              onClick={() => setViewMode("years")}
            >
              {titleYear}
            </span>
          </div>
        </div>

        {/* arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setCursor((c) =>
                viewMode === "days"
                  ? addMonths(c, -1)
                  : viewMode === "months"
                  ? new Date(c.getFullYear() - 1, c.getMonth(), 1)
                  : new Date(c.getFullYear() - 12, c.getMonth(), 1)
              )
            }
            className="rounded-xl border border-emerald-300/60 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300 p-1 shadow-sm transition-all duration-200 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() =>
              setCursor((c) =>
                viewMode === "days"
                  ? addMonths(c, 1)
                  : viewMode === "months"
                  ? new Date(c.getFullYear() + 1, c.getMonth(), 1)
                  : new Date(c.getFullYear() + 12, c.getMonth(), 1)
              )
            }
            className="rounded-xl border border-emerald-300/60 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300 p-1 shadow-sm transition-all duration-200 active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* main content */}
      <AnimatePresence mode="wait">
        {viewMode === "days" && (
          <motion.div
            key="days"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium text-gray-500 dark:text-emerald-400 mb-2">
              {weekdayNames.map((n) => (
                <div key={n}>{n}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {matrix.map((c, i) => {
                const isSelected = c.iso === valueISO;
                const cellDate = new Date(c.iso);
                cellDate.setHours(0, 0, 0, 0);
                const isPast = disablePastDates && cellDate < today;

                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (!isPast) onChange(c.iso);
                    }}
                    disabled={isPast}
                    className={`aspect-square rounded-2xl border text-sm transition shadow-sm 
                      ${
                        isPast
                          ? "border-neutral-100 bg-neutral-100 text-gray-400 dark:border-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-700 cursor-not-allowed opacity-60"
                          : isSelected
                          ? "border-emerald-600 bg-emerald-600 text-white"
                          : c.inMonth
                          ? "border-neutral-200 dark:border-emerald-800 bg-white dark:bg-emerald-900 text-gray-700 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-800"
                          : "border-neutral-100 dark:border-emerald-950 bg-neutral-50 dark:bg-emerald-950/50 text-gray-400 dark:text-emerald-600 hover:bg-neutral-100 dark:hover:bg-emerald-900/60"
                      }`}
                  >
                    <span className="font-semibold">{c.day}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {viewMode === "months" && (
          <motion.div
            key="months"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-3 gap-2 p-1"
          >
            {monthNames.map((m, idx) => (
              <button
                key={m}
                onClick={() => handleMonthSelect(idx)}
                className={`p-3 text-sm rounded-2xl border transition capitalize ${
                  idx === cursor.getMonth()
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white dark:bg-emerald-900 border-neutral-200 dark:border-emerald-800 text-gray-700 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-800"
                }`}
              >
                {m.slice(0, 3)}
              </button>
            ))}
          </motion.div>
        )}

        {viewMode === "years" && (
          <motion.div
            key="years"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-3 gap-2 p-1"
          >
            {years.map((year) => (
              <button
                key={year}
                onClick={() => handleYearSelect(year)}
                className={`p-3 text-sm rounded-2xl border transition ${
                  year === cursor.getFullYear()
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white dark:bg-emerald-900 border-neutral-200 dark:border-emerald-800 text-gray-700 dark:text-emerald-100 hover:bg-emerald-50 dark:hover:bg-emerald-800"
                }`}
              >
                {year}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ArtisticCalendar;
