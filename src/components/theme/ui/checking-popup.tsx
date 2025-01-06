import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

interface CheckingPopupProps {
  isOpen: boolean;
  isRTL: boolean;
  message?: string;
  onClose?: () => void;
}

export const CheckingPopup = ({ isOpen, isRTL, message, onClose }: CheckingPopupProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            className="bg-black/90 border border-zinc-800/50 rounded-2xl p-6 shadow-xl
                       flex flex-col items-center gap-4 max-w-md w-full"
          >
            {!message ? (
              <>
                <div className="relative w-16 h-16">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-t-2 border-primary"
                  />
                  <Loader2 className="w-16 h-16 text-primary/50 animate-pulse" />
                </div>
                <h3 className="text-lg font-medium text-white">
                  {isRTL ? '...רגע, בודק את הפרטים' : 'Just a sec, checking details...'}
                </h3>
              </>
            ) : (
              <>
                <div className="text-white text-center space-y-4">
                  <div className="whitespace-pre-wrap" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                    {message}
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-4 px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg
                             text-white font-medium transition-colors"
                  >
                    {isRTL ? 'הבנתי, אעדכן!' : 'Got it, I\'ll update!'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 