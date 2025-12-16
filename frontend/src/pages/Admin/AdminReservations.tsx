// Import React and hooks
import React, { useEffect, useMemo, useState } from 'react';
// Import shared API client
import api from '../../services/api';
// Import icons for UI
import { Calendar, Clock, CreditCard, Search, User, MapPin, Trash2 } from 'lucide-react';

// Define reservation interface based on backend
interface Reservation {
  _id: string;
  organizer: {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  };
  stadium: {
    _id: string;
    name: string;
    location?: string;
  } | string;
  sessions: Array<{
    _id: string;
    date: string;
    startTime: string;
    endTime: string;
    price: number;
  }>;
  totalPrice: number;
  isSplitPayment: boolean;
  status: string;
  createdAt: string;
  players?: Array<{
    _id: string;
    username: string;
    email: string;
    avatar?: string;
  }>;
}

// Helper to attach Authorization header with JWT token
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// Export the main AdminReservations component
export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stadiums, setStadiums] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const resReservations = await api.get('/reservations', {
          headers: authHeader(),
        });
        const reservationsList: Reservation[] = Array.isArray(resReservations.data)
          ? resReservations.data
          : [];

        const resStadiums = await api.get('/stadium');
        const stadiumsList = Array.isArray(resStadiums.data)
          ? resStadiums.data
          : Array.isArray(resStadiums.data?.data)
          ? resStadiums.data.data
          : [];

        const stadiumMap: Record<string, string> = {};
        stadiumsList.forEach((s: any) => {
          if (s && s._id && s.name) {
            stadiumMap[s._id] = s.name;
          }
        });

        setStadiums(stadiumMap);
        setReservations(reservationsList);
      } catch (e: any) {
        console.error('Error fetching reservations:', e);
        const errorMessage =
          e?.response?.data?.message || e?.message || 'Failed to load reservations';
        setError(errorMessage);
        setReservations([]);
        setStadiums({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStadiumName = (reservation: Reservation): string => {
    try {
      if (!reservation) {
        return 'Unknown';
      }
      if (typeof reservation.stadium === 'object' && reservation.stadium?.name) {
        return reservation.stadium.name;
      }
      if (typeof reservation.stadium === 'string') {
        return stadiums[reservation.stadium] || 'Unknown Stadium';
      }
      return 'Unknown';
    } catch (err) {
      console.error('Error getting stadium name:', err);
      return 'Unknown';
    }
  };

  const getTimeRange = (reservation: Reservation): string => {
    try {
      if (!reservation || !reservation.sessions || reservation.sessions.length === 0) {
        return 'N/A';
      }

      if (reservation.sessions.length === 1) {
        const s = reservation.sessions[0];
        if (!s || !s.startTime || !s.endTime) return 'N/A';
        return `${s.startTime} - ${s.endTime}`;
      }

      const sorted = [...reservation.sessions]
        .filter((s) => s && s.startTime)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
      if (sorted.length === 0) return 'N/A';
      return `${sorted[0].startTime} - ${sorted[sorted.length - 1].endTime} (${reservation.sessions.length} sessions)`;
    } catch (err) {
      console.error('Error getting time range:', err);
      return 'N/A';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'N/A';
    }
  };

  const displayed = useMemo(() => {
    if (!Array.isArray(reservations) || reservations.length === 0) {
      return [];
    }

    if (!search.trim()) return reservations;

    const q = search.trim().toLowerCase();
    return reservations.filter((r) => {
      if (!r || !r.organizer) return false;
      try {
        const username = r.organizer?.username?.toLowerCase() || '';
        const email = r.organizer?.email?.toLowerCase() || '';
        const stadiumName = getStadiumName(r).toLowerCase();
        const paymentMode = r.isSplitPayment ? 'split' : 'all';

        return (
          username.includes(q) ||
          email.includes(q) ||
          stadiumName.includes(q) ||
          paymentMode.includes(q)
        );
      } catch (err) {
        console.error('Error filtering reservation:', err);
        return false;
      }
    });
  }, [reservations, search, stadiums]);

  const deleteReservation = async (reservationId: string) => {
    const confirmMessage =
      'Are you sure you want to delete this reservation? This action cannot be undone.';
    const ok = window.confirm(confirmMessage);
    if (!ok) return;

    try {
      setLoading(true);
      setError(null);

      await api.delete(`/reservations/${reservationId}`, {
        headers: authHeader(),
      });

      try {
        const resReservations = await api.get('/reservations', {
          headers: authHeader(),
        });
        const reservationsList: Reservation[] = Array.isArray(resReservations.data)
          ? resReservations.data
          : [];
        setReservations(reservationsList);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to refresh reservations');
      }
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to delete reservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-700">Reservations</h1>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by user, email, stadium, or payment mode..."
          className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600">Loading reservations...</div>
        </div>
      )}

      {!loading && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-left text-sm text-gray-700">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Stadium</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Payment Mode</th>
                <th className="px-4 py-3">Total Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {displayed && displayed.length > 0
                ? displayed.map((reservation) => {
                    if (!reservation || !reservation._id) return null;

                    const stadiumName = getStadiumName(reservation);
                    const timeRange = getTimeRange(reservation);
                    const reservationDate =
                      reservation.sessions && reservation.sessions.length > 0
                        ? formatDate(reservation.sessions[0].date)
                        : 'N/A';

                    return (
                      <tr key={reservation._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {reservation.organizer?.username || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {reservation.organizer?.email || 'N/A'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-gray-400" />
                            <span className="font-medium text-gray-900">{stadiumName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-gray-400" />
                            {reservationDate}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-400" />
                            <span className="text-sm">{timeRange}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <CreditCard size={14} className="text-gray-400" />
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                !reservation.isSplitPayment
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {!reservation.isSplitPayment ? 'Total Price' : 'Split Payment'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-semibold">
                          {typeof reservation.totalPrice === 'number'
                            ? reservation.totalPrice.toFixed(2)
                            : '0.00'}{' '}
                          €
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              reservation.status === 'confirmed'
                                ? 'bg-green-100 text-green-700'
                                : reservation.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {reservation.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => deleteReservation(reservation._id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Reservation"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                : null}

              {(!displayed || displayed.length === 0) && (
                <tr>
                  <td className="px-4 py-8 text-center text-gray-500" colSpan={9}>
                    {search
                      ? 'No reservations found matching your search.'
                      : 'No reservations found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
