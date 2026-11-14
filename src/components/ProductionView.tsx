import React from 'react';
import { motion } from 'motion/react';
import { X, Video, Image as ImageIcon, Mic, Layout, Download, Share2, Sparkles, Plus } from 'lucide-react';

interface Template {
  id: number;
  type: 'video' | 'image' | 'audio';
  title: string;
  category: string;
  thumbnail: string;
}

const templates: Template[] = [
  { id: 1, type: 'video', title: "موشن جرافيك: الرد على شبهة العنف", category: "فيديوهات قصيرة", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400" },
  { id: 2, type: 'image', title: "انفوجرافيك: حقوق المرأة في الإسلام", category: "منصات التواصل", thumbnail: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=400" },
  { id: 3, type: 'audio', title: "بودكاست: حوار مع مفكر منصف", category: "محتوى صوتي", thumbnail: "https://images.unsplash.com/photo-1478737270239-2fccd2700f9?auto=format&fit=crop&q=80&w=400" },
  { id: 4, type: 'image', title: "بوستر: منجزات الحضارة الإسلامية", category: "مطبوعات", thumbnail: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400" },
];

interface ProductionViewProps {
  onClose: () => void;
}

const ProductionView: React.FC<ProductionViewProps> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4 bg-slate-900/60 backdrop-blur-lg"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-full lg:h-[85vh] lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b flex items-center justify-between bg-purple-600 text-white shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center ml-3 shadow-inner">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold">وحدة الإنتاج الإعلامي</h2>
              <p className="text-xs lg:text-sm text-purple-100">درع الأمة • صناعة المحتوى الإبداعي</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Sidebar */}
          <div className="w-full lg:w-72 border-l bg-slate-50 dark:bg-slate-800 p-6 overflow-y-auto shrink-0 border-b lg:border-b-0 max-h-[30vh] lg:max-h-none">
            <h3 className="font-bold text-slate-900 dark:text-white mb-6 px-2 text-sm lg:text-base">أدوات الاستوديو</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-2">
              <button className="flex items-center gap-3 p-3 bg-purple-50 text-purple-700 rounded-xl font-bold text-xs lg:text-sm">
                <Layout className="w-4 h-4" />
                القوالب الجاهزة
              </button>
              <button className="flex items-center gap-3 p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800/50 rounded-xl font-medium transition-colors text-xs lg:text-sm">
                <ImageIcon className="w-4 h-4" />
                مكتبة الوسائط
              </button>
              <button className="flex items-center gap-3 p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800/50 rounded-xl font-medium transition-colors text-xs lg:text-sm">
                <Mic className="w-4 h-4" />
                تحرير الصوت
              </button>
              <button className="flex items-center gap-3 p-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:bg-slate-800/50 rounded-xl font-medium transition-colors text-xs lg:text-sm">
                <Sparkles className="w-4 h-4" />
                توليد بالذكاء الاصطناعي
              </button>
            </div>

            <div className="mt-8 lg:mt-12">
              <div className="p-5 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl text-white shadow-lg">
                <h4 className="font-bold text-xs lg:text-sm mb-2">طلب تصميم مخصص</h4>
                <p className="text-[10px] lg:text-[11px] text-purple-100 leading-relaxed mb-4">هل تحتاج لمحتوى خاص لقضية معينة؟ تواصل مع فريق المصممين المحترفين.</p>
                <button className="w-full py-2 bg-white dark:bg-slate-900 text-purple-700 rounded-xl text-[10px] lg:text-xs font-black hover:bg-slate-100 dark:bg-slate-800/50 transition-colors">
                  إرسال طلب
                </button>
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 p-6 lg:p-8 overflow-y-auto bg-slate-50/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white">اختر قالباً للبدء</h3>
              <div className="flex flex-wrap gap-2">
                {['الكل', 'فيديو', 'صور', 'صوت'].map((cat, i) => (
                  <button key={i} className={`px-4 py-2 rounded-xl text-[10px] lg:text-xs font-bold transition-all ${i === 0 ? 'bg-purple-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-purple-200'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
              <motion.div 
                whileHover={{ scale: 0.98 }}
                className="border-2 border-dashed border-slate-300 rounded-[2rem] lg:rounded-[2.5rem] p-8 lg:p-12 flex flex-col items-center justify-center text-slate-400 hover:border-purple-400 hover:text-purple-500 transition-all cursor-pointer bg-white/50"
              >
                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center mb-4 shadow-inner">
                  <Plus className="w-6 h-6 lg:w-8 lg:h-8" />
                </div>
                <span className="font-black text-base lg:text-lg">بدء تصميم من الصفر</span>
              </motion.div>

              {templates.map((tpl) => (
                <motion.div 
                  key={tpl.id}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-slate-900 rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="h-40 lg:h-48 relative overflow-hidden">
                    <img src={tpl.thumbnail} alt={tpl.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button className="p-3 bg-white dark:bg-slate-900 text-purple-600 rounded-full shadow-xl hover:scale-110 transition-transform">
                        <Download className="w-5 h-5 lg:w-6 lg:h-6" />
                      </button>
                      <button className="p-3 bg-white dark:bg-slate-900 text-purple-600 rounded-full shadow-xl hover:scale-110 transition-transform">
                        <Share2 className="w-5 h-5 lg:w-6 lg:h-6" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="text-[10px] lg:text-xs font-bold text-purple-600 mb-1">{tpl.category}</div>
                    <h4 className="text-base lg:text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{tpl.title}</h4>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductionView;
