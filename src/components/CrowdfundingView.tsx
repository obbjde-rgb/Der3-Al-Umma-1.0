import React from 'react';
import { motion } from 'motion/react';
import { X, Landmark, Heart, Users, TrendingUp, ShieldCheck, ChevronLeft, CreditCard } from 'lucide-react';

interface Campaign {
  id: number;
  title: string;
  goal: string;
  raised: string;
  donors: number;
  category: string;
  image: string;
}

const campaigns: Campaign[] = [
  { id: 1, title: "إنتاج سلسلة وثائقية عن 'تاريخ الإسلام في الأندلس'", goal: "٥٠,٠٠٠$", raised: "٣٢,٥٠٠$", donors: 450, category: "إنتاج إعلامي", image: "https://images.unsplash.com/photo-1543783232-af9942f4a472?auto=format&fit=crop&q=80&w=400" },
  { id: 2, title: "ترجمة 'الموسوعة العلمية للرد على الشبهات' لـ ١٠ لغات", goal: "٢٠,٠٠٠$", raised: "١٨,٧٠٠$", donors: 890, category: "ترجمة ونشر", image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400" },
  { id: 3, title: "توسعة شبكة 'المراقب الرقمي' لرصد الإساءات عالمياً", goal: "١٥,٠٠٠$", raised: "٤,٢٠٠$", donors: 120, category: "تقنية ومراقبة", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400" },
];

interface CrowdfundingViewProps {
  onClose: () => void;
}

const CrowdfundingView: React.FC<CrowdfundingViewProps> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4 bg-slate-900/60 backdrop-blur-lg"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-full lg:h-[85vh] lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b flex items-center justify-between bg-emerald-700 text-white shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center ml-3 shadow-inner">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold">وحدة التمويل الجماعي</h2>
              <p className="text-xs lg:text-sm text-emerald-100">درع الأمة • الاستدامة المالية للمشاريع الحضارية</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main Area */}
          <div className="flex-1 p-6 lg:p-8 overflow-y-auto bg-slate-50/30">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm">
                <Users className="w-6 h-6 text-emerald-600 mb-2" />
                <div className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white">١,٤٦٠</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">متبرع نشط</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm">
                <TrendingUp className="w-6 h-6 text-emerald-600 mb-2" />
                <div className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white">٥٥,٤٠٠$</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">إجمالي التبرعات</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm">
                <ShieldCheck className="w-6 h-6 text-emerald-600 mb-2" />
                <div className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white">١٢</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">مشروع مكتمل</div>
              </div>
            </div>

            <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white mb-8">حملات التمويل الجارية</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 pb-8">
              {campaigns.map((camp) => (
                <motion.div 
                  key={camp.id}
                  whileHover={{ y: -5 }}
                  className="bg-white dark:bg-slate-900 rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="h-40 lg:h-48 relative overflow-hidden">
                    <img src={camp.image} alt={camp.title} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[9px] lg:text-[10px] font-black text-emerald-700 shadow-lg">
                      {camp.category}
                    </div>
                  </div>
                  <div className="p-6 lg:p-8">
                    <h4 className="text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-4 min-h-[3rem] lg:min-h-[3.5rem] line-clamp-2 leading-relaxed">{camp.title}</h4>
                    
                    <div className="space-y-4 mb-6 lg:mb-8">
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold mb-1 uppercase">تم جمع</div>
                          <div className="text-xl lg:text-2xl font-black text-emerald-600">{camp.raised}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-slate-400 font-bold mb-1 uppercase">الهدف</div>
                          <div className="text-base lg:text-lg font-bold text-slate-800 dark:text-slate-200">{camp.goal}</div>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-600 transition-all duration-1000" 
                          style={{ width: `${(parseFloat(camp.raised.replace(/[^0-9.]/g, '')) / parseFloat(camp.goal.replace(/[^0-9.]/g, ''))) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Heart className="w-4 h-4 text-pink-500" />
                        <span className="text-[10px] lg:text-xs font-bold">{camp.donors} متبرع</span>
                      </div>
                      <button className="px-4 lg:px-6 py-2 lg:py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs lg:text-sm shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        ساهم الآن
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 border-l bg-slate-50 dark:bg-slate-800 p-6 lg:p-8 overflow-y-auto shrink-0 border-t lg:border-t-0 max-h-[40vh] lg:max-h-none">
            <h4 className="font-black text-slate-900 dark:text-white mb-6 lg:mb-8 flex items-center gap-2 text-sm lg:text-base">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              الشفافية والحوكمة
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
              {[
                "تقارير التدقيق المالي السنوية",
                "نظام متابعة صرف الميزانيات",
                "سياسة حماية بيانات المتبرعين"
              ].map((item, i) => (
                <div key={i} className="group cursor-pointer">
                  <h5 className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 transition-colors mb-1 text-sm lg:text-base leading-snug">{item}</h5>
                  <div className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                    تحميل الملف <ChevronLeft className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 lg:mt-12 p-6 lg:p-8 bg-slate-900 rounded-[2rem] lg:rounded-[2.5rem] text-white shadow-xl">
              <h5 className="text-lg lg:text-xl font-black mb-4">زكاة مالك.. <br/>دفاع عن دينك</h5>
              <p className="text-[11px] lg:text-xs text-slate-400 leading-relaxed mb-6 font-medium">
                تُخصص أموال الزكاة والصدقات في درع الأمة لخدمة قضايا الدعوة والرد على الشبهات ونشر العلم النافع.
              </p>
              <button className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[10px] lg:text-xs font-black hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20">
                حساب الزكاة
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CrowdfundingView;
