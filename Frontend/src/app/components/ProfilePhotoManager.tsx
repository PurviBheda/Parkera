import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, User, Upload, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface ProfilePhotoManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfilePhotoManager: React.FC<ProfilePhotoManagerProps> = ({ isOpen, onClose }) => {
    const { user, updateUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showUpdateProfile, setShowUpdateProfile] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const { t, i18n } = useTranslation();

    if (!user) return null;

    const openUpdateProfile = () => {
        const parts = user.name.split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
        setShowUpdateProfile(true);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { toast.error(t('Image must be under 10MB.')); return; }
        if (!file.type.startsWith('image/')) { toast.error(t('Please select an image file.')); return; }

        setIsUploading(true);
        try {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile-photo/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, photo: base64 }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message); return; }
            updateUser({ profilePhotos: data.profilePhotos, activePhoto: data.activePhoto });
            toast.success(t('Photo uploaded!'));
        } catch { toast.error(t('Failed to upload photo.')); }
        finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
    };

    const handleRemovePhoto = async () => {
        if (!user.activePhoto) return;
        const index = (user.profilePhotos || []).indexOf(user.activePhoto);
        if (index === -1) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile-photo/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, photoIndex: index }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message); return; }
            updateUser({ profilePhotos: data.profilePhotos, activePhoto: data.activePhoto });
            toast.success(t('Photo removed.'));
        } catch { toast.error(t('Failed to remove photo.')); }
    };

    const handleSave = async () => {
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
        if (!fullName) { toast.error(t('Name cannot be empty.')); return; }
        setIsSaving(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/update-name`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, name: fullName }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data.message); return; }
            updateUser({ name: data.name });
            toast.success(t('Profile updated!'));
            setShowUpdateProfile(false);
        } catch { toast.error(t('Failed to update name.')); }
        finally { setIsSaving(false); }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-6">
                            <h2 className="text-xl font-semibold text-gray-900">{t('Profile details')}</h2>
                            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="border-t border-gray-200" />

                        {/* Profile Section */}
                        <div className="px-8 py-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">{t('Profile')}</span>
                                <div className="flex items-center flex-1 min-w-0">
                                    {!showUpdateProfile ? (
                                        <>
                                            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                                                {user.activePhoto ? (
                                                    <img src={user.activePhoto} alt="Profile" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-7 h-7 text-gray-400" />
                                                )}
                                            </div>
                                            <span className="text-sm font-medium text-gray-900 ml-4 truncate">{user.name}</span>
                                        </>
                                    ) : null}
                                </div>
                                {!showUpdateProfile && (
                                    <button
                                        onClick={openUpdateProfile}
                                        className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex-shrink-0 ml-4"
                                    >
                                        {t('Update profile')}
                                    </button>
                                )}
                            </div>

                            {/* Update Profile Inline Card */}
                            <AnimatePresence>
                                {showUpdateProfile && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 overflow-hidden"
                                    >
                                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                            <h3 className="text-base font-semibold text-gray-900 mb-4">{t('Update profile')}</h3>

                                            {/* Photo + Upload/Remove */}
                                            <div className="flex items-center gap-4 mb-5">
                                                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                                                    {user.activePhoto ? (
                                                        <img src={user.activePhoto} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-8 h-8 text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                                                        <button
                                                            onClick={() => {
                                                                if ((user.profilePhotos || []).length >= 3) {
                                                                    toast.error(t('You can only keep up to 3 profile photos. Remove one to upload a new photo.'));
                                                                    return;
                                                                }
                                                                fileInputRef.current?.click();
                                                            }}
                                                            disabled={isUploading}
                                                            className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                                                        >
                                                            {isUploading ? t('Uploading...') : t('Upload')}
                                                        </button>
                                                        {user.activePhoto && (
                                                            <button
                                                                onClick={handleRemovePhoto}
                                                                className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
                                                            >
                                                                {t('Remove')}
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-400">{t('Recommended size 1:1, up to 10MB.')}</p>
                                                </div>
                                            </div>

                                            {/* Saved Photos Row */}
                                            {(user.profilePhotos || []).length > 1 && (
                                                <div className="mb-5">
                                                    <p className="text-xs text-gray-400 mb-2">{t('Saved photos — click to switch')}</p>
                                                    <div className="flex gap-3">
                                                        {(user.profilePhotos || []).map((photo, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={async () => {
                                                                    if (photo === user.activePhoto) return;
                                                                    try {
                                                                        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile-photo/set-active`, {
                                                                            method: 'PUT',
                                                                            headers: { 'Content-Type': 'application/json' },
                                                                            body: JSON.stringify({ userId: user.id, photoIndex: index }),
                                                                        });
                                                                        const data = await res.json();
                                                                        if (!res.ok) { toast.error(data.message); return; }
                                                                        updateUser({ profilePhotos: data.profilePhotos, activePhoto: data.activePhoto });
                                                                        toast.success(t('Photo switched!'));
                                                                    } catch { toast.error(t('Failed to switch photo.')); }
                                                                }}
                                                                className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all flex-shrink-0 ${photo === user.activePhoto
                                                                    ? 'border-[#EAB308] ring-2 ring-[#EAB308]/30 scale-110'
                                                                    : 'border-gray-200 hover:border-gray-400'
                                                                    }`}
                                                            >
                                                                <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* First name / Last name */}
                                            <div className="grid grid-cols-2 gap-4 mb-5">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('First name')}</label>
                                                    <input
                                                        type="text"
                                                        value={firstName}
                                                        onChange={(e) => setFirstName(e.target.value)}
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">{t('Last name')}</label>
                                                    <input
                                                        type="text"
                                                        value={lastName}
                                                        onChange={(e) => setLastName(e.target.value)}
                                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                                    />
                                                </div>
                                            </div>

                                            {/* Cancel / Save */}
                                            <div className="flex justify-end items-center gap-3">
                                                <button
                                                    onClick={() => setShowUpdateProfile(false)}
                                                    className="text-sm font-medium text-gray-600 hover:text-gray-800 px-4 py-2 transition-colors"
                                                >
                                                    {t('Cancel')}
                                                </button>
                                                <button
                                                    onClick={handleSave}
                                                    disabled={isSaving}
                                                    className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                                >
                                                    {isSaving ? t('Saving...') : t('Save')}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="border-t border-gray-200" />

                        {/* Email Section */}
                        <div className="px-8 py-6">
                            <div className="flex items-start justify-between">
                                <span className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">{t('Email addresses')}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-900 truncate">{user.email}</span>
                                        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{t('Primary')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200" />

                        {/* Vehicle Section */}
                        <div className="px-8 py-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">{t('Account type')}</span>
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm text-gray-900 capitalize">{user.role === 'admin' ? t('Administrator') : t('User')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200" />

                        {/* Language Section */}
                        <div className="px-8 py-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500 w-32 flex-shrink-0 flex items-center">
                                    <Globe className="w-4 h-4 mr-2" />
                                    {t('Language Preferences')}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <select
                                        value={i18n.language}
                                        onChange={(e) => {
                                            i18n.changeLanguage(e.target.value);
                                            localStorage.setItem('parkera-language', e.target.value);
                                            toast.success('Language updated');
                                        }}
                                        className="w-full max-w-[200px] border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#EAB308] focus:ring-1 focus:ring-[#EAB308] transition-all"
                                    >
                                        <option value="en">{t('English')}</option>
                                        <option value="hi">{t('Hindi')}</option>
                                        <option value="gu">{t('Gujarati')}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
