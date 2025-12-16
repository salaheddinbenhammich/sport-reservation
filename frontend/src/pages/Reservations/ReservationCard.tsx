import React from "react";
import {
  Calendar,
  Clock,
  Euro,
  User,
  CheckCircle2,
  XCircle,
  Hourglass,
  Info,
} from "lucide-react";

interface ReservationCardProps {
  stadiumName: string;
  stadiumImage: string;
  date: string;
  timeSlots: string[];
  totalPrice: number;
  status: "confirmed" | "pending" | "cancelled";
  organizer: string;
  isPaid?: boolean;
  onDetailsClick?: () => void;
  onPayNow?: () => void;
}

const statusColors = {
  confirmed:
    "text-emerald-700 bg-emerald-100 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-900/40 dark:border-emerald-700",
  pending:
    "text-amber-700 bg-amber-100 border-amber-300 dark:text-amber-300 dark:bg-amber-900/40 dark:border-amber-700",
  cancelled:
    "text-rose-700 bg-rose-100 border-rose-300 dark:text-rose-300 dark:bg-rose-900/40 dark:border-rose-700",
};

const ReservationCard: React.FC<ReservationCardProps> = ({
  stadiumName,
  stadiumImage,
  date,
  timeSlots,
  totalPrice,
  status,
  organizer,
  isPaid,
  onDetailsClick,
  onPayNow,
}) => {
  const StatusIcon =
    status === "confirmed"
      ? CheckCircle2
      : status === "pending"
      ? Hourglass
      : XCircle;

  return (
    <div className="bg-white dark:bg-emerald-950/40 rounded-3xl shadow-md border border-emerald-100 dark:border-emerald-800 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* 🏟️ Image */}
      <div className="h-40 w-full overflow-hidden">
        <img
          src={stadiumImage}
          alt={stadiumName}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* 📄 Content */}
      <div className="p-5 flex justify-between items-stretch gap-6">
        {/* LEFT SIDE – Info */}
        <div className="flex flex-col text-sm text-neutral-700 gap-1 flex-1 dark:text-emerald-100">
          <h3 className="font-semibold text-lg text-emerald-700 mb-0 dark:bg-gradient-to-r dark:from-emerald-300 dark:via-teal-400 dark:to-emerald-200 dark:bg-clip-text dark:text-transparent">
            {stadiumName}
          </h3>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold bg-gradient-to-r from-emerald-900 to-teal-900 bg-clip-text text-transparent dark:from-emerald-300 dark:to-teal-400">
              Organizer:
            </span>
            <span className="font-medium text-gray-800 dark:text-emerald-100">
              {organizer}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-gray-800 dark:text-emerald-100">
              {new Date(date).toLocaleDateString("en-GB", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-gray-800 dark:text-emerald-100">
              {timeSlots.join(", ")}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-auto">
            <Euro className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-emerald-700 dark:bg-gradient-to-r dark:from-emerald-300 dark:via-teal-400 dark:to-emerald-200 dark:bg-clip-text dark:text-transparent">
              {totalPrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* RIGHT SIDE – Status + Payment + Details (Details fixed at bottom) */}
        <div className="relative flex flex-col items-end justify-between min-h-[130px]">
          {/* Top Section - Status + Payment */}
          <div className="flex flex-col items-end gap-1">
            {/* Status */}
            <div
              className={`flex items-center gap-1 px-3 py-1 text-xs font-medium border rounded-full ${statusColors[status]}`}
            >
              <StatusIcon className="h-4 w-4" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>

            {/* Payment Info */}
            {status === "pending" && (
              <>
                {isPaid ? (
                  <p className="text-emerald-700 dark:text-emerald-300 text-xs font-medium flex flex-wrap items-center gap-1 text-right leading-snug break-words max-w-[140px]">
                    Don’t worry, you already paid your amount 😉
                  </p>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-amber-700 dark:text-amber-400 text-xs font-medium">
                      You didn’t pay yet 😕
                    </p>

                    <button
                      onClick={onPayNow}
                      className="flex items-center gap-1 px-3 py-1 text-xs font-medium border border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-100 bg-emerald-100 dark:bg-emerald-800/40 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-700/60 transition-all"
                    >
                      Pay Now ?
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom Section - Details Button (Now blue theme) */}
          <button
            onClick={onDetailsClick}
            className="self-end flex items-center gap-1 px-3 py-1 text-xs font-medium border border-sky-300 text-sky-700 bg-sky-50 rounded-full hover:bg-sky-100 transition-all dark:border-emerald-600 dark:text-emerald-100 dark:bg-emerald-800/40 dark:hover:bg-emerald-700/60"
          >
            <Info className="w-4 h-4 text-sky-700 dark:text-emerald-300" />
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationCard;
