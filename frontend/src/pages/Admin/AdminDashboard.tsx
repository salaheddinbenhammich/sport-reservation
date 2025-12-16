// Import React hooks
import React, { useState, useEffect } from 'react';
// Import API service to make HTTP requests to backend
import api from '../../services/api';
// Import icons from lucide-react
import { Users, MapPin, TrendingUp, ArrowRight, Calendar, DollarSign, Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Define interface for dashboard statistics
interface DashboardStats {
  totalUsers: number;
  totalStadiums: number;
  activeReservations: number;
  totalRevenue: number;
}

interface RecentReservation {
  _id: string;
  organizer: {
    username: string;
    email: string;
  };
  stadium: {
    name: string;
  };
  totalPrice: number;
  status: string;
  createdAt: string;
}

interface StadiumItem {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  isAvailable?: boolean;
}

// Export the AdminDashboard component
export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStadiums: 0,
    activeReservations: 0,
    totalRevenue: 0,
  });
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([]);
  const [stadiums, setStadiums] = useState<StadiumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [usersRes, stadiumsRes, reservationsRes] = await Promise.all([
          api.get('/users', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
          api.get('/stadium'),
          api.get('/reservations', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }),
        ]);

        const users = usersRes.data;
        const stadiumsData = stadiumsRes.data;
        const reservations = Array.isArray(reservationsRes.data) ? reservationsRes.data : [];

        // Process stadiums data
        const stadiumsList = Array.isArray(stadiumsData?.data)
          ? stadiumsData.data
          : Array.isArray(stadiumsData)
          ? stadiumsData
          : [];
        
        const processedStadiums = stadiumsList.slice(0, 6).map((s: any) => ({
          _id: s._id,
          name: s.name || 'Unknown',
          location: s.location || 'N/A',
          capacity: s.capacity || 0,
          isAvailable: s.isAvailable !== false,
        }));

        // Calculate active reservations (confirmed status)
        const active = reservations.filter((r: any) => r.status === 'confirmed' || r.status === 'pending').length;
        
        // Calculate total revenue
        const revenue = reservations
          .filter((r: any) => r.status === 'confirmed')
          .reduce((sum: number, r: any) => sum + (r.totalPrice || 0), 0);

        // Get recent reservations (last 5)
        const recent = reservations
          .slice(0, 5)
          .map((r: any) => ({
            _id: r._id,
            organizer: r.organizer || { username: 'Unknown', email: '' },
            stadium: typeof r.stadium === 'object' ? r.stadium : { name: 'Unknown' },
            totalPrice: r.totalPrice || 0,
            status: r.status || 'pending',
            createdAt: r.createdAt || new Date().toISOString(),
          }));

        setStats({
          totalUsers: Array.isArray(users) ? users.length : 0,
          totalStadiums: stadiumsList.length,
          activeReservations: active,
          totalRevenue: revenue,
        });
        setRecentReservations(recent);
        setStadiums(processedStadiums);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  // Small stat cards for 2x2 grid
  const smallStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      iconBg: 'bg-purple-500',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.totalRevenue / 1000).toFixed(1)}k`,
      icon: DollarSign,
      iconBg: 'bg-pink-500',
    },
    {
      title: 'Active Reservations',
      value: stats.activeReservations,
      icon: TrendingUp,
      iconBg: 'bg-orange-500',
    },
    {
      title: 'Total Stadiums',
      value: stats.totalStadiums,
      icon: MapPin,
      iconBg: 'bg-teal-500',
    },
  ];

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Gradient Background - Green theme */}
      <div className="fixed inset-0 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 -z-10" />
      
      {/* Main Container Panel - Glassmorphism */}
      <div className="relative z-10">
        <div className="p-8 border shadow-2xl bg-white/60 backdrop-blur-xl rounded-3xl border-white/30">
          {/* Header - Matching CoachPro Design */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm text-gray-600">
                  Welcome back, {user?.username || 'Admin'} 👋
                </p>
                <h1 className="text-4xl font-bold text-gray-800">Dashboard</h1>
              </div>
              
              {/* Right side - Search, Notifications, and User Profile */}
              <div className="flex items-center gap-4">
                {/* Search Icon */}
                <button
                  className="p-2 text-gray-600 transition-colors rounded-lg hover:bg-white/50 hover:text-green-600"
                  title="Search"
                >
                  <Search size={20} />
                </button>
                
                {/* Notification Bell Icon */}
                <button
                  className="relative p-2 text-gray-600 transition-colors rounded-lg hover:bg-white/50 hover:text-green-600"
                  title="Notifications"
                >
                  <Bell size={20} />
                  {/* Notification badge */}
                  <span className="absolute w-2 h-2 bg-green-500 rounded-full top-1 right-1"></span>
                </button>
                
                {/* User Profile */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 font-semibold text-white rounded-full shadow-lg bg-gradient-to-br from-green-400 to-emerald-500">
                    {user?.username?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <span className="hidden text-sm font-medium text-gray-700 md:block">
                    {user?.username || 'Admin'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Row - Two Large Cards */}
          <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-2">
            {/* Recent Reservations Card */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/40 min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Recent Reservations</h2>
                <a
                  href="/admin/reservations"
                  className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"
                >
                  View all
                  <ArrowRight size={14} />
                </a>
              </div>
              <div className="space-y-3">
                {recentReservations.length > 0 ? (
                  recentReservations.map((res) => (
                    <div
                      key={res._id}
                      className="p-3 transition-all border border-gray-100 rounded-lg bg-white/60 hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {res.organizer.username}
                          </p>
                          <p className="text-xs text-gray-600">{res.stadium.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">${res.totalPrice.toFixed(2)}</p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              res.status === 'confirmed'
                                ? 'bg-green-100 text-green-700'
                                : res.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {res.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-sm text-center text-gray-500">No recent reservations</p>
                )}
              </div>
            </div>

            {/* Statistics Card */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/40 min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Reservations Statistics</h2>
                <a
                  href="/admin/reservations"
                  className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"
                >
                  View all statistics
                  <ArrowRight size={14} />
                </a>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Reservations</span>
                  <span className="text-2xl font-bold text-gray-800">{stats.activeReservations}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Confirmed</span>
                    <div className="flex-1 mx-4">
                      <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: '75%' }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">75%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pending</span>
                    <div className="flex-1 mx-4">
                      <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{ width: '20%' }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">20%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Cancelled</span>
                    <div className="flex-1 mx-4">
                      <div className="h-2 overflow-hidden bg-gray-200 rounded-full">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{ width: '5%' }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">5%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row - Large Card Left, 4 Small Cards Right */}
          <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
            {/* Stadiums List Card */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/40 min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Stadiums</h2>
                <a
                  href="/admin/stadiums"
                  className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700"
                >
                  View all
                  <ArrowRight size={14} />
                </a>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-5 gap-4 pb-2 text-xs font-semibold text-gray-600 border-b border-gray-200">
                  <div>#</div>
                  <div>STADIUM</div>
                  <div>LOCATION</div>
                  <div>CAPACITY</div>
                  <div>STATUS</div>
                </div>
                {stadiums.length > 0 ? (
                  stadiums.map((stadium, index) => (
                    <div
                      key={stadium._id}
                      className={`grid grid-cols-5 gap-4 py-3 px-2 rounded-lg text-sm ${
                        index % 2 === 0 ? 'bg-gray-50/50' : 'bg-transparent'
                      }`}
                    >
                      <div className="font-semibold text-gray-700">{index + 1}</div>
                      <div className="font-medium text-gray-800">{stadium.name}</div>
                      <div className="text-gray-600">{stadium.location}</div>
                      <div className="text-gray-600">{stadium.capacity}</div>
                      <div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            stadium.isAvailable
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {stadium.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-sm text-center text-gray-500">
                    No stadiums found
                  </div>
                )}
              </div>
            </div>

            {/* 4 Small Stat Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              {smallStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-4 border border-white/40 min-h-[180px] flex flex-col justify-center"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className={`${stat.iconBg} w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-md`}>
                        <Icon className="text-white" size={20} />
                      </div>
                      <p className="mb-1 text-2xl font-bold text-gray-800">{stat.value}</p>
                      <p className="text-xs font-medium text-gray-600">{stat.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Row - Quick Actions / Don't Forget Card */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/40 min-h-[200px] flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="mb-2 text-xl font-bold text-gray-800">DON'T FORGET</h2>
                <p className="mb-4 text-gray-600">Review and manage pending reservations</p>
                <a
                  href="/admin/reservations"
                  className="inline-flex items-center gap-2 px-6 py-3 font-medium text-white transition-all bg-green-600 rounded-full shadow-lg hover:bg-green-700 hover:shadow-xl"
                >
                  <Calendar size={18} />
                  Go to Reservations
                </a>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
