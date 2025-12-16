import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import StadiumCard from "./StadiumCard";
import Pagination from "../../components/Pagination";
import FilterOptions, { FilterValues } from "../../components/filterOptions";
import { Search, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "../../components/Skeleton";

type Stadium = {
  _id: string;
  name: string;
  images: string[];
  location?: string;
  city?: string;
  price?: number;
  minPrice?: number | null;
  capacity?: number;
};

type Paginated<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

// ✅ FIXED LIMIT PAGE SIZE
const FIXED_LIMIT = 6;

function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const Stadiums: React.FC = () => {
  const [params, setParams] = useSearchParams();

  const page = Math.max(1, parseInt(params.get("page") || "1", 10));

  // quick search
  const [name, setName] = useState(params.get("name") || "");
  const debouncedName = useDebounced(name);

  // Filters
  const [location, setLocation] = useState(params.get("location") || "");
  const [minCapacity, setMinCapacity] = useState<string>(params.get("minCapacity") || "");
  const [maxCapacity, setMaxCapacity] = useState<string>(params.get("maxCapacity") || "");
  const [minPrice, setMinPrice] = useState<string>(params.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState<string>(params.get("maxPrice") || "");
  const [amenities, setAmenities] = useState<string[]>(
    (params.get("amenities") || "").split(",").filter(Boolean)
  );
  const [sortBy, setSortBy] = useState<any>(params.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = useState<any>(params.get("sortOrder") || "desc");

  const [showFilters, setShowFilters] = useState(false);

  // ✅ Query always uses FIXED_LIMIT
  const query = useMemo(
    () => ({
      page,
      limit: FIXED_LIMIT,
      name: debouncedName || undefined,
      location: location || undefined,
      minCapacity: minCapacity ? Number(minCapacity) : undefined,
      maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      amenities: amenities.length ? amenities : undefined,
      sortBy,
      sortOrder,
    }),
    [
      page,
      debouncedName,
      location,
      minCapacity,
      maxCapacity,
      minPrice,
      maxPrice,
      amenities,
      sortBy,
      sortOrder,
    ]
  );

  // Data
  const [data, setData] = useState<Stadium[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Fetch
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErr(null);

    api
      .get<Paginated<Stadium>>("/stadium", { params: query })
      .then(({ data }) => {
        if (cancelled) return;
        setData(data.data);
        setTotalPages(data.meta.totalPages);
      })
      .catch(() => !cancelled && setErr("Failed to load stadiums"))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [query]);

  useEffect(() => {
    const next = new URLSearchParams();
    next.set("page", String(page));
    if (name) next.set("name", name);
    if (location) next.set("location", location);
    if (minCapacity) next.set("minCapacity", minCapacity);
    if (maxCapacity) next.set("maxCapacity", maxCapacity);
    if (minPrice) next.set("minPrice", minPrice);
    if (maxPrice) next.set("maxPrice", maxPrice);
    if (amenities.length) next.set("amenities", amenities.join(","));
    next.set("sortBy", sortBy);
    next.set("sortOrder", sortOrder);

    if (next.toString() !== params.toString()) {
      setParams(next, { replace: true });
    }
  }, [
    page,
    name,
    location,
    minCapacity,
    maxCapacity,
    minPrice,
    maxPrice,
    amenities,
    sortBy,
    sortOrder,
  ]);

  const onPageChange = (newPage: number) => {
    const next = new URLSearchParams(params);
    next.set("page", String(newPage));
    setParams(next);
  };

  const handleApplyFilters = (values: FilterValues) => {
    setName(values.name || "");
    setLocation(values.location || "");
    setMinCapacity(values.minCapacity ? String(values.minCapacity) : "");
    setMaxCapacity(values.maxCapacity ? String(values.maxCapacity) : "");
    setMinPrice(values.minPrice ? String(values.minPrice) : "");
    setMaxPrice(values.maxPrice ? String(values.maxPrice) : "");
    setAmenities(values.amenities || []);
    setSortBy(values.sortBy || "createdAt");
    setSortOrder(values.sortOrder || "desc");

    const next = new URLSearchParams(params);
    next.set("page", "1");
    setParams(next);
  };

  return (
    <div className="bg-gradient-to-b from-emerald-50 via-white to-gray-50 dark:from-emerald-950 dark:via-black dark:to-emerald-950 text-gray-800 dark:text-emerald-100 min-h-screen transition-colors duration-500">
      <Navbar />

      {/* Search + Filter */}
      <div className="pt-24 pb-2 px-4">
        <div className="max-w-[720px] mx-auto w-full">
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center bg-white dark:bg-emerald-900/40 rounded-full shadow-md px-5 py-3 w-full sm:w-[600px] border border-emerald-100 dark:border-emerald-800 transition-colors">
              <Search className="text-gray-500 dark:text-emerald-300 mr-2" />
              <input
                type="text"
                placeholder="Search stadium..."
                className="w-full outline-none text-gray-700 dark:text-emerald-100 bg-transparent"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowFilters((s) => !s)}
              className="flex items-center justify-center bg-white dark:bg-emerald-900/40 rounded-full shadow-md px-4 py-2 hover:bg-gray-50 dark:hover:bg-emerald-800/50 border border-emerald-100 dark:border-emerald-800 transition-all"
            >
              <SlidersHorizontal
                className={`text-gray-700 dark:text-emerald-300 transition-transform ${
                  showFilters ? "rotate-90" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <div
        className={`transition-all duration-300 ${
          showFilters ? "max-h-[1300px] opacity-100 mt-3" : "max-h-0 opacity-0"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="w-full bg-white dark:bg-emerald-900/40 rounded-2xl shadow-lg px-6 py-6 border border-emerald-100 dark:border-emerald-800">
            <FilterOptions
              initialValues={{
                name,
                location,
                minCapacity: minCapacity ? Number(minCapacity) : undefined,
                maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
                minPrice: minPrice ? Number(minPrice) : undefined,
                maxPrice: maxPrice ? Number(maxPrice) : undefined,
                amenities,
                sortBy,
                sortOrder,
              }}
              onApply={handleApplyFilters}
            />
          </div>
        </div>
      </div>


      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 pb-0">
        {err && <div className="text-red-600 mb-4">{err}</div>}

        {loading ? (
          <div className="animate-fade-in">
            {/* Stadium cards skeleton grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl shadow-md overflow-hidden border border-emerald-100"
                >
                  {/* Image placeholder */}
                  <Skeleton className="h-[180px] w-full rounded-none" />

                  <div className="p-4 space-y-3">
                    <Skeleton className="w-3/4 h-5" />
                    <Skeleton className="w-1/2 h-4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="w-16 h-4" />
                      <Skeleton className="w-20 h-6 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination skeleton */}
            <div className="mt-10 flex justify-center">
              <Skeleton className="w-48 h-8 rounded-full" />
            </div>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {data.map((stadium) => (
                <StadiumCard
                  key={stadium._id}
                  stadium={{
                    ...stadium,
                    price: stadium.minPrice ?? stadium.price,
                    city: stadium.location || stadium.city,
                  }}
                />
              ))}
            </div>

            {/* Pagination centered */}
            <div className="mb-8 flex justify-center">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Stadiums;
