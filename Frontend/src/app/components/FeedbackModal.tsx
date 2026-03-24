import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, CheckCircle } from 'lucide-react';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white p-10 rounded-[2.5rem] relative z-10 max-w-md w-full shadow-2xl"
                >
                    <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-black tracking-tighter">Rate Your Experience</h2>
                            <p className="text-gray-500 font-medium text-sm">
                                How was your parking experience with ParkEra? Your feedback helps us improve.
                            </p>
                        </div>

                        <div className="flex justify-center items-center space-x-2 py-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="p-1 transform transition-all hover:scale-110 focus:outline-none"
                                >
                                    <Star
                                        className={`w-12 h-12 transition-colors duration-200 ${star <= (hoveredRating || rating)
                                                ? 'fill-[#EAB308] text-[#EAB308]'
                                                : 'text-gray-200'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="pt-4 flex flex-col space-y-3">
                            <button
                                disabled={rating === 0}
                                onClick={() => onSubmit(rating)}
                                className="w-full bg-[#EAB308] text-black py-4 rounded-2xl font-black text-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-900/10"
                            >
                                Submit Feedback
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full text-gray-400 font-bold py-2 hover:text-black transition-colors"
                            >
                                Skip for now
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
