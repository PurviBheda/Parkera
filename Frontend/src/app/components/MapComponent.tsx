import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ParkingArea } from '../data/constants';
import { MapPin, Navigation, Info, ArrowRight } from 'lucide-react';
import { useBooking } from '../context/BookingContext';

// Fix for default Leaflet icon not appearing in Vite
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom yellow icon for parking
const YellowIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapProps {
  onSelectArea: (area: ParkingArea) => void;
  center?: [number, number];
}

const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [center, map]);
  return null;
};

export const MapComponent: React.FC<MapProps> = ({ onSelectArea, center = [22.572, 88.363] }) => {
  const { parkingAreas } = useBooking();
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setMapCenter([position.coords.latitude, position.coords.longitude]);
      });
    }
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/5 border border-gray-100">
      <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <ChangeView center={mapCenter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {parkingAreas.map((area) => (
          <Marker
            key={area.id}
            position={[area.lat, area.lng]}
            icon={YellowIcon}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[180px]">
                <h4 className="font-bold text-sm mb-1">{area.name}</h4>
                <p className="text-xs text-gray-500 mb-2">{area.address}</p>
                <div className="flex items-center justify-between text-xs font-semibold mb-3">
                  <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {area.availableSlots.car + area.availableSlots.bike + area.availableSlots.scooty} Available
                  </span>
                  <span className="text-gray-900">₹{area.pricePerHour}/hr</span>
                </div>
                <button
                  onClick={() => onSelectArea(area)}
                  className="w-full bg-black text-white text-xs py-2 rounded-lg font-bold flex items-center justify-center space-x-1 hover:bg-gray-800 transition-colors"
                >
                  <span>Book Now</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
        <button
          onClick={handleLocate}
          className="bg-white p-3 rounded-xl shadow-lg hover:bg-gray-50 transition-colors border border-gray-100 group"
          title="My Location"
        >
          <Navigation className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />
        </button>
        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100 flex items-center justify-center">
          <MapPin className="w-5 h-5 text-[#EAB308]" />
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-[1000] md:hidden">
        <div className="bg-white/90 backdrop-blur-md p-3 rounded-xl border border-white/50 shadow-xl flex items-center space-x-3">
          <Info className="w-5 h-5 text-[#EAB308]" />
          <p className="text-[10px] font-medium text-gray-700 leading-tight">
            Tap on yellow markers to view details and book slots.
          </p>
        </div>
      </div>
    </div>
  );
};
