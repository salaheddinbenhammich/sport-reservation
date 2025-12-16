import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";
import logo from "../assets/logo1.png";

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
    <nav className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 shadow-xl fixed w-full z-50 border-b border-emerald-800/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="GoalTime" className="w-40 h-10 rounded-lg" />
        </motion.div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
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
                    className="absolute inset-0 bg-emerald-700/50 rounded-lg -z-10"
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
            className="p-2 rounded-full border border-emerald-700/50 bg-emerald-800/40 hover:bg-emerald-700/40 transition-all text-emerald-100"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </motion.button>


          {/* Username */}
          {user && !loading && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden sm:inline text-emerald-100 font-medium text-sm"
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
              className="flex items-center gap-2 rounded-full overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-700 text-white w-10 h-10 md:w-auto md:h-auto md:px-3 md:py-2 md:rounded-xl justify-center hover:from-emerald-500 hover:to-emerald-600 transition-all border border-emerald-500/50 shadow-lg"
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
                  className="w-full h-full object-cover rounded-full md:w-6 md:h-6"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png";
                  }}
                />
              ) : (
                <User size={20} />
              )}
              <ChevronDown className="hidden md:block w-4 h-4" />
            </motion.button>

            {/* Dropdown of the profile button*/}
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-3 w-48 bg-gradient-to-br from-emerald-900 to-emerald-950 border border-emerald-700/50 rounded-xl shadow-2xl overflow-hidden"
                >
                  {loading ? (
                    <div className="px-4 py-3 text-emerald-200 text-center text-sm">
                      Loading...
                    </div>
                  ) : !user ? (
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/login");
                      }}
                      className="block w-full px-4 py-3 text-emerald-100 hover:bg-emerald-800/50 text-center transition-colors"
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
                        className="block w-full text-left px-4 py-3 text-emerald-100 hover:bg-emerald-800/50 transition-colors border-b border-emerald-800/50"
                      >
                        My Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-emerald-100 hover:bg-red-900/30 hover:text-red-300 transition-colors"
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
            className="md:hidden overflow-hidden bg-gradient-to-b from-emerald-900 to-emerald-950 border-t border-emerald-800/50"
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
