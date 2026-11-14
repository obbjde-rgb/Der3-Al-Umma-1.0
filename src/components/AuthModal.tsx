import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user profile exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create initial profile
        await setDoc(userDocRef, {
          displayName: user.displayName || 'مستخدم جديد',
          email: user.email,
          role: 'user',
          reputation: 0,
          joinedAt: serverTimestamp(),
        });
      }
      onClose();
    } catch (err: any) {
      console.warn("Auth/Firestore error (likely quota):", err?.message);
      setError('عذراً، حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:bg-slate-800/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>

          <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-teal-600" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">تأمين الوصول للمنصة</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">انضم إلى مجتمع "درع الأمة" وكن جزءاً من مسيرة الوعي والحماية الرقمية.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-3 font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              )}
              الدخول بواسطة جوجل
            </button>

            <button 
              className="w-full py-4 px-6 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 font-black hover:bg-slate-800 transition-all opacity-50 cursor-not-allowed"
              disabled
            >
              <Mail className="w-5 h-5" />
              قريباً: الدخول بالبريد الإلكتروني
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Identity & Access Management • Shield Core
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;
