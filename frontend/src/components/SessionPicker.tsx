import React, { useMemo, useState } from "react";

interface Session {
  _id: string;
  startTime: string;
  endTime: string;
  price: number;
  status: "available" | "booked" | "canceled";
}

interface Props {
  sessions: Session[];
  selectedSessions: Session[];
  onToggle: (session: Session) => void;
}

const formatHour = (t: string) => {
  const m = /^(\d{1,2})(?::(\d{2}))?/.exec(t);
  if (!m) return t;
  const hh = m[1].padStart(2, "0");
  const mm = m[2] ?? "00";
  return mm === "00" ? `${hh}h` : `${hh}h${mm}`;
};

const SessionPicker: React.FC<Props> = ({
  sessions,
  selectedSessions,
  onToggle,
}) => {
  const selectedIds = useMemo(
    () => new Set(selectedSessions.map((s) => s._id)),
    [selectedSessions]
  );

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap gap-2">
      {sessions.map((s) => {
        const isSelected = selectedIds.has(s._id);
        const isBooked = s.status === "booked";
        const isCanceled = s.status === "canceled";

        return (
          <div
            key={s._id}
            className="relative flex items-center gap-2"
            onMouseEnter={() => setHoveredId(s._id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <button
              onClick={() => {
                if (!isBooked && !isCanceled) onToggle(s);
              }}
              disabled={isBooked || isCanceled}
              aria-pressed={isSelected}
              className={[
                "px-3 py-2 rounded-xl text-sm font-medium transition-all border shadow-sm",
                isBooked
                  ? "bg-gray-100 text-gray-500 border-gray-300 dark:bg-emerald-950/40 dark:text-emerald-600 dark:border-emerald-800 cursor-not-allowed"
                  : isCanceled
                  ? "bg-rose-100 text-rose-500 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 cursor-not-allowed"
                  : isSelected
                  ? "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-600 dark:border-emerald-600 dark:text-white"
                  : "bg-white border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/60",
              ].join(" ")}
            >
              {formatHour(s.startTime)}
            </button>

            {/* hover labels (reserved/canceled) */}
            {hoveredId === s._id && isBooked && (
              <span className="text-xs text-gray-500 dark:text-emerald-400 select-none">
                Reserved
              </span>
            )}
            {hoveredId === s._id && isCanceled && (
              <span className="text-xs text-rose-500 dark:text-rose-400 select-none">
                Canceled
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SessionPicker;
