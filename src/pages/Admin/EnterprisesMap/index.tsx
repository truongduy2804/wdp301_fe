// src/pages/Admin/EnterprisesMap/index.tsx
import React, { useState } from "react";
import AdminMapGuard from "@/components/Admin/EnterprisesMap/AdminMapGuard";
import MapComponent from "@/components/Admin/EnterprisesMap/MapComponent";
import SearchBar from "@/components/Admin/EnterprisesMap/SearchBar";
import LocationFilter from "@/components/Admin/EnterprisesMap/LocationFilter";
import EnterpriseDetailPanel from "@/components/Admin/EnterprisesMap/EnterpriseDetailPanel";
import { fetchEnterprisesMap, type EnterpriseMapLocation } from "@/api/admin/enterprise-map";

const AdminEnterprisesMap: React.FC = () => {
    const [enterprises, setEnterprises] = useState<EnterpriseMapLocation[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("ACTIVE");
    const [flyToLocation, setFlyToLocation] = useState<{ lat: number; lng: number } | null>(null);

    React.useEffect(() => {
        const loadMarkers = async () => {
            setIsLoading(true);
            try {
                const data = await fetchEnterprisesMap(statusFilter);
                setEnterprises(data);
            } catch (err: any) {
                console.error("Failed to load map data:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadMarkers();
    }, [statusFilter]);

    const handleEnterpriseSelect = (id: number, lat: number, lng: number) => {
        setSelectedEnterpriseId(id);
        setFlyToLocation({ lat, lng });
    };

    const handleSearchSelect = (lat: number, lng: number, id?: number) => {
        setFlyToLocation({ lat, lng });
        if (id) {
            setSelectedEnterpriseId(id);
        }
    };

    const handleLocationFilterSelect = async (loc: { province?: string; district?: string; ward?: string }) => {
        // Construct search query
        const query = [loc.ward, loc.district, loc.province].filter(Boolean).join(", ");
        console.log("DEBUG: Filtering by location:", query);

        try {
            // Geocode the location to fly to it
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
            const data = await response.json();
            if (data && data[0]) {
                setFlyToLocation({
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                });
            }
        } catch (error) {
            console.error("Failed to geocode location filter:", error);
        }
    };

    return (
        <AdminMapGuard>
            <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-white">
                {/* Main Map */}
                <MapComponent
                    enterprises={enterprises}
                    isLoading={isLoading}
                    onSelectEnterprise={handleEnterpriseSelect}
                    flyTo={flyToLocation}
                />

                {/* Search Bar - Top Floating */}
                <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-center pointer-events-none">
                    <div className="w-full max-w-md pointer-events-auto">
                        <SearchBar
                            enterprises={enterprises}
                            onSelectLocation={handleSearchSelect}
                        />
                    </div>
                </div>

                {/* Location Filter - Left Floating */}
                <div className="absolute top-20 left-4 bottom-4 z-[1000] pointer-events-none">
                    <div className="h-full pointer-events-auto">
                        <LocationFilter
                            onLocationSelect={handleLocationFilterSelect}
                        />
                    </div>
                </div>

                {/* Details Panel - Right Sliding */}
                <EnterpriseDetailPanel
                    enterpriseId={selectedEnterpriseId}
                    onClose={() => setSelectedEnterpriseId(null)}
                />
            </div>
        </AdminMapGuard>
    );
};

export default AdminEnterprisesMap;
