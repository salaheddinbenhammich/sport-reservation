import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Users,
  ShieldCheck,
  CreditCard,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Clock,
  EuroIcon,
  CheckCircle2,
} from "lucide-react";

export type Session = {
  _id: string;
  startTime: string;
  endTime: string;
  price: number;
};

type PaymentMode = "all" | "split";

interface ReservationPanelProps {
  open: boolean;
  onClose: () => void;
  sessions: Session[];
  totalPrice: number;
  selectedDateISO: string;
  stadiumName?: string;
  onConfirm?: (payload: {
    dateISO: string;
    sessions: Session[];
    emails: string[];
    paymentMode: PaymentMode;
  }) => Promise<void> | void;
}

const formatSlot = (start: string, end: string) => `${start}–${end}`;

const emailRegex =
  /^(?:[a-zA-Z0-9_'^&\/+-])+(?:\.(?:[a-zA-Z0-9_'^&\/+-])+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

const turfGlow =
  "shadow-[0_0_0_1px_rgba(16,185,129,.25),0_6px_30px_-8px_rgba(16,185,129,.35),inset_0_0_40px_-20px_rgba(16,185,129,.4)]";

const ReservationPanel: React.FC<ReservationPanelProps> = ({
  open,
  onClose,
  sessions,
  totalPrice,
  selectedDateISO,
  stadiumName,
  onConfirm,
}) => {
  const [inputEmail, setInputEmail] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("all");
  const [processing, setProcessing] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  const teamSize = 1 + emails.length;
  const perPerson = useMemo(
    () => (paymentMode === "split" ? totalPrice / teamSize : null),
    [paymentMode, teamSize, totalPrice]
  );

  // ESC Close
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onClose]);

  // Lock scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      window.scrollTo({ top: 0 });
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  };

  function addEmail() {
    const email = inputEmail.trim();
    if (!email || !emailRegex.test(email)) return setEmailError("Invalid email");
    if (emails.includes(email)) return setEmailError("Already added");
    setEmails([...emails, email]);
    setInputEmail("");
    setEmailError(null);
  }

  function removeEmail(email: string) {
    setEmails(emails.filter((e) => e !== email));
  }

  async function handleConfirm() {
    setProcessing(true);
    await onConfirm?.({
      dateISO: selectedDateISO,
      sessions,
      emails,
      paymentMode,
    });
    setProcessing(false);
    onClose();
  }

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
              className={`
                pointer-events-auto rounded-3xl overflow-hidden
                w-[95%] max-w-[650px] h-[92vh]
                border backdrop-blur-2xl transition-colors
                bg-white/95 dark:bg-neutral-950
                text-neutral-900 dark:text-white
                border-emerald-400/40 dark:border-white/10
              `}
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
            >
              {/* HEADER */}
              <div className="sticky top-0 flex justify-between items-center px-5 py-4 border-b backdrop-blur-xl border-emerald-600/20 dark:border-white/10 bg-white/70 dark:bg-neutral-900/70">
                <div className="flex items-center gap-3">
                  <div className={`h-9 w-9 rounded-xl grid place-items-center ${turfGlow} bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700`}>
                    <ShieldCheck />
                  </div>
                  <div>
                    <div className="text-sm uppercase tracking-wide text-emerald-700 dark:text-emerald-200">
                      Reservation
                    </div>
                    <div className="text-base font-semibold">
                      {stadiumName ?? "Stadium"}
                    </div>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="h-9 w-9 grid place-items-center rounded-xl border transition border-emerald-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:bg-emerald-50 dark:hover:bg-neutral-700"
                >
                  <X />
                </button>
              </div>

              {/* CONTENT */}
              <div className="px-5 pb-8 pt-6 overflow-y-auto space-y-6 h-[calc(92vh-70px)]">
                {/* DATE + SESSIONS */}
                <div
                  className={`rounded-2xl border p-4 ${turfGlow} border-emerald-400/40 dark:border-emerald-500/20 bg-white dark:bg-neutral-900`}
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-medium">
                      <CalendarIcon className="h-4" />
                      {new Date(selectedDateISO).toLocaleDateString("en-US", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-medium">
                      <Clock className="h-4" />
                      {sessions.length} session
                      {sessions.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sessions.map((s) => (
                      <li
                        key={s._id}
                        className="rounded-xl px-3 py-2 flex justify-between text-sm border border-emerald-400/30 dark:border-white/10 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-white"
                      >
                        {formatSlot(s.startTime, s.endTime)}
                        <span className="text-emerald-700 dark:text-emerald-300 font-semibold inline-flex items-center gap-1">
                          <EuroIcon className="h-4 w-4" />
                          {s.price.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 pt-3 border-t flex justify-between items-center font-medium border-emerald-200 dark:border-white/10 text-neutral-700 dark:text-white">
                    Total:
                    <span className="text-lg font-bold inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                      <EuroIcon className="h-5 w-5" />
                      {totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* INVITE PLAYERS */}
                <div className="rounded-2xl border p-4 border-emerald-400/40 dark:border-white/10 bg-white dark:bg-neutral-900">
                  <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-200">
                    <Users className="h-5" /> Invite players
                  </div>

                  <div className="mt-3 flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 text-emerald-600 dark:text-emerald-300" />
                      <input
                        type="email"
                        value={inputEmail}
                        onChange={(e) => setInputEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addEmail()}
                        placeholder="email@example.com"
                        className="w-full rounded-xl border px-9 py-2 text-sm focus:ring-2 bg-white dark:bg-neutral-800 border-emerald-300 dark:border-neutral-700 text-neutral-800 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:ring-emerald-600/40"
                      />
                    </div>
                    <button
                      onClick={addEmail}
                      className="rounded-xl px-3 py-2 flex items-center gap-1 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white dark:text-emerald-300 border border-emerald-600 dark:border-neutral-700"
                    >
                      <Plus className="h-4" />
                      Add
                    </button>
                  </div>

                  {emailError && (
                    <p className="mt-2 text-xs text-red-500">{emailError}</p>
                  )}

                  {emails.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {emails.map((email) => (
                        <span
                          key={email}
                          className="flex items-center gap-2 rounded-full px-3 py-1 text-xs border bg-emerald-50 dark:bg-neutral-800 border-emerald-300 dark:border-white/10 text-neutral-700 dark:text-white"
                        >
                          <Mail className="h-3" />
                          {email}
                          <button
                            onClick={() => removeEmail(email)}
                            className="p-1 rounded-full text-neutral-500 hover:text-emerald-700 dark:hover:text-emerald-300"
                          >
                            <Trash2 className="h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* PAYMENT */}
                <div className="rounded-2xl border p-4 border-emerald-400/40 dark:border-white/10 bg-white dark:bg-neutral-900">
                  <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-200">
                    <CreditCard className="h-5" /> Payment
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {["all", "split"].map((mode: any) => (
                      <button
                        key={mode}
                        onClick={() => setPaymentMode(mode)}
                        className={`py-2 rounded-xl border font-medium text-sm transition
                        ${
                          paymentMode === mode
                            ? "border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-300"
                            : "border-emerald-300 bg-white dark:border-neutral-700 dark:bg-neutral-800 text-emerald-500 hover:bg-emerald-50 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {mode === "all"
                          ? "I’ll pay everything"
                          : "Split with team"}
                      </button>
                    ))}
                  </div>

                  {paymentMode === "split" && (
                    <div className="mt-3 rounded-xl px-3 py-2 text-sm border border-emerald-300 dark:border-white/10 bg-emerald-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200">
                      <div className="flex justify-between">
                        Players (you included):
                        <span className="font-semibold">{teamSize}</span>
                      </div>
                      <div className="flex justify-between font-semibold mt-2">
                        <span>Per person</span>
                        <span className="inline-flex items-center gap-1">
                          <EuroIcon className="h-4 w-4" />
                          {(perPerson ?? 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* TERMS */}
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 accent-emerald-600"
                  />
                  I agree to the{" "}
                  <span className="text-emerald-600 underline">
                    terms of reservation
                  </span>
                </label>

                {/* CONFIRM */}
                <button
                  disabled={!agreed || processing || sessions.length === 0}
                  onClick={handleConfirm}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-semibold
                  ${
                    !agreed || processing || sessions.length === 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : `bg-emerald-600 text-white hover:bg-emerald-700 border border-emerald-600 ${turfGlow}`
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {processing ? "Processing..." : "Pay & Reserve"}
                </button>

                <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                  Secure payments • Instant confirmation • Cancel free within 24h
                </p>
              </div>
            </motion.aside>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReservationPanel;
