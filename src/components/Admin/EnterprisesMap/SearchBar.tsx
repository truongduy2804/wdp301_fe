// src/components/Admin/EnterprisesMap/SearchBar.tsx
import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import type { EnterpriseMapLocation } from "@/api/admin/enterprise-map";
import { translateStatus } from "@/utils/statusTranslation";

interface SearchBarProps {
  enterprises: EnterpriseMapLocation[];
  onSelectLocation: (lat: number, lng: number, id?: number) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  enterprises,
  onSelectLocation,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<EnterpriseMapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 1) {
        setIsLoading(true);
        // Filter local enterprises instead of calling external API
        const filtered = (enterprises || [])
          .filter(
            (ent) =>
              ent.name.toLowerCase().includes(query.toLowerCase()) ||
              ent.address.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 8); // Limit suggestions

        setSuggestions(filtered);
        setShowDropdown(true);
        setIsLoading(false);
      } else {
        setSuggestions([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, enterprises]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (s: EnterpriseMapLocation) => {
    onSelectLocation(s.latitude, s.longitude, s.id);
    setQuery(s.name);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative flex items-center bg-white rounded-2xl shadow-xl border border-slate-200 p-1 pl-4 ring-1 ring-slate-100 hover:ring-emerald-200 transition-all">
        <Search className="w-5 h-5 text-slate-400 mr-3" />
        <input
          type="text"
          className="flex-1 bg-transparent py-2.5 outline-none text-slate-800 placeholder-slate-400 text-sm font-medium"
          placeholder="Tìm kiếm theo tên doanh nghiệp"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="p-2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isLoading && (
          <div className="pr-3">
            <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
          </div>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[1100]">
          <div className="py-2">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-start gap-3 transition-colors group"
              >
                <div className="mt-0.5 rounded-lg bg-slate-100 p-1.5 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                  <MapPin className="w-4 h-4 text-slate-500 group-hover:text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {s.name}
                  </p>
                  <p className="text-[12px] text-slate-500 truncate mt-0.5">
                    {s.address}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                  >
                    {translateStatus(s.status)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    #{s.id}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
