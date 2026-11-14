import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, GraduationCap, Play, Book, Award, CheckCircle, ChevronLeft } from 'lucide-react';

interface Course {
  id: number;
  title: string;
  duration: string;
  lessons: number;
  progress: number;
  image: string;
}

const courses: Course[] = [
  { id: 1, title: "فن المناظرة الفكرية: الأصول والقواعد", duration: "١٠ ساعات", lessons: 12, progress: 45, image: "https://images.unsplash.com/photo-1524178232363-1fb28f74b671?auto=format&fit=crop&q=80&w=400" },
  { id: 2, title: "الإعلام الرقمي وصناعة الرأي العام", duration: "٨ ساعات", lessons: 10, progress: 0, image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400" },
  { id: 3, title: "فقه الشبهات المعاصرة: دراسة تأصيلية", duration: "١٥ ساعة", lessons: 20, progress: 100, image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400" }
];

interface TrainingViewProps {
  onClose: () => void;
}

const TrainingView: React.FC<TrainingViewProps> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4 bg-slate-900/60 backdrop-blur-lg"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-full lg:h-[85vh] lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b flex items-center justify-between bg-emerald-600 text-white shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center ml-3 shadow-inner">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold">وحدة التأهيل الفكري</h2>
              <p className="text-xs lg:text-sm text-emerald-100">أكاديمية درع الأمة • صناعة سفراء الحضارة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Sidebar */}
          <div className="w-full lg:w-72 border-l bg-slate-50 dark:bg-slate-800 p-6 overflow-y-auto shrink-0 border-b lg:border-b-0">
            <div className="mb-8">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4 px-2">ملفي الأكاديمي</h3>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">ع.م</div>
                  <div className="text-sm">
                    <div className="font-bold text-slate-800 dark:text-slate-200">عبدالله محمد</div>
                    <div className="text-slate-500 dark:text-slate-400">متدرب فضي</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">مستوى التقدم</span>
                    <span className="text-emerald-600 font-bold">٦٥٪</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[65%]"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2">
              <button className="w-full flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm lg:text-base">
                <Play className="w-4 h-4" />
                دوراتي الحالية
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800/50 rounded-xl font-medium transition-colors text-sm lg:text-base">
                <Book className="w-4 h-4" />
                مكتبة المصادر
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800/50 rounded-xl font-medium transition-colors text-sm lg:text-base">
                <Award className="w-4 h-4" />
                الشهادات المنجزة
              </button>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 p-6 lg:p-8 overflow-y-auto bg-slate-50/30">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white">واصل التعلم</h3>
              <button className="text-emerald-600 font-bold text-xs lg:text-sm flex items-center gap-1 hover:underline">
                استكشاف جميع الدورات
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
              {courses.map((course) => (
                <motion.div 
                  key={course.id}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="h-40 relative overflow-hidden">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    {course.progress === 100 && (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                        <CheckCircle className="w-3 h-3" />
                        مكتمل
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h4 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 min-h-[3.5rem]">{course.title}</h4>
                    <div className="flex items-center gap-4 text-[10px] lg:text-xs text-slate-500 dark:text-slate-400 mb-4 font-medium">
                      <span className="flex items-center gap-1"><Play className="w-3 h-3" /> {course.lessons} درس</span>
                      <span className="flex items-center gap-1"><Book className="w-3 h-3" /> {course.duration}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${course.progress}%` }}></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Progress: {course.progress}%</span>
                        <button className={`px-4 py-1.5 rounded-lg text-[10px] lg:text-xs font-bold transition-all ${
                          course.progress === 100 ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-400' : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 hover:scale-105'
                        }`}>
                          {course.progress === 100 ? 'مراجعة المادة' : course.progress === 0 ? 'بدء الدورة' : 'متابعة التعلم'}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Achievement Section */}
            <div className="mt-4 lg:mt-12 p-6 lg:p-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2rem] text-white relative overflow-hidden">
              <Award className="absolute -left-4 -bottom-4 w-40 h-40 opacity-10 rotate-12" />
              <div className="relative z-10 max-w-lg">
                <h4 className="text-xl lg:text-2xl font-black mb-2">تحدي الـ ٣٠ يوماً</h4>
                <p className="text-sm lg:text-emerald-100 font-medium mb-6">أكمل ٥ دروس هذا الأسبوع لتحصل على وسام "المحاور البارع" وتتأهل للمرحلة المتقدمة من المناظرات.</p>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map(d => (
                    <div key={d} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${d < 4 ? 'bg-white dark:bg-slate-900 text-emerald-600 border-white' : 'bg-transparent border-white/30 text-white/50'}`}>
                      {d < 4 ? <CheckCircle className="w-4 h-4" /> : d}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TrainingView;
