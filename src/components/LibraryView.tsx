import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, LibraryBig, History, Search, Map as MapIcon, User, ChevronRight, ChevronLeft } from 'lucide-react';

interface Era {
  id: number;
  name: string;
  period: string;
  color: string;
}

const eras: Era[] = [
  { id: 1, name: "عصر النبوة والراشدين", period: "٦١٠ - ٦٦١ م", color: "bg-emerald-500" },
  { id: 2, name: "العصر الأموي", period: "٦٦١ - ٧٥٠ م", color: "bg-blue-500" },
  { id: 3, name: "العصر الذهبي (العباسي)", period: "٧٥٠ - ١٢٥٨ م", color: "bg-amber-500" },
  { id: 4, name: "عصر الأندلس", period: "٧١١ - ١٤٩٢ م", color: "bg-indigo-500" },
];

interface Figure {
  id: number;
  name: string;
  title: string;
  field: string;
  era: string;
  achievement: string;
}

const figures: Figure[] = [
  { id: 1, name: "الخوارزمي", title: "مؤسس علم الجبر", field: "الرياضيات", era: "العصر العباسي", achievement: "وضع أسس الخوارزميات التي يقوم عليها عالمنا الرقمي اليوم." },
  { id: 2, name: "ابن سينا", title: "الشيخ الرئيس", field: "الطب والفلسفة", era: "العصر العباسي", achievement: "كتاب 'القانون في الطب' ظل المرجع الأول لأوروبا لـ ٦ قرون." },
  { id: 3, name: "الزهراوي", title: "أبو الجراحة", field: "الطب", era: "عصر الأندلس", achievement: "اخترع أكثر من ٢٠٠ أداة جراحية لا يزال بعضها مستخدماً." },
  { id: 4, name: "ابن خلدون", title: "مؤسس علم الاجتماع", field: "التاريخ والاجتماع", era: "شمال أفريقيا", achievement: "وضع قوانين قيام وسقوط الدول في مقدمته الشهيرة." }
];

interface LibraryViewProps {
  onClose: () => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ onClose }) => {
  const [activeEra, setActiveEra] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFigures = figures.filter(fig => 
    fig.name.includes(searchQuery) || 
    fig.field.includes(searchQuery) ||
    fig.achievement.includes(searchQuery)
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4 bg-slate-900/60 backdrop-blur-lg"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-full lg:h-[85vh] lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b flex items-center justify-between bg-cyan-600 text-white shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center ml-3 shadow-inner">
              <LibraryBig className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold">وحدة المكتبة الحضارية</h2>
              <p className="text-xs lg:text-sm text-cyan-100">درع الأمة • استعادة الذاكرة المعرفية</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Era Selector / Timeline */}
          <div className="p-6 lg:p-8 bg-slate-50 dark:bg-slate-800 border-b shrink-0 overflow-x-auto">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
              <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-6 h-6 text-cyan-600" />
                الجدول الزمني للحضارة
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative w-full lg:w-auto">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن عالم أو اختراع..."
                    className="w-full lg:w-64 p-2.5 pr-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-cyan-500 transition-all outline-none"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center relative px-10 min-w-[600px] lg:min-w-0 py-4">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
              {eras.map((era) => (
                <button 
                  key={era.id}
                  onClick={() => setActiveEra(era.id)}
                  className="relative z-10 flex flex-col items-center group"
                >
                  <div className={`w-5 h-5 rounded-full border-4 border-white shadow-sm transition-all duration-300 ${
                    activeEra === era.id ? `${era.color} scale-150` : 'bg-slate-300 group-hover:bg-cyan-400'
                  }`}></div>
                  <div className="absolute top-8 whitespace-nowrap text-center">
                    <div className={`text-xs lg:text-sm font-black transition-colors ${activeEra === era.id ? 'text-cyan-600' : 'text-slate-500 dark:text-slate-400'}`}>
                      {era.name}
                    </div>
                    <div className="text-[9px] lg:text-[10px] text-slate-400 font-bold">{era.period}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Content */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Figures List */}
            <div className="w-full lg:w-80 border-l p-4 lg:p-6 overflow-y-auto bg-white dark:bg-slate-900 border-b lg:border-b-0 shrink-0">
              <h4 className="font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-600" />
                أبرز الشخصيات ({filteredFigures.length})
              </h4>
              <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                {filteredFigures.map((fig) => (
                  <motion.button 
                    key={fig.id}
                    whileHover={{ x: -4 }}
                    className="min-w-[200px] lg:min-w-0 text-right p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-cyan-200 hover:bg-cyan-50 transition-all flex flex-col gap-1 group shrink-0"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-cyan-700 text-sm lg:text-base">{fig.name}</span>
                    <span className="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400">{fig.field} • {fig.era}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Display Area */}
            <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-slate-50/30">
              <motion.div 
                key={activeEra}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-3xl"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-[10px] lg:text-xs font-bold mb-6">
                  <MapIcon className="w-3 h-3" />
                  أهم مراكز العلم في هذا العصر
                </div>
                
                <h3 className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white mb-6 leading-tight">بيت الحكمة: <br/><span className="text-cyan-600 text-xl lg:text-3xl">أكبر مركز بحثي في التاريخ الوسيط</span></h3>
                
                <p className="text-sm lg:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium mb-8">
                  في قلب بغداد، أسس الخليفة المأمون "بيت الحكمة" ليكون مجمعاً علمياً، مرصداً فلكياً، ومكتبة ضخمة. هنا تُرجمت علوم اليونان والهند والفرس، وانطلقت منها ثورة علمية غيّرت وجه البشرية.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="text-cyan-600 font-black text-2xl lg:text-3xl mb-1">١,٠٠٠,٠٠٠+</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs lg:text-sm font-bold">مخطوطة ومجلد</div>
                  </div>
                  <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="text-cyan-600 font-black text-2xl lg:text-3xl mb-1">٤٠٠+</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs lg:text-sm font-bold">عالم وباحث مقيم</div>
                  </div>
                </div>

                <div className="mt-8 lg:mt-12 p-6 lg:p-8 bg-white dark:bg-slate-900 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-cyan-500"></div>
                  <h4 className="font-black text-lg lg:text-xl text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5 text-cyan-600" />
                    اكتشاف مميز من هذا العصر
                  </h4>
                  <p className="text-sm lg:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                    اختراع "الإسطرلاب" المتطور، والذي كان بمثابة الحاسوب المحمول في ذلك الزمان، يُستخدم لتحديد القبلة، مواقيت الصلاة، والملاحة البحرية بدقة متناهية.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LibraryView;
