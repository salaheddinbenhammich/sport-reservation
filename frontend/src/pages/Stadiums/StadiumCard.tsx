import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StadiumCardProps {
  stadium: {
    _id: string;
    name: string;
    location: string;
    images: string[];
    minPrice?: number | null;
  };
}

const StadiumCard: React.FC<StadiumCardProps> = ({ stadium }) => {
  const { _id, name, location, images, minPrice } = stadium;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();

  const nextImage = () => {
    resetAutoPlay();
    setCurrentIndex((prev) => (prev + 1) % Math.max(images.length, 1));
  };

  const prevImage = () => {
    resetAutoPlay();
    setCurrentIndex(
      (prev) => (prev - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1)
    );
  };

  const resetAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 1700);
  };

  useEffect(() => {
    if (isHovered) resetAutoPlay();
    else if (intervalRef.current) clearInterval(intervalRef.current);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, images.length]);

  return (
    <div
      className="bg-white dark:bg-emerald-900/40 rounded-3xl shadow-md border border-emerald-100 dark:border-emerald-800 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/stadiums/${_id}`)}
    >
      {/* 🏟️ Image Section */}
      <div
        className="relative h-40 w-full overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {images && images.length > 0 ? (
          images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[900ms] ${
                currentIndex === idx ? "opacity-100" : "opacity-0"
              }`}
            />
          ))
        ) : (
          <div className="absolute inset-0 grid place-items-center text-gray-400 dark:text-emerald-200 text-sm bg-gray-100 dark:bg-emerald-950">
            No image available
          </div>
        )}

        {/* Arrows */}
        {isHovered && images.length > 1 && (
          <>
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 dark:bg-emerald-950/60 text-white p-2 rounded-full hover:bg-black/60 dark:hover:bg-emerald-900/70 transition"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <ChevronLeft size={18} />
            </button>

            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 dark:bg-emerald-950/60 text-white p-2 rounded-full hover:bg-black/60 dark:hover:bg-emerald-900/70 transition"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}
      </div>

      {/* 📄 Info Section */}
      <div className="p-5 flex flex-col text-sm text-neutral-700 dark:text-emerald-100 gap-2 transition-colors duration-500">
        <h3 className="font-semibold text-lg text-emerald-700 dark:text-emerald-300">
          {name}
        </h3>

        <div className="flex items-center gap-2 text-gray-800 dark:text-emerald-100 mt-1">
          <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <p className="truncate" title={location}>
            {location}
          </p>
        </div>


        <div className="flex justify-end gap-1 mt-2">
          {minPrice != null ? (
            <div className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-full shadow-sm hover:bg-emerald-200 dark:hover:bg-emerald-800/60 transition-all">
              Starting From {minPrice} € / H
            </div>
          ) : (
            <div className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-800 rounded-full shadow-sm">
              No sessions yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StadiumCard;
