import React, { useState, useRef, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { Skeleton } from "../../components/Skeleton";
import {
  Settings,
  LogOut,
  User,
  Lock,
  Calendar as CalendarIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ArtisticCalendar from "../../components/ArtisticCalendar";
import { updateUserProfile } from "../../services/userService";
import { useToastContext } from "../../context/ToastProvider";
import bgImage from "../../assets/test.jpg";

// Format phone numbers nicely
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return "";
  let cleaned = phone.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+33")) {
    const rest = cleaned.slice(3);
    return `+33 ${rest.replace(
      /(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/,
      "$1 $2 $3 $4 $5"
    )}`;
  }

  if (cleaned.startsWith("0")) {
    const rest = cleaned.slice(1);
    return `0${rest.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, " $1 $2 $3 $4")}`;
  }

  return phone;
};

const turfGlow =
  "shadow-[0_0_0_1px_rgba(16,185,129,.25),0_6px_30px_-8px_rgba(16,185,129,.35),inset_0_0_40px_-20px_rgba(16,185,129,.4)]";

const Profile: React.FC = () => {
  const { user, setUser, logout, loading } = useAuth();
  const { showToast } = useToastContext();

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col overflow-hidden">
        {/* 🌆 Full-page blurred background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${bgImage})`,
            filter: "blur(20px) brightness(0.85)",
            transform: "scale(1.1)",
          }}
        ></motion.div>

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />

          <div className="flex-1 flex items-center justify-center px-6 pt-28 pb-2">
            <div className="flex flex-col md:flex-row items-center justify-center gap-10 w-full max-w-6xl">
              {/* LEFT SIDEBAR SKELETON */}
              <div
                className={`rounded-3xl border border-emerald-300/40 dark:border-emerald-800 bg-white/95 dark:bg-emerald-950/60 backdrop-blur-2xl shadow-lg w-80 overflow-hidden ${turfGlow}`}
              >
                <div className="flex flex-col items-center p-6 border-b border-emerald-200/50 dark:border-emerald-800">
                  <Skeleton className="w-20 h-20 rounded-full mb-4" />
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <div className="flex flex-col p-4 space-y-3">
                  <Skeleton className="h-10 rounded-xl" />
                  <Skeleton className="h-10 rounded-xl" />
                  <Skeleton className="h-10 rounded-xl" />
                  <Skeleton className="h-10 rounded-xl bg-red-100" />
                </div>
              </div>

              {/* RIGHT PANEL SKELETON */}
              <div
                className={`rounded-3xl border border-emerald-300/40 dark:border-emerald-800 bg-white/95 dark:bg-emerald-950/60 backdrop-blur-2xl shadow-lg w-full max-w-xl p-8 ${turfGlow}`}
              >
                <div className="flex items-center gap-4 mb-8">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>

                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center border-b border-emerald-100 pb-3"
                    >
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-8 gap-4">
                  <Skeleton className="w-1/2 h-10 rounded-2xl" />
                  <Skeleton className="w-1/2 h-10 rounded-2xl" />
                </div>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    );
  }

  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");
  const [editMode, setEditMode] = useState(false);
  const [showCal, setShowCal] = useState(false);

  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCal(false);
      }
    };
    if (showCal) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCal]);

  const [calendarPosition, setCalendarPosition] = useState<"top" | "bottom">(
    "bottom"
  );

  useEffect(() => {
    if (showCal && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setCalendarPosition(spaceBelow < 350 && spaceAbove > spaceBelow ? "top" : "bottom");
    }
  }, [showCal]);
  const createdAt = user?.createdAt || "";

  const [formData, setFormData] = useState({
    username: user?.username ?? "",
    email: user?.email ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    birthDate: user?.birthDate ? user.birthDate.split("T")[0] : "",
    profileImage:
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        username: user.username || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        birthDate: user.birthDate ? user.birthDate.split("T")[0] : "",
        profileImage: user.avatar
          ? user.avatar.startsWith("http")
            ? user.avatar
            : `${import.meta.env.VITE_API_URL}${user.avatar}`
          : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
      }));
    }
  }, [user]);

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z])(?=.*[\W_]).{6,}$/;

  const [passwordErrors, setPasswordErrors] = useState({ new: "" });

  const validateNewPassword = () => {
    const value = passwordData.new.trim();
    if (value && !passwordRegex.test(value)) {
      if (value.length < 6) {
        setPasswordErrors({
          new: "Password must be at least 6 characters long",
        });
      } else {
        setPasswordErrors({
          new: "Password must include uppercase, lowercase, number, and special character",
        });
      }
    } else {
      setPasswordErrors({ new: "" });
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        username: formData.username,
        phoneNumber: formData.phoneNumber,
        birthDate: formData.birthDate,
      };

      const updatedUser = await updateUserProfile(payload);
      setUser(updatedUser);
      setEditMode(false);
      showToast("Profile updated successfully!", "success");
    } catch (error: any) {
      console.error(error);
      showToast(
        error.response?.data?.message || "Failed to update profile.",
        "error"
      );
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      username: user?.username,
      email: user?.email,
      phoneNumber: user?.phoneNumber,
      birthDate: user?.birthDate ? user.birthDate.split("T")[0] : "",
      profileImage: user?.avatar
        ? user.avatar.startsWith("http")
          ? user.avatar
          : `${import.meta.env.VITE_API_URL}${user.avatar}`
        : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
    });
  };

  const handleProfilePictureChange = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, profileImage: previewUrl }));

      const formDataToSend = new FormData();
      formDataToSend.append("avatar", file);

      try {
        const updatedUser = await updateUserProfile(formDataToSend);
        setUser((prev) => ({ ...prev, avatar: updatedUser.avatar }));
        showToast("Profile picture updated successfully!", "success");
      } catch (error: any) {
        console.error(error);
        showToast(
          error.response?.data?.message || "Failed to upload avatar.",
          "error"
        );
      }
    };

    input.click();
  };

  const passwordsMatch =
    passwordData.confirm === "" || passwordData.new === passwordData.confirm;

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* 🌆 Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-black to-emerald-900 dark:from-emerald-950 dark:via-black dark:to-emerald-900"
        style={{
          backgroundImage: `url(${bgImage})`,
          filter: "blur(6px) brightness(0.85)",
        }}
      ></motion.div>

      {/* Page layout */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <div className="flex-1 flex items-center justify-center px-6 pt-28 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="flex flex-col md:flex-row items-center justify-center gap-10 w-full max-w-6xl"
          >
            {/* ===== LEFT SIDEBAR ===== */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className={`rounded-3xl border border-emerald-300/40 dark:border-emerald-800 bg-white/95 dark:bg-emerald-950/60 backdrop-blur-2xl shadow-lg w-80 overflow-hidden ${turfGlow}`}
            >
              <div className="flex flex-col items-center p-6 border-b border-emerald-200/50 dark:border-emerald-800">
                <img
                  src={formData.profileImage}
                  alt="User"
                  className="w-20 h-20 rounded-full object-cover border-4 border-emerald-300/60 cursor-pointer"
                />
                <h3 className="mt-4 font-semibold text-gray-800 dark:text-emerald-100 text-lg">
                  {formData.username}
                </h3>
                <p className="text-sm text-gray-500 dark:text-emerald-300">{formData.email}</p>
              </div>
              <div className="flex flex-col p-4">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`flex items-center justify-between p-3 rounded-xl transition font-medium ${
                    activeTab === "profile"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "hover:bg-emerald-50 text-gray-700 dark:hover:bg-emerald-900/30 dark:text-emerald-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5" />
                    <span>My Profile</span>
                  </div>
                  <span>›</span>
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex items-center justify-between p-3 rounded-xl transition font-medium ${
                    activeTab === "settings"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "hover:bg-emerald-50 text-gray-700 dark:hover:bg-emerald-900/30 dark:text-emerald-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </div>
                  <span>›</span>
                </button>

                <button
                  onClick={() => navigate("/reservations")}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-gray-700 dark:text-emerald-100 font-medium transition"
                >
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5" />
                    <span>Reservations</span>
                  </div>
                  <span>›</span>
                </button>

                <button
                  onClick={async () => {
                    await logout();
                    setTimeout(() => navigate("/"), 0.0001);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-700 dark:text-red-400 font-medium transition"
                >
                  <div className="flex items-center gap-3 text-red-500 dark:text-red-400">
                    <LogOut className="w-5 h-5" />
                    <span>Log Out</span>
                  </div>
                </button>
              </div>
            </motion.div>

            {/* ===== RIGHT PANEL ===== */}
            <AnimatePresence mode="wait">
              {activeTab === "profile" ? (
                /* ---------------- PROFILE TAB ---------------- */
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-3xl border border-emerald-300/40 dark:border-emerald-800 bg-white/95 dark:bg-emerald-950/60 backdrop-blur-2xl shadow-lg w-full max-w-xl p-8 ${turfGlow}`}
                >
                  <div className="flex items-center gap-4 mb-8">
                    <img
                      src={
                        user?.avatar?.startsWith("http")
                          ? user.avatar
                          : user?.avatar
                          ? `${import.meta.env.VITE_API_URL}${user.avatar}`
                          : "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
                      }
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-4 border-emerald-300/60 cursor-pointer"
                      onClick={handleProfilePictureChange}
                      title="Change picture"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-emerald-100 text-lg">
                        {formData.username}
                      </h3>
                      <p className="text-gray-500 dark:text-emerald-300 text-sm">
                        {formData.email}
                      </p>
                    </div>
                  </div>

                  {/* ==== Profile information fields ==== */}
                  <div className="space-y-6">
                    {[{ label: "Username", key: "username" },
                      { label: "Phone Number", key: "phoneNumber" },
                      { label: "Birth Date", key: "birthDate" }].map(
                      ({ label, key }) => (
                        <div
                          key={key}
                          className="flex justify-between items-center border-b border-emerald-100 dark:border-emerald-800 pb-3 relative"
                        >
                          <p className="text-gray-500 dark:text-emerald-300 text-sm">
                            {label}
                          </p>
                          {editMode ? (
                            key === "birthDate" ? (
                              <div
                                ref={inputRef}
                                className="relative flex flex-col items-end w-52"
                              >
                                <div className="flex items-center w-full">
                                  <input
                                    type="text"
                                    readOnly
                                    value={
                                      formData.birthDate
                                        ? new Date(formData.birthDate).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          })
                                        : ""
                                    }
                                    onClick={() => setShowCal((s) => !s)}
                                    className="font-secular font-semibold text-gray-800 dark:text-emerald-100 text-right bg-transparent focus:outline-none cursor-pointer w-full"
                                  />
                                  <CalendarIcon
                                    className="w-5 h-5 text-emerald-600 ml-2 cursor-pointer"
                                    onClick={() => setShowCal((s) => !s)}
                                  />
                                </div>

                                <AnimatePresence>
                                  {showCal && (
                                    <motion.div
                                      ref={calendarRef}
                                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                      animate={{ opacity: 1, y: 8, scale: 1 }}
                                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                      transition={{ duration: 0.25 }}
                                      className={`w-64 absolute z-50 bg-white dark:bg-emerald-950 rounded-3xl shadow-xl overflow-hidden right-0 ${
                                        calendarPosition === "bottom"
                                          ? "top-full mt-2 origin-top-right"
                                          : "bottom-full mb-2 origin-bottom-right"
                                      }`}
                                    >
                                      <ArtisticCalendar
                                        valueISO={
                                          formData.birthDate ||
                                          new Date().toISOString().slice(0, 10)
                                        }
                                        onChange={(newISO) => {
                                          setFormData((prev) => ({
                                            ...prev,
                                            birthDate: newISO,
                                          }));
                                          setShowCal(false);
                                        }}
                                      />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ) : (
                              <input
                                type="text"
                                value={formData[key as keyof typeof formData] as string}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    [key]: e.target.value,
                                  })
                                }
                                className="font-secular font-semibold text-gray-800 dark:text-emerald-100 text-right w-52 bg-transparent focus:outline-none focus:ring-0"
                              />
                            )
                          ) : (
                            <p className="font-secular font-semibold text-gray-800 dark:text-emerald-100 w-52 text-right tracking-wide">
                              {key === "birthDate" && formData.birthDate
                                ? new Date(formData.birthDate).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : key === "phoneNumber" && formData.phoneNumber
                                ? formatPhoneNumber(formData.phoneNumber)
                                : formData[key as keyof typeof formData]}
                            </p>
                          )}
                        </div>
                      )
                    )}

                    {/* Member Since */}
                    <div className="flex justify-between items-center border-b border-emerald-100 dark:border-emerald-800 pb-3">
                      <p className="text-gray-500 dark:text-emerald-300 text-sm">Member Since</p>
                      <p className="font-secular font-semibold text-gray-800 dark:text-emerald-100 w-52 text-right tracking-wide">
                        {new Date(createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {!editMode ? (
                    <button
                      onClick={() => setEditMode(true)}
                      className="mt-8 w-full bg-emerald-600 text-white py-3 rounded-2xl font-semibold hover:bg-emerald-700 transition-all shadow-md"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <div className="flex justify-between mt-8 gap-4">
                      <button
                        onClick={handleCancel}
                        className="w-1/2 bg-gray-200 dark:bg-emerald-900/50 dark:text-emerald-100 text-gray-700 py-3 rounded-2xl font-semibold hover:bg-gray-300 dark:hover:bg-emerald-900/70 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="w-1/2 bg-emerald-600 text-white py-3 rounded-2xl font-semibold hover:bg-emerald-700 transition-all"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                /* ---------------- SETTINGS TAB ---------------- */
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-3xl border border-emerald-300/40 dark:border-emerald-800 bg-white/95 dark:bg-emerald-950/60 backdrop-blur-2xl shadow-lg w-full max-w-xl p-8 ${turfGlow}`}
                >
                  <div className="flex items-center gap-3 mb-8">
                    <Lock className="w-6 h-6 text-emerald-700 dark:text-emerald-300" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-emerald-100">
                      Password Management
                    </h3>
                  </div>
                  <div className="space-y-5">
                    {["Current Password", "New Password", "Confirm Password"].map(
                      (label, index) => {
                        const field =
                          ["current", "new", "confirm"][index] as keyof typeof passwordData;
                        const isConfirm = field === "confirm";
                        const invalid =
                          isConfirm &&
                          passwordData.confirm !== "" &&
                          passwordData.new !== passwordData.confirm;

                        return (
                          <div key={field} className="flex flex-col">
                            <label className="text-gray-600 dark:text-emerald-300 mb-1 text-sm">
                              {label}
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords[field] ? "text" : "password"}
                                value={passwordData[field]}
                                onChange={(e) =>
                                  setPasswordData({
                                    ...passwordData,
                                    [field]: e.target.value,
                                  })
                                }
                                onBlur={() =>
                                  field === "new" && validateNewPassword()
                                }
                                className={`border rounded-lg px-4 py-2 w-full pr-10 focus:outline-none focus:ring-2 text-gray-800 dark:text-emerald-100 dark:bg-emerald-950/40 transition-all ${
                                  field === "new" && passwordErrors.new
                                    ? "border-red-400 focus:ring-red-400"
                                    : invalid
                                    ? "border-red-400 focus:ring-red-400"
                                    : "border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500"
                                }`}
                                placeholder="••••••••"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowPasswords((prev) => ({
                                    ...prev,
                                    [field]: !prev[field],
                                  }))
                                }
                                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                                  field === "new" && passwordErrors.new
                                    ? "text-red-500 hover:text-red-600"
                                    : invalid
                                    ? "text-red-500 hover:text-red-600"
                                    : "text-emerald-600 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200"
                                } focus:outline-none`}
                              >
                                {showPasswords[field] ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </button>
                            </div>

                            {field === "new" && passwordErrors.new && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="text-red-500 text-sm mt-1"
                              >
                                {passwordErrors.new}
                              </motion.p>
                            )}
                            {invalid && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="text-red-500 text-sm mt-1"
                              >
                                Passwords do not match
                              </motion.p>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>

                  <button
                    disabled={
                      !passwordsMatch ||
                      passwordData.new === "" ||
                      passwordData.confirm === "" ||
                      passwordData.current === ""
                    }
                    onClick={async () => {
                      try {
                        const res = await updateUserProfile({
                          currentPassword: passwordData.current,
                          newPassword: passwordData.new,
                        });
                        showToast(
                          res.message || "Password updated successfully!",
                          "success"
                        );
                        setPasswordData({ current: "", new: "", confirm: "" });
                      } catch (error: any) {
                        console.error(error);
                        showToast(
                          error.response?.data?.message ||
                            "Failed to update password.",
                          "error"
                        );
                      }
                    }}
                    className={`mt-8 w-full py-3 rounded-2xl font-semibold transition-all shadow-md ${
                      !passwordsMatch ||
                      passwordData.new === "" ||
                      passwordData.confirm === "" ||
                      passwordData.current === ""
                        ? "bg-gray-300 dark:bg-emerald-950/40 text-gray-500 cursor-not-allowed"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    Update Password
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Profile;
