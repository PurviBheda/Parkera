import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProfilePhotoManager } from './ProfilePhotoManager';
import { ParkingCircle, User, LogOut, Menu, X, LayoutDashboard, History, ShieldCheck, Settings, CalendarCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Corrected from motion/react to framer-motion
import { useTranslation } from 'react-i18next';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPhotoManager, setShowPhotoManager] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const { t } = useTranslation();

  const isAdminPage = location.pathname.startsWith('/admin');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    ...(!isAdminPage ? [
      { name: t('Find Parking'), path: '/dashboard', icon: LayoutDashboard },
      { name: t('History'), path: '/history', icon: History }
    ] : []),
    ...(user?.role === 'admin' ? [{ name: t('Admin'), path: '/admin', icon: ShieldCheck }] : []),
  ];

  const AvatarButton = ({ size = 'w-8 h-8', onClick }: { size?: string; onClick?: () => void }) => (
    <button
      onClick={onClick}
      className={`${size} rounded-full overflow-hidden flex items-center justify-center border-2 transition-all hover:shadow-md ${user?.activePhoto ? 'border-[#EAB308] shadow-sm' : 'border-gray-200 bg-gray-100'
        }`}
    >
      {user?.activePhoto ? (
        <img src={user.activePhoto} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <User className="w-4 h-4 text-gray-600" />
      )}
    </button>
  );

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <a href="/" className="flex items-center space-x-2">
              <div className="bg-black p-2 rounded-lg">
                <ParkingCircle className="text-[#EAB308] w-6 h-6" />
              </div>
              <span className="font-bold text-xl tracking-tighter">PARK<span className="text-[#EAB308]">ERA</span></span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {user ? (
                <>
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.path}
                      className="flex items-center space-x-1 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                    >
                      <link.icon className="w-4 h-4" />
                      <span>{link.name}</span>
                    </a>
                  ))}
                  <div className="h-4 w-[1px] bg-gray-200"></div>

                  {/* Avatar + Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <div className="flex items-center space-x-2">
                      <AvatarButton onClick={() => setShowDropdown(!showDropdown)} />
                      <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="text-sm font-semibold hover:text-[#EAB308] transition-colors"
                      >
                        {user.name}
                      </button>
                    </div>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                        >
                          {/* User Info Header */}
                          <div className="px-4 py-4 border-b border-gray-50 flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#EAB308] flex items-center justify-center bg-gray-100 flex-shrink-0">
                              {user.activePhoto ? (
                                <img src={user.activePhoto} alt="Profile" className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-black truncate">{user.name}</p>
                              <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setShowDropdown(false);
                                setShowPhotoManager(true);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                            >
                              <Settings className="w-4 h-4" />
                              <span>{t('Manage account')}</span>
                            </button>
                            <a
                              href="/history"
                              onClick={() => setShowDropdown(false)}
                              className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                            >
                              <CalendarCheck className="w-4 h-4" />
                              <span>{t('My Bookings')}</span>
                            </a>
                            <button
                              onClick={() => {
                                setShowDropdown(false);
                                logout();
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>{t('Sign out')}</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <a href="/login" className="bg-black text-white px-8 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all">
                    {t('Login')}
                  </a>

                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-600 hover:text-black p-2"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                {user ? (
                  <>
                    <div className="flex items-center space-x-3 px-3 py-4 mb-2 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#EAB308] flex items-center justify-center bg-white shadow-sm flex-shrink-0">
                        {user.activePhoto ? (
                          <img src={user.activePhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    {navLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.path}
                        className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-black"
                      >
                        <link.icon className="w-5 h-5" />
                        <span>{link.name}</span>
                      </a>
                    ))}
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setShowPhotoManager(true);
                      }}
                      className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-black"
                    >
                      <Settings className="w-5 h-5" />
                      <span>{t('Manage account')}</span>
                    </button>
                    <a
                      href="/history"
                      className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-black"
                    >
                      <CalendarCheck className="w-5 h-5" />
                      <span>{t('My Bookings')}</span>
                    </a>
                    <button
                      onClick={logout}
                      className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-black"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>{t('Sign out')}</span>
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <a
                      href="/login"
                      className="flex items-center justify-center px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium"
                    >
                      {t('Login')}
                    </a>
                    <a
                      href="/register"
                      className="flex items-center justify-center px-4 py-3 bg-black text-white rounded-xl text-sm font-medium"
                    >
                      {t('Register')}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Profile Photo Manager Modal */}
      <ProfilePhotoManager isOpen={showPhotoManager} onClose={() => setShowPhotoManager(false)} />
    </>
  );
};
