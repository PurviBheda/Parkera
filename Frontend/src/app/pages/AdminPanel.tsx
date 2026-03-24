import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from '../components/Navbar';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { ParkingArea } from '../data/constants';
import { toast } from 'sonner';
import {
  ShieldCheck, BarChart3, Users, ParkingCircle,
  MapPin, Clock, Search, Filter, AlertCircle,
  TrendingUp, Download, CheckCircle2, MoreVertical,
  Plus, Trash2, Crosshair, Star, Crown, CalendarDays
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

export const AdminPanel = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { activeBookings, parkingAreas, setParkingAreas } = useBooking();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'lots' | 'users'>('dashboard');

  // Dashboard Search
  const [search, setSearch] = useState('');

  // Users State
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  // Premium Passes State
  const [premiumPasses, setPremiumPasses] = useState<any[]>([]);

  // Expired Reservations State
  const [expiredReservations, setExpiredReservations] = useState<any[]>([]);

  // Global Bookings State
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);

  // New Lot Form State
  const [isAddingLot, setIsAddingLot] = useState(false);
  const [newLot, setNewLot] = useState({
    name: '', address: '', lat: 21.1702, lng: 72.8311,
    rating: 4.5, pricePerHour: 30, carSlots: 50, bikeSlots: 50, scootySlots: 20
  });

  useEffect(() => {
    if (user?.role === 'admin' && usersList.length === 0) {
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPremiumPasses();
      // Fetch expired reservations
      fetch('http://localhost:5000/api/reservations/all-expired')
        .then(res => res.json())
        .then(data => setExpiredReservations(data.reservations || []))
        .catch(err => console.error('Failed to fetch expired reservations', err));

      fetchAllBookings();

      const refreshInterval = setInterval(fetchAllBookings, 10000); // Sync every 10s
      return () => clearInterval(refreshInterval);
    }
  }, [user]);

  const fetchAllBookings = async () => {
    try {
      setIsBookingsLoading(true);
      const res = await fetch("http://localhost:5000/api/bookings/all");
      if (res.ok) {
        const data = await res.json();
        setAllBookings(data.bookings || []);
      }
    } catch (err) {
      console.error("Failed to fetch all bookings", err);
    } finally {
      setIsBookingsLoading(false);
    }
  };

  const fetchPremiumPasses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/passes/all');
      if (res.ok) {
        const data = await res.json();
        setPremiumPasses(data.passes || []);
      }
    } catch (err) {
      console.error('Failed to fetch premium passes', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsUsersLoading(true);
      const res = await fetch("http://localhost:5000/api/auth/users");
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleAddLot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: newLot.name,
        address: newLot.address,
        lat: newLot.lat,
        lng: newLot.lng,
        rating: newLot.rating,
        pricePerHour: newLot.pricePerHour,
        totalSlots: newLot.carSlots + newLot.bikeSlots + newLot.scootySlots,
        availableSlots: {
          car: newLot.carSlots,
          bike: newLot.bikeSlots,
          scooty: newLot.scootySlots
        }
      };

      const res = await fetch("http://localhost:5000/api/parking-areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setParkingAreas([...parkingAreas, data.area]);
        toast.success(t("Parking location added successfully."));
        setIsAddingLot(false);
      } else {
        toast.error(t("Failed to add parking location."));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("Error connecting to server."));
    }
  };

  const handleDeleteLot = async (id: string, name: string) => {
    if (!window.confirm(t('Are you sure you want to delete {{name}}?', { name }))) return;
    try {
      const res = await fetch(`http://localhost:5000/api/parking-areas/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setParkingAreas(parkingAreas.filter(a => a.id !== id && (a as any)._id !== id));
        toast.success(t('{{name}} has been removed.', { name }));
      }
    } catch (err) {
      console.error(err);
      toast.error(t("Error deleting location."));
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-black">{t('Access Denied.')}</h2>
          <p className="text-gray-500 font-medium">{t('This section is reserved for system administrators only. Please contact support if you believe this is an error.')}</p>
          <a href="/dashboard" className="bg-black text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center space-x-2">
            <span>{t('Back to Safety')}</span>
          </a>
        </div>
      </div>
    );
  }

  const stats = [
    { label: t('Total Earnings'), value: `₹${allBookings.reduce((acc, b) => acc + (b.paidAmount || 0) + (b.penaltyAmount || 0), 0)}`, icon: TrendingUp, color: 'text-green-500' },
    { label: t('Total Bookings'), value: allBookings.length, icon: BarChart3, color: 'text-[#EAB308]' },
    { label: t('Registered Users'), value: usersList.length > 0 ? usersList.length : '-', icon: Users, color: 'text-blue-500' },
    { label: t('Occupied Slots'), value: allBookings.filter(b => b.status === 'active').length, icon: ParkingCircle, color: 'text-red-500' },
    { label: t('Premium Users'), value: premiumPasses.filter(p => p.status === 'active').length, icon: Crown, color: 'text-[#EAB308]' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-20">
      <Navbar />

      <main className="flex-1 pt-24 px-4 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-black tracking-tighter flex items-center space-x-3">
              <ShieldCheck className="text-[#EAB308] w-10 h-10" />
              <span>{t('Admin Command Center')}</span>
            </h1>
            <p className="text-gray-500 font-medium italic">{t('Monitoring live parking infrastructure and booking transactions.')}</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            {[
              { id: 'dashboard', label: t('Dashboard') },
              { id: 'lots', label: t('Parking Lots') },
              { id: 'users', label: t('Users') }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-xl font-bold text-sm capitalize transition-all ${activeTab === tab.id ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab Content */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {stats.map((s, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-black/5 space-y-4">
                  <div className={`w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center ${s.color}`}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-black">{s.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h3 className="text-xl font-black text-black">{t('Live Booking Logs')}</h3>
                <div className="flex items-center space-x-3">
                  <div className="relative group flex-1 md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-black transition-colors" />
                    <input
                      type="text"
                      placeholder={t("Search Ticket ID...")}
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-black rounded-xl py-3 pl-10 pr-4 outline-none transition-all font-semibold text-xs"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Full Name')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Booking ID')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Slot')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Location')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Vehicle')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Total')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Status')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Feedback')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allBookings.filter(b => 
                      (b.ticketId || b._id || '').toLowerCase().includes(search.toLowerCase()) || 
                      (b.userName || b.userEmail || b.userId || '').toLowerCase().includes(search.toLowerCase())
                    ).map((b) => (
                      <tr key={b._id || b.ticketId} className="hover:bg-gray-50/50 transition-colors group">

                        {/* FULL NAME */}
                        <td className="px-8 py-5">
                          <p className="text-xs font-bold text-gray-600 truncate max-w-[150px] capitalize">
                            {(() => {
                              let name = b.userName || '';
                              if (!name || name.includes('@')) {
                                const matchedUser = usersList.find(u => u._id === b.userId || u.email === b.userEmail || u.email === name);
                                name = matchedUser ? matchedUser.name : (name ? name.split('@')[0] : 'Guest');
                              }
                              return name;
                            })()}
                          </p>
                        </td>

                        {/* Booking ID */}
                        <td className="px-8 py-5">
                          <p className="text-xs font-black text-black whitespace-nowrap">
                            {b.ticketId || `PF-${b._id?.slice(-6).toUpperCase()}`}
                          </p>
                          <p className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                            {format(parseISO(b.entryTime), 'MMM dd, hh:mm a')}
                          </p>
                        </td>

                        {/* SLOT COLUMN */}
                        <td className="px-8 py-5">
                          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap">
                            {b.slotId || '-'}
                          </span>
                        </td>

                        {/* LOCATION */}
                        <td className="px-8 py-5">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-3 h-3 text-[#EAB308]" />
                            <span className="text-xs font-bold text-gray-600">{b.areaName}</span>
                          </div>
                        </td>

                        {/* VEHICLE */}
                        <td className="px-8 py-5 uppercase text-[10px] font-black text-gray-500">
                          {b.vehicleType}
                        </td>

                        {/* TOTAL */}
                        <td className="px-8 py-5 text-xs font-black text-black">
                          ₹{(b.paidAmount || 0) + (b.penaltyAmount || 0)}
                        </td>

                        {/* STATUS */}
                        <td className="px-8 py-5">
                          <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${b.status === 'active'
                            ? 'bg-yellow-100 text-[#CA8A04]'
                            : 'bg-green-100 text-green-600'
                            }`}>
                            {b.status === 'active'
                              ? <Clock className="w-3 h-3" />
                              : <CheckCircle2 className="w-3 h-3" />}
                            <span>{t(b.status)}</span>
                          </div>
                        </td>

                        {/* FEEDBACK */}
                        <td className="px-8 py-5">
                          {b.rating ? (
                            <div className="flex items-center space-x-1 text-[#EAB308]">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-xs font-black text-black">{b.rating}/5</span>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-gray-400">-</span>
                          )}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(allBookings.length === 0 && !isBookingsLoading) && (
                <div className="py-20 text-center text-gray-400 font-medium italic">{t('No transactions found in the system.')}</div>
              )}
              {isBookingsLoading && (
                <div className="py-20 text-center text-gray-400 font-medium italic">{t('Syncing logs...')}</div>
              )}
            </div>

            {/* Premium Pass Holders Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                    <Crown className="w-5 h-5 text-[#EAB308]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-black">{t('Premium Pass Holders')}</h3>
                    <p className="text-xs text-gray-400 font-medium">{t('All users who purchased a premium parking pass.')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs font-black">
                  <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full">{premiumPasses.filter(p => p.status === 'active').length} {t('Active')}</span>
                  <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full">{premiumPasses.filter(p => p.status === 'expired').length} {t('Expired')}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('User Email')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Pass Type')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Location')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Slot')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Price')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Duration')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {premiumPasses.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-16 font-bold text-gray-400 italic">{t('No premium passes found.')}</td></tr>
                    ) : (
                      premiumPasses.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <p className="text-xs font-bold text-gray-700">{p.userEmail}</p>
                          </td>
                          <td className="px-8 py-5">
                            <span className="bg-yellow-50 text-[#CA8A04] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{p.passType}</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-3 h-3 text-[#EAB308]" />
                              <span className="text-xs font-bold text-gray-600">{p.areaName}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-xs font-black text-gray-500">{p.slotId}</td>
                          <td className="px-8 py-5 text-xs font-black text-black">₹{p.price}</td>
                          <td className="px-8 py-5">
                            <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-500">
                              <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                              <span>{format(parseISO(p.startDate), 'MMM dd')} → {format(parseISO(p.endDate), 'MMM dd, yyyy')}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                              }`}>
                              {p.status === 'active' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Expired Reservations / No-Show Penalties — Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-black">{t('No-Show Penalties')}</h3>
                    <p className="text-xs text-gray-400 font-medium">{t('Users who reserved a slot but didn\'t arrive in time.')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs font-black">
                  <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full">{expiredReservations.filter(r => r.penaltyStatus === 'paid').length} {t('Paid')}</span>
                  <span className="bg-red-100 text-red-500 px-3 py-1.5 rounded-full">{expiredReservations.filter(r => r.penaltyStatus === 'pending').length} {t('Pending')}</span>
                  <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full">{expiredReservations.length} {t('Total')}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('User ID')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Slot')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Vehicle')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Penalty')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('AutoPay')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Status')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Reserved At')}</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Paid At')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {expiredReservations.length === 0 ? (
                      <tr><td colSpan={8} className="text-center py-16 font-bold text-gray-400 italic">{t('No expired reservations found.')}</td></tr>
                    ) : (
                      expiredReservations.map((r) => (
                        <tr key={r._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-5">
                            <p className="text-xs font-bold text-gray-700 truncate max-w-[150px]">{r.userId}</p>
                          </td>
                          <td className="px-8 py-5 text-xs font-black text-black">{r.slotId}</td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-bold text-gray-500 uppercase">{r.vehicleType}</span>
                          </td>
                          <td className="px-8 py-5 text-xs font-black text-red-600">₹{r.penaltyAmount}</td>
                          <td className="px-8 py-5">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${r.autoPenalty ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                              {r.autoPenalty ? 'ON' : 'OFF'}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${r.penaltyStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
                              }`}>
                              {r.penaltyStatus === 'paid' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                              {r.penaltyStatus}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-bold text-gray-500">{format(new Date(r.bookingTime), 'MMM dd, hh:mm a')}</span>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-xs font-bold text-gray-500">{r.penaltyPaidAt ? format(new Date(r.penaltyPaidAt), 'MMM dd, hh:mm a') : '—'}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Lots Management Tab Content */}
        {activeTab === 'lots' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100">
              <div>
                <h2 className="text-2xl font-black">{t('Parking Network')}</h2>
                <p className="text-gray-500 font-medium">{t('Manage all parking lots across the city.')}</p>
              </div>
              <button
                onClick={() => setIsAddingLot(!isAddingLot)}
                className="bg-[#EAB308] text-black px-6 py-4 rounded-2xl font-black shadow-xl shadow-yellow-900/10 hover:scale-[1.02] flex items-center space-x-2"
              >
                {isAddingLot ? <Crosshair className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                <span>{isAddingLot ? t('Cancel') : t('Add New Parking Lot')}</span>
              </button>
            </div>

            {/* Add New Lot Form */}
            <AnimatePresence>
              {isAddingLot && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-black text-white p-10 rounded-[2.5rem] shadow-2xl space-y-6 overflow-hidden"
                  onSubmit={handleAddLot}
                >
                  <h3 className="text-xl font-black text-[#EAB308] mb-6 border-b border-white/10 pb-4">{t('Create New Parking Location')}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Location Name')}</label>
                      <input required type="text" className="w-full bg-gray-900 border-2 border-gray-800 focus:border-[#EAB308] rounded-xl py-3 px-4 outline-none font-bold" value={newLot.name} onChange={e => setNewLot({ ...newLot, name: e.target.value })} placeholder={t('Location Name')} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Full Address')}</label>
                      <input required type="text" className="w-full bg-gray-900 border-2 border-gray-800 focus:border-[#EAB308] rounded-xl py-3 px-4 outline-none font-bold" value={newLot.address} onChange={e => setNewLot({ ...newLot, address: e.target.value })} placeholder={t('Full Address')} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Latitude')}</label>
                      <input required type="number" step="any" className="w-full bg-gray-900 border-2 border-gray-800 focus:border-[#EAB308] rounded-xl py-3 px-4 outline-none font-bold" value={newLot.lat} onChange={e => setNewLot({ ...newLot, lat: parseFloat(e.target.value) })} placeholder={t('Latitude')} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Longitude')}</label>
                      <input required type="number" step="any" className="w-full bg-gray-900 border-2 border-gray-800 focus:border-[#EAB308] rounded-xl py-3 px-4 outline-none font-bold" value={newLot.lng} onChange={e => setNewLot({ ...newLot, lng: parseFloat(e.target.value) })} placeholder={t('Longitude')} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Hourly Price (₹)')}</label>
                      <input required type="number" className="w-full bg-gray-900 border-2 border-gray-800 focus:border-[#EAB308] rounded-xl py-3 px-4 outline-none font-bold" value={newLot.pricePerHour} onChange={e => setNewLot({ ...newLot, pricePerHour: parseInt(e.target.value) })} placeholder={t('Hourly Price (₹)')} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Rating')}</label>
                      <input required type="number" step="0.1" className="w-full bg-gray-900 border-2 border-gray-800 focus:border-[#EAB308] rounded-xl py-3 px-4 outline-none font-bold" value={newLot.rating} onChange={e => setNewLot({ ...newLot, rating: parseFloat(e.target.value) })} placeholder={t('Rating')} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/10">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#EAB308]">{t('Car Capacity')}</label>
                      <input required type="number" className="w-full bg-gray-900 border-2 border-gray-800 focus:border-white rounded-xl py-3 px-4 outline-none font-bold" value={newLot.carSlots} onChange={e => setNewLot({ ...newLot, carSlots: parseInt(e.target.value) })} placeholder={t('Car Capacity')} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#EAB308]">{t('Bike Capacity')}</label>
                      <input required type="number" className="w-full bg-gray-900 border-2 border-gray-800 focus:border-white rounded-xl py-3 px-4 outline-none font-bold" value={newLot.bikeSlots} onChange={e => setNewLot({ ...newLot, bikeSlots: parseInt(e.target.value) })} placeholder={t('Bike Capacity')} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#EAB308]">{t('Scooty Capacity')}</label>
                      <input required type="number" className="w-full bg-gray-900 border-2 border-gray-800 focus:border-white rounded-xl py-3 px-4 outline-none font-bold" value={newLot.scootySlots} onChange={e => setNewLot({ ...newLot, scootySlots: parseInt(e.target.value) })} placeholder={t('Scooty Capacity')} />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button type="submit" className="w-full bg-[#EAB308] text-black py-5 rounded-2xl font-black text-lg hover:bg-white transition-colors">
                      {t('Deploy Infrastructure')}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Lots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parkingAreas.map((area) => (
                <div key={area.id || (area as any)._id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl group">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-black text-black group-hover:text-[#EAB308] transition-colors">{area.name}</h3>
                      <p className="text-xs text-gray-500 font-medium flex items-center mt-1"><MapPin className="w-3 h-3 mr-1" />{area.address}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteLot((area as any)._id || area.id, area.name)}
                      className="p-2 text-red-400 hover:text-white hover:bg-red-500 rounded-xl transition-all shadow-sm bg-red-50"
                      title={t('Delete Location')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-[10px] font-black uppercase text-gray-400">{t('Total Capacity')}</p>
                      <p className="text-lg font-black text-black">{area.totalSlots} {t('Slots')}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <p className="text-[10px] font-black uppercase text-gray-400">{t('Pricing')}</p>
                      <p className="text-lg font-black text-[#EAB308]">₹{area.pricePerHour}<span className="text-xs font-bold text-gray-400">/{t('hr')}</span></p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold text-gray-500 bg-gray-50 py-2 px-4 rounded-full border border-gray-100">
                    <span>{t('Cars')}: {area.availableSlots.car}</span>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <span>{t('Bikes')}: {area.availableSlots.bike}</span>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <span>{t('Scootys')}: {area.availableSlots.scooty}</span>
                  </div>
                </div>
              ))}
            </div>
            {parkingAreas.length === 0 && (
              <div className="bg-white p-12 rounded-[2.5rem] border-2 border-dashed border-gray-200 text-center">
                <p className="text-gray-500 font-medium text-lg">{t('No parking locations found.')}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Users Tab Content */}
        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-50">
              <h3 className="text-xl font-black text-black flex items-center space-x-2">
                <Users className="w-6 h-6 text-[#EAB308]" />
                <span>{t('Registered Users Database')}</span>
              </h3>
              <p className="text-gray-500 text-sm mt-1">{t('Directory of all commuter profiles spanning across the platform.')}</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Profile')}</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Contact Identity')}</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Vehicle')}</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase text-gray-400 tracking-widest">{t('Role/Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isUsersLoading ? (
                    <tr><td colSpan={4} className="text-center py-10 font-bold text-gray-400">{t('Loading directory...')}</td></tr>
                  ) : usersList.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-10 font-bold text-gray-400">{t('No users found.')}</td></tr>
                  ) : (
                    usersList.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <p className="text-sm font-black text-black">{u.name}</p>
                          <p className="text-[10px] font-bold text-gray-400">{t('Joined')}: {format(parseISO(u.createdAt), 'MMM yyyy')}</p>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-bold text-gray-600">{u.email}</p>
                          <p className="text-[10px] font-bold text-gray-400">{u.phone}</p>
                        </td>
                        <td className="px-8 py-5 uppercase text-[10px] font-black text-gray-500">{u.vehicle}</td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col gap-2 items-start">
                            {u.role === 'admin' && (
                              <span className="bg-black text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">{t('Admin')}</span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${u.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                              {u.isVerified ? t('Verified') : t('Unverified')}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
};
