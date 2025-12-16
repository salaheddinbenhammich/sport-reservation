import React from "react";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<Props> = ({ page, totalPages, onPageChange, className }) => {
  const pages = new Set<number>([1, totalPages]);
  for (let p = page - 2; p <= page + 2; p++) {
    if (p >= 1 && p <= totalPages) pages.add(p);
  }
  const sorted = Array.from(pages).sort((a, b) => a - b);

  return (
    <div className={`flex justify-center items-center mt-10 space-x-3 ${className || ""}`}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Prev
      </button>

      {/* Page Numbers */}
      {sorted.map((p, i) => {
        const prev = sorted[i - 1];
        const showDots = prev && p - prev > 1;
        return (
          <React.Fragment key={p}>
            {showDots && <span className="text-gray-500 select-none">…</span>}
            <button
              onClick={() => onPageChange(p)}
              disabled={p === page}
              className={`px-3 py-2 rounded-lg transition ${
                p === page
                  ? "bg-emerald-600 text-white"
                  : "bg-white border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
