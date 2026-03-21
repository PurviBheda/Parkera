export interface ParkingArea {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  pricePerHour: number;
  totalSlots: number;
  availableSlots: {
    car: number;
    bike: number;
    scooty: number;
  };
}

export const PARKING_AREAS: ParkingArea[] = [
  {
    id: "p1",
    name: "RR Mall Parking",
    address: "Piplod, Surat",
    lat: 21.1507,
    lng: 72.7703,
    rating: 4.5,
    pricePerHour: 30,
    totalSlots: 100,
    availableSlots: { car: 12, bike: 25, scooty: 10 },
  },
  {
    id: "p2",
    name: "Street Parking Lot",
    address: "Surat chauta Bazar, LalGate",
    lat: 22.553,
    lng: 88.353,
    rating: 4.2,
    pricePerHour: 30,
    totalSlots: 250,
    availableSlots: { car: 45, bike: 60, scooty: 30 },
  },
  {
    id: "p3",
    name: "Platinum Plaza",
    address: "Dumas Road, Surat",
    lat: 22.541,
    lng: 88.363,
    rating: 4.7,
    pricePerHour: 30,
    totalSlots: 150,
    availableSlots: { car: 5, bike: 12, scooty: 8 },
  },
  {
    id: "p4",
    name: "Agarsen Bhawan Parking",
    address: "Athwa, Citylight",
    lat: 22.572,
    lng: 88.433,
    rating: 4.0,
    pricePerHour: 30,
    totalSlots: 300,
    availableSlots: { car: 80, bike: 120, scooty: 50 },
  },
  {
    id: "p5",
    name: "Stadium Parking",
    address: "Udhna, Surat",
    lat: 22.572,
    lng: 88.433,
    rating: 4.0,
    pricePerHour: 30,
    totalSlots: 300,
    availableSlots: { car: 30, bike: 70, scooty: 50 },
  },
];

export interface Booking {
  id: string;
  userId: string;
  userEmail?: string;
  areaId: string;
  areaName: string;
  vehicleType: "car" | "bike" | "scooty";
  slotId: string;
  startTime: string; // ISO
  endTime: string; // ISO
  totalCost: number;
  status: "active" | "completed" | "cancelled";
  actualExitTime?: string;
  penalty?: number;
  rating?: number;
}
