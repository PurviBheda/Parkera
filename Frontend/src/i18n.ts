import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
    en: {
        translation: {
            "Welcome Back": "Welcome Back.",
            "Welcome": "Welcome",
            "Home": "Home",
            "Dashboard": "Dashboard",
            "Book Now": "Book Now",
            "Login": "Login",
            "Logout": "Logout",
            "Manage Account": "Manage Account",
            "Profile details": "Profile details",
            "Language Preferences": "Language Preferences",
            "Select Language": "Select Language",
            "English": "English",
            "Hindi": "Hindi",
            "Gujarati": "Gujarati",
            "Find Your Perfect Parking Space": "Find Your Perfect Parking Space",
            "Book in seconds, park with peace of mind.": "Book in seconds, park with peace of mind.",
            "Smart Parking": "Smart Parking",
            "Real-time Tracking": "Real-time Tracking",
            "Secure System": "Secure System",
            "About Us": "About Us",
            "Contact Info": "Contact Info",
            "Company": "Company",
            "Legal": "Legal",
            "Terms & Conditions": "Terms & Conditions",
            "Privacy Policy": "Privacy Policy"
        }
    },
    hi: {
        translation: {
            "Welcome Back": "वापसी पर स्वागत है।",
            "Welcome": "स्वागत है",
            "Home": "मुख्य पृष्ठ",
            "Dashboard": "डैशबोर्ड",
            "Book Now": "अभी बुक करें",
            "Login": "लॉग इन",
            "Logout": "लॉग आउट",
            "Manage Account": "खाता प्रबंधित करें",
            "Profile details": "प्रोफ़ाइल विवरण",
            "Language Preferences": "भाषा प्राथमिकताएं",
            "Select Language": "भाषा चुनें",
            "English": "अंग्रेज़ी",
            "Hindi": "हिन्दी",
            "Gujarati": "गुजराती",
            "Find Your Perfect Parking Space": "अपनी आदर्श पार्किंग जगह खोजें",
            "Book in seconds, park with peace of mind.": "सेकंडों में बुक करें, शांति से पार्क करें।",
            "Smart Parking": "स्मार्ट पार्किंग",
            "Real-time Tracking": "रीयल-टाइम ट्रैकिंग",
            "Secure System": "सुरक्षित प्रणाली",
            "About Us": "हमारे बारे में",
            "Contact Info": "संपर्क जानकारी",
            "Company": "कंपनी",
            "Legal": "कानूनी",
            "Terms & Conditions": "नियम और शर्तें",
            "Privacy Policy": "गोपनीयता नीति"
        }
    },
    gu: {
        translation: {
            "Welcome Back": "ફરીથી આપનું સ્વાગત છે.",
            "Welcome": "સ્વાગત છે",
            "Home": "મુખ્ય પૃષ્ઠ",
            "Dashboard": "ડેશબોર્ડ",
            "Book Now": "હવે બુક કરો",
            "Login": "લૉગ ઇન",
            "Logout": "લૉગ આઉટ",
            "Manage Account": "ખાતું મેનેજ કરો",
            "Profile details": "પ્રોફાઇલ વિગતો",
            "Language Preferences": "ભાષા પસંદગીઓ",
            "Select Language": "ભાષા પસંદ કરો",
            "English": "અંગ્રેજી",
            "Hindi": "હિન્દી",
            "Gujarati": "ગુજરાતી",
            "Find Your Perfect Parking Space": "તમારી આદર્શ પાર્કિંગ જગ્યા શોધો",
            "Book in seconds, park with peace of mind.": "સેકંડમાં બુક કરો, શાંતિથી પાર્ક કરો.",
            "Smart Parking": "સ્માર્ટ પાર્કિંગ",
            "Real-time Tracking": "રીઅલ-ટાઇમ ટ્રેકિંગ",
            "Secure System": "સુરક્ષિત સિસ્ટમ",
            "About Us": "અમારા વિશે",
            "Contact Info": "સંપર્ક માહિતી",
            "Company": "કંપની",
            "Legal": "કાનૂની",
            "Terms & Conditions": "નિયમો અને શરતો",
            "Privacy Policy": "ગોપનીયતા નીતિ"
        }
    }
};

const savedLanguage = localStorage.getItem('parkera-language') || 'en';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLanguage, // default language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export default i18n;
