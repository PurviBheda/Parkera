import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Car, Bike, Smartphone, ArrowLeft, ArrowRight, Clock,
  CreditCard, ShieldCheck, CheckCircle2, AlertCircle,
  MapPin, Info, Timer, QrCode
} from 'lucide-react';
import { format, addMinutes } from 'date-fns';
import { toast } from 'sonner';
// @ts-ignore
import QRCodeImage from '../../assests/QR code.jpg';

export const BookingFlow = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { selectedArea, activeBookings, addBooking } = useBooking();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [vehicleType, setVehicleType] = useState<'car' | 'bike' | 'scooty'>('car');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [duration, setDuration] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [penaltyPaymentProcessing, setPenaltyPaymentProcessing] = useState(false);
  const [autoPenaltyEnabled, setAutoPenaltyEnabled] = useState(true);
  const [pendingPenaltyData, setPendingPenaltyData] = useState<any>(null);
  const [showPendingPenaltyModal, setShowPendingPenaltyModal] = useState(false);
  const [reservedPassSlots, setReservedPassSlots] = useState<string[]>([]);
  const [etaReservedSlots, setEtaReservedSlots] = useState<any[]>([]);
  const [etaDetails, setEtaDetails] = useState<any>(null);
  const [activeReservation, setActiveReservation] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const isPremiumUser = (user as any)?.role === 'premium' || (user as any)?.isPremium;

  const currentUserIdentifier = (user as any)?._id || user?.email || 'unknown';
  const hasActiveSession = activeBookings.some(b => b.userId === currentUserIdentifier && b.status === 'active');

  // Payment States
  const [cardDetails, setCardDetails] = useState(() => {
    const saved = localStorage.getItem(`parkflow_saved_card_${currentUserIdentifier}`);
    if (saved) return JSON.parse(saved);
    return {
      number: '1234 1234 1234 1234',
      expiry: '12/28',
      cvv: '123',
      name: (user as any)?.name || 'Purvi Bheda',
    };
  });
  const [upiId, setUpiId] = useState('');

  // Card Formatting Handlers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (val.length > 16) val = val.slice(0, 16); // Limit to 16
    // Add spaces every 4 digits
    const formatted = val.replace(/(\d{4})/g, '$1 ').trim();
    setCardDetails({ ...cardDetails, number: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (val.length > 4) val = val.slice(0, 4); // Limit to 4 digits (MMYY)

    // Auto-insert slash
    if (val.length >= 3) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardDetails({ ...cardDetails, expiry: val });
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (val.length > 3) val = val.slice(0, 3); // Strictly 3 digits
    setCardDetails({ ...cardDetails, cvv: val });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Allow only letters and spaces
    setCardDetails({ ...cardDetails, name: val });
  };

  useEffect(() => {
    if (!selectedArea) {
      navigate('/dashboard');
      return;
    }

    const areaIdentifier = (selectedArea as any)?._id || selectedArea?.id;
    if (areaIdentifier) {
      fetch(`https://parkera-backend.onrender.com/api/passes/slots?areaId=${areaIdentifier}`)
        .then(res => res.json())
        .then(data => setReservedPassSlots(data.reservedSlots || []))
        .catch(err => console.error("Failed to fetch reserved pass slots:", err));

      fetch(`https://parkera-backend.onrender.com/api/reservations/area/${areaIdentifier}`)
        .then(res => res.json())
        .then(data => setEtaReservedSlots(data.reservations || []))
        .catch(err => console.error("Failed to fetch ETA reservations:", err));
    }

    const userId = (user as any)?._id || user?.email;
    if (userId) {
      fetch(`https://parkera-backend.onrender.com/api/reservations/user/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.reservation) {
            setActiveReservation(data.reservation);
            setAutoPenaltyEnabled(data.reservation.autoPenalty !== false);

            const expiry = new Date(data.reservation.reservationExpiryTime).getTime();
            // If the reservation is already expired logically, go straight to step 7 to prevent reverting back to step 6.
            if (Date.now() >= expiry) {
              setStep(7);
            } else {
              setStep(6);
            }
          } else {
            setActiveReservation(null);
          }
        })
        .catch(err => console.error("Failed to fetch user reservation:", err));

      // Check for pending penalties
      fetch(`https://parkera-backend.onrender.com/api/reservations/pending-penalty/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.hasPending) {
            setPendingPenaltyData(data.reservation);
            setShowPendingPenaltyModal(true);
          }
        })
        .catch(err => console.error("Failed to check pending penalty:", err));
    }
  }, [selectedArea, navigate, user, step]);

  useEffect(() => {
    let timer: any;
    if (activeReservation && step === 6) {
      timer = setInterval(() => {
        const expiry = new Date(activeReservation.reservationExpiryTime).getTime();
        const now = new Date().getTime();
        const diff = Math.floor((expiry - now) / 1000);
        if (diff <= 0) {
          clearInterval(timer);
          setTimeLeft(0);
          setTimeout(() => {
            setStep(7);
          }, 2000);
        } else {
          setTimeLeft(diff);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeReservation, step]);

  if (!selectedArea) return null;

  // Calculate occupied slots per vehicle type for the selected area
  const areaIdentifier = (selectedArea as any)?._id || selectedArea?.id;
  const occupiedSlots = activeBookings.reduce((acc, b) => {
    if (b.areaId === areaIdentifier && b.status === 'active') {
      if (b.vehicleType === 'car') acc.car++;
      if (b.vehicleType === 'bike') acc.bike++;
      if (b.vehicleType === 'scooty') acc.scooty++;
    }
    return acc;
  }, { car: 0, bike: 0, scooty: 0 });

  const availableCarSlots = Math.max(0, selectedArea.availableSlots.car - occupiedSlots.car - reservedPassSlots.filter(s => s.startsWith('C')).length - etaReservedSlots.filter(s => s.vehicleType === 'car').length);
  const availableBikeSlots = Math.max(0, selectedArea.availableSlots.bike - occupiedSlots.bike - reservedPassSlots.filter(s => s.startsWith('T') || s.startsWith('B')).length - etaReservedSlots.filter(s => s.vehicleType === 'bike').length);
  const availableScootySlots = Math.max(0, selectedArea.availableSlots.scooty - occupiedSlots.scooty - reservedPassSlots.filter(s => s.startsWith('E') || s.startsWith('S')).length - etaReservedSlots.filter(s => s.vehicleType === 'scooty').length);

  const formatTimeLeft = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleReserveSlot = () => {
    if (!selectedSlot) return;
    setIsProcessing(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setIsProcessing(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const destLat = (selectedArea as any).lat;
        const destLng = (selectedArea as any).lng;

        fetch(`https://parkera-backend.onrender.com/api/reservations/calculate-eta?originLat=${latitude}&originLng=${longitude}&destLat=${destLat}&destLng=${destLng}`)
          .then(res => res.json())
          .then(data => {
            setEtaDetails(data);
            setIsProcessing(false);
            setStep(5);
          })
          .catch(err => {
            toast.error("Failed to calculate ETA");
            setIsProcessing(false);
          });
      },
      (error) => {
        toast.error("Location access denied. Cannot calculate ETA.");
        setIsProcessing(false);
      }
    );
  };

  const confirmReservation = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`https://parkera-backend.onrender.com/api/reservations/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: (user as any)?._id || user?.email,
          parkingAreaId: areaIdentifier,
          slotId: selectedSlot,
          vehicleType: vehicleType,
          etaMins: etaDetails.etaMins,
          bufferMins: etaDetails.bufferMins,
          userEmail: user?.email,
          autoPenalty: autoPenaltyEnabled
        })
      });
      const data = await res.json();
      if (data.reservation) {
        setActiveReservation(data.reservation);
        setStep(6);
        toast.success("Slot Reserved based on ETA!");
      } else {
        toast.error("Could not reserve slot.");
      }
    } catch (err) {
      toast.error("Error creating reservation.");
    }
    setIsProcessing(false);
  };

  const handleCheckIn = async () => {
    setIsProcessing(true);
    // Since we arrived safely, we need to let the backend know so it stops the expiry cron block.
    try {
      const res = await fetch(`https://parkera-backend.onrender.com/api/reservations/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: activeReservation._id,
          expectedExit: addMinutes(new Date(), 60).toISOString(),
          paidAmount: 0,
          userEmail: user?.email,
          areaName: selectedArea?.name
        })
      });
      const data = await res.json();

      if (data.booking) {
        toast.success("Arrived Successfully! Redirecting to Payment...");
        // The standard check-in flow is: Choose Duration -> Payment -> Confirmed.
        // Move user to step 2 to pick duration and finalize payment.
        setActiveReservation(null);
        setStep(2);
      } else {
        toast.error("Failed to sync check-in with the server.");
      }
    } catch (error) {
      toast.error("Check-in error.");
    }
    setIsProcessing(false);
  };

  const totalCost = duration * 30;
  const exitTime = addMinutes(new Date(), duration * 60);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment gateway
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Save strictly validated card details for this user ID on successful payment if they used CC
    if (selectedPaymentMethod === 0) {
      localStorage.setItem(`parkflow_saved_card_${currentUserIdentifier}`, JSON.stringify(cardDetails));
    }

    const id = `PF-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingId(id);

    addBooking({
      id,
      userId: (user as any)?._id || user?.email || 'unknown',
      areaId: (selectedArea as any)?._id || selectedArea?.id,
      areaName: selectedArea.name,
      vehicleType,
      slotId: selectedSlot || 'A-1',
      startTime: new Date().toISOString(),
      endTime: exitTime.toISOString(),
      totalCost,
      userEmail: user?.email,
      userName: (user as any)?.name || user?.email || 'Guest',
      status: 'active'
    });

    // 2. Save Booking to Backend to Trigger Confirmation Email and Cron Jobs
    try {
      await fetch('https://parkera-backend.onrender.com/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: (user as any)?._id || user?.email || 'guest',
          ticketId: id,
          userEmail: user?.email,
          userName: (user as any)?.name || 'Guest',
          slotId: selectedSlot,
          areaName: selectedArea?.name,
          vehicleType: vehicleType,
          entryTime: new Date().toISOString(),
          expectedExit: exitTime.toISOString(),
          paidAmount: totalCost
        })
      });
    } catch (err) {
      console.error("Failed to sync booking with backend:", err);
    }

    setIsProcessing(false);
    setStep(4);
    toast.success('Parking spot booked successfully!');
  };

  const steps = [
    { title: t('Vehicle & Slot'), icon: Car },
    { title: t('Duration'), icon: Clock },
    { title: t('Payment'), icon: CreditCard },
    { title: t('Confirm'), icon: CheckCircle2 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-12 px-4 max-w-4xl mx-auto w-full">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4 px-2">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center space-y-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step > i + 1 ? 'bg-black border-black text-white' :
                  step === i + 1 ? 'border-[#EAB308] bg-yellow-50 text-black' :
                    'border-gray-200 bg-white text-gray-300'
                  }`}>
                  {step > i + 1 ? <CheckCircle2 className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${step === i + 1 ? 'text-black' : 'text-gray-400'
                  }`}>{s.title}</span>
              </div>
            ))}
          </div>
          <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden mx-6">
            <motion.div
              className="absolute left-0 top-0 h-full bg-[#EAB308]"
              animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Vehicle & Slot */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-black tracking-tighter">{t('Select Your Vehicle Type.')}</h2>
                  <p className="text-gray-500 font-medium italic">{t('We have dedicated zones for different vehicles.')}</p>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  {[
                    { type: 'car' as const, icon: Car, label: t('Four Wheeler'), count: availableCarSlots },
                    { type: 'bike' as const, icon: Bike, label: t('Two Wheeler'), count: availableBikeSlots },
                    { type: 'scooty' as const, icon: Smartphone, label: t('Electric/Scooty'), count: availableScootySlots }
                  ].map((v) => (
                    <button
                      key={v.type}
                      onClick={() => setVehicleType(v.type)}
                      className={`relative p-6 rounded-3xl border-2 transition-all group flex flex-col items-center space-y-3 ${vehicleType === v.type ? 'border-[#EAB308] bg-yellow-50' : 'border-gray-50 bg-gray-50 hover:border-gray-200'
                        }`}
                    >
                      <v.icon className={`w-10 h-10 ${vehicleType === v.type ? 'text-black' : 'text-gray-400 group-hover:text-black transition-colors'}`} />
                      <div className="text-center">
                        <p className={`text-xs font-black uppercase tracking-widest ${vehicleType === v.type ? 'text-black' : 'text-gray-500'}`}>{v.label}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{v.count} {t('Slots Available')}</p>
                      </div>
                      {vehicleType === v.type && (
                        <div className="absolute -top-2 -right-2 bg-black text-white p-1 rounded-full border-4 border-white">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <h3 className="font-black text-black tracking-tight flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-[#EAB308]" />
                    <span>{t('Choose a Slot (Zone A)')}</span>
                  </h3>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                    {Array.from({ length: selectedArea.availableSlots[vehicleType] }).map((_, i) => {
                      const id = `${vehicleType.toUpperCase()[0]}-${i + 1}`;
                      const areaIdentifier = (selectedArea as any)?._id || selectedArea?.id;
                      const isOccupiedByBooking = activeBookings.some(b => b.areaId === areaIdentifier && b.vehicleType === vehicleType && b.slotId === id && b.status === "active");
                      const isOccupiedByPass = reservedPassSlots.includes(id);
                      const isOccupied = isOccupiedByBooking || isOccupiedByPass;

                      const etaReservation = etaReservedSlots.find(r => r.slotId === id && r.vehicleType === vehicleType);
                      const isEtaReserved = !!etaReservation;

                      let slotClass = 'bg-[#a3e6b5] border-[#82d197] text-black hover:border-black hover:bg-[#82d197] shadow-sm';
                      if (isOccupiedByPass) {
                        slotClass = 'bg-red-500 border-red-600 text-white cursor-not-allowed shadow-none opacity-90';
                      } else if (isOccupiedByBooking) {
                        slotClass = 'bg-gray-400 border-gray-500 text-white cursor-not-allowed shadow-none opacity-90';
                      } else if (isEtaReserved) {
                        slotClass = 'bg-orange-400 border-orange-500 text-white cursor-not-allowed shadow-none opacity-90';
                      } else if (selectedSlot === id) {
                        slotClass = 'bg-black border-black text-white scale-110 shadow-lg';
                      }

                      return (
                        <button
                          key={id}
                          disabled={isOccupied || isEtaReserved}
                          onClick={() => {
                            if (hasActiveSession) {
                              setShowWarning(true);
                            } else {
                              setSelectedSlot(id);
                            }
                          }}
                          className={`h-12 rounded-xl text-[10px] font-black transition-all border-2 ${slotClass}`}
                        >
                          {id}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-[#a3e6b5] border border-[#82d197] rounded"></div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('Available')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-400 border border-orange-500 rounded"></div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('Reserved')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-gray-400 rounded"></div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('Occupied')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded"></div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('Premium/Violator')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-black rounded"></div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('Selected')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center space-x-2 text-sm font-black text-gray-400 hover:text-black transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t('Back to Map')}</span>
                </button>
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
                  <button
                    disabled={!selectedSlot}
                    onClick={handleReserveSlot}
                    className="bg-orange-500 text-white px-8 py-5 rounded-2xl font-black shadow-xl shadow-orange-500/20 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center space-x-3 disabled:bg-gray-200 disabled:scale-100"
                  >
                    {isProcessing ? <span>{t('Calculating ETA...')}</span> : <span>{t('Reserve Slot (ETA)')}</span>}
                  </button>
                  <button
                    disabled={!selectedSlot}
                    onClick={() => setStep(2)}
                    className="bg-black text-white px-8 py-5 rounded-2xl font-black shadow-xl shadow-black/10 hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center space-x-3 disabled:bg-gray-200 disabled:scale-100"
                  >
                    <span>{t('Instant Booking')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Duration Selector */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-12">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto border-4 border-yellow-100 shadow-inner">
                    <Clock className="w-10 h-10 text-[#EAB308]" />
                  </div>
                  <h2 className="text-4xl font-black text-black tracking-tighter">{t('How long will you stay?')}</h2>
                  <p className="text-gray-500 font-medium max-w-sm mx-auto">{t("Select your estimated parking duration. You'll be notified 15 minutes before your time ends.")}</p>
                </div>

                <div className="flex flex-col items-center space-y-8">
                  <div className="flex items-center space-x-6">
                    <button
                      onClick={() => setDuration(Math.max(0.5, duration - 0.5))}
                      className="w-16 h-16 rounded-3xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center text-3xl font-black hover:bg-black hover:text-white transition-all shadow-sm"
                    >
                      -
                    </button>
                    <div className="text-center w-32">
                      <p className="text-7xl font-black text-black tracking-tighter">{duration === 0.5 ? '30' : duration}</p>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#EAB308]">{duration === 0.5 ? t('Mins') : t('Hours')}</p>
                    </div>
                    <button
                      onClick={() => setDuration(Math.min(24, duration + 0.5))}
                      className="w-16 h-16 rounded-3xl bg-gray-50 border-2 border-gray-100 flex items-center justify-center text-3xl font-black hover:bg-black hover:text-white transition-all shadow-sm"
                    >
                      +
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-8 w-full max-w-md pt-8 border-t border-gray-50">
                    <div className="text-center">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('Start Time')}</p>
                      <p className="text-sm font-bold">{format(new Date(), 'hh:mm a')}</p>
                    </div>
                    <div className="flex items-center justify-center">
                      <ArrowRight className="text-gray-200" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('End Time')}</p>
                      <p className="text-sm font-bold">{format(exitTime, 'hh:mm a')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black text-white p-8 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 shadow-2xl shadow-black/20">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#EAB308]">{t('Estimated Total')}</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-5xl font-black">₹{totalCost}</span>
                    <span className="text-gray-400 text-sm font-bold">/ {duration === 0.5 ? '30m' : duration + 'h'}</span>
                  </div>
                </div>
                <div className="flex space-x-4 w-full md:w-auto">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 md:flex-none px-8 py-5 rounded-2xl font-black text-gray-400 border border-gray-800 hover:text-white transition-all"
                  >
                    {t('Back')}
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 md:flex-none bg-[#EAB308] text-black px-10 py-5 rounded-2xl font-black hover:scale-[1.05] transition-all shadow-xl shadow-yellow-900/10"
                  >
                    {t('Proceed to Pay')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment Simulation */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left: Summary */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8">
                  <h2 className="text-2xl font-black text-black tracking-tighter flex items-center space-x-3">
                    <ShieldCheck className="text-[#EAB308] w-7 h-7" />
                    <span>{t('Booking Summary')}</span>
                  </h2>

                  <div className="space-y-4">
                    {[
                      { label: t('Parking Area'), value: selectedArea.name, icon: MapPin },
                      { label: t('Vehicle Type'), value: vehicleType.toUpperCase(), icon: Car },
                      { label: t('Selected Slot'), value: selectedSlot, icon: Info },
                      { label: t('Total Duration'), value: duration === 0.5 ? t('30 Mins') : `${duration} ${t('Hours')}`, icon: Clock },
                      { label: t('Booking Date'), value: format(new Date(), 'MMM dd, yyyy'), icon: Timer }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-center py-2">
                        <div className="flex items-center space-x-3 text-gray-400 font-medium">
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <span className="text-sm font-black text-black">{item.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-gray-50 space-y-2">
                    <div className="flex justify-between items-center text-gray-400 text-sm font-medium">
                      <span>{t('Base Rate')}</span>
                      <span>₹30.00 x {duration}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-400 text-sm font-medium">
                      <span>{t('Taxes & Fees')}</span>
                      <span className="text-green-600 font-black">{t('FREE')}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-xl font-black">{t('Total Payable')}</span>
                      <span className="text-3xl font-black text-[#EAB308]">₹{totalCost}.00</span>
                    </div>
                  </div>
                </div>

                {/* Right: Payment Method */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8">
                  <h2 className="text-2xl font-black text-black tracking-tighter">{t('Secure Payment.')}</h2>

                  <div className="space-y-4">
                    {[t('Credit / Debit Card'), t('UPI Payment (GPay, PhonePe)')].map((method, i) => (
                      <div key={i} className={`rounded-2xl border-2 transition-all ${i === selectedPaymentMethod ? 'border-[#EAB308] bg-white' : 'border-gray-50 bg-white hover:border-gray-200'}`}>
                        <button
                          onClick={() => setSelectedPaymentMethod(i)}
                          className="w-full flex items-center justify-between p-5 group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform">
                              <CreditCard className={`w-5 h-5 ${i === selectedPaymentMethod ? 'text-[#EAB308]' : 'text-gray-400'}`} />
                            </div>
                            <span className={`font-bold text-sm ${i === selectedPaymentMethod ? 'text-black' : 'text-gray-500'}`}>{method}</span>
                          </div>
                          {i === selectedPaymentMethod && <div className="w-3 h-3 bg-[#EAB308] rounded-full border-2 border-white shadow-sm"></div>}
                        </button>

                        {/* Expandable Content for Credit Card */}
                        <AnimatePresence>
                          {i === 0 && selectedPaymentMethod === 0 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border-t border-gray-100"
                            >
                              <div className="p-5 space-y-4 bg-yellow-50/30">
                                <p className="text-[10px] text-gray-500 font-medium">{t('Payment is processed through your bank card network (Visa, Mastercard, RuPay).')}</p>
                                <div className="space-y-3">
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Card Number')}</label>
                                    <input
                                      type="text"
                                      className={`w-full bg-white border ${cardDetails.number && cardDetails.number.replace(/\s/g, '').length < 16 ? 'border-red-500' : 'border-gray-200 focus:border-[#EAB308]'} rounded-xl py-2 px-3 outline-none font-bold text-sm font-mono tracking-widest text-black`}
                                      value={cardDetails.number}
                                      onChange={handleCardNumberChange}
                                      placeholder="0000 0000 0000 0000"
                                    />
                                    {cardDetails.number && cardDetails.number.replace(/\s/g, '').length < 16 && (
                                      <p className="text-[10px] text-red-500 font-bold">{t('16 digits required.')}</p>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Expiry Date')}</label>
                                      <input
                                        type="text"
                                        className={`w-full bg-white border ${cardDetails.expiry && cardDetails.expiry.length < 5 ? 'border-red-500' : 'border-gray-200 focus:border-[#EAB308]'} rounded-xl py-2 px-3 outline-none font-bold text-sm font-mono text-black`}
                                        placeholder="MM/YY"
                                        value={cardDetails.expiry}
                                        onChange={handleExpiryChange}
                                      />
                                      {cardDetails.expiry && cardDetails.expiry.length < 5 && (
                                        <p className="text-[10px] text-red-500 font-bold">{t('Valid date required.')}</p>
                                      )}
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('CVV')}</label>
                                      <input
                                        type="password"
                                        className={`w-full bg-white border ${cardDetails.cvv && cardDetails.cvv.length < 3 ? 'border-red-500' : 'border-gray-200 focus:border-[#EAB308]'} rounded-xl py-2 px-3 outline-none font-bold text-sm font-mono text-black`}
                                        placeholder="123"
                                        value={cardDetails.cvv}
                                        onChange={handleCvvChange}
                                      />
                                      {cardDetails.cvv && cardDetails.cvv.length < 3 && (
                                        <p className="text-[10px] text-red-500 font-bold">{t('3 digits required.')}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Cardholder Name')}</label>
                                    <input
                                      type="text"
                                      className={`w-full bg-white border ${cardDetails.name && cardDetails.name.toLowerCase() !== ((user as any)?.name || '').toLowerCase() ? 'border-red-500' : 'border-gray-200 focus:border-[#EAB308]'} rounded-xl py-2 px-3 outline-none font-bold text-sm text-black uppercase`}
                                      placeholder="ENTER YOUR NAME"
                                      value={cardDetails.name}
                                      onChange={handleNameChange}
                                    />
                                    {cardDetails.name && cardDetails.name.toLowerCase() !== ((user as any)?.name || '').toLowerCase() && (
                                      <p className="text-[10px] text-red-500 font-bold">{t('Name must match your account ({name}).', { name: ((user as any)?.name || t('Account')) })}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Expandable Content for UPI */}
                        <AnimatePresence>
                          {i === 1 && selectedPaymentMethod === 1 && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border-t border-gray-100"
                            >
                              <div className="p-5 space-y-5 bg-yellow-50/30">
                                <p className="text-[10px] text-gray-500 font-medium">{t('You pay using UPI ID or your UPI app (Google Pay, PhonePe, Paytm). You just approve the payment in your mobile app.')}</p>
                                <div className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
                                  <img src={QRCodeImage} alt="UPI QR Code" className="w-32 h-32 object-contain mb-2 rounded-xl shadow-sm" />
                                  <span className="text-xs font-bold text-gray-400">{t('Scan QR Code')}</span>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Or enter UPI ID')}</label>
                                  <input
                                    type="text"
                                    className="w-full bg-white border border-gray-200 focus:border-[#EAB308] rounded-xl py-2 px-3 outline-none font-bold text-sm text-black"
                                    placeholder="example@upi"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-gray-400 mt-1" />
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      {t('By proceeding, you agree to our terms. Penalty of ₹2 per late minute will apply if you exceed your booked duration.')}
                    </p>
                  </div>

                  {(() => {
                    let isPaymentValid = false;
                    if (selectedPaymentMethod === 0) {
                      const cleanNumber = cardDetails.number.replace(/\s/g, '');
                      isPaymentValid = cleanNumber.length === 16 && cardDetails.expiry.length === 5 && cardDetails.cvv.length === 3 && cardDetails.name.trim().toLowerCase() === ((user as any)?.name?.toLowerCase() || '');
                    } else if (selectedPaymentMethod === 1) {
                      isPaymentValid = upiId.trim() !== '';
                    }

                    return (
                      <button
                        disabled={isProcessing || !isPaymentValid}
                        onClick={handlePayment}
                        className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:bg-gray-400 disabled:scale-100 group"
                      >
                        <span>{isProcessing ? t('Processing...') : `${t('Pay')} ₹${totalCost}.00`}</span>
                        {!isProcessing && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        {isProcessing && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Booking Confirmation */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl space-y-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#EAB308]"></div>

                <div className="space-y-6">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100/50">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black text-black tracking-tighter">{t('Booking Confirmed!')}</h2>
                    <p className="text-gray-500 font-medium">{t('Your slot is now marked as')} <span className="text-red-500 font-black">{t('OCCUPIED')}</span>.</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-dashed border-gray-200 space-y-6">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">{t('Booking ID')}</span>
                    <span className="text-3xl font-black text-black tracking-tight">{bookingId}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-6">
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-1">{t('Slot No')}</p>
                      <p className="font-bold text-black">{selectedSlot}</p>
                    </div>
                    <div className="text-center border-l border-gray-200">
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-1">{t('Vehicle')}</p>
                      <p className="font-bold text-black uppercase">{vehicleType}</p>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-center">
                    <div className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">
                      <Clock className="w-3 h-3 text-[#EAB308]" />
                      <span>{t('Expires')}: {format(exitTime, 'hh:mm a')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 group"
                  >
                    <span>{t('Go to Dashboard')}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                    {t('A confirmation email has been sent.')}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          {/* Step 5: ETA Reservation Confirmation */}
          {step === 5 && etaDetails && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl space-y-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>

                <div className="space-y-6">
                  <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-orange-100/50">
                    <Clock className="w-12 h-12 text-orange-600" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-black tracking-tighter">{t('Confirm Reservation')}</h2>
                    <p className="text-gray-500 font-medium">{t('Your route has been calculated successfully.')}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-[2rem] border-2 border-dashed border-gray-200 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-1">{t('Travel Time (ETA)')}</p>
                      <p className="font-bold text-black text-xl">{etaDetails.etaMins} {t('Mins')}</p>
                    </div>
                    <div className="text-center border-l border-gray-200">
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-1">{t('Traffic Buffer')}</p>
                      <p className="font-bold text-black text-xl">+{etaDetails.bufferMins} {t('Mins')}</p>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-center border-t border-gray-200">
                    <div className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-xl font-black uppercase tracking-widest border border-orange-200">
                      <Timer className="w-4 h-4 text-orange-600" />
                      <span>{t('Total Window')}: {etaDetails.etaMins + etaDetails.bufferMins} {t('Mins')}</span>
                    </div>
                  </div>
                </div>

                {/* AutoPay Toggle */}
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="space-y-1">
                      <p className="text-sm font-black text-black">{t('Enable Auto Penalty Payment')}</p>
                      <p className="text-[10px] text-gray-400 font-medium leading-relaxed">{t('If you fail to arrive before the timer ends, the penalty will be automatically charged using your saved payment method.')}</p>
                    </div>
                    <div className="relative ml-4 flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={autoPenaltyEnabled}
                        onChange={(e) => setAutoPenaltyEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-checked:bg-orange-500 rounded-full transition-colors"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5"></div>
                    </div>
                  </label>
                </div>

                <div className="space-y-4">
                  <button
                    disabled={isProcessing}
                    onClick={confirmReservation}
                    className="w-full bg-orange-500 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 group disabled:bg-gray-400"
                  >
                    <span>{isProcessing ? t("Reserving...") : t("Hold My Slot")}</span>
                    {!isProcessing && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="w-full bg-white text-gray-500 py-4 rounded-2xl font-black text-md hover:bg-gray-50 transition-all flex items-center justify-center space-x-2"
                  >
                    {t('Cancel')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 6: Active Reservation Countdown */}
          {step === 6 && activeReservation && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl space-y-8 text-center relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-2 ${timeLeft < 300 ? 'bg-red-500' : 'bg-orange-500'}`}></div>

                <div className="space-y-4 flex flex-col items-center">
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 shadow-xl mb-4 ${timeLeft < 300 ? 'border-red-500 text-red-600 bg-red-50' : 'border-orange-500 text-orange-600 bg-orange-50'}`}>
                    <span className="text-4xl font-black font-mono tracking-tighter">
                      {formatTimeLeft(timeLeft)}
                    </span>
                  </div>
                  <h2 className="text-3xl font-black text-black tracking-tighter">{t('Arriving Soon')}</h2>
                  <p className="text-gray-500 font-medium pb-2">
                    {t('You have reserved slot')} <strong className="text-black text-lg">{activeReservation.slotId}</strong>.
                  </p>
                </div>

                <div className="bg-orange-50 p-6 rounded-[2rem] border-2 border-orange-100 space-y-4">
                  <p className="text-sm font-bold text-orange-800">
                    {t('Your slot is held. Please arrive before the timer runs out. Failure to arrive incurs a ₹15 penalty.')}
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    disabled={isProcessing}
                    onClick={handleCheckIn}
                    className="w-full bg-black text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-gray-900 transition-all flex items-center justify-center space-x-3 disabled:bg-gray-400 group"
                  >
                    <span>{isProcessing ? t("Checking In...") : t("I Have Arrived. Check In.")}</span>
                    {!isProcessing && <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 7: Reservation Penalty — AutoPay ON or OFF */}
          {step === 7 && activeReservation?.autoPenalty && (
            <motion.div
              key="step7-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl space-y-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>

                <div className="space-y-4 flex flex-col items-center">
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-black text-black tracking-tighter">{t('Reservation Expired')}</h2>
                  <p className="text-gray-500 font-medium">
                    {t('You didn\'t arrive before the timer ended.')} <strong className="text-green-600">₹15</strong> {t('penalty has been')} <strong className="text-green-600">{t('automatically charged')}</strong>.
                  </p>
                </div>

                <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500">{t('Reserved Slot')}</span>
                    <span className="text-sm font-black text-black">{activeReservation?.slotId || selectedSlot || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500">{t('Parking Area')}</span>
                    <span className="text-sm font-black text-black">{selectedArea?.name}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-green-200">
                    <span className="text-sm font-bold text-gray-500">{t('Penalty')}</span>
                    <span className="text-sm font-black text-green-600">₹15 — {t('Auto Paid')} ✓</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setActiveReservation(null);
                      navigate('/history');
                    }}
                    className="w-full bg-black text-white py-4 rounded-2xl font-black text-md hover:bg-gray-900 transition-all"
                  >
                    {t('View Receipt')}
                  </button>
                  <button
                    onClick={() => {
                      setActiveReservation(null);
                      navigate('/dashboard');
                    }}
                    className="w-full bg-white text-gray-500 py-4 rounded-2xl font-black text-md border border-gray-200 hover:bg-gray-50 transition-all"
                  >
                    {t('Close')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 7 && (!activeReservation?.autoPenalty) && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto"
            >
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl space-y-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>

                <div className="space-y-4 flex flex-col items-center">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                  </div>
                  <h2 className="text-3xl font-black text-black tracking-tighter">{t('Reservation Expired')}</h2>
                  <p className="text-gray-500 font-medium">
                    {t('You did not arrive in time. A penalty of')} <strong className="text-red-600">₹15</strong> {t('has been applied.')}
                  </p>
                </div>

                {/* Penalty Summary */}
                <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500">{t('Reserved Slot')}</span>
                    <span className="text-sm font-black text-black">{activeReservation?.slotId || selectedSlot || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500">{t('Parking Area')}</span>
                    <span className="text-sm font-black text-black">{selectedArea?.name}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-red-200">
                    <span className="text-lg font-black text-red-600">{t('Penalty Amount')}</span>
                    <span className="text-3xl font-black text-red-600">₹15</span>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-4 text-left">
                  <h3 className="text-lg font-black text-black tracking-tight">{t('Pay Penalty')}</h3>
                  {[t('Credit / Debit Card'), t('UPI Payment (GPay, PhonePe)')].map((method, i) => (
                    <div key={i} className={`rounded-2xl border-2 transition-all ${i === selectedPaymentMethod ? 'border-[#EAB308] bg-white' : 'border-gray-50 bg-white hover:border-gray-200'
                      }`}>
                      <button
                        onClick={() => setSelectedPaymentMethod(i)}
                        className="w-full flex items-center justify-between p-4 group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                            {i === 0 ? <CreditCard className={`w-5 h-5 ${i === selectedPaymentMethod ? 'text-[#EAB308]' : 'text-gray-400'}`} /> : <QrCode className={`w-5 h-5 ${i === selectedPaymentMethod ? 'text-[#EAB308]' : 'text-gray-400'}`} />}
                          </div>
                          <span className={`font-bold text-sm ${i === selectedPaymentMethod ? 'text-black' : 'text-gray-500'}`}>{method}</span>
                        </div>
                        {i === selectedPaymentMethod && <div className="w-3 h-3 bg-[#EAB308] rounded-full border-2 border-white shadow-sm"></div>}
                      </button>

                      {/* Card Details */}
                      <AnimatePresence>
                        {i === 0 && selectedPaymentMethod === 0 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-gray-100"
                          >
                            <div className="p-5 space-y-3 bg-yellow-50/30">
                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Card Number')}</label>
                                <input
                                  type="text"
                                  className="w-full bg-white border border-gray-200 focus:border-[#EAB308] rounded-xl py-2 px-3 outline-none font-bold text-sm font-mono tracking-widest text-black"
                                  value={cardDetails.number}
                                  onChange={handleCardNumberChange}
                                  placeholder="0000 0000 0000 0000"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Expiry')}</label>
                                  <input
                                    type="text"
                                    className="w-full bg-white border border-gray-200 focus:border-[#EAB308] rounded-xl py-2 px-3 outline-none font-bold text-sm font-mono text-black"
                                    value={cardDetails.expiry}
                                    onChange={handleExpiryChange}
                                    placeholder="MM/YY"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('CVV')}</label>
                                  <input
                                    type="password"
                                    className="w-full bg-white border border-gray-200 focus:border-[#EAB308] rounded-xl py-2 px-3 outline-none font-bold text-sm font-mono text-black"
                                    value={cardDetails.cvv}
                                    onChange={handleCvvChange}
                                    placeholder="123"
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* UPI */}
                      <AnimatePresence>
                        {i === 1 && selectedPaymentMethod === 1 && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-gray-100"
                          >
                            <div className="p-5 space-y-4 bg-yellow-50/30">
                              <div className="flex flex-col items-center justify-center p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
                                <img src={QRCodeImage} alt="UPI QR Code" className="w-28 h-28 object-contain mb-2 rounded-xl shadow-sm" />
                                <span className="text-xs font-bold text-gray-400">{t('Scan QR Code')}</span>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Or enter UPI ID')}</label>
                                <input
                                  type="text"
                                  className="w-full bg-white border border-gray-200 focus:border-[#EAB308] rounded-xl py-2 px-3 outline-none font-bold text-sm text-black"
                                  placeholder="example@upi"
                                  value={upiId}
                                  onChange={(e) => setUpiId(e.target.value)}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Pay Now / Pay Later Buttons */}
                <div className="space-y-3">
                  {(() => {
                    let isValid = false;
                    if (selectedPaymentMethod === 0) {
                      const cleanNum = cardDetails.number.replace(/\s/g, '');
                      isValid = cleanNum.length === 16 && cardDetails.expiry.length === 5 && cardDetails.cvv.length === 3;
                    } else {
                      isValid = upiId.trim() !== '';
                    }
                    return (
                      <button
                        disabled={penaltyPaymentProcessing || !isValid}
                        onClick={async () => {
                          setPenaltyPaymentProcessing(true);
                          try {
                            if (activeReservation?._id) {
                              await fetch('https://parkera-backend.onrender.com/api/reservations/pay-penalty', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ reservationId: activeReservation._id })
                              });
                            }
                            await new Promise(r => setTimeout(r, 1500));
                            setActiveReservation(null);
                            toast.success(t('Penalty paid successfully!'));
                            navigate('/dashboard');
                          } catch { toast.error(t('Payment failed.')); }
                          setPenaltyPaymentProcessing(false);
                        }}
                        className="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-red-500/20 hover:bg-red-700 transition-all flex items-center justify-center space-x-3 disabled:bg-gray-400 disabled:scale-100 group"
                      >
                        <span>{penaltyPaymentProcessing ? t('Processing...') : t('Pay Penalty Now')}</span>
                        {penaltyPaymentProcessing && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        {!penaltyPaymentProcessing && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                      </button>
                    );
                  })()}
                  <button
                    onClick={() => {
                      setActiveReservation(null);
                      toast.warning(t('Penalty of ₹15 is pending. You must pay before making new bookings.'));
                      navigate('/dashboard');
                    }}
                    className="w-full bg-white text-gray-500 py-4 rounded-2xl font-black text-md border border-gray-200 hover:bg-gray-50 transition-all"
                  >
                    {t('Pay Later')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Warning Dialog */}
        <AnimatePresence>
          {showWarning && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl"
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-black">{t('Active Booking Exists')}</h3>
                <p className="text-gray-500 font-medium">
                  {t('you can book the slot after current slot is expire')}
                </p>
                <button
                  onClick={() => setShowWarning(false)}
                  className="w-full bg-black text-white py-4 rounded-2xl font-black hover:bg-gray-900 transition-colors"
                >
                  {t('Okay')}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Pending Penalty Blocking Modal */}
        <AnimatePresence>
          {showPendingPenaltyModal && pendingPenaltyData && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl"
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-black text-black">{t('Pending Penalty')}</h3>
                <p className="text-gray-500 font-medium text-sm">
                  {t('You have an unpaid penalty of')} <strong className="text-red-600">₹{pendingPenaltyData.penaltyAmount}</strong> {t('from a missed reservation. Please pay to continue booking.')}
                </p>
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs font-bold text-gray-500">{t('Slot')}</span>
                    <span className="text-xs font-black text-black">{pendingPenaltyData.slotId}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-red-200">
                    <span className="text-sm font-black text-red-600">{t('Penalty')}</span>
                    <span className="text-sm font-black text-red-600">₹{pendingPenaltyData.penaltyAmount}</span>
                  </div>
                </div>
                <button
                  disabled={penaltyPaymentProcessing}
                  onClick={async () => {
                    setPenaltyPaymentProcessing(true);
                    try {
                      await fetch('https://parkera-backend.onrender.com/api/reservations/pay-penalty', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ reservationId: pendingPenaltyData._id })
                      });
                      await new Promise(r => setTimeout(r, 1000));
                      setShowPendingPenaltyModal(false);
                      setPendingPenaltyData(null);
                      toast.success(t('Penalty paid! You can now book.'));
                    } catch { toast.error(t('Payment failed.')); }
                    setPenaltyPaymentProcessing(false);
                  }}
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-black hover:bg-red-700 transition-colors disabled:bg-gray-400"
                >
                  {penaltyPaymentProcessing ? t('Processing...') : `${t('Pay')} ₹${pendingPenaltyData.penaltyAmount} ${t('Now')}`}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
