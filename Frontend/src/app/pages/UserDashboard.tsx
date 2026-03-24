import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import {
  Clock, MapPin, Car, Bike, AlertCircle,
  ArrowRight, CheckCircle2, TrendingUp, User as UserIcon,
  ShieldCheck, Info
} from 'lucide-react';
import { format, differenceInMinutes, parseISO, isAfter } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { FeedbackModal } from '../components/FeedbackModal';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import { Download } from 'lucide-react';

export const ActiveBookingCard = ({ booking, userEmail, onExit }: { booking: any, userEmail: string, onExit: (b: any) => void }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0, isLate: false });
  const hasNotified = useRef(false);
  const penaltyNotified = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      // Normalize endTime/expectedExit
      const endTimeStr = booking.endTime || booking.expectedExit;
      if (!endTimeStr) return;
      
      const end = parseISO(endTimeStr);
      const diff = differenceInMinutes(end, now);
      const diffSecs = Math.floor((end.getTime() - now.getTime()) / 1000);

      if (diffSecs <= 300 && diffSecs > 0 && !hasNotified.current) {
        toast.warning(`🔔 SMS Sent: You have 5 min left for slot ${booking.slotId}. After 5 min penalty applies.`, {
          duration: 10000
        });
        hasNotified.current = true;
      }

      if (diff < 0) {
        const lateMins = Math.abs(diff);
        setTimeLeft({ minutes: lateMins, seconds: 0, isLate: true });

        if (!penaltyNotified.current) {
          toast.error(`🚨 Time's Up! Late penalty of ₹2/min is now active for slot ${booking.slotId}.`, {
            duration: 10000
          });
          penaltyNotified.current = true;
        }
      } else {
        const totalSeconds = diff * 60 - now.getSeconds();
        setTimeLeft({
          minutes: Math.floor(totalSeconds / 60),
          seconds: totalSeconds % 60,
          isLate: false
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [booking.endTime]);

  return (
    <motion.div className="bg-white rounded-[2.5rem] border-2 border-gray-100 p-8 shadow-xl shadow-black/5 relative overflow-hidden">

      <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest ${timeLeft.isLate ? 'bg-red-500 text-white animate-pulse' : 'bg-[#EAB308] text-black'
        }`}>
        {timeLeft.isLate ? t('Late Penalty Applied') : t('Active Session')}
      </div>

      <div className="flex flex-col md:flex-row gap-8">

        <div className="flex-1 space-y-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-black text-black tracking-tighter">{booking.areaName}</h3>
            <div className="flex items-center text-xs text-gray-500 font-medium space-x-2">
              <MapPin className="w-3 h-3" />
              <span>{t('Slot')}: <span className="text-black font-bold uppercase">{booking.slotId}</span></span>
              <span className="text-gray-200">|</span>
              <span className="uppercase">{booking.vehicleType}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">{t('Entry Time')}</p>
              <p className="text-sm font-bold text-black">{format(parseISO(booking.startTime), 'hh:mm a')}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">{t('Expected Exit')}</p>
              <p className="text-sm font-bold text-black">{format(parseISO(booking.endTime), 'hh:mm a')}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full bg-black text-white px-6 py-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase text-gray-500">{t('Paid Amount')}</p>
                <p className="text-xl font-black">₹{booking.totalCost}</p>
              </div>
              {timeLeft.isLate && (
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-red-500">{t('Late Penalty')}</p>
                  <p className="text-xl font-black text-red-500">+₹{timeLeft.minutes * 2}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => onExit(booking)}
              className="w-full md:w-auto bg-white border-2 border-black text-black px-8 py-4 rounded-2xl font-black hover:bg-black hover:text-white transition-all shadow-lg shadow-black/5"
            >
              {t('Confirm Exit')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Helper to normalize booking objects from different sources
const normalizeBooking = (b: any) => ({
  ...b,
  id: b.id || b.ticketId || b._id,
  startTime: b.startTime || b.entryTime,
  endTime: b.endTime || b.expectedExit,
  totalCost: b.totalCost || b.paidAmount || 0
});

const PassCountdown = ({ endDate }: { endDate: string }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, mins: number }>({ days: 0, hours: 0, mins: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const end = new Date(endDate);
      const diff = end.getTime() - now.getTime();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          mins: Math.floor((diff / 1000 / 60) % 60)
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  return (
    <div className="flex space-x-4">
      <div className="text-center">
        <span className="block text-2xl font-black bg-white rounded-lg px-3 py-1 text-black shadow-inner">{timeLeft.days}</span>
        <span className="text-[10px] uppercase font-bold text-gray-500">{t('Days')}</span>
      </div>
      <div className="text-center">
        <span className="block text-2xl font-black bg-white rounded-lg px-3 py-1 text-black shadow-inner">{timeLeft.hours}</span>
        <span className="text-[10px] uppercase font-bold text-gray-500">{t('Hours')}</span>
      </div>
      <div className="text-center">
        <span className="block text-2xl font-black bg-white rounded-lg px-3 py-1 text-black shadow-inner">{timeLeft.mins}</span>
        <span className="text-[10px] uppercase font-bold text-gray-500">{t('Mins')}</span>
      </div>
    </div>
  );
};

export const UserDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { activeBookings, completeBooking, submitFeedback } = useBooking();
  const navigate = useNavigate();

  const currentUserIdentifier = (user as any)?._id || user?.email;
  const myActiveBookings = activeBookings.filter((b: any) =>
    b.status === "active" && (b.userId === currentUserIdentifier || b.userEmail === user?.email)
  );

  const [exitModal, setExitModal] = useState<any>(null);
  const [isProcessingExit, setIsProcessingExit] = useState(false);
  const [activePass, setActivePass] = useState<any>(null);
  const [feedbackBookingId, setFeedbackBookingId] = useState<string | null>(null);
  const [missedReservations, setMissedReservations] = useState<any[]>([]);
  const [payingPenaltyId, setPayingPenaltyId] = useState<string | null>(null);
  const [bookingHistory, setBookingHistory] = useState<any[]>([]);

  const fetchHistory = (uId: string) => {
    console.log("Fetching history for:", uId);
    fetch(`${import.meta.env.VITE_API_URL}/api/bookings/history/${encodeURIComponent(uId)}`)
      .then(res => res.json())
      .then(data => {
        console.log("Received History:", data.history);
        setBookingHistory((data.history || []).map(normalizeBooking))
      })
      .catch(console.error);
  };

  useEffect(() => {
    if (user) {
      const uId = (user as any)?._id || user.email;
      fetch(`${import.meta.env.VITE_API_URL}/api/passes/my-pass/${encodeURIComponent(uId)}`)
        .then(res => res.json())
        .then(data => {
          if (data.pass) {
            setActivePass(data.pass);
          }
        })
        .catch(console.error);

      // Fetch missed reservations
      fetch(`${import.meta.env.VITE_API_URL}/api/reservations/missed/${encodeURIComponent(uId)}`)
        .then(res => res.json())
        .then(data => setMissedReservations(data.reservations || []))
        .catch(console.error);
        
      fetchHistory(uId);
    }
  }, [user]);

  const handleExit = (booking: any) => {
    const now = new Date();
    const end = parseISO(booking.endTime);
    const lateMins = isAfter(now, end) ? differenceInMinutes(now, end) : 0;
    const penalty = lateMins * 2;

    setExitModal({ ...booking, penalty, lateMins });
  };

  // Process the exit locally and via backend
  const confirmExit = async () => {
    try {
      setIsProcessingExit(true);

      // If there's a penalty, route to the payment page instead
      if (exitModal.penalty > 0) {
        setIsProcessingExit(false);
        setExitModal(null);
        navigate(`/penalty/${exitModal.id}`);
        return;
      }

      await fetch(`${import.meta.env.VITE_API_URL}/api/bookings/confirm-exit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId: exitModal.id })
      });

      completeBooking(exitModal.id, new Date().toISOString(), exitModal.penalty);

      setIsProcessingExit(false);
      toast.success("Vehicle exited and slot cleared successfully!");
      setFeedbackBookingId(exitModal.id);
      setExitModal(null);
      
      if (user) {
        fetchHistory((user as any)?._id || user.email);
      }

    } catch (err) {
      console.error(err);
      setIsProcessingExit(false);
      toast.error("An error occurred while exiting.");
    }
  };

  const generateReceipt = (booking: any) => {
    const doc = new jsPDF();
    
    // Colors
    const black = '#000000';
    const white = '#FFFFFF';
    const grey = '#6B7280';
    const lightGrey = '#F3F4F6';
    const mustardYellow = '#EAB308';
    
    // Header section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(black);
    doc.text("ParkEra", 20, 25);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(grey);
    doc.text("123 Parking Avenue,", 20, 31);
    doc.text("Tech Park, City 12345", 20, 36);
    
    // Right side header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(black);
    doc.text("PARKING", 190, 25, { align: "right", charSpace: 2 });
    doc.setTextColor(mustardYellow);
    doc.text("RECEIPT", 190, 37, { align: "right", charSpace: 2 });
    
    // Billed To Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(mustardYellow); 
    doc.text("Billed To", 20, 60);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(black);
    doc.text(user?.name || "Customer Name", 20, 67);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(grey);
    doc.text(`Vehicle No: ${(user as any)?.vehicle || 'N/A'}`, 20, 73);
    doc.text(user?.email || "customer@example.com", 20, 78);
    
    // Receipt Details (Right side)
    doc.setFont("helvetica", "bold");
    doc.setTextColor(mustardYellow);
    doc.text("Receipt #", 140, 67);
    doc.text("Receipt date", 140, 73);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(black);
    doc.text(booking.ticketId || booking._id || "000000", 190, 67, { align: "right" });
    doc.text(format(new Date(booking.actualExit || booking.expectedExit || new Date()), 'dd-MM-yyyy'), 190, 73, { align: "right" });
    
    // Table Header
    const startY = 95;
    doc.setFillColor(black);
    doc.rect(20, startY, 170, 10, 'F');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(white);
    doc.text("QTY", 25, startY + 7);
    doc.text("Description", 45, startY + 7);
    doc.text("Unit Price", 145, startY + 7);
    doc.text("Amount", 185, startY + 7, { align: "right" });
    
    // Table Rows
    doc.setFont("helvetica", "normal");
    doc.setTextColor(black);
    
    const durationMins = differenceInMinutes(new Date(booking.actualExit || booking.expectedExit), new Date(booking.entryTime));
    const hours = Math.floor(durationMins / 60);
    const mins = durationMins % 60;
    const durationStr = `${hours}h ${mins}m`;
    
    // Row 1: Parking Fee
    doc.text("1", 28, startY + 18, { align: "center" });
    doc.text(`Parking Session (${durationStr}) - ${booking.areaName || 'Lot'}`, 45, startY + 18);
    doc.text(Number(booking.paidAmount || 0).toFixed(2), 145, startY + 18);
    doc.text(Number(booking.paidAmount || 0).toFixed(2), 185, startY + 18, { align: "right" });
    
    let currentY = startY + 18;
    
    // Row 2: Penalty (if exists)
    if (booking.penaltyAmount > 0) {
      currentY += 10;
      doc.text("1", 28, currentY, { align: "center" });
      doc.text("Late Exit Penalty Fee", 45, currentY);
      doc.text(Number(booking.penaltyAmount).toFixed(2), 145, currentY);
      doc.text(Number(booking.penaltyAmount).toFixed(2), 185, currentY, { align: "right" });
    }
    
    // Draw line below rows
    currentY += 8;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, currentY, 190, currentY);
    
    // Totals Section
    const subtotal = (booking.paidAmount || 0) + (booking.penaltyAmount || 0);
    const tax = 0;
    const total = subtotal + tax;
    
    currentY += 8;
    doc.text("Subtotal", 130, currentY);
    doc.text(`${subtotal.toFixed(2)}`, 185, currentY, { align: "right" });
    
    currentY += 8;
    doc.text("Sales Tax (0%)", 130, currentY);
    doc.text(`${tax.toFixed(2)}`, 185, currentY, { align: "right" });
    
    currentY += 4;
    doc.setDrawColor(mustardYellow); // Mustard Yellow line for total
    doc.setLineWidth(0.5);
    doc.line(130, currentY, 190, currentY);
    
    currentY += 8;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(mustardYellow); // Mustard yellow for "Total"
    doc.text("Total (INR)", 130, currentY);
    doc.text(`Rs. ${total.toFixed(2)}`, 185, currentY, { align: "right" });
    
    currentY += 4;
    doc.line(130, currentY, 190, currentY); // Line under total
    
    // Notes Section
    doc.setFont("helvetica", "bold");
    doc.setTextColor(mustardYellow); 
    doc.text("Notes", 20, 230);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(grey);
    doc.text(`Thank you for parking with ParkEra! All sales are final. Please retain this receipt for warranty or`, 20, 236);
    doc.text(`exchange purposes.`, 20, 241);
    
    // Actual entry/exit details in note
    doc.text(`Arrival: ${format(new Date(booking.entryTime), 'dd MMM yyyy, hh:mm a')}`, 20, 248);
    doc.text(`Departure: ${format(new Date(booking.actualExit || booking.expectedExit), 'dd MMM yyyy, hh:mm a')}`, 20, 253);
    
    doc.text("For questions or support, contact us at support@parkera.com or (555) 987-6543.", 20, 265);
    
    doc.save(`ParkEra_Receipt_${booking.ticketId || booking._id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-12 px-4 max-w-4xl mx-auto w-full space-y-8">
        <h1 className="text-4xl font-black">{t('Hello')}, {user?.name}</h1>

        {/* Pass Section */}
        {activePass && (
          <div className="bg-yellow-50 p-8 rounded-[2.5rem] border-2 border-[#EAB308] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 px-6 py-2 rounded-bl-3xl font-black text-[10px] uppercase tracking-widest bg-black text-white">
              {t('Active Pass')}
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-black">{t('My Parking Pass')}</h2>
                <div className="space-y-2">
                  <p className="flex items-center space-x-2 text-sm font-bold text-gray-600">
                    <span className="text-gray-400">{t('Plan')}:</span>
                    <span className="text-black uppercase">{t(activePass.passType)}</span>
                  </p>
                  <p className="flex items-center space-x-2 text-sm font-bold text-gray-600">
                    <span className="text-gray-400">{t('Location')}:</span>
                    <span className="text-black truncate max-w-[200px]">{t(activePass.areaName)}</span>
                  </p>
                  <p className="flex items-center space-x-2 text-sm font-bold text-gray-600">
                    <span className="text-gray-400">{t('Reserved Slot')}:</span>
                    <span className="bg-black text-white px-2 py-1 rounded text-xs leading-none">{activePass.slotId}</span>
                  </p>
                  <p className="flex items-center space-x-2 text-sm font-bold text-gray-600">
                    <span className="text-gray-400">{t('Benefits')}:</span>
                    <span className="text-green-600">{t('Discounted Hourly Rate')}</span>
                  </p>
                </div>
              </div>

              <div className="bg-white/50 p-4 rounded-2xl border border-yellow-200 backdrop-blur-sm self-stretch md:self-auto flex flex-col justify-center items-center space-y-3 shadow-md">
                <p className="text-[10px] uppercase font-black tracking-widest text-[#EAB308]">{t('Expires In')}</p>
                <PassCountdown endDate={activePass.endDate} />
              </div>
            </div>
          </div>
        )}

        {myActiveBookings.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-gray-200 text-center space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto border-4 border-gray-100">
              <Car className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-black">{t('No Active Bookings')}</h2>
              <p className="text-gray-500 text-sm mt-1">{t('You don\'t have any ongoing parking sessions right now.')}</p>
            </div>
          </div>
        ) : (
          myActiveBookings.map((b: any) => (
            <ActiveBookingCard key={b.id} booking={b} userEmail={user?.email || ''} onExit={handleExit} />
          ))
        )}

        {/* Booking History Section */}
        {bookingHistory.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-black tracking-tight flex items-center space-x-3">
              <Clock className="w-6 h-6 text-black" />
              <span>{t('Booking History')}</span>
            </h2>
            <div className="space-y-4">
              {bookingHistory.map((b: any) => (
                <div key={b._id} className="bg-white rounded-[2.5rem] border-2 border-gray-100 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-gray-200 transition-colors">
                  
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-black">{b.areaName}</h3>
                      <div className="flex items-center text-xs text-gray-500 font-medium space-x-2">
                        <MapPin className="w-3 h-3" />
                        <span>{t('Slot')}: <span className="text-black font-bold uppercase">{b.slotId}</span></span>
                        <span className="text-gray-200">|</span>
                        <span className="uppercase">{b.vehicleType}</span>
                        <span className="text-gray-200">|</span>
                        <span>{format(new Date(b.entryTime), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm">
                      <div>
                        <span className="text-[10px] font-black uppercase text-gray-400 block">{t('Duration')}</span>
                        <span className="font-bold text-black">{format(new Date(b.entryTime), 'hh:mm a')} - {format(new Date(b.actualExit || b.expectedExit), 'hh:mm a')}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase text-gray-400 block">{t('Paid')}</span>
                        <span className="font-bold text-black">₹{b.paidAmount + (b.penaltyAmount || 0)}</span>
                      </div>
                      <div className="hidden sm:block">
                        <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">{t('Completed')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center self-end md:self-center">
                    <button 
                      onClick={() => generateReceipt(b)}
                      className="bg-gray-50 hover:bg-black text-gray-600 hover:text-white p-4 rounded-2xl transition-colors flex flex-col items-center justify-center space-y-1 border border-gray-100 hover:border-black group-hover:shadow-md"
                      title={t("Download Receipt")}
                    >
                      <Download className="w-5 h-5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{t('Receipt')}</span>
                    </button>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missed Reservations Section */}
        {missedReservations.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-black tracking-tight flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <span>{t('Missed Reservations')}</span>
            </h2>
            <div className="space-y-4">
              {missedReservations.map((r: any) => (
                <div key={r._id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-black text-black">{t('Slot')} {r.slotId}</span>
                      <span className="text-gray-200">|</span>
                      <span className="text-xs font-bold text-gray-500 uppercase">{t(r.vehicleType)}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span>{t('Reserved')}: {format(new Date(r.bookingTime), 'MMM dd, hh:mm a')}</span>
                      {r.penaltyPaidAt && (
                        <span>{t('Paid')}: {format(new Date(r.penaltyPaidAt), 'MMM dd, hh:mm a')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400">{t('Penalty')}</p>
                      <p className="text-lg font-black text-red-600">₹{r.penaltyAmount}</p>
                    </div>
                    {r.penaltyStatus === 'paid' ? (
                      <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">{t('Paid')}</span>
                    ) : (
                      <button
                        disabled={payingPenaltyId === r._id}
                        onClick={async () => {
                          setPayingPenaltyId(r._id);
                          try {
                            await fetch(`${import.meta.env.VITE_API_URL}/api/reservations/pay-penalty`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ reservationId: r._id })
                            });
                            setMissedReservations(prev => prev.map(mr =>
                              mr._id === r._id ? { ...mr, penaltyStatus: 'paid', penaltyPaidAt: new Date().toISOString() } : mr
                            ));
                            toast.success(t('Penalty paid!'));
                          } catch { toast.error(t('Payment failed.')); }
                          setPayingPenaltyId(null);
                        }}
                        className="bg-red-600 text-white text-xs font-black px-4 py-2 rounded-xl hover:bg-red-700 transition-colors disabled:bg-gray-400"
                      >
                        {payingPenaltyId === r._id ? t('...') : t('Pay Now')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Exit Modal */}
      <AnimatePresence>
        {exitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div className="absolute inset-0 bg-black/70" onClick={() => setExitModal(null)} />

            <motion.div className="bg-white p-10 rounded-3xl relative z-10 max-w-md w-full space-y-6">

              <h2 className="text-2xl font-black text-center">{t('Exit Confirmation')}</h2>

              <div className="bg-gray-100 p-6 rounded-2xl space-y-3">
                <p className="flex justify-between">
                  <span>{t('Late Duration')}</span>
                  <span className="font-bold">{exitModal.lateMins} {t('mins')}</span>
                </p>

                <p className="flex justify-between text-xl font-black">
                  <span>{t('Penalty')}</span>
                  <span className="text-red-500">₹{exitModal.penalty}</span>
                </p>
              </div>

              {exitModal.penalty > 0 && (
                <div className="flex items-start space-x-2 text-yellow-700 bg-yellow-50 p-4 rounded-xl">
                  <Info className="w-5 h-5 mt-1" />
                  <p className="text-xs font-bold">{t('₹2 per minute late charge applied.')}</p>
                </div>
              )}

              <button
                onClick={confirmExit}
                disabled={isProcessingExit}
                className="w-full bg-black text-white py-4 rounded-xl font-bold"
              >
                {isProcessingExit ? t("Processing...") : t("Pay & Exit")}
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <FeedbackModal
        isOpen={!!feedbackBookingId}
        onClose={() => setFeedbackBookingId(null)}
        onSubmit={(rating) => {
          if (feedbackBookingId) {
            submitFeedback(feedbackBookingId, rating);
            toast.success("Thank you for your feedback!");
            setFeedbackBookingId(null);
          }
        }}
      />
    </div>
  );
};
