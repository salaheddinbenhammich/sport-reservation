import React from "react";
import { useNavigate } from "react-router-dom";


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
        src="/images/no-reservation.gif"
        alt="No reservations"
        className="object-contain w-64 h-64 opacity-90"
      />
      <h2 className="mb-2 text-2xl font-bold text-emerald-700">{title}</h2>
      <p className="mb-6 text-neutral-600">{subtitle}</p>
      <button
        onClick={() => navigate(buttonLink)}
        className="px-6 py-3 font-semibold text-white transition rounded-full shadow bg-emerald-600 hover:bg-emerald-700"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default EmptyState;
