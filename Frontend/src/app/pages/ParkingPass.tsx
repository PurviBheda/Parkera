import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export const ParkingPass = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const plans = [
        {
            id: '15-days',
            title: t('15 Day Pass'),
            price: 499,
            durationDays: 15,
            discountText: t('Discounted rate of ₹20 per hour'),
            features: [t('Dedicated reserved slot for 15 days'), t('Unlimited entry & exit'), t('Priority support')]
        },
        {
            id: '1-month',
            title: t('1 Month Pass'),
            price: 899,
            durationDays: 30,
            discountText: t('Discounted rate of ₹15 per hour'),
            features: [t('Dedicated reserved slot for 1 month'), t('Unlimited entry & exit'), t('Priority support')],
            popular: true
        },
        {
            id: '3-months',
            title: t('3 Month Pass'),
            price: 2199,
            durationDays: 90,
            discountText: t('Discounted rate of ₹12 per hour'),
            features: [t('Dedicated reserved slot for 3 months'), t('Unlimited entry & exit'), t('Premium support')]
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans overflow-x-hidden flex flex-col">
            <Navbar />

            <main className="flex-1 pt-32 pb-20 px-4">
                <div className="max-w-5xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-black">
                            {t('Exclusive')} <span className="text-[#EAB308]">{t('Parking Passes.')}</span>
                        </h1>
                        <p className="text-gray-500 font-medium max-w-2xl mx-auto text-lg leading-relaxed">
                            {t('Reserve a dedicated parking slot just for you. Never worry about finding a spot again. Unlock massive discounts with our long-term passes.')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {plans.map((plan, index) => (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`relative bg-white rounded-[2.5rem] p-8 shadow-xl flex flex-col justify-between border-2 ${plan.popular ? 'border-[#EAB308] transform md:-translate-y-4' : 'border-gray-100 hover:border-gray-200'} transition-all group`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#EAB308] text-black px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md whitespace-nowrap">
                                        {t('Most Popular')}
                                    </div>
                                )}

                                <div className="space-y-6 text-center">
                                    <h3 className="text-3xl font-black text-black tracking-tight">{plan.title}</h3>

                                    <div className="inline-flex items-center space-x-2 bg-yellow-50 text-yellow-800 px-3 py-1 rounded-lg text-xs font-bold w-fit mx-auto">
                                        <Clock className="w-3 h-3" />
                                        <span>{plan.discountText}</span>
                                    </div>

                                    <div className="py-6 border-y border-gray-50 flex flex-col items-center justify-center">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-gray-500 transition-colors">{t('Total Price')}</p>
                                        <div className="flex items-start justify-center text-black">
                                            <span className="text-2xl font-bold mt-2">₹</span>
                                            <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
                                        </div>
                                    </div>

                                    <ul className="space-y-4 text-left pt-2 pb-6">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start space-x-3 text-gray-500 font-medium text-sm">
                                                <CheckCircle className="w-5 h-5 text-[#EAB308] shrink-0 mt-0.5" />
                                                <span className="leading-snug">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <button
                                    onClick={() => navigate(`/dashboard?mode=pass&plan=${plan.id}&price=${plan.price}&duration=${plan.durationDays}&title=${encodeURIComponent(plan.title)}`)}
                                    className={`w-full py-5 rounded-2xl font-black flex items-center justify-center space-x-2 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all group/btn mt-auto ${plan.popular ? 'bg-[#EAB308] text-black shadow-yellow-900/10' : 'bg-black text-white shadow-black/10'}`}
                                >
                                    <span>{t('Buy Pass')}</span>
                                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
