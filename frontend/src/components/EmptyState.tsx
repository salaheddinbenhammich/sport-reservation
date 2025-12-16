import React from "react";
import { useNavigate } from "react-router-dom";
import localGif from "../assets/no-reservation.gif";


interface EmptyStateProps {
  title?: string;
  subtitle?: string;
  gifSrc?: string;
  buttonText?: string;
  buttonLink?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "Ooow! No reservations yet ⚽",
  subtitle = "Your football journey is just beginning — book your first match now!",
  buttonText = "Explore Stadiums",
  buttonLink = "/stadiums",
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center text-center animate-fade-in">
      <img
        src={localGif}
        alt="No reservations"
        className="w-64 h-64 object-contain opacity-90"
      />
      <h2 className="text-2xl font-bold text-emerald-700 mb-2">{title}</h2>
      <p className="text-neutral-600 mb-6">{subtitle}</p>
      <button
        onClick={() => navigate(buttonLink)}
        className="px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold shadow hover:bg-emerald-700 transition"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default EmptyState;
