import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";


const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Stadiums", path: "/stadiums" },
    { label: "Reservations", path: "/reservations" },
    { label: "About Us", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed z-50 w-full border-b shadow-xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border-emerald-800/50">
      <div className="flex items-center justify-between px-6 py-4 mx-auto max-w-7xl">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src="/images/logo1.png" alt="GoalTime" className="w-40 h-10 rounded-lg" />
        </motion.div>

        {/* Desktop Links */}
        <div className="items-center hidden gap-1 md:flex">
          {navLinks.map(({ label, path }) => (
            <Link key={path} to={path}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(path)
                    ? "text-white"
                    : "text-emerald-100/70 hover:text-white"
                }`}
              >
                {label}
                {isActive(path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-emerald-700/50 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-3">

          {/* Theme Toggle */}
          <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 transition-all border rounded-full border-emerald-700/50 bg-emerald-800/40 hover:bg-emerald-700/40 text-emerald-100"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </motion.button>


          {/* Username */}
          {user && !loading && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden text-sm font-medium sm:inline text-emerald-100"
            >
              {user.username}
            </motion.span>
          )}

          {/* Profile Button */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center justify-center w-10 h-10 gap-2 overflow-hidden text-white transition-all border rounded-full shadow-lg bg-gradient-to-br from-emerald-600 to-emerald-700 md:w-auto md:h-auto md:px-3 md:py-2 md:rounded-xl hover:from-emerald-500 hover:to-emerald-600 border-emerald-500/50"
            >
              {user && user.avatar ? (
                <img
                  src={
                    user.avatar.startsWith("http")
                      ? user.avatar
                      : `${
                          import.meta.env.VITE_API_URL || "http://localhost:3000"
                        }${user.avatar}`
                  }
                  alt="Profile"
                  className="object-cover w-full h-full rounded-full md:w-6 md:h-6"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png";
                  }}
                />
              ) : (
                <User size={20} />
              )}
              <ChevronDown className="hidden w-4 h-4 md:block" />
            </motion.button>

            {/* Dropdown of the profile button*/}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 w-48 mt-3 overflow-hidden border shadow-2xl bg-gradient-to-br from-emerald-900 to-emerald-950 border-emerald-700/50 rounded-xl"
                >
                  {loading ? (
                    <div className="px-4 py-3 text-sm text-center text-emerald-200">
                      Loading...
                    </div>
                  ) : !user ? (
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/login");
                      }}
                      className="block w-full px-4 py-3 text-center transition-colors text-emerald-100 hover:bg-emerald-800/50"
                    >
                      Sign In
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/profile");
                        }}
                        className="block w-full px-4 py-3 text-left transition-colors border-b text-emerald-100 hover:bg-emerald-800/50 border-emerald-800/50"
                      >
                        My Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-3 text-left transition-colors text-emerald-100 hover:bg-red-900/30 hover:text-red-300"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-emerald-100 hover:text-white"
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t md:hidden bg-gradient-to-b from-emerald-900 to-emerald-950 border-emerald-800/50"
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map(({ label, path }) => (
                <Link key={path} to={path} onClick={() => setMenuOpen(false)}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className={`block px-4 py-3 rounded-lg transition-colors ${
                      isActive(path)
                        ? "bg-emerald-700/50 text-white font-medium"
                        : "text-emerald-100/70 hover:bg-emerald-800/30 hover:text-white"
                    }`}
                  >
                    {label}
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
