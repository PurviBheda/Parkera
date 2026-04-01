import React, { createContext, useContext, useState, useEffect } from 'react';
import { ParkingArea, Booking } from '../data/constants';

interface BookingContextType {
  parkingAreas: ParkingArea[];
  setParkingAreas: (areas: ParkingArea[]) => void;
  selectedArea: ParkingArea | null;
  setSelectedArea: (area: ParkingArea | null) => void;
  currentBooking: Partial<Booking> | null;
  setCurrentBooking: (booking: Partial<Booking> | null) => void;
  activeBookings: Booking[];
  allActiveBookings: Booking[];
  addBooking: (booking: Booking) => void;
  fetchAllActiveBookings: (areaId: string) => Promise<void>;
  completeBooking: (id: string, exitTime: string, penalty: number) => void;
  submitFeedback: (id: string, rating: number) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [parkingAreas, setParkingAreas] = useState<ParkingArea[]>([]);
  const [selectedArea, setSelectedArea] = useState<ParkingArea | null>(null);
  const [currentBooking, setCurrentBooking] = useState<Partial<Booking> | null>(null);
  const [activeBookings, setActiveBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('parkflow_bookings');
    return saved ? JSON.parse(saved) : [];
  });
  const [allActiveBookings, setAllActiveBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/parking-areas`);
        if (res.ok) {
          const data = await res.json();
          setParkingAreas(data);
        }
      } catch (error) {
        console.error("Failed to fetch parking areas", error);
      }
    };

    const fetchActiveBookings = async () => {
      const userStr = localStorage.getItem("parkflow_user");
      if (!userStr) return;
      const user = JSON.parse(userStr);
      const userId = user.id || user._id || user.email;
      if (!userId) return;

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/all?userId=${encodeURIComponent(userId)}&status=active`);
        if (res.ok) {
          const data = await res.json();
          const myActive = (data.bookings || []).map((b: any) => ({
            ...b,
            id: b.id || b.ticketId || b._id,
            startTime: b.startTime || b.entryTime,
            endTime: b.endTime || b.expectedExit,
            totalCost: b.totalCost || b.paidAmount || 0
          }));
          
          setActiveBookings(myActive);
          localStorage.setItem('parkflow_bookings', JSON.stringify(myActive));
        }
      } catch (error) {
        console.error("Failed to fetch active bookings", error);
      }
    };

    fetchAreas();
    fetchActiveBookings();
  }, []);

  const fetchAllActiveBookings = async (areaId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/all?areaId=${encodeURIComponent(areaId)}&status=active`);
      if (res.ok) {
        const data = await res.json();
        setAllActiveBookings(data.bookings || []);
      }
    } catch (error) {
      console.error("Failed to fetch all active bookings", error);
    }
  };

  // Removed hardcoded activeBookings.filter for slotsToClear

  const addBooking = (booking: Booking) => {

    // Get logged in user from localStorage
    const user = JSON.parse(localStorage.getItem("parkflow_user") || "{}");

    const bookingWithEmail = {
      ...booking,
      userEmail: booking.userEmail || user?.email || "-"
    };

    const newBookings = [bookingWithEmail, ...activeBookings];

    setActiveBookings(newBookings);
    localStorage.setItem('parkflow_bookings', JSON.stringify(newBookings));
  };

  const completeBooking = (id: string, exitTime: string, penalty: number) => {
    const newBookings = activeBookings.map(b =>
      b.id === id ? { ...b, status: 'completed' as const, actualExitTime: exitTime, penalty } : b
    );
    setActiveBookings(newBookings);
    localStorage.setItem('parkflow_bookings', JSON.stringify(newBookings));
  };

  const submitFeedback = async (id: string, rating: number) => {
    // Call backend API
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id, rating }),
      });
    } catch (error) {
      console.error("Failed to submit feedback", error);
    }

    // Update local state
    const newBookings = activeBookings.map(b =>
      b.id === id ? { ...b, rating } : b
    );
    setActiveBookings(newBookings);
    localStorage.setItem('parkflow_bookings', JSON.stringify(newBookings));
  };

  return (
    <BookingContext.Provider value={{
      parkingAreas, setParkingAreas,
      selectedArea, setSelectedArea,
      currentBooking, setCurrentBooking,
      activeBookings, allActiveBookings, addBooking, fetchAllActiveBookings, completeBooking, submitFeedback
    }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) throw new Error('useBooking must be used within a BookingProvider');
  return context;
};
