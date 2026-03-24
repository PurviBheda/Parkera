import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, CreditCard, Car, Bike, Smartphone, MapPin, AlertCircle, Timer, Info, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
// @ts-ignore
import QRCodeImage from '../../assets/QR code.jpg';
import { useTranslation } from 'react-i18next';

export const SelectReservedSlot = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const plan = searchParams.get('plan') || '1-month';
    const price = Number(searchParams.get('price')) || 899;
    const duration = Number(searchParams.get('duration')) || 30;
    const title = searchParams.get('title') || '1 Month Pass';
    const areaId = searchParams.get('areaId') || 'unknown';
    const areaName = searchParams.get('areaName') || 'Unknown Area';

    const [reservedSlots, setReservedSlots] = useState<string[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [vehicleType, setVehicleType] = useState<'car' | 'bike' | 'scooty'>('car');

    // Payment States
    const currentUserIdentifier = (user as any)?._id || user?.email || 'unknown';
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(0);
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

    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 16) val = val.slice(0, 16);
        const formatted = val.replace(/(\d{4})/g, '$1 ').trim();
        setCardDetails({ ...cardDetails, number: formatted });
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 4) val = val.slice(0, 4);
        if (val.length >= 3) {
            val = `${val.slice(0, 2)}/${val.slice(2)}`;
        }
        setCardDetails({ ...cardDetails, expiry: val });
    };

    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 3) val = val.slice(0, 3);
        setCardDetails({ ...cardDetails, cvv: val });
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
        setCardDetails({ ...cardDetails, name: val });
    };

    const { parkingAreas, activeBookings } = useBooking();
    const currentArea = parkingAreas.find((a: any) => a.id === areaId || a._id === areaId);

    // Calculate slots based on vehicle type
    const totalSlots = currentArea ? currentArea.availableSlots[vehicleType] : 50;

    const [showSummary, setShowSummary] = useState(false);
    const [bookingDetails, setBookingDetails] = useState<any>(null);

    // Fetch reserved slots
    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/api/passes/slots?areaId=${areaId}`)
            .then(res => res.json())
            .then(data => setReservedSlots(data.reservedSlots || []))
            .catch(err => console.error(err));
    }, [areaId]);

    const handlePayment = async () => {
        setIsProcessing(true);
        // Simulate payment wait
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (selectedPaymentMethod === 0) {
            localStorage.setItem(`parkflow_saved_card_${currentUserIdentifier}`, JSON.stringify(cardDetails));
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/passes/purchase`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: (user as any)?._id || user?.email,
                    userEmail: user?.email,
                    areaId,
                    areaName,
                    slotId: selectedSlot,
                    passType: title,
                    price: price,
                    durationDays: duration
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            setBookingDetails(data.pass);
            setShowSummary(true);
            toast.success(t('Pass purchased successfully!'));
        } catch (err: any) {
            toast.error(err.message || t('Payment failed'));
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 pt-24 pb-12 px-4 max-w-4xl mx-auto w-full">
                <AnimatePresence mode="wait">
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
                                    <p className="text-gray-500 font-medium italic">{t('We have dedicated zones for different vehicles at')} <span className="font-bold text-black">{areaName}</span>.</p>
                                </div>

                                <div className="grid grid-cols-3 gap-6">
                                    {[
                                        { type: 'car' as const, icon: Car, label: t('Four Wheeler'), count: currentArea ? currentArea.availableSlots.car : 50 },
                                        { type: 'bike' as const, icon: Bike, label: t('Two Wheeler'), count: currentArea ? currentArea.availableSlots.bike : 50 },
                                        { type: 'scooty' as const, icon: Smartphone, label: t('Electric/Scooty'), count: currentArea ? currentArea.availableSlots.scooty : 50 }
                                    ].map((v) => (
                                        <button
                                            key={v.type}
                                            onClick={() => {
                                                setVehicleType(v.type);
                                                setSelectedSlot(null); // Reset slot when vehicle changes
                                            }}
                                            className={`relative p-6 rounded-3xl border-2 transition-all group flex flex-col items-center space-y-3 ${vehicleType === v.type ? 'border-[#EAB308] bg-yellow-50' : 'border-gray-50 bg-gray-50 hover:border-gray-200'
                                                }`}
                                        >
                                            <v.icon className={`w-10 h-10 ${vehicleType === v.type ? 'text-black' : 'text-gray-400 group-hover:text-black transition-colors'}`} />
                                            <div className="text-center">
                                                <p className={`text-xs font-black uppercase tracking-widest ${vehicleType === v.type ? 'text-black' : 'text-gray-500'}`}>{v.label}</p>
                                                <p className="text-[10px] text-gray-400 mt-1">{v.count} {t('Total Slots in Zone')}</p>
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
                                        {Array.from({ length: totalSlots }).map((_, i) => {
                                            const id = `${vehicleType.toUpperCase()[0]}-${i + 1}`;
                                            const areaIdentifier = (currentArea as any)?._id || currentArea?.id;
                                            const isOccupiedByBooking = activeBookings.some(b => b.areaId === areaIdentifier && b.vehicleType === vehicleType && b.slotId === id && b.status === "active");
                                            const isOccupiedByPass = reservedSlots.includes(id);
                                            let isReserved = isOccupiedByBooking || isOccupiedByPass;

                                            return (
                                                <button
                                                    key={id}
                                                    disabled={isReserved}
                                                    onClick={() => setSelectedSlot(id)}
                                                    className={`h-12 rounded-xl text-[10px] font-black transition-all border-2 ${isReserved ? 'bg-red-50 border-red-100 text-red-500 cursor-not-allowed' :
                                                        selectedSlot === id ? 'bg-black border-black text-white scale-110 shadow-lg' :
                                                            'bg-[#a3e6b5] border-[#82d197] text-black hover:border-black hover:bg-[#82d197] shadow-sm'
                                                        }`}
                                                >
                                                    {id}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex items-center justify-center space-x-6 pt-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 rounded bg-[#a3e6b5] border border-[#82d197]"></div>
                                            <span className="text-xs font-bold text-gray-500">{t('Available')}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 rounded bg-red-50 border border-red-100"></div>
                                            <span className="text-xs font-bold text-gray-500">{t('Reserved')}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 rounded bg-black"></div>
                                            <span className="text-xs font-bold text-gray-500">{t('Selected')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <button
                                    onClick={() => navigate('/passes')}
                                    className="flex items-center space-x-2 text-sm font-black text-gray-400 hover:text-black transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>{t('Back to Plans')}</span>
                                </button>
                                <button
                                    disabled={!selectedSlot}
                                    onClick={() => setStep(2)}
                                    className="bg-black text-white px-8 py-5 rounded-2xl font-black shadow-xl shadow-black/10 hover:scale-[1.05] transition-all flex items-center space-x-3 disabled:bg-gray-200 disabled:scale-100"
                                >
                                    <span>{t('Proceed to Payment')}</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm max-w-fit pr-6">
                                <button
                                    onClick={() => setStep(1)}
                                    className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors mr-4"
                                >
                                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                                </button>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Step 2 of 2')}</p>
                                    <p className="font-bold text-black">{t('Complete Payment')}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left: Summary */}
                                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8 h-fit">
                                    <h2 className="text-2xl font-black text-black tracking-tighter flex items-center space-x-3">
                                        <ShieldCheck className="text-[#EAB308] w-7 h-7" />
                                        <span>{t('Pass Summary')}</span>
                                    </h2>

                                    <div className="space-y-4">
                                        {[
                                            { label: t('Location'), value: areaName, icon: MapPin },
                                            { label: t('Vehicle Type'), value: t(vehicleType.toUpperCase()), icon: Car },
                                            { label: t('Reserved Slot'), value: selectedSlot, icon: Info },
                                            { label: t('Pass Plan'), value: t(title), icon: Timer },
                                            { label: t('Start Date'), value: format(new Date(), 'MMM dd, yyyy'), icon: Clock }
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
                                            <span>₹{price}.00</span>
                                        </div>
                                        <div className="flex justify-between items-center text-gray-400 text-sm font-medium">
                                            <span>{t('Taxes & Fees')}</span>
                                            <span className="text-green-600 font-black">{t('FREE')}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-4">
                                            <span className="text-xl font-black">{t('Total Payable')}</span>
                                            <span className="text-3xl font-black text-[#EAB308]">₹{price}.00</span>
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
                                                                            <p className="text-[10px] text-red-500 font-bold">{t('Name must match your account ({{name}}).', { name: (user as any)?.name || 'Account' })}</p>
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
                                            {t('By proceeding, you agree to our terms. This pass is non-refundable and tied strictly to your registered vehicle inside our premises.')}
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
                                                <span>{isProcessing ? t('Processing...') : t('Pay ₹{{price}}.00', { price })}</span>
                                                {!isProcessing && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                                {isProcessing && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                            </button>
                                        );
                                    })()}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showSummary && bookingDetails && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-[3rem] p-10 max-w-md w-full text-center space-y-8 shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-[#EAB308]"></div>

                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100/50">
                                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                                </div>

                                <div>
                                    <h3 className="text-3xl font-black text-black tracking-tight">{t('Pass Reserved!')}</h3>
                                    <p className="text-gray-500 mt-2">{t('Your dedicated slot is locked & ready.')}</p>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-4 border border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t('Location')}</span>
                                        <span className="font-black text-right max-w-[150px] truncate">{bookingDetails.areaName}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t('Slot No')}</span>
                                        <span className="font-black text-lg">{bookingDetails.slotId}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t('Plan')}</span>
                                        <span className="font-black">{t(bookingDetails.passType)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t('Valid Until')}</span>
                                        <span className="font-bold text-[#EAB308]">{new Date(bookingDetails.endDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                                        <span className="text-xs font-bold text-gray-400 uppercase">{t('Amount Paid')}</span>
                                        <span className="font-black">₹{bookingDetails.price}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="w-full bg-black text-white py-5 rounded-2xl font-black shadow-xl hover:bg-gray-900 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>{t('Go to Dashboard')}</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};
