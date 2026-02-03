// src/components/Admin/EnterprisesMap/LocationFilter.tsx
import React, { useEffect, useState } from "react";
import { MapPin, ChevronDown, Loader2, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationOption {
    code: number;
    name: string;
}

interface LocationFilterProps {
    onLocationSelect: (location: { province?: string; district?: string; ward?: string; lat?: number; lng?: number }) => void;
}

const VIETNAM_OPEN_API = "https://provinces.open-api.vn/api";

const LocationFilter: React.FC<LocationFilterProps> = ({ onLocationSelect }) => {
    const [provinces, setProvinces] = useState<LocationOption[]>([]);
    const [districts, setDistricts] = useState<LocationOption[]>([]);
    const [wards, setWards] = useState<LocationOption[]>([]);

    const [selectedProvince, setSelectedProvince] = useState<number | "">("");
    const [selectedDistrict, setSelectedDistrict] = useState<number | "">("");
    const [selectedWard, setSelectedWard] = useState<number | "">("");

    const [loading, setLoading] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Fetch Provinces on mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const response = await fetch(`${VIETNAM_OPEN_API}/p/`);
                const data = await response.json();
                setProvinces(data);
            } catch (error) {
                console.error("Failed to fetch provinces:", error);
            }
        };
        fetchProvinces();
    }, []);

    // Fetch Districts when Province changes
    useEffect(() => {
        if (!selectedProvince) {
            setDistricts([]);
            setSelectedDistrict("");
            return;
        }

        const fetchDistricts = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${VIETNAM_OPEN_API}/p/${selectedProvince}?depth=2`);
                const data = await response.json();
                setDistricts(data.districts || []);
                setSelectedDistrict("");
                setSelectedWard("");
            } catch (error) {
                console.error("Failed to fetch districts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDistricts();

        const province = provinces.find(p => p.code === selectedProvince);
        if (province) onLocationSelect({ province: province.name });
    }, [selectedProvince]);

    // Fetch Wards when District changes
    useEffect(() => {
        if (!selectedDistrict) {
            setWards([]);
            setSelectedWard("");
            return;
        }

        const fetchWards = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${VIETNAM_OPEN_API}/d/${selectedDistrict}?depth=2`);
                const data = await response.json();
                setWards(data.wards || []);
                setSelectedWard("");
            } catch (error) {
                console.error("Failed to fetch wards:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWards();

        const province = provinces.find(p => p.code === selectedProvince);
        const district = districts.find(d => d.code === selectedDistrict);
        if (province && district) {
            onLocationSelect({ province: province.name, district: district.name });
        }
    }, [selectedDistrict]);

    // Handle Ward change
    useEffect(() => {
        if (!selectedWard) return;

        const province = provinces.find(p => p.code === selectedProvince);
        const district = districts.find(d => d.code === selectedDistrict);
        const ward = wards.find(w => w.code === selectedWard);

        if (province && district && ward) {
            onLocationSelect({
                province: province.name,
                district: district.name,
                ward: ward.name
            });
        }
    }, [selectedWard]);

    return (
        <div className="relative h-full flex items-start">
            <motion.div
                animate={{
                    width: isCollapsed ? 0 : 220,
                    opacity: isCollapsed ? 0 : 1,
                    marginRight: isCollapsed ? 0 : 12
                }}
                transition={{ type: "spring", damping: 20, stiffness: 150 }}
                className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 overflow-hidden h-fit max-h-[calc(100vh-390px)]"
            >
                <div className="p-3 w-[220px] flex flex-col max-h-full">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            <h3 className="font-bold text-slate-800 text-xs">Khu vực</h3>
                        </div>
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
                        {/* Province Select */}
                        <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Tỉnh / Thành phố</label>
                            <div className="relative">
                                <select
                                    value={selectedProvince}
                                    onChange={(e) => setSelectedProvince(Number(e.target.value))}
                                    className="w-full h-8 pl-2.5 pr-7 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 appearance-none transition-all cursor-pointer"
                                >
                                    <option value="">Chọn Tỉnh/Thành</option>
                                    {provinces.map(p => (
                                        <option key={p.code} value={p.code}>{p.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* District Select */}
                        <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Quận / Huyện</label>
                            <div className="relative">
                                <select
                                    value={selectedDistrict}
                                    onChange={(e) => setSelectedDistrict(Number(e.target.value))}
                                    disabled={!selectedProvince}
                                    className="w-full h-8 pl-2.5 pr-7 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 appearance-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">Chọn Quận/Huyện</option>
                                    {districts.map(d => (
                                        <option key={d.code} value={d.code}>{d.name}</option>
                                    ))}
                                </select>
                                {loading && !selectedDistrict ? (
                                    <Loader2 className="absolute right-7 top-1/2 -translate-y-1/2 w-3 h-3 text-emerald-500 animate-spin" />
                                ) : (
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                                )}
                            </div>
                        </div>

                        {/* Ward Select */}
                        <div className="space-y-0.5">
                            <label className="text-[9px] font-bold text-slate-500 uppercase ml-1">Phường / Xã</label>
                            <div className="relative">
                                <select
                                    value={selectedWard}
                                    onChange={(e) => setSelectedWard(Number(e.target.value))}
                                    disabled={!selectedDistrict}
                                    className="w-full h-8 pl-2.5 pr-7 rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 appearance-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="">Chọn Phường/Xã</option>
                                    {wards.map(w => (
                                        <option key={w.code} value={w.code}>{w.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Toggle Button when collapsed */}
            <AnimatePresence>
                {isCollapsed && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsCollapsed(false)}
                        className="p-3 bg-white shadow-lg border border-slate-100 rounded-2xl text-emerald-600 hover:text-emerald-700 transition-all hover:shadow-xl active:scale-95 group flex items-center gap-2"
                    >
                        <Filter className="w-5 h-5" />
                        <span className="text-xs font-bold text-slate-800 pr-1 group-hover:inline hidden transition-all">Bộ lọc khu vực</span>
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LocationFilter;
