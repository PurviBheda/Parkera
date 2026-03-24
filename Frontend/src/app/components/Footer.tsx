import React from 'react';
import { ParkingCircle, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight, Github } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-black text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Logo & Info */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-black p-2 rounded-xl">
                <ParkingCircle className="text-[#EAB308] w-8 h-8" />
              </div>
              <span className="font-black text-3xl tracking-tighter text-white">
                PARK<span className="text-[#EAB308]">ERA</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {t('A smart parking solution built with modern technology for urban commuters. Find, book, and park effortlessly.')}
            </p>
            <div className="flex space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-[#EAB308] hover:text-black transition-all cursor-pointer">
                <Github className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-[#EAB308] hover:text-black transition-all cursor-pointer">
                <Twitter className="w-5 h-5" />
              </div>
              <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-[#EAB308] hover:text-black transition-all cursor-pointer">
                <Linkedin className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Quick Links (Company) */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold mb-6 text-white tracking-tight underline decoration-[#EAB308] underline-offset-8 decoration-2">{t('Company')}</h3>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li>
                <a href="#about" className="hover:text-[#EAB308] transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#EAB308]" />
                  {t('About Us')}
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#EAB308] transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#EAB308]" />
                  {t('Features')}
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#EAB308] transition-colors flex items-center group">
                  <ArrowRight className="w-4 h-4 mr-2 opacity-0 -ml-6 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#EAB308]" />
                  {t('How it Works')}
                </a>
              </li>
              <li><a href="/dashboard" className="hover:text-[#EAB308] transition-colors">{t('Find Parking')}</a></li>
              <li><a href="/login" className="hover:text-[#EAB308] transition-colors">{t('Login / Register')}</a></li>
              <li><a href="/history" className="hover:text-[#EAB308] transition-colors">{t('My Bookings')}</a></li>
              <li><a href="/admin" className="hover:text-[#EAB308] transition-colors">{t('Admin Portal')}</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold mb-6 text-white tracking-tight underline decoration-[#EAB308] underline-offset-8 decoration-2">{t('Support')}</h3>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li><a href="#" className="hover:text-[#EAB308] transition-colors">{t('Help Center')}</a></li>
              <li><a href="#" className="hover:text-[#EAB308] transition-colors">{t('Safety Center')}</a></li>
              <li><a href="/terms" target="_blank" rel="noopener noreferrer" className="hover:text-[#EAB308] transition-colors">{t('Terms & Conditions')}</a></li>
              <li><a href="#" className="hover:text-[#EAB308] transition-colors">{t('Privacy Policy')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold mb-6 text-white tracking-tight underline decoration-[#EAB308] underline-offset-8 decoration-2">{t('Contact Info')}</h3>
            <ul className="space-y-4 text-sm text-gray-400 font-medium">
              <li className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-[#EAB308]" />
                <span>{t('123 Park Avenue, Vesu')}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#EAB308]" />
                <span>{t('+91 98765 43210')}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#EAB308]" />
                <span>{t('pnuorg@gmail.com')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-900 text-center">
          <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">
            © {new Date().getFullYear()} {t('PARKERA SYSTEM. BUILT FOR SMART CITIES.')}
          </p>
        </div>
      </div>
    </footer>
  );
};
