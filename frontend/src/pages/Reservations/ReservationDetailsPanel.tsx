import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  EuroIcon,
  CreditCard,
  CheckCircle2,
  Hourglass,
  Printer,
} from "lucide-react";
import { generateReservationPDF } from "../../services/pdfService";
import api from "../../services/api";

export type Session = {
  _id: string;
  startTime: string;
  endTime: string;
  price: number;
};

interface ReservationDetailsPanelProps {
  reservationId: string;
  open: boolean;
  onClose: () => void;
  sessions: Session[];
  totalPrice: number;
  date: string;
  stadiumName: string;
  stadiumImage?: string | string[];
  organizer: string;
  players?: string[];
  paymentMode?: "all" | "split";
  perPerson?: number;
  status?: "confirmed" | "pending" | "cancelled";
  isPaid?: boolean;
  onPayNow?: () => void;
}

const turfGlow =
  "shadow-[0_0_0_1px_rgba(16,185,129,.25),0_6px_30px_-8px_rgba(16,185,129,.35),inset_0_0_40px_-20px_rgba(16,185,129,.4)]";

const formatSlot = (start: string, end: string) => `${start}–${end}`;

const ReservationDetailsPanel: React.FC<ReservationDetailsPanelProps> = ({
  reservationId,
  open,
  onClose,
  sessions,
  totalPrice,
  date,
  stadiumName,
  stadiumImage,
  organizer,
  players = [],
  paymentMode,
  perPerson,
  status,
  isPaid,
  onPayNow,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 🧾 Generate receipt PDF from backend data
  const handlePrintReceipt = async () => {
    try {
      const { data } = await api.get(`/reservations/${reservationId}`);
      generateReservationPDF({
        stadiumName: data.stadium?.name || stadiumName,
        stadiumImage: data.stadium?.images?.[0] || stadiumImage,
        organizer: data.organizer?.username || organizer,
        organizerEmail: data.organizer?.email,
        players:
          data.players?.map((p: any) => ({
            name: p.username,
            email: p.email,
          })) || players,
        sessions:
          data.sessions?.map((s: any) => ({
            startTime: s.startTime,
            endTime: s.endTime,
            price: s.price,
          })) || sessions,
        totalPrice: data.totalPrice || totalPrice,
        date: data.sessions?.[0]?.date || date,
        stadiumLocation: data.stadium?.location,
        bookingReference: data.bookingReference,
        status: data.status,
        paymentMode: data.isSplitPayment ? "split" : "all",
      });
    } catch (error) {
      console.error("Error fetching reservation or generating PDF:", error);
    }
  };

  // ESC key to close
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            ref={backdropRef}
            onMouseDown={handleBackdropClick}
            className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* PANEL */}
          <motion.div
            className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.aside
              role="dialog"
              aria-modal="true"
              className="pointer-events-auto rounded-3xl overflow-hidden w-[95%] max-w-[650px] h-[92vh] border backdrop-blur-2xl transition-colors 
                         bg-white/95 text-neutral-900 border-emerald-400/40 
                         dark:bg-neutral-950 dark:text-white dark:border-white/10"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
            >
              {/* HEADER */}
              <div className="sticky top-0 flex justify-between items-center px-5 py-4 border-b backdrop-blur-xl border-emerald-600/20 bg-white/70 dark:border-white/10 dark:bg-neutral-900/70">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-xl grid place-items-center ${turfGlow} bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20`}
                  >
                    <ShieldCheck />
                  </div>

                  <div>
                    <div className="text-sm uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
                      Reservation Details
                    </div>

                    <div className="text-base font-semibold flex items-center gap-3">
                      {stadiumName}

                      {/* STATUS BADGE */}
                      {status && (
                        <span
                          className={`flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border  
                            ${
                              status === "confirmed"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                                : status === "pending"
                                ? "bg-amber-100 text-amber-700 border-amber-300"
                                : "bg-rose-100 text-rose-700 border-rose-300"
                            }`}
                        >
                          {status === "confirmed" ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : status === "pending" ? (
                            <Hourglass className="h-3.5 w-3.5" />
                          ) : (
                            <X className="h-3.5 w-3.5" />
                          )}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      )}

                      {/* PRINT BUTTON */}
                      {status === "confirmed" && (
                        <button
                          onClick={handlePrintReceipt}
                          className="flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-full border 
                                     border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200 
                                     dark:border-emerald-700 dark:bg-emerald-800/50 dark:text-emerald-200 
                                     dark:hover:bg-emerald-700/60 transition"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Print Receipt
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="h-9 w-9 grid place-items-center rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 
                             dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition"
                >
                  <X />
                </button>
              </div>

              {/* CONTENT */}
              <div className="px-5 pb-8 pt-6 overflow-y-auto space-y-6 h-[calc(92vh-70px)]">
                {/* IMAGES + MAP */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div
                    className="sm:w-2/3 rounded-2xl overflow-hidden border border-emerald-400/40 shadow-lg bg-white dark:bg-neutral-900"
                    style={{ height: "230px" }}
                  >
                    <div className="relative w-full h-full group overflow-hidden">
                      <div
                        className="flex w-full h-full transition-transform duration-500 ease-in-out"
                        style={{
                          transform: `translateX(-${currentIndex * 100}%)`,
                        }}
                      >
                        {(Array.isArray(stadiumImage)
                          ? stadiumImage
                          : [stadiumImage]
                        ).map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`${stadiumName} ${idx + 1}`}
                            className="w-full h-full object-cover flex-shrink-0"
                          />
                        ))}
                      </div>
                      {Array.isArray(stadiumImage) &&
                        stadiumImage.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex((prev) =>
                                  prev === 0
                                    ? stadiumImage.length - 1
                                    : prev - 1
                                );
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentIndex((prev) =>
                                  prev ===
                                  (stadiumImage as string[]).length - 1
                                    ? 0
                                    : prev + 1
                                );
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </>
                        )}
                    </div>
                  </div>

                  <div
                    className="sm:w-1/3 rounded-2xl overflow-hidden border border-emerald-400/40 shadow-lg bg-white dark:bg-neutral-900"
                    style={{ height: "230px" }}
                  >
                    <iframe
                      title="Google Maps"
                      src={`https://www.google.com/maps?q=${encodeURIComponent(
                        stadiumName
                      )}&output=embed`}
                      className="w-full h-full border-0"
                      loading="lazy"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>

                {/* ORGANIZER */}
                <div className="rounded-2xl border p-4 border-emerald-400/40 bg-white dark:border-white/10 dark:bg-neutral-900">
                  <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-200">
                    <ShieldCheck className="h-5" /> Organizer
                  </div>
                  <p className="mt-2 text-sm text-neutral-700 dark:text-white">
                    {organizer}
                  </p>
                </div>

                {/* PLAYERS */}
                <div className="rounded-2xl border p-4 border-emerald-400/40 bg-white dark:border-white/10 dark:bg-neutral-900">
                  <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-200">
                    <Users className="h-5" /> Players Invited
                  </div>

                  {players.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {players.map((p) => (
                        <span
                          key={p}
                          className="rounded-full px-3 py-1 text-xs border bg-emerald-50 border-emerald-300 text-neutral-700 dark:bg-neutral-800 dark:border-white/10 dark:text-white"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm italic text-gray-500 dark:text-neutral-400">
                      None
                    </p>
                  )}
                </div>

                {/* SESSIONS DETAILS */}
                <div
                  className={`rounded-2xl border p-4 ${turfGlow} border-emerald-400/40 bg-white dark:border-emerald-500/20 dark:bg-neutral-900`}
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
                      <CalendarIcon className="h-4" />
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                    <span className="flex items-center gap-2 font-medium text-emerald-700 dark:text-emerald-300">
                      <Clock className="h-4" />
                      {sessions.length} session
                      {sessions.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sessions.map((s) => (
                      <li
                        key={s._id}
                        className="rounded-xl px-3 py-2 flex justify-between text-sm border border-emerald-400/30 bg-white text-neutral-700 dark:border-white/10 dark:bg-neutral-800 dark:text-white"
                      >
                        {formatSlot(s.startTime, s.endTime)}
                        <span className="font-semibold inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                          <EuroIcon className="h-4 w-4" />
                          {s.price.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 pt-3 border-t flex justify-between items-center font-medium border-emerald-200 text-neutral-700 dark:border-white/10 dark:text-white">
                    Total:
                    <span className="text-lg font-bold inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                      <EuroIcon className="h-5 w-5" />
                      {totalPrice.toFixed(2)}
                    </span>
                  </div>

                  {/* SPLIT PAYMENT */}
                  {paymentMode === "split" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className={`mt-4 rounded-2xl border p-4 ${turfGlow} border-emerald-400/40 bg-emerald-50 text-neutral-800 dark:border-emerald-500/20 dark:bg-neutral-900 dark:text-white`}
                    >
                      <div className="flex items-center gap-2 font-semibold mb-1">
                        <CreditCard className="h-5 w-5 text-emerald-600" />
                        <span>
                          Organizer chose to{" "}
                          <span className="text-emerald-700 font-bold dark:text-emerald-300">
                            split payment
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-neutral-700 dark:text-neutral-400">
                          Your share of the total amount
                        </p>
                        <div className="text-lg font-bold flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                          <EuroIcon className="h-5 w-5" />
                          {perPerson ? perPerson.toFixed(2) : "—"}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* PAYMENT PROMPT */}
                  {status === "pending" && !isPaid && (
                    <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-neutral-700 dark:text-neutral-300">
                      <span>
                        {paymentMode === "split"
                          ? "You did not pay your share yet."
                          : "You didn’t pay yet for this reservation."}
                      </span>
                      <button
                        onClick={onPayNow}
                        className="ml-auto px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 dark:hover:bg-emerald-500 shadow transition"
                      >
                        Pay Now
                      </button>
                    </div>
                  )}

                  {/* ALREADY PAID MESSAGE */}
                  {status === "pending" && isPaid && paymentMode === "split" && (
                    <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300 font-medium">
                      Don’t worry, you already paid your amount. We’re just
                      waiting for your friends to finish.
                    </p>
                  )}
                </div>
              </div>
            </motion.aside>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReservationDetailsPanel;
