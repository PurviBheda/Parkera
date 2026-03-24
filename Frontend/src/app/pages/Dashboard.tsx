import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  MapPin,
  Filter,
  Navigation,
  Star,
  Clock,
  Info,
  ArrowRight,
  Car,
  Bike,
  Smartphone,
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { MapComponent } from "../components/MapComponent";
import { ParkingArea } from "../data/constants";
import { useNavigate, useSearchParams } from "react-router";
import { useBooking } from "../context/BookingContext";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export const Dashboard = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const { parkingAreas, setSelectedArea } = useBooking();
  const [filteredAreas, setFilteredAreas] = useState<ParkingArea[]>([]);
  const [showLocationPermission, setShowLocationPermission] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "prompt") {
          setShowLocationPermission(true);
        }
      });
    }
  }, []);

  useEffect(() => {
    const filtered = parkingAreas.filter(
      (area) =>
        area.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        area.address.toLowerCase().includes(searchQuery.toLowerCase()),
    );
    setFilteredAreas(filtered);
  }, [searchQuery, parkingAreas]);

  const handleSelectArea = (area: ParkingArea) => {
    setSelectedArea(area);
    const mode = searchParams.get("mode");
    if (mode === "pass") {
      const plan = searchParams.get("plan");
      const price = searchParams.get("price");
      const duration = searchParams.get("duration");
      const title = searchParams.get("title");
      navigate(`/passes/select?plan=${plan}&price=${price}&duration=${duration}&title=${title}&areaId=${(area as any)._id || area.id}&areaName=${encodeURIComponent(area.name)}`);
    } else {
      navigate("/booking");
    }
  };

  const handleGrantPermission = () => {
    navigator.geolocation.getCurrentPosition(
      () => setShowLocationPermission(false),
      () => setShowLocationPermission(false),
    );
  };

  /* ===========================
     NEW FUNCTION ADDED
     =========================== */

  const handleOpenDirections = (area: ParkingArea, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent booking click

    if (!navigator.geolocation) {
      alert(t("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        const destinationQuery = encodeURIComponent(
          `${area.name}, ${area.address}`,
        );

        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destinationQuery}&travelmode=driving`;

        window.open(googleMapsUrl, "_blank");
      },
      () => {
        alert(t("Please enable location access to get directions."));
      },
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-20 overflow-y-auto">
        <div className="w-full max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col">
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-black tracking-tighter">
                  {t("Find Parking Nearby.")}
                </h2>
                <p className="text-gray-500 text-sm font-medium italic">
                  {t("Showing")} {filteredAreas.length} {t("available spots in your area.")}
                </p>
              </div>

              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-black transition-colors" />
                <input
                  type="text"
                  placeholder={t("Search location, mall, or street...")}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-semibold shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white rounded-lg transition-colors">
                  <Filter className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
              {filteredAreas.map((area, i) => (
                <motion.div
                  key={area.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleSelectArea(area)}
                  className="group bg-white border-2 border-gray-100 p-4 rounded-2xl hover:border-black cursor-pointer transition-all hover:shadow-xl hover:shadow-black/5"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1">
                      <h3 className="font-black text-lg tracking-tight group-hover:text-[#EAB308] transition-colors">
                        {area.name}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 font-medium space-x-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate max-w-[180px]">
                          {area.address}
                        </span>
                      </div>
                    </div>

                    {/* NEW SMALL LOCATION BUTTON */}
                    <button
                      onClick={(e) => handleOpenDirections(area, e)}
                      className="bg-gray-100 hover:bg-black hover:text-white p-2 rounded-xl transition-all shadow-sm"
                    >
                      <Navigation className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
                      <Car className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                      <p className="text-[10px] font-black text-black">
                        {area.availableSlots.car}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
                      <Bike className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                      <p className="text-[10px] font-black text-black">
                        {area.availableSlots.bike}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
                      <Smartphone className="w-4 h-4 mx-auto mb-1 text-gray-400" />
                      <p className="text-[10px] font-black text-black">
                        {area.availableSlots.scooty}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-[#EAB308]" />
                      <span className="text-sm font-black text-black">
                        ₹{area.pricePerHour}/{t('hr')}
                      </span>
                    </div>
                    <button className="bg-black text-white p-2 rounded-xl group-hover:bg-[#EAB308] group-hover:text-black transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>


        </div>
      </main>
    </div>
  );
};
