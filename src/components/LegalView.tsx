import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Scale, FileText, ShieldAlert, Gavel, Users, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react';

interface LegalResource {
  title: string;
  description: string;
  link: string;
}

const resources: LegalResource[] = [
  { title: "دليل التعامل مع خطاب الكراهية في أوروبا", description: "دليل قانوني شامل حول القوانين المحلية والأوروبية المنظمة للتعبير والكراهية.", link: "#" },
  { title: "نماذج التبليغ عن المحتوى المسيء", description: "قوالب قانونية جاهزة لإرسالها لمنصات التواصل الاجتماعي (تويتر، فيسبوك، يوتيوب).", link: "#" },
  { title: "حقوق المسلم في بيئة العمل", description: "كيفية حماية حقوقك القانونية في حال التعرض للتمييز بسبب الدين.", link: "#" }
];

interface LegalViewProps {
  onClose: () => void;
}

const LegalView: React.FC<LegalViewProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4 bg-slate-900/60 backdrop-blur-lg"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-full lg:h-[85vh] lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b flex items-center justify-between bg-slate-800 text-white shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ml-3 shadow-inner">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold">وحدة الدفاع القانوني</h2>
              <p className="text-xs lg:text-sm text-slate-400">درع الأمة • حماية الحقوق ومناهضة التمييز</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main Area */}
          <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-slate-50/30">
            {!submitted ? (
              <div className="max-w-3xl pb-8">
                <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mb-4 lg:mb-6 leading-tight">توثيق حالة إسلاموفوبيا</h3>
                <p className="text-base lg:text-lg text-slate-600 dark:text-slate-400 mb-8 lg:mb-10 font-medium leading-relaxed">
                  ساعدنا في رصد وتوثيق حالات الاعتداء أو خطاب الكراهية لاتخاذ الإجراءات القانونية اللازمة. سيتم التعامل مع بياناتك بخصوصية تامة.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-2">
                      <label className="text-xs lg:text-sm font-bold text-slate-700 dark:text-slate-300 px-1">نوع الانتهاك</label>
                      <select className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-slate-800 transition-all outline-none font-medium text-sm lg:text-base">
                        <option>خطاب كراهية عبر الإنترنت</option>
                        <option>اعتداء لفظي/جسدي</option>
                        <option>تمييز في العمل/التعليم</option>
                        <option>تشويه إعلامي</option>
                        <option>أخرى</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs lg:text-sm font-bold text-slate-700 dark:text-slate-300 px-1">تاريخ الواقعة</label>
                      <input type="date" className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-slate-800 transition-all outline-none font-medium text-sm lg:text-base" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs lg:text-sm font-bold text-slate-700 dark:text-slate-300 px-1">وصف تفصيلي للواقعة</label>
                    <textarea 
                      rows={4} 
                      placeholder="يرجى ذكر المكان، الأشخاص المعنيين، وما قيل أو فُعل..."
                      className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-slate-800 transition-all outline-none font-medium resize-none text-sm lg:text-base"
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs lg:text-sm font-bold text-slate-700 dark:text-slate-300 px-1">إرفاق أدلة (صور، لقطات شاشة، فيديو)</label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl lg:rounded-3xl p-6 lg:p-8 text-center hover:border-slate-400 transition-all bg-white dark:bg-slate-900 cursor-pointer group">
                      <FileText className="w-8 h-8 lg:w-10 lg:h-10 text-slate-300 mx-auto mb-2 group-hover:text-slate-500 dark:text-slate-400 transition-colors" />
                      <div className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 font-bold">اسحب الملفات هنا أو انقر للاختيار</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-800 text-[11px] lg:text-sm font-medium">
                    <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 shrink-0" />
                    تذكر: توثيق الأدلة هو مفتاح النجاح في أي ملاحقة قانونية.
                  </div>

                  <button 
                    disabled={isSubmitting}
                    className="w-full py-4 lg:py-5 bg-slate-900 text-white rounded-2xl font-black text-lg lg:text-xl shadow-2xl shadow-slate-900/20 hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 lg:w-6 lg:h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                        جاري إرسال التقرير...
                      </>
                    ) : (
                      <>
                        <Gavel className="w-5 h-5 lg:w-6 lg:h-6" />
                        إرسال لغرفة العمليات القانونية
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto text-center py-12 lg:py-20"
              >
                <div className="w-20 h-20 lg:w-24 lg:h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 lg:mb-8 shadow-inner">
                  <CheckCircle className="w-10 h-10 lg:w-12 lg:h-12" />
                </div>
                <h3 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white mb-4">تم استلام بلاغك بنجاح</h3>
                <p className="text-base lg:text-lg text-slate-600 dark:text-slate-400 mb-8 font-medium leading-relaxed">
                  شكراً لمساهمتك. سيقوم فريقنا القانوني بمراجعة الحالة والتواصل معك عبر البريد الإلكتروني خلال ٤٨ ساعة لتوجيهك نحو الخطوات القادمة.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="px-8 py-3 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm lg:text-base"
                >
                  إرسال بلاغ آخر
                </button>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 border-l bg-slate-50 dark:bg-slate-800 p-6 lg:p-8 overflow-y-auto shrink-0 border-t lg:border-t-0 max-h-[40vh] lg:max-h-none">
            <h4 className="font-black text-slate-900 dark:text-white mb-6 lg:mb-8 flex items-center gap-2 text-sm lg:text-base">
              <ShieldAlert className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              المصادر القانونية
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
              {resources.map((res, i) => (
                <div key={i} className="group cursor-pointer">
                  <h5 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-600 dark:text-slate-400 transition-colors mb-1 text-sm lg:text-base leading-snug">{res.title}</h5>
                  <p className="text-[11px] lg:text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2 font-medium">{res.description}</p>
                  <div className="text-[10px] font-black text-slate-400 group-hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 transition-colors">
                    قراءة المزيد <ChevronLeft className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 lg:mt-12 p-6 lg:p-8 bg-slate-900 rounded-[2rem] lg:rounded-3xl text-white shadow-xl">
              <Users className="w-7 h-7 lg:w-8 lg:h-8 text-slate-400 mb-4" />
              <h5 className="font-bold mb-2 text-sm lg:text-base">انضم لشبكة المحامين</h5>
              <p className="text-[11px] lg:text-xs text-slate-400 leading-relaxed mb-6 font-medium">هل أنت محامٍ وترغب في التطوع للدفاع عن قضايا الأمة؟</p>
              <button className="w-full py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl text-[10px] lg:text-xs font-black hover:bg-slate-100 dark:bg-slate-800/50 transition-colors shadow-lg">
                تسجيل المتطوعين
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LegalView;
