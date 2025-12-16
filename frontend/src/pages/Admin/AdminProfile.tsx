// Import React and hooks for state and lifecycle
import React, { useEffect, useState } from 'react';
// Import shared API client to communicate with backend
import api from '../../services/api';
// Import icons for minor UI embellishments
import { Pencil, Camera, MapPin } from 'lucide-react';
// Import auth context to update global user after profile change
import { useAuth } from '../../context/AuthContext';

// Define TypeScript interface for the profile payload
interface ProfileData {
  _id?: string;
  username: string;
  email: string;
  phoneNumber?: string;
  birthDate?: string;
  role?: string;
  country?: string;
  city?: string;
  postalCode?: string;
}

// Helper to include Authorization header with stored JWT
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// Export the AdminProfile component
export default function AdminProfile() {
  const [form, setForm] = useState<ProfileData>({ username: '', email: '' });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [editingPersonal, setEditingPersonal] = useState<boolean>(false);
  const [editingAddress, setEditingAddress] = useState<boolean>(false);
  const { setUser } = useAuth();

  const getFirstName = () => {
    if (!form.username) return '';
    const parts = form.username.split(' ');
    return parts[0] || '';
  };

  const getLastName = () => {
    if (!form.username) return '';
    const parts = form.username.split(' ');
    return parts.slice(1).join(' ') || '';
  };

  const formatDateForDisplay = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const res = await api.get('/users/me', { headers: authHeader() });
        const data = res.data as ProfileData;
        setForm({
          _id: data._id,
          username: data.username || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          birthDate: data.birthDate ? String(data.birthDate).slice(0, 10) : '',
          role: data.role,
          country: data.country || 'United Kingdom',
          city: data.city || 'Leeds',
          postalCode: data.postalCode || '',
        });
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const onFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFirstNameChange = (firstName: string) => {
    const lastName = getLastName();
    setForm((prev) => ({ ...prev, username: `${firstName} ${lastName}`.trim() }));
  };

  const handleLastNameChange = (lastName: string) => {
    const firstName = getFirstName();
    setForm((prev) => ({ ...prev, username: `${firstName} ${lastName}`.trim() }));
  };

  const saveProfile = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload: any = {
        username: form.username,
        email: form.email,
        phoneNumber: form.phoneNumber || undefined,
        birthDate: form.birthDate || undefined,
      };
      if (password || confirmPassword) {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        payload.password = password;
        payload.confirmPassword = confirmPassword;
      }

      const res = await api.patch('/users/me', payload, { headers: authHeader() });
      const updated = res?.data || form;
      setUser((prev) => (prev ? { ...prev, username: updated.username, email: updated.email } : prev));

      setSuccess('Profile updated successfully');
      setPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile();
  };

  if (loading) {
    return <div className="text-gray-600">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-green-700">My Profile</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-3xl font-bold">
              {form.username ? form.username.charAt(0).toUpperCase() : 'A'}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
              title="Change profile picture"
            >
              <Camera size={16} className="text-gray-600" />
            </button>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{form.username || 'Admin User'}</h2>
            <p className="text-gray-600 mt-1 capitalize">{form.role || 'Admin'}</p>
            <div className="flex items-center gap-2 mt-2 text-gray-600">
              <MapPin size={16} />
              <span>{form.city || 'Leeds'}, {form.country || 'United Kingdom'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-green-700">Personal Information</h2>
          <button
            type="button"
            onClick={async () => {
              if (editingPersonal) {
                await saveProfile();
              }
              setEditingPersonal(!editingPersonal);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            <Pencil size={16} />
            {editingPersonal ? 'Save' : 'Edit'}
          </button>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">First Name</label>
            {editingPersonal ? (
              <input
                type="text"
                value={getFirstName()}
                onChange={(e) => handleFirstNameChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="First Name"
              />
            ) : (
              <p className="text-gray-900">{getFirstName() || '-'}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Last Name</label>
            {editingPersonal ? (
              <input
                type="text"
                value={getLastName()}
                onChange={(e) => handleLastNameChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Last Name"
              />
            ) : (
              <p className="text-gray-900">{getLastName() || '-'}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Date of Birth</label>
            {editingPersonal ? (
              <input
                name="birthDate"
                type="date"
                value={form.birthDate || ''}
                onChange={onFormChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            ) : (
              <p className="text-gray-900">{form.birthDate ? formatDateForDisplay(form.birthDate) : '-'}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            {editingPersonal ? (
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onFormChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            ) : (
              <p className="text-gray-900">{form.email || '-'}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            {editingPersonal ? (
              <input
                name="phoneNumber"
                type="tel"
                value={form.phoneNumber || ''}
                onChange={onFormChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="(+62) 821 2554-5846"
              />
            ) : (
              <p className="text-gray-900">{form.phoneNumber || '-'}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">User Role</label>
            <p className="text-gray-900 capitalize">{form.role || 'Admin'}</p>
          </div>
        </form>
      </div>

      {/* Address */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-green-700">Address</h2>
          <button
            type="button"
            onClick={async () => {
              if (editingAddress) {
                await saveProfile();
              }
              setEditingAddress(!editingAddress);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            <Pencil size={16} />
            {editingAddress ? 'Save' : 'Edit'}
          </button>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Country</label>
            {editingAddress ? (
              <input
                name="country"
                type="text"
                value={form.country || ''}
                onChange={onFormChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Enter your country"
              />
            ) : (
              <p className="text-gray-900">{form.country || '-'}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">City</label>
            {editingAddress ? (
              <input
                name="city"
                type="text"
                value={form.city || ''}
                onChange={onFormChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="Enter your city"
              />
            ) : (
              <p className="text-gray-900">{form.city || '-'}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Postal Code</label>
            {editingAddress ? (
              <input
                name="postalCode"
                type="text"
                value={form.postalCode || ''}
                onChange={onFormChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="ERT 1254"
              />
            ) : (
              <p className="text-gray-900">{form.postalCode || '-'}</p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
