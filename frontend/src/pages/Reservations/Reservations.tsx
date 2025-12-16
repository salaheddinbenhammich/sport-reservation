import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { Skeleton } from "../../components/Skeleton";
import ReservationCard from "./ReservationCard";
import EmptyState from "../../components/EmptyState";
import ReservationDetailsPanel from "./ReservationDetailsPanel";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";

interface Session {
  _id: string;
  startTime: string;
  endTime: string;
  price: number;
}

interface Reservation {
  id: string;
  stadiumName: string;
  coverImage: string;
  stadiumImages: string[];
  date: string;
  timeSlots: string[];
  totalPrice: number;
  status: "confirmed" | "pending" | "cancelled";
  organizer: string;
  isPaid?: boolean;
  sessions?: Session[];
  players?: string[];
  paymentMode?: "all" | "split";
  perPerson?: number;
}

const Reservations: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reservationsPerPage = 6;
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/reservations/user/${user?._id}`);
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.reservations || [];

        const formatted = data.map((res: any) => {
          const stadium = res.stadium || {};
          const organizer = res.organizer || {};
          const sessions = (res.sessions || []).sort(
            (a: any, b: any) => a.startTime.localeCompare(b.startTime)
          );

          let mergedTimeSlots: string[] = [];
          if (sessions.length > 0) {
            const firstStart = sessions[0].startTime;
            const lastEnd = sessions[sessions.length - 1].endTime;
            mergedTimeSlots = [`${firstStart}–${lastEnd}`];
          }

          const isOrganizer = organizer?._id === user?._id;
          const organizerName = isOrganizer
            ? "YOU"
            : organizer?.username || "Unknown Organizer";

          const imgs: string[] =
            stadium.images && stadium.images.length > 0
              ? stadium.images
              : ["https://via.placeholder.com/300x200?text=No+Image"];

          return {
            id: res._id,
            stadiumName: stadium.name || "Unknown Stadium",
            coverImage: imgs[0],
            stadiumImages: imgs,
            date:
              sessions.length > 0
                ? new Date(sessions[0].date).toISOString()
                : new Date().toISOString(),
            timeSlots: mergedTimeSlots,
            totalPrice: res.totalPrice || 0,
            status: res.status || "pending",
            organizer: organizerName,
            isPaid:
              Array.isArray(res.paidParticipants) &&
              res.paidParticipants.includes(user?._id),
            sessions: sessions.map((s: any) => ({
              _id: s._id,
              startTime: s.startTime,
              endTime: s.endTime,
              price: s.price,
            })),
            players: (res.players || []).map((p: any) => p.username),
            paymentMode: res.isSplitPayment ? "split" : "all",
            perPerson:
              res.isSplitPayment && (res.players?.length || 0) >= 0
                ? (res.totalPrice || 0) / ((res.players?.length || 0) + 1)
                : undefined,
          };
        });

        setReservations(formatted);
      } catch (error) {
        console.error("❌ Error fetching reservations:", error);
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchReservations();
  }, [user]);

  // Pay Now redirect
  const handlePayNow = (reservationId: string) => {
    navigate(`/payment/${reservationId}`);
  };

  // Details modal
  const handleDetailsClick = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setDetailsOpen(true);
  };

  // Pagination
  const totalPages = Math.ceil(reservations.length / reservationsPerPage);
  const startIndex = (currentPage - 1) * reservationsPerPage;
  const currentReservations = reservations.slice(
    startIndex,
    startIndex + reservationsPerPage
  );

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <div className="min-h-screen text-gray-800 dark:text-emerald-100 transition-colors duration-500 bg-gradient-to-b from-emerald-50 via-white to-gray-50 dark:from-emerald-950 dark:via-black dark:to-emerald-950">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mb-8 text-center">
          My Reservations
        </h1>

        {/* LOADING STATE */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-emerald-900/40 rounded-3xl shadow-md overflow-hidden border border-emerald-100 dark:border-emerald-800"
              >
                <Skeleton className="h-[160px] w-full rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="w-3/4 h-5" />
                    <Skeleton className="w-1/2 h-4" />
                    <Skeleton className="w-20 h-6 rounded-full" />
                  </div>
              </div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* PAGINATED CARDS */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentReservations.map((r) => (
                <ReservationCard
                  key={r.id}
                  stadiumName={r.stadiumName}
                  stadiumImage={r.coverImage}
                  date={r.date}
                  timeSlots={r.timeSlots}
                  totalPrice={r.totalPrice}
                  status={r.status}
                  organizer={r.organizer}
                  isPaid={r.isPaid}
                  onPayNow={() => handlePayNow(r.id)}
                  onDetailsClick={() => handleDetailsClick(r)}
                />
              ))}
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="mt-8 flex justify-center">
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            </div>
          </>
        )}
      </main>

      {/* DETAILS PANEL */}
      {selectedReservation && (
        <ReservationDetailsPanel
          open={detailsOpen}
          onClose={() => setDetailsOpen(false)}
          stadiumName={selectedReservation.stadiumName}
          stadiumImage={selectedReservation.stadiumImages}
          date={selectedReservation.date}
          organizer={selectedReservation.organizer}
          sessions={selectedReservation.sessions || []}
          totalPrice={selectedReservation.totalPrice}
          paymentMode={selectedReservation.paymentMode}
          perPerson={selectedReservation.perPerson}
          players={selectedReservation.players || []}
          status={selectedReservation.status}
          isPaid={selectedReservation.isPaid}
          onPayNow={() => handlePayNow(selectedReservation.id)}
          reservationId={selectedReservation?.id}
        />
      )}

      <Footer />
    </div>
  );
};

export default Reservations;
