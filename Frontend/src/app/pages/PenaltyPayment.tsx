import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { CreditCard, AlertCircle, ArrowRight, ShieldCheck, Clock, MapPin, QrCode, Car, Info, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { FeedbackModal } from '../components/FeedbackModal';
// @ts-ignore
import QRCodeImage from '../../assets/QR code.jpg';

export const PenaltyPayment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { activeBookings, completeBooking, submitFeedback } = useBooking();
    const [isProcessing, setIsProcessing] = useState(false);
    const [booking, setBooking] = useState<any>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);

    const currentUserIdentifier = (user as any)?._id || user?.email || 'unknown';

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
        const formatted = val.replace(/(\d{4})/g, '$1 ').trim();
        setCardDetails({ ...cardDetails, number: formatted });
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 4) val = val.slice(0, 4);
        if (val.length >= 3) val = `${val.slice(0, 2)}/${val.slice(2)}`;
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

    useEffect(() => {
        const found = activeBookings.find((b: any) => b.id === id);
        if (!found) {
            navigate('/history');
        } else {
            setBooking(found);
        }
    }, [id, activeBookings, navigate]);

    if (!booking) return null;

    // Recalculate penalty just in case
    const endTime = booking.endTime || booking.expectedExit;
    if (!endTime) return null;
    
    const lateMins = Math.max(0, Math.floor((new Date().getTime() - new Date(endTime).getTime()) / 60000));
    const penaltyAmount = lateMins * 2;

    const handlePayment = async () => {
        setIsProcessing(true);
        // Simulate payment gateway processing
        await new Promise(resolve => setTimeout(resolve, 800));

        if (selectedPaymentMethod === 0) {
            localStorage.setItem(`parkflow_saved_card_${currentUserIdentifier}`, JSON.stringify(cardDetails));
        }

        // Call backend to mark as completed and store penalty
        try {
            await fetch('https://parkera-backend.onrender.com/api/bookings/pay-penalty', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    ticketId: booking.id, 
                    penaltyAmount: penaltyAmount 
                })
            });
        } catch (err) {
            console.error("Backend Penalty Update Failed:", err);
            // We continue anyway as the payment simulation passed, but history might be slightly off
        }

        completeBooking(booking.id, new Date().toISOString(), penaltyAmount);

        setIsProcessing(false);
        toast.success('Penalty paid! Vehicle exited and slot cleared successfully.');
        setShowFeedback(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 pt-24 pb-12 px-4 max-w-4xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8"
                >
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-black text-red-600 tracking-tighter">Late Penalty Active</h1>
                        <p className="text-gray-500 font-medium">Please clear your pending dues to exit the parking area.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left: Summary */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8 h-fit">
                            <h2 className="text-2xl font-black text-black tracking-tighter flex items-center space-x-3">
                                <ShieldCheck className="text-[#EAB308] w-7 h-7" />
                                <span>Booking Summary</span>
                            </h2>

                            <div className="space-y-4">
                                {[
                                    { label: 'Parking Area', value: booking.areaName, icon: MapPin },
                                    { label: 'Vehicle Type', value: (booking.vehicleType || 'CAR').toUpperCase(), icon: Car },
                                    { label: 'Selected Slot', value: booking.slotId, icon: Info },
                                    { label: 'Overdue Time', value: `${lateMins} Mins`, icon: Clock },
                                    { label: 'Booking Date', value: format(new Date(booking.startTime || new Date()), 'MMM dd, yyyy'), icon: Timer }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center py-2">
                                        <div className="flex items-center space-x-3 text-gray-400 font-medium">
                                            <item.icon className="w-4 h-4" />
                                            <span className="text-sm">{item.label}</span>
                                        </div>
                                        <span className={`text-sm font-black ${item.label === 'Overdue Time' ? 'text-red-600' : 'text-black'}`}>{item.value}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-gray-50 space-y-2">
                                <div className="flex justify-between items-center text-gray-400 text-sm font-medium">
                                    <span>Base Booking Paid</span>
                                    <span>₹{booking.totalCost}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4">
                                    <span className="text-xl font-black">Total Penalty to Pay</span>
                                    <span className="text-3xl font-black text-red-600">₹{penaltyAmount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Payment Method */}
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8">
                            <h2 className="text-2xl font-black text-black tracking-tighter">Secure Payment.</h2>

                            <div className="space-y-4">
                                {['Credit / Debit Card', 'UPI Payment (GPay, PhonePe)'].map((method, i) => (
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
                                                        <p className="text-[10px] text-gray-500 font-medium">Payment is processed through your bank card network (Visa, Mastercard, RuPay).</p>
                                                        <div className="space-y-3">
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Card Number</label>
                                                                <input
                                                                    type="text"
                                                                    className={`w-full bg-white border ${cardDetails.number && cardDetails.number.replace(/\s/g, '').length < 16 ? 'border-red-500' : 'border-gray-200 focus:border-[#EAB308]'} rounded-xl py-2 px-3 outline-none font-bold text-sm font-mono tracking-widest text-black`}
                                                                    value={cardDetails.number}
                                                                    onChange={handleCardNumberChange}
                                                                    placeholder="0000 0000 0000 0000"
                                                                />
                                                                {cardDetails.number && cardDetails.number.replace(/\s/g, '').length < 16 && (
                                                                    <p className="text-[10px] text-red-500 font-bold">16 digits required.</p>
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Expiry Date</label>
                                                                    <input
                                                                        type="text"
                                                                        className={`w-full bg-white border ${cardDetails.expiry && cardDetails.expiry.length < 5 ? 'border-red-500' : 'border-gray-200 focus:border-[#EAB308]'} rounded-xl py-2 px-3 outline-none font-bold text-sm font-mono text-black`}
                                                                        placeholder="MM/YY"
                                                                        value={cardDetails.expiry}
                                                                        onChange={handleExpiryChange}
                                                                    />
                                                                    {cardDetails.expiry && cardDetails.expiry.length < 5 && (
                                                                        <p className="text-[10px] text-red-500 font-bold">Valid date required.</p>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">CVV</label>
                                                                    <input
                                                                        type="password"
                                                                        className={`w-full bg-white border ${cardDetails.cvv && cardDetails.cvv.length < 3 ? 'border-red-500' : 'border-gray-200 focus:border-[#EAB308]'} rounded-xl py-2 px-3 outline-none font-bold text-sm font-mono text-black`}
                                                                        placeholder="123"
                                                                        value={cardDetails.cvv}
                                                                        onChange={handleCvvChange}
                                                                    />
                                                                    {cardDetails.cvv && cardDetails.cvv.length < 3 && (
                                                                        <p className="text-[10px] text-red-500 font-bold">3 digits required.</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cardholder Name</label>
                                                                <input
                                                                    type="text"
                                                                    className={`w-full bg-white border ${cardDetails.name && cardDetails.name.toLowerCase() !== ((user as any)?.name || '').toLowerCase() ? 'border-red-500' : 'border-gray-200 focus:border-[#EAB308]'} rounded-xl py-2 px-3 outline-none font-bold text-sm text-black uppercase`}
                                                                    placeholder="ENTER YOUR NAME"
                                                                    value={cardDetails.name}
                                                                    onChange={handleNameChange}
                                                                />
                                                                {cardDetails.name && cardDetails.name.toLowerCase() !== ((user as any)?.name || '').toLowerCase() && (
                                                                    <p className="text-[10px] text-red-500 font-bold">Name must match your account ({((user as any)?.name || 'Account')}).</p>
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
                                                        <p className="text-[10px] text-gray-500 font-medium">You pay using UPI ID or your UPI app (Google Pay, PhonePe, Paytm). You just approve the payment in your mobile app.</p>
                                                        <div className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
                                                            <img src={QRCodeImage} alt="UPI QR Code" className="w-32 h-32 object-contain mb-2 rounded-xl shadow-sm" />
                                                            <span className="text-xs font-bold text-gray-400">Scan QR Code</span>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Or enter UPI ID</label>
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

                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex items-start space-x-3">
                                <AlertCircle className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                                <p className="text-sm text-red-600 font-bold leading-relaxed">
                                    A penalty of ₹2 applies for every minute past your expected exit time.
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
                                        className="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-red-600/30 hover:bg-red-700 active:scale-[0.98] transition-all flex items-center justify-center space-x-3 disabled:bg-gray-400 disabled:scale-100 group"
                                    >
                                        <span>{isProcessing ? 'Processing Securely...' : `Pay ₹${penaltyAmount}`}</span>
                                        {!isProcessing && <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                                        {isProcessing && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                    </button>
                                );
                            })()}
                        </div>
                    </div>
                </motion.div>
            </main>

            <FeedbackModal
                isOpen={showFeedback}
                onClose={() => navigate('/history')}
                onSubmit={(rating) => {
                    submitFeedback(booking.id, rating);
                    toast.success("Thank you for your feedback!");
                    navigate('/history');
                }}
            />
        </div>
    );
};
