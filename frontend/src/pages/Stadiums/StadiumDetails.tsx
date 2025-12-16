import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AutoCarousel from "../../components/AutoCarousel";
import Stars from "../../components/Stars";
import Chip from "../../components/Chip";
import SectionCard from "../../components/SectionCard";
import SessionPicker from "../../components/SessionPicker";
import ArtisticCalendar from "../../components/ArtisticCalendar";
import ReservationPanel from "../Reservations/ReservationPanel";
import { Skeleton } from "../../components/Skeleton";
import { useAuth } from "../../context/AuthContext";

import {
  fetchReviews,
  fetchSessions,
  fetchStadiumDetails,
  Review,
  Session,
  StadiumDetailsDTO,
} from "../../services/stadiums";

import { MapPin, Calendar, BadgeCheck } from "lucide-react";
import api from "../../services/api";
import { useToast } from "../../hooks/useToast";

const todayISO = () => new Date().toISOString().slice(0, 10);

// helper to convert time into minutes for easy comparison
const timeToMinutes = (t: string) => {
  const m = /^(\d{1,2})(?::(\d{2}))?/.exec(t);
  if (!m) return 0;
  const hh = parseInt(m[1], 10);
  const mm = m[2] ? parseInt(m[2], 10) : 0;
  return hh * 60 + mm;
};

// formats session time slots like 10:00–11:00
const formatSlot = (start: string, end: string) => `${start}–${end}`;

// tries to find the most common time step between sessions
function inferCommonStep(sessions: Session[]): number {
  if (!sessions || sessions.length < 2) return 60;
  const sorted = [...sessions].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );
  const counts = new Map<number, number>();
  for (let i = 1; i < sorted.length; i++) {
    const diff =
      timeToMinutes(sorted[i].startTime) -
      timeToMinutes(sorted[i - 1].startTime);
    if (diff <= 0) continue;
    counts.set(diff, (counts.get(diff) || 0) + 1);
  }
  if (counts.size === 0) return 60;
  let best = 60,
    bestCount = -1;
  for (const [diff, cnt] of counts) {
    if (cnt > bestCount) {
      best = diff;
      bestCount = cnt;
    }
  }
  return best;
}

// checks if sessions selected are continuous (no gap)
function isContiguousRange(list: Session[], step: number): boolean {
  if (list.length <= 1) return true;
  for (let i = 1; i < list.length; i++) {
    const prev = timeToMinutes(list[i - 1].startTime);
    const cur = timeToMinutes(list[i].startTime);
    if (cur - prev !== step) return false;
  }
  return true;
}

const StadiumDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stadium, setStadium] = useState<StadiumDetailsDTO | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showCal, setShowCal] = useState(false);
  const { showToast, ToastContainer } = useToast();
  const [selectedDateISO, setSelectedDateISO] = useState<string>(todayISO());
  const [selectedSessions, setSelectedSessions] = useState<Session[]>([]);

  const [myRating, setMyRating] = useState<number>(0);
  const [myComment, setMyComment] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const [showReservationPanel, setShowReservationPanel] = useState(false);

  // loads stadium details, sessions and reviews
  useEffect(() => {
    let mounted = true;
    async function loadDetails() {
      if (!id) return;
      setLoading(true);
      try {
        const [details, sess, rev] = await Promise.all([
          fetchStadiumDetails(id),
          fetchSessions(id, selectedDateISO).catch(() => []),
          fetchReviews(id).catch(() => []),
        ]);

        if (!mounted) return;
        setStadium(details);
        setSessions(sess);
        setReviews(rev);
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
    return () => {
      mounted = false;
    };
  }, [id]);

  // refetch sessions when date changes
  useEffect(() => {
    if (!id) return;
    setSelectedSessions([]);
    fetchSessions(id, selectedDateISO)
      .then(setSessions)
      .catch(() => setSessions([]));
  }, [id, selectedDateISO]);

  // if redirected after login, reopen reservation panel
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reserve") === "true" && user) {
      setShowReservationPanel(true);
      params.delete("reserve");
      navigate(
        {
          search: params.toString() ? "?" + params.toString() : "",
        },
        { replace: true }
      );
    }
  }, [user, navigate]);

  const minPrice = useMemo(() => stadium?.minPrice ?? 0, [stadium]);
  const totalPrice = selectedSessions.reduce((sum, s) => sum + s.price, 0);

  // handle selection and deselection of sessions
  function handleToggleSession(session: Session) {
    setSelectedSessions((prev) => {
      const clickedId = session._id;
      const already = prev.some((s) => s._id === clickedId);
      if (already) return prev.filter((s) => s._id !== clickedId);
      if (prev.length === 0) return [session];

      const all = [...prev, session];
      const sortedSelected = [...all].sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );
      const minM = timeToMinutes(sortedSelected[0].startTime);
      const maxM = timeToMinutes(
        sortedSelected[sortedSelected.length - 1].startTime
      );

      const inWindow = [...sessions]
        .filter(
          (s) =>
            timeToMinutes(s.startTime) >= minM &&
            timeToMinutes(s.startTime) <= maxM
        )
        .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

      const step = inferCommonStep(sessions);

      // block selection if not contiguous by time
      if (!isContiguousRange(inWindow, step)) return prev;

      // block selection if there's any reserved session in between
      const hasReservedInMiddle = inWindow.some((s) => s.status === "booked");
      if (hasReservedInMiddle) return prev;

      return inWindow;
    });
  }

  // handles review submission
  async function handleSubmitReview() {
    if (!id || myRating <= 0) return;
    setSubmitting(true);
    try {
      const optimistic: Review = {
        id: `temp-${Date.now()}`,
        userName: "You",
        rating: myRating,
        comment: myComment,
        createdAt: new Date().toISOString(),
      };
      setReviews((r) => [optimistic, ...r]);
      setMyRating(0);
      setMyComment("");
    } finally {
      setSubmitting(false);
    }
  }

  // handles reservation confirmation and sends it to backend
  async function handleConfirmReservation(payload: {
    dateISO: string;
    sessions: Session[];
    emails: string[];
    paymentMode: "all" | "split";
  }) {
    try {
      if (!user) {
        navigate(`/login?redirect=/stadiums/${id}`);
        return;
      }

      const body = {
        stadium: id,
        sessions: payload.sessions.map((s) => s._id),
        emails: payload.emails,
        isSplitPayment: payload.paymentMode === "split",
      };

      const res = await api.post("/reservations", body);

      if (res.data && res.data._id) {
        // immediately refresh sessions to mark newly reserved ones as booked
        fetchSessions(id, selectedDateISO)
          .then(setSessions)
          .catch(() => setSessions([]));

        navigate(`/payment/${res.data._id}`);
      } else {
        showToast("reservation created, but missing id", "warning");
      }
    } catch (error: any) {
      console.error("reservation failed:", error);
      showToast("reservation failed. please try again.", "error");
    }
  }

  // loading state with skeletons
  if (loading || !stadium) {
    return (
      <>
        <Navbar />
        <ToastContainer />
        <div className="mx-auto max-w-6xl px-4 pt-20 pb-12 space-y-8 animate-fade-in dark:bg-gradient-to-br dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-950">
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div className="space-y-3">
              <Skeleton variant="text" className="w-4/5 h-7" />
              <div className="flex gap-4">
                <Skeleton variant="text" className="w-24 h-4" />
                <Skeleton variant="text" className="w-32 h-4" />
              </div>
            </div>
            <Skeleton className="w-40 h-8 rounded-2xl" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Skeleton className="h-[360px] md:h-[400px] rounded-3xl lg:col-span-2" />
            <Skeleton className="h-[360px] md:h-[400px] rounded-3xl" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
              <Skeleton className="h-[140px] rounded-3xl" />
              <Skeleton className="h-[120px] rounded-3xl" />
              <Skeleton className="h-[220px] rounded-3xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-[300px] rounded-3xl" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
    
      <div className="min-h-screen bg-gradient-to-b  dark:from-emerald-950 dark:via-emerald-900 dark:to-emerald-950 transition-colors duration-500">

        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mx-auto max-w-6xl px-4 pt-20 pb-12 text-gray-800 dark:text-emerald-100 transition-colors duration-500"
        >
          {/* stadium title, rating and location */}
          <div className="mb-4 flex flex-wrap items-center justify-between pt-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-300">
                {stadium.name}
              </h1>
              <div className="mt-1 flex items-center gap-3 text-neutral-600 dark:text-emerald-200">
                <div className="flex items-center gap-2">
                  <Stars value={stadium.ratingAvg || 0} />
                  <span className="text-sm font-medium dark:text-gray-300">
                    {(stadium.ratingAvg || 0).toFixed(1)} ({stadium.ratingCount || 0})
                  </span>
                </div>

                <div className="flex items-center gap-1 text-sm dark:text-gray-300">
                  <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  {stadium.location}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-emerald-900/50 px-3 py-2 text-sm text-neutral-700 dark:text-emerald-100">
              Starting from{" "}
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                € {minPrice.toFixed(2)}
              </span>{" "}
              / hour
            </div>
          </div>

          {/* image gallery and map */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
              <AutoCarousel
                images={stadium.images}
                className="h-[360px] md:h-[400px] rounded-3xl overflow-hidden shadow-xl border border-emerald-300 dark:border-emerald-800"
              />
            </div>

            <div className="h-[360px] md:h-[400px] rounded-3xl overflow-hidden shadow-xl border border-emerald-300 dark:border-emerald-800">
              <iframe
                title="Google Maps"
                className="w-full h-full border-0 rounded-3xl"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                src={`https://www.google.com/maps?q=${encodeURIComponent(stadium.location)}&output=embed`}
              ></iframe>
            </div>
          </div>

          {/* main two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* left column */}
            <div className="flex flex-col gap-6 ">
              <SectionCard
                title="About this stadium"
                className="border-emerald-300 dark:border-emerald-800 bg-white  dark:bg-emerald-900/40 shadow-md rounded-3xl"
              >
                <p className="text-neutral-700 dark:text-emerald-100 leading-relaxed">
                  {stadium.description}
                </p>
              </SectionCard>

              <SectionCard
                title="Amenities"
                className="border-emerald-300 dark:border-emerald-800 bg-white dark:bg-emerald-900/40 shadow-md rounded-3xl"
              >
                <div className="flex flex-wrap gap-2">
                  {stadium.amenities && typeof stadium.amenities === "object" ? (
                    Object.entries(stadium.amenities).map(([key]) => (
                      <Chip
                        key={key}
                        className="bg-emerald-50 dark:bg-emerald-800/50 border-emerald-300 dark:border-emerald-700"
                      >
                        <span className="capitalize text-emerald-700 dark:text-emerald-200">
                          {key.replaceAll("_", " ")}
                        </span>
                      </Chip>
                    ))
                  ) : (
                    <span className="text-sm text-neutral-500 dark:text-emerald-400">
                      no amenities listed
                    </span>
                  )}
                </div>
              </SectionCard>

              <SectionCard
                title="What players say"
                className="border-emerald-300 dark:border-emerald-800 bg-white dark:bg-emerald-900/40 shadow-md rounded-3xl"
              >
                {reviews.length === 0 ? (
                  <div className="text-sm text-neutral-500 dark:text-emerald-400">
                    no reviews yet. be the first
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {reviews.map((r) => (
                      <li
                        key={r.id}
                        className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-emerald-950/40 p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-semibold text-emerald-700 dark:text-emerald-300">
                            {r.userName}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-emerald-400">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Stars value={r.rating} size={16} />
                        {r.comment && (
                          <p className="mt-2 text-neutral-600 dark:text-emerald-100 text-sm">
                            {r.comment}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {/* user review form */}
                <div className="mt-6 border-t border-emerald-200 dark:border-emerald-800 pt-6">
                  <div className="mb-2 font-semibold text-emerald-700 dark:text-emerald-300">
                    rate this stadium
                  </div>
                  <Stars value={myRating} onChange={setMyRating} size={22} />
                  <textarea
                    value={myComment}
                    onChange={(e) => setMyComment(e.target.value)}
                    placeholder="share your opinion"
                    className="mt-3 w-full rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-emerald-950 px-3 py-2 focus:ring-2 focus:ring-emerald-600 placeholder:text-neutral-400 dark:placeholder:text-emerald-500"
                    rows={3}
                  />
                  <button
                    disabled={submitting || myRating <= 0}
                    onClick={handleSubmitReview}
                    className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 text-white px-4 py-2 font-medium shadow hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <BadgeCheck className="h-4 w-4" /> submit review
                  </button>
                </div>
              </SectionCard>
            </div>

            {/* right column */}
            <div className="min-w-[340px]">
              <SectionCard className="border-emerald-300 dark:border-emerald-800 bg-white dark:bg-emerald-900/40 shadow-lg rounded-3xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-lg text-emerald-700 dark:text-emerald-100">
                    select & reserve
                  </h3>

                  <button
                    onClick={() => setShowCal((s) => !s)}
                    className="px-3 py-1 rounded-xl bg-white dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 shadow-sm hover:bg-emerald-50 dark:hover:bg-emerald-900 text-sm flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-200"
                  >
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedDateISO).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </button>
                </div>

                {showCal && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    className="absolute z-[9999] bg-white dark:bg-emerald-950 rounded-3xl shadow-lg border-emerald-300 dark:border-emerald-800"
                    style={{ width: 260, right: "10px", top: "50px" }}
                  >
                    <ArtisticCalendar
                      valueISO={selectedDateISO}
                      onChange={(newISO) => {
                        setSelectedDateISO(newISO);
                        setShowCal(false);
                        setSelectedSessions([]);
                      }}
                      disablePastDates
                    />
                  </motion.div>
                )}

                <SessionPicker
                  sessions={sessions}
                  selectedSessions={selectedSessions}
                  onToggle={handleToggleSession}
                />

                <div className="my-4 border-t border-emerald-200 dark:border-emerald-800 pt-2 flex justify-between items-center">
                  <button
                    onClick={() => setSelectedSessions([])}
                    disabled={selectedSessions.length === 0}
                    className="text-xs font-medium rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-emerald-950 px-3 py-1 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    clear
                  </button>

                  <div className="text-sm flex gap-2 items-center">
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {selectedSessions.length} session
                      {selectedSessions.length !== 1 ? "s" : ""}
                    </span>
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                      € {totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                  {selectedSessions.length > 0
                    ? [...selectedSessions]
                        .sort(
                          (a, b) =>
                            timeToMinutes(a.startTime) -
                            timeToMinutes(b.startTime)
                        )
                        .map((s) => formatSlot(s.startTime, s.endTime))
                        .join(", ")
                    : "choose one or multiple sessions"}
                </div>

                <button
                  disabled={selectedSessions.length === 0}
                  onClick={() => {
                    if (!user) {
                      navigate(`/login?redirect=/stadiums/${id}&reserve=true`);
                      return;
                    }
                    setShowReservationPanel(true);
                  }}
                  className="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-2 text-white font-semibold shadow hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  reserve now
                </button>
              </SectionCard>
            </div>
          </div>
        </motion.main>
      </div>
      <ReservationPanel
        open={showReservationPanel}
        onClose={() => setShowReservationPanel(false)}
        sessions={selectedSessions}
        totalPrice={totalPrice}
        selectedDateISO={selectedDateISO}
        stadiumName={stadium.name}
        onConfirm={handleConfirmReservation}
      />

      <Footer />
    </>
  );
};

export default StadiumDetails;
