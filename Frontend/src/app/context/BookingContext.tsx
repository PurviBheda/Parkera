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
  addBooking: (booking: Booking) => void;
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
      const user = JSON.parse(localStorage.getItem("parkera_user") || "{}");
      const userId = user._id || user.email;
      if (!userId) return;

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/all`); // Fetch all then filter locally to avoid adding new backend endpoints if simple
        if (res.ok) {
          const data = await res.json();
          // Filter for active bookings of the current user
          const myActive = (data.bookings || []).filter((b: any) => 
            b.status === "active" && (b.userId === userId || b.userEmail === user.email)
          );
          
          // Merge with local storage but prioritize backend
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

  useEffect(() => {
    const slotsToClear = ['B-5', 'C-3'];
    const hasSlotsToClear = activeBookings.some((b: Booking) => slotsToClear.includes(b.slotId) && b.status === 'active');
    if (hasSlotsToClear) {
      const newBookings = activeBookings.filter((b: Booking) => !(slotsToClear.includes(b.slotId) && b.status === 'active'));
      setActiveBookings(newBookings);
      localStorage.setItem('parkflow_bookings', JSON.stringify(newBookings));
    }
  }, [activeBookings]);

  const addBooking = (booking: Booking) => {

    // Get logged in user from localStorage
    const user = JSON.parse(localStorage.getItem("parkera_user") || "{}");

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
      activeBookings, addBooking, completeBooking, submitFeedback
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
