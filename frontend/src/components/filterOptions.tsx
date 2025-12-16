import React, { useEffect, useMemo, useState } from "react";
import { Filter, X } from "lucide-react";
import Select from "./Select";

export type SortBy = "createdAt" | "name" | "price" | "capacity" | "location";
export type SortOrder = "asc" | "desc";

export type FilterValues = {
  name?: string;
  location?: string;
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  sortBy?: SortBy;
  sortOrder?: SortOrder;
};

export interface FilterOptionsProps {
  initialValues: FilterValues;
  onApply: (values: FilterValues) => void;
  className?: string;
  amenityOptions?: string[];
}

const DEFAULT_AMENITIES = ["lights", "parking", "showers", "locker_room", "cafeteria"];
const toNumberOrUndefined = (v: string): number | undefined =>
  v.trim() === "" ? undefined : Number(v);

const FilterOptions: React.FC<FilterOptionsProps> = ({
  initialValues,
  onApply,
  className,
  amenityOptions,
}) => {
  const amenityList = useMemo(
    () => (amenityOptions && amenityOptions.length ? amenityOptions : DEFAULT_AMENITIES),
    [amenityOptions]
  );

  const [name, setName] = useState(initialValues.name ?? "");
  const [location, setLocation] = useState(initialValues.location ?? "");
  const [minCapacity, setMinCapacity] = useState(
    initialValues.minCapacity !== undefined ? String(initialValues.minCapacity) : ""
  );
  const [maxCapacity, setMaxCapacity] = useState(
    initialValues.maxCapacity !== undefined ? String(initialValues.maxCapacity) : ""
  );
  const [minPrice, setMinPrice] = useState(
    initialValues.minPrice !== undefined ? String(initialValues.minPrice) : ""
  );
  const [maxPrice, setMaxPrice] = useState(
    initialValues.maxPrice !== undefined ? String(initialValues.maxPrice) : ""
  );
  const [amenities, setAmenities] = useState<string[]>(
    initialValues.amenities && initialValues.amenities.length ? initialValues.amenities : []
  );
  const [sortBy, setSortBy] = useState<SortBy>(initialValues.sortBy ?? "createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>(initialValues.sortOrder ?? "desc");

  useEffect(() => {
    setName(initialValues.name ?? "");
    setLocation(initialValues.location ?? "");
    setMinCapacity(
      initialValues.minCapacity !== undefined ? String(initialValues.minCapacity) : ""
    );
    setMaxCapacity(
      initialValues.maxCapacity !== undefined ? String(initialValues.maxCapacity) : ""
    );
    setMinPrice(initialValues.minPrice !== undefined ? String(initialValues.minPrice) : "");
    setMaxPrice(initialValues.maxPrice !== undefined ? String(initialValues.maxPrice) : "");
    setAmenities(initialValues.amenities ?? []);
    setSortBy(initialValues.sortBy ?? "createdAt");
    setSortOrder(initialValues.sortOrder ?? "desc");
  }, [initialValues]);

  const toggleAmenity = (a: string) => {
    setAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const clearAll = () => {
    setName("");
    setLocation("");
    setMinCapacity("");
    setMaxCapacity("");
    setMinPrice("");
    setMaxPrice("");
    setAmenities([]);
    setSortBy("createdAt");
    setSortOrder("desc");
  };

  const handleApply = () => {
    onApply({
      name: name.trim() || undefined,
      location: location.trim() || undefined,
      minCapacity: toNumberOrUndefined(minCapacity),
      maxCapacity: toNumberOrUndefined(maxCapacity),
      minPrice: toNumberOrUndefined(minPrice),
      maxPrice: toNumberOrUndefined(maxPrice),
      amenities: amenities.length ? amenities : undefined,
      sortBy,
      sortOrder,
    });
  };

  return (
    <div
      className={`w-full rounded-2xl shadow-lg border transition-colors duration-500 
      bg-white/80 backdrop-blur-md border-emerald-100
      dark:bg-emerald-950/60 dark:border-emerald-800 dark:shadow-emerald-900/40
      ${className || ""}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-100 dark:border-emerald-800">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-emerald-100">
            Filters
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Clear */}
          <button
            onClick={clearAll}
            type="button"
            title="Clear all filters"
            aria-label="Clear all filters"
            className="group inline-flex items-center gap-1 text-xs text-gray-700 dark:text-emerald-200
                       px-3 py-1.5 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200"
          >
            <X className="w-4 h-4" />
            Clear
          </button>

          {/* Apply */}
          <button
            type="button"
            onClick={handleApply}
            className="group inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-200
                       border border-emerald-600 dark:border-emerald-500 rounded-lg px-3 py-1.5
                       hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 transition-all duration-200"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700 dark:text-emerald-100">
        {/* Name */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-emerald-300 mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Arena, Galaxy..."
            className="w-full px-3 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800
                       bg-white/60 dark:bg-emerald-950/40
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs text-gray-500 dark:text-emerald-300 mb-1">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City / Area"
            className="w-full px-3 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800
                       bg-white/60 dark:bg-emerald-950/40
                       focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Capacity */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-emerald-300 mb-1">
              Min Capacity
            </label>
            <input
              type="number"
              min={0}
              value={minCapacity}
              onChange={(e) => setMinCapacity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800
                         bg-white/60 dark:bg-emerald-950/40
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-emerald-300 mb-1">
              Max Capacity
            </label>
            <input
              type="number"
              min={0}
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800
                         bg-white/60 dark:bg-emerald-950/40
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 dark:text-emerald-300 mb-1">Min Price</label>
            <input
              type="number"
              min={0}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800
                         bg-white/60 dark:bg-emerald-950/40
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-emerald-300 mb-1">Max Price</label>
            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-emerald-100 dark:border-emerald-800
                         bg-white/60 dark:bg-emerald-950/40
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="lg:col-span-2">
          <label className="block text-xs text-gray-500 dark:text-emerald-300 mb-2">Amenities</label>
          <div className="flex flex-wrap gap-2">
            {amenityList.map((a) => {
              const checked = amenities.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all
                    ${
                      checked
                        ? "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500"
                        : "text-gray-700 dark:text-emerald-200 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/40"
                    }`}
                >
                  {a.replace(/_/g, " ")}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort */}
        <div className="grid grid-cols-2 gap-3">
          <Select<SortBy>
            label="Sort By"
            value={sortBy}
            onChange={(v) => setSortBy(v)}
            options={[
              { label: "Newest", value: "createdAt" },
              { label: "Name", value: "name" },
              { label: "Price", value: "price" },
              { label: "Capacity", value: "capacity" },
              { label: "Location", value: "location" },
            ]}
          />
          <Select<SortOrder>
            label="Order"
            value={sortOrder}
            onChange={(v) => setSortOrder(v)}
            options={[
              { label: "Desc", value: "desc" },
              { label: "Asc", value: "asc" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterOptions;
