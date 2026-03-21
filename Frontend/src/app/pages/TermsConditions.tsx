import React from 'react';
import { Shield, FileText, Clock, CreditCard, AlertTriangle, ArrowLeft } from 'lucide-react';

export const TermsConditions = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <a href="/" className="inline-flex items-center text-gray-500 hover:text-black transition-colors font-semibold group">
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </a>
                </div>

                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
                    <div className="bg-black p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#EAB308] rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>

                        <div className="relative z-10 flex items-center mb-4">
                            <div className="bg-[#EAB308] p-3 rounded-xl mr-4">
                                <FileText className="text-black w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Terms & Conditions</h1>
                                <p className="text-gray-400 font-medium mt-1">Last updated: March 9, 2026</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 md:p-12 space-y-10">
                        <p className="text-gray-600 leading-relaxed font-medium text-lg">
                            Welcome to ParkEra. By using our services, you agree to comply with and be bound by the following terms and conditions. Please read them carefully before making a reservation.
                        </p>

                        <section className="space-y-4">
                            <div className="flex items-center space-x-3 text-black">
                                <Shield className="w-6 h-6 text-[#EAB308]" />
                                <h2 className="text-2xl font-black tracking-tight">1. User Responsibilities</h2>
                            </div>
                            <ul className="list-disc pl-6 space-y-2 text-gray-600 font-medium leading-relaxed">
                                <li>Users must provide accurate vehicle and contact information during registration.</li>
                                <li>Accounts are non-transferable and must only be used by the registered vehicle owner.</li>
                                <li>Users are responsible for ensuring their vehicle does not leak fluids or cause damage to the parking facility.</li>
                                <li>Locking vehicles and securing valuables is the sole responsibility of the user. ParkEra is not liable for theft or damage.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center space-x-3 text-black">
                                <Clock className="w-6 h-6 text-[#EAB308]" />
                                <h2 className="text-2xl font-black tracking-tight">2. Parking Reservation Rules</h2>
                            </div>
                            <ul className="list-disc pl-6 space-y-2 text-gray-600 font-medium leading-relaxed">
                                <li>Reservations guarantee a spot within the selected parking lot, but not necessarily a specific numbered space unless explicitly stated.</li>
                                <li>Users must arrive within the designated time window of their reservation.</li>
                                <li>Overstaying past the reserved time may result in additional charges or vehicle towing at the owner's expense.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center space-x-3 text-black">
                                <AlertTriangle className="w-6 h-6 text-red-500" />
                                <h2 className="text-2xl font-black tracking-tight">3. Late Arrival Penalty Policy</h2>
                            </div>
                            <div className="bg-red-50 border border-red-100 p-5 rounded-2xl">
                                <p className="text-gray-800 font-medium leading-relaxed mb-4">
                                    Timeliness is crucial to maintaining an efficient parking network. If you fail to arrive within the allotted grace period of your reservation time:
                                </p>
                                <ul className="list-disc pl-6 space-y-2 text-red-800 font-semibold">
                                    <li>Your reservation will be automatically cancelled to free up the slot for others.</li>
                                    <li>A late arrival penalty fee of ₹15 will be levied on your account.</li>
                                    <li>Future bookings will be restricted until all pending penalty fees are fully paid.</li>
                                </ul>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center space-x-3 text-black">
                                <CreditCard className="w-6 h-6 text-[#EAB308]" />
                                <h2 className="text-2xl font-black tracking-tight">4. Auto Payment for Penalties</h2>
                            </div>
                            <p className="text-gray-600 font-medium leading-relaxed mb-2">
                                Users have the option to enable "AutoPay" during the booking process.
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-600 font-medium leading-relaxed">
                                <li>If AutoPay is enabled, any incurred late penalties (₹15) will be automatically deducted from your designated payment method.</li>
                                <li>This ensures uninterrupted access to the ParkEra application for future bookings.</li>
                                <li>If AutoPay fails or is disabled, the penalty must be paid manually before you can make another reservation.</li>
                            </ul>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center space-x-3 text-black">
                                <FileText className="w-6 h-6 text-[#EAB308]" />
                                <h2 className="text-2xl font-black tracking-tight">5. Payment and Refund Rules</h2>
                            </div>
                            <ul className="list-disc pl-6 space-y-2 text-gray-600 font-medium leading-relaxed">
                                <li>All payments must be made digitally through the approved payment gateways integrated into the app.</li>
                                <li>Cancellations made more than 1 hour before the reservation time are eligible for a full refund.</li>
                                <li>Cancellations within 1 hour of the reservation time hold a 50% cancellation fee.</li>
                                <li>Refunds are processed within 5-7 business days to the original payment method.</li>
                            </ul>
                        </section>

                    </div>
                    <div className="bg-gray-50 border-t border-gray-100 p-6 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            By checking "I agree to the Terms & Conditions" during registration, you legally acknowledge and accept these terms.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
