import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "warning";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // auto close after 3s
    return () => clearTimeout(timer);
  }, [onClose]);

  const style =
    type === "success"
      ? "bg-emerald-100/90 border-emerald-400 text-emerald-800"
      : type === "error"
      ? "bg-red-100/90 border-red-400 text-red-800"
      : "bg-yellow-100/90 border-yellow-400 text-yellow-800";

  const Icon =
    type === "success" ? CheckCircle : type === "error" ? XCircle : AlertTriangle;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-[9999] flex gap-3 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-xl border ${style}`}
      >

        <Icon className="w-5 h-5" />
        <span className="font-medium">{message}</span>
      </motion.div>
    </AnimatePresence>
  );
};

export default Toast;
