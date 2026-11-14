import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, Clock, Search, ShieldCheck, MessageSquare, ChevronLeft } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthProvider';

interface DoubtResponse {
  id: string;
  doubt: string;
  response: string;
  status: 'pending_review' | 'published';
  authorId: string;
  createdAt: any;
}

interface ScholarReviewViewProps {
  onClose: () => void;
}

const ScholarReviewView: React.FC<ScholarReviewViewProps> = ({ onClose }) => {
  const { user, isScholar } = useAuth();
  const [pendingResponses, setPendingResponses] = useState<DoubtResponse[]>([]);
  const [selectedResponse, setSelectedResponse] = useState<DoubtResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [editedResponse, setEditedResponse] = useState('');

  useEffect(() => {
    if (!isScholar) return;

    const q = query(
      collection(db, 'doubts_responses'),
      where('status', '==', 'pending_review')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DoubtResponse));
      setPendingResponses(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'doubts_responses');
    });

    return () => unsubscribe();
  }, [isScholar]);

  const handleApprove = async () => {
    if (!selectedResponse || !user) return;
    try {
      await updateDoc(doc(db, 'doubts_responses', selectedResponse.id), {
        status: 'published',
        response: editedResponse || selectedResponse.response,
        reviewerId: user.uid,
        updatedAt: serverTimestamp(),
      });
      setSelectedResponse(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `doubts_responses/${selectedResponse.id}`);
    }
  };

  if (!isScholar) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-lg">
        <div className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">وصول مقيد</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">هذه المنطقة مخصصة للعلماء والمراجعين المعتمدين فقط.</p>
          <button onClick={onClose} className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold">إغلاق</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4 bg-slate-900/60 backdrop-blur-lg"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-full lg:h-[85vh] lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ml-3 shadow-inner">
              <ShieldCheck className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold">مركز المراجعة العلمية</h2>
              <p className="text-xs lg:text-sm text-slate-400">تدقيق الردود وإجازتها للنشر</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* List */}
          <div className="w-full lg:w-1/3 border-l bg-slate-50/50 overflow-y-auto shrink-0 border-b lg:border-b-0 max-h-[40vh] lg:max-h-none">
            <div className="p-4 lg:p-6 border-b bg-white/50 backdrop-blur-sm sticky top-0 z-10">
              <div className="relative">
                <Search className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="بحث في الردود المعلقة..." 
                  className="w-full pr-10 pl-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 transition-all outline-none"
                />
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="p-8 text-center text-slate-400 font-medium">جاري جلب البيانات...</div>
              ) : pendingResponses.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium">لا توجد ردود معلقة حالياً.</div>
              ) : (
                pendingResponses.map((res) => (
                  <button
                    key={res.id}
                    onClick={() => {
                      setSelectedResponse(res);
                      setEditedResponse(res.response);
                    }}
                    className={`w-full text-right p-4 rounded-2xl border transition-all ${
                      selectedResponse?.id === res.id 
                        ? 'bg-white dark:bg-slate-900 border-teal-500 shadow-md ring-2 ring-teal-50' 
                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">معلق</span>
                    </div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm line-clamp-2 leading-relaxed mb-1">{res.doubt}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{res.response}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-white dark:bg-slate-900">
            <AnimatePresence mode="wait">
              {selectedResponse ? (
                <motion.div
                  key={selectedResponse.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-3xl mx-auto space-y-8"
                >
                  <div>
                    <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                      <MessageSquare className="w-7 h-7 text-teal-600" />
                      مراجعة الرد العلمي
                    </h3>
                    
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800 mb-8 shadow-inner">
                      <div className="text-[10px] font-black text-slate-400 uppercase mb-2">الشبهة / السؤال</div>
                      <p className="text-base lg:text-lg font-bold text-slate-800 dark:text-slate-200 leading-relaxed">{selectedResponse.doubt}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">الرد المقترح (قابل للتعديل)</span>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI Generated Draft</div>
                      </div>
                      <textarea 
                        value={editedResponse}
                        onChange={(e) => setEditedResponse(e.target.value)}
                        className="w-full h-80 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-teal-500 transition-all outline-none text-slate-800 dark:text-slate-200 font-medium leading-relaxed shadow-inner resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-8">
                    <button 
                      onClick={handleApprove}
                      className="w-full sm:flex-1 py-4 bg-teal-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                    >
                      <CheckCircle className="w-6 h-6" />
                      اعتماد الرد ونشره
                    </button>
                    <button 
                      className="w-full sm:w-auto px-8 py-4 bg-red-50 text-red-600 rounded-2xl font-black text-lg hover:bg-red-100 transition-all"
                    >
                      رفض
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <ChevronLeft className="w-10 h-10 lg:w-12 lg:h-12 text-slate-300" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold text-slate-400">اختر رداً من القائمة للمراجعة</h3>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScholarReviewView;
