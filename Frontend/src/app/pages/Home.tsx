import React from 'react';
import { motion } from 'framer-motion';
import { ParkingCircle, ArrowRight, ShieldCheck, MapPin, Zap, Smartphone, CheckCircle, Clock, CreditCard } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useTranslation } from 'react-i18next';
// Image moved to public folder for better Vercel compatibility

export const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4">
        <div className="absolute top-20 right-0 w-1/2 h-[600px] bg-yellow-50 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full border border-gray-200">
              <span className="flex h-2 w-2 rounded-full bg-[#EAB308] animate-ping"></span>
              <span className="text-xs font-bold uppercase tracking-widest text-gray-600">{t('Smart Parking for Future Cities')}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-none text-black tracking-tighter">
              {t('PARKERA')} <br />
              <span className="text-[#EAB308]">{t('THE NEW ERA OF PARKING')}</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg leading-relaxed font-medium">
              {t('Find, reserve, and manage your parking spot in seconds with a smart and seamless parking experience')}
            </p>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4">

              <a href="/dashboard" className="inline-flex bg-black text-white px-8 py-5 rounded-2xl font-bold items-center space-x-3 shadow-2xl shadow-black/10 hover:scale-105 transition-all group">
                <span>{t('Book Parking Now')}</span>
                <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
              </a>


            </div>
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-100">
              <div>
                <p className="text-2xl font-black text-black">500+</p>
                <p className="text-xs font-bold text-gray-500 uppercase">{t('Parking Slots')}</p>
              </div>
              <div>
                <p className="text-2xl font-black text-black">10k+</p>
                <p className="text-xs font-bold text-gray-500 uppercase">{t('Happy Users')}</p>
              </div>
              <div>
                <p className="text-2xl font-black text-black">0%</p>
                <p className="text-xs font-bold text-gray-500 uppercase">{t('Wait Time')}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-[2rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.1)] border-8 border-white bg-gray-100 aspect-[4/5] md:aspect-square">
              <img
                src="/parking photo.jpg"
                className="w-full h-full object-cover opacity-90"
                alt="Parking Lot"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

              {/* Floating Dashboard Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-100 p-2 rounded-xl">
                    <ParkingCircle className="text-yellow-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500">{t('Nearest Parking')}</p>
                    <p className="text-sm font-black text-black">{t('RR Mall')} • 0.2km</p>
                  </div>
                </div>
                <div className="bg-green-100 px-3 py-1 rounded-full">
                  <span className="text-green-700 text-[10px] font-black uppercase tracking-widest">{t('Available')}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[#EAB308]">{t('System Features')}</h2>
            <p className="text-4xl md:text-5xl font-black text-black tracking-tight leading-tight">
              {t('Designed for Convenience and Precision.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: MapPin,
                title: t('Real-time Location'),
                desc: t('Detect your current location and find the nearest available parking slots instantly with integrated maps.')
              },
              {
                icon: Zap,
                title: t('Instant Booking'),
                desc: t('Book your slot in seconds. No more driving around in circles looking for space. Your spot is waiting.')
              },
              {
                icon: CreditCard,
                title: t('Secure Payments'),
                desc: t('Integrated online payment system. Pay only for the time you use with transparent hourly rates.')
              },
              {
                icon: Clock,
                title: t('Smart Timer'),
                desc: t('Track your parking time live. Get notified when your session is ending and avoid penalties.')
              },
              {
                icon: Smartphone,
                title: t('Mobile First'),
                desc: t('A fully responsive experience that works perfectly on your phone, tablet or desktop.')
              },
              {
                icon: ShieldCheck,
                title: t('Penalty Protection'),
                desc: t('Fair and transparent penalty system for overstays. Exit confirmation only after clear payment.')
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 space-y-4 group transition-all"
              >
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-[#EAB308] group-hover:text-black transition-all">
                  <feature.icon className="w-6 h-6 text-gray-600 group-hover:text-black" />
                </div>
                <h3 className="text-xl font-black text-black tracking-tight">{feature.title}</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Parking Pass Banner */}
      <section className="py-12 px-4 bg-black text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#EAB308] opacity-10 rounded-l-[100px] blur-3xl"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-2xl text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              {t('Get an Exclusive')} <span className="text-[#EAB308]">{t('Parking Pass.')}</span>
            </h2>
            <p className="text-gray-400 font-medium text-sm md:text-base leading-relaxed">
              {t('Tired of looking for spots? Reserve your own dedicated parking slot with our 15-day, 1-month, or 3-month passes and enjoy massive hourly discounts.')}
            </p>
          </div>
          <a href="/passes" className="bg-[#EAB308] text-black px-8 py-4 rounded-2xl font-black shadow-xl shadow-yellow-900/20 hover:scale-105 transition-all whitespace-nowrap">
            {t('View Pass Plans')}
          </a>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              {t('How It')} <span className="text-[#EAB308]">{t('Works.')}</span>
            </h2>

            <div className="space-y-8">
              {[
                { step: "01", title: t("Registration & Login"), text: t("Create your account with email verification to get started safely.") },
                { step: "02", title: t("Find & Select Slot"), text: t("Locate parking on the map and choose a slot based on your vehicle type.") },
                { step: "03", title: t("Pay & Park"), text: t("Proceed to secure payment. Your slot status becomes 'Occupied' instantly.") },
                { step: "04", title: t("Timer & Exit"), text: t("Track your duration and exit. Any penalties are calculated automatically.") }
              ].map((step, i) => (
                <div key={i} className="flex space-x-6 items-start group">
                  <div className="text-3xl font-black text-gray-100 group-hover:text-[#EAB308] transition-colors">{step.step}</div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black tracking-tight group-hover:translate-x-1 transition-transform">{step.title}</h4>
                    <p className="text-gray-500 text-sm font-medium max-w-sm">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-yellow-400 rounded-[3rem] rotate-3 opacity-10"></div>
            <div className="relative bg-black text-white p-10 rounded-[3rem] shadow-2xl space-y-8">
              <div className="flex justify-between items-center pb-6 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-[#EAB308] w-6 h-6" />
                  <span className="font-black text-xl">{t('Booking Summary')}</span>
                </div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('Active ID')}: #PF-9921</div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">{t('Location')}</span>
                  <span className="font-bold">{t('South City Mall Parking')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">{t('Vehicle Type')}</span>
                  <span className="bg-[#EAB308] text-black px-3 py-1 rounded-full font-black text-[10px] uppercase">{t('SUV / CAR')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">{t('Slot ID')}</span>
                  <span className="font-bold">A-42</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">{t('Duration')}</span>
                  <span className="font-bold">{t('01 Hour')}</span>
                </div>
                <div className="pt-6 border-t border-gray-800 flex justify-between items-center">
                  <span className="text-xl font-bold">{t('Total Amount')}</span>
                  <span className="text-3xl font-black text-[#EAB308]">₹30.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
