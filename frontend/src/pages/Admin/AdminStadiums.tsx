// Import React and hooks for state management and lifecycle
import React, { useEffect, useMemo, useState } from "react";
// Import shared API client
import api from "../../services/api";
// Import icons for UI actions
import { Plus, Search, Pencil, Trash2, Save, X } from "lucide-react";

// Define the stadium type according to backend entity
interface AdminStadium {
  _id: string;
  name: string;
  location: string;
  capacity: number;
  description?: string;
  isAvailable?: boolean;
  images?: string[];
  amenities?: Record<string, string>;
}

// Helper to attach auth header with JWT token
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// Export the main component
export default function AdminStadiums() {
  const [stadiums, setStadiums] = useState<AdminStadium[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editing, setEditing] = useState<AdminStadium | null>(null);
  const [form, setForm] = useState({
    name: "",
    location: "",
    capacity: 0,
    description: "",
    imageUrl: "",
    amenities: {} as Record<string, string>,
    date: "",
    startTime: "",
    endTime: "",
    price: 0,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const commonAmenities = [
    { key: "parking", label: "Parking" },
    { key: "wifi", label: "WiFi" },
    { key: "lights", label: "Lights" },
    { key: "showers", label: "Showers" },
    { key: "lockers", label: "Lockers" },
    { key: "cafe", label: "Cafe/Restaurant" },
    { key: "security", label: "Security" },
    { key: "firstAid", label: "First Aid" },
  ];

  useEffect(() => {
    const fetchStadiums = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/stadium");
        const list: AdminStadium[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        setStadiums(list);
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to load stadiums");
      } finally {
        setLoading(false);
      }
    };
    fetchStadiums();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stadiums;
    return stadiums.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.location.toLowerCase().includes(q)
    );
  }, [search, stadiums]);

  const openCreate = () => {
    setIsEditing(false);
    setEditing(null);
    setForm({
      name: "",
      location: "",
      capacity: 0,
      description: "",
      imageUrl: "",
      amenities: {},
      date: "",
      startTime: "",
      endTime: "",
      price: 0,
    });
    setImagePreview(null);
    setFormOpen(true);
  };

  const openEdit = (s: AdminStadium) => {
    setIsEditing(true);
    setEditing(s);
    setForm({
      name: s.name,
      location: s.location,
      capacity: s.capacity,
      description: s.description || "",
      imageUrl: s.images && s.images.length > 0 ? s.images[0] : "",
      amenities: s.amenities || {},
      date: "",
      startTime: "",
      endTime: "",
      price: 0,
    });
    setImagePreview(s.images && s.images.length > 0 ? s.images[0] : null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setIsEditing(false);
    setEditing(null);
  };

  const onFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "capacity" || name === "price" ? Number(value) : value,
    }));
    if (name === "imageUrl") {
      setImagePreview(value || null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setForm((prev) => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleAmenity = (key: string, value: string) => {
    setForm((prev) => {
      const newAmenities = { ...prev.amenities };
      if (newAmenities[key] === value) {
        delete newAmenities[key];
      } else {
        newAmenities[key] = value;
      }
      return { ...prev, amenities: newAmenities };
    });
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isEditing && editing) {
        const images: string[] = [];
        if (form.imageUrl && form.imageUrl.trim()) {
          images.push(form.imageUrl.trim());
        } else if (editing.images && editing.images.length > 0) {
          images.push(...editing.images);
        } else {
          images.push(
            `https://source.unsplash.com/640x360/?stadium,football,${encodeURIComponent(
              form.name
            )}-${Math.random().toString(36).substr(2, 5)}`
          );
        }

        await api.patch(
          `/stadium/${editing._id}`,
          {
            name: form.name,
            location: form.location,
            capacity: form.capacity,
            description: form.description || undefined,
            images: images,
            amenities:
              Object.keys(form.amenities).length > 0
                ? form.amenities
                : undefined,
          },
          { headers: authHeader() }
        );
      } else {
        const images: string[] = [];
        if (form.imageUrl && form.imageUrl.trim()) {
          images.push(form.imageUrl.trim());
        } else {
          images.push(
            `https://source.unsplash.com/640x360/?stadium,football,${encodeURIComponent(
              form.name
            )}-${Math.random().toString(36).substr(2, 5)}`
          );
        }

        const createRes = await api.post(
          "/stadium",
          {
            name: form.name,
            location: form.location,
            capacity: form.capacity,
            description: form.description || undefined,
            images: images,
            amenities:
              Object.keys(form.amenities).length > 0
                ? form.amenities
                : undefined,
          },
          { headers: authHeader() }
        );

        const newStadiumId = createRes.data?._id || createRes.data?.id;
        if (
          newStadiumId &&
          form.date &&
          form.startTime &&
          form.endTime &&
          form.price > 0
        ) {
          try {
            await api.post(
              "/sessions",
              {
                stadium: newStadiumId,
                date: form.date,
                startTime: form.startTime,
                endTime: form.endTime,
                price: form.price,
                status: "available",
              },
              { headers: authHeader() }
            );
          } catch (sessionError: any) {
            console.error("Failed to create session:", sessionError);
            setError(
              `Stadium created but session creation failed: ${
                sessionError?.response?.data?.message || "Unknown error"
              }`
            );
          }
        }
      }

      const res = await api.get("/stadium");
      const list: AdminStadium[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setStadiums(list);
      closeForm();
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to save stadium");
    } finally {
      setLoading(false);
    }
  };

  const removeStadium = async (id: string) => {
    const ok = window.confirm("Are you sure you want to delete this stadium?");
    if (!ok) return;
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/stadium/${id}`, { headers: authHeader() });
      setStadiums((prev) => prev.filter((s) => s._id !== id));
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to delete stadium");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-green-700">Stadiums</h1>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transition-all"
        >
          <Plus size={16} />
          New Stadium
        </button>
      </div>

      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or location..."
          className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md">
          {error}
        </div>
      )}

      {loading && <div className="text-gray-600">Loading...</div>}

      {!loading && (
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full">
            <thead className="bg-gray-50 text-left text-sm text-gray-700">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filtered.map((s) => {
                const available = s.isAvailable ?? true;
                const badgeClass = available
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-700";
                return (
                  <tr key={s._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{s.location}</td>
                    <td className="px-4 py-3 text-gray-700">{s.capacity}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${badgeClass}`}
                      >
                        {available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEdit(s)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border hover:bg-green-50 hover:text-green-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} /> Edit
                        </button>
                        <button
                          onClick={() => removeStadium(s._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-8 text-center text-gray-500"
                    colSpan={5}
                  >
                    No stadiums found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal-like form */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg p-6 space-y-4 my-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? "Edit Stadium" : "Create Stadium"}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={submitForm} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm text-gray-700">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={onFormChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="e.g., City Arena"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-700">Location</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={onFormChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="e.g., Downtown, NY"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-700">Capacity</label>
                <input
                  name="capacity"
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={onFormChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="e.g., 20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm text-gray-700">
                  Description (optional)
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                  placeholder="Short description..."
                />
              </div>

              {/* ... */}
              {/* Image field */}
              <div className="space-y-1">
                <label className="text-sm text-gray-700">Stadium Image</label>
                <div className="space-y-2">
                  <input
                    name="imageUrl"
                    type="url"
                    value={form.imageUrl}
                    onChange={onFormChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="https://example.com/image.jpg"
                  />

                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="block w-full px-3 py-2 border border-dashed border-gray-300 rounded-md text-center text-sm text-gray-600 hover:border-green-600 hover:text-green-600 cursor-pointer transition-colors"
                    >
                      Or click to upload an image file
                    </label>
                  </div>

                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Preview:</p>
                      <img
                        src={imagePreview}
                        alt="Stadium preview"
                        className="w-full h-48 object-cover rounded-md border border-gray-200"
                        onError={() => {
                          setImagePreview(null);
                          setError(
                            "Failed to load image. Please check the URL or try uploading a file."
                          );
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setForm((prev) => ({ ...prev, imageUrl: "" }));
                        }}
                        className="mt-1 text-xs text-red-600 hover:text-red-700"
                      >
                        Remove image
                      </button>
                    </div>
                  )}

                  {!imagePreview && (
                    <p className="text-xs text-gray-500">
                      Leave empty to auto-generate an image, or provide an image
                      URL or upload a file.
                    </p>
                  )}
                </div>
              </div>

              {/* Amenities Section */}
              <div className="space-y-1">
                <label className="text-sm text-gray-700">Amenities</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {commonAmenities.map((amenity) => {
                    const isEnabled = form.amenities[amenity.key] === "yes";
                    return (
                      <button
                        key={amenity.key}
                        type="button"
                        onClick={() => toggleAmenity(amenity.key, "yes")}
                        className={`px-3 py-2 rounded-md border text-sm font-medium transition ${
                          isEnabled
                            ? "border-green-600 bg-green-500/10 text-green-700"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {amenity.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Click amenities to toggle them on/off for this stadium.
                </p>
              </div>

              {/* Session Section - Only when creating */}
              {!isEditing && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Session Details
                  </h3>

                  <div className="space-y-1 mb-3">
                    <label className="text-sm text-gray-700">
                      Session Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={onFormChange}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="space-y-1">
                      <label className="text-sm text-gray-700">
                        Start Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="startTime"
                        type="time"
                        value={form.startTime}
                        onChange={onFormChange}
                        required
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm text-gray-700">
                        End Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="endTime"
                        type="time"
                        value={form.endTime}
                        onChange={onFormChange}
                        required
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    <label className="text-sm text-gray-700">
                      Price (€) <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="price"
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.price}
                      onChange={onFormChange}
                      required
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
                      placeholder="e.g., 50.00"
                    />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 rounded-md border hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transition-all"
                >
                  <Save size={16} />
                  {isEditing ? "Save Changes" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
