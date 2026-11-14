import React from 'react';
import { motion } from 'motion/react';
import { X, Handshake, MessageSquare, Video, Globe, Users, Calendar } from 'lucide-react';

interface ContactViewProps {
  onClose: () => void;
}

const ContactView: React.FC<ContactViewProps> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4 bg-slate-900/60 backdrop-blur-lg"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-full lg:h-[85vh] lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b flex items-center justify-between bg-teal-600 text-white shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center ml-3 shadow-inner">
              <Handshake className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold">وحدة التواصل الحضاري</h2>
              <p className="text-xs lg:text-sm text-teal-100">درع الأمة • كسر الحواجز وبناء جسور التفاهم</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-slate-50/30">
          <div className="max-w-4xl mx-auto pb-8">
            <div className="text-center mb-12 lg:mb-16">
              <h3 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white mb-4 leading-tight">نحن هنا للإجابة والحوار</h3>
              <p className="text-base lg:text-lg text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">نؤمن بأن الجهل هو عدو الإنسان الأول، ومن خلال الحوار الصادق يمكننا تبديد المخاوف وتصحيح المفاهيم.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12 lg:mb-16">
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">أسئلة وأجوبة مباشرة</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed font-medium">تحدث مع نخبة من المختصين في الشؤون الإسلامية والحضارية لطرح أسئلتك بكل حرية.</p>
                <button className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-600/20 hover:scale-105 active:scale-95 transition-all">ابدأ المحادثة الآن</button>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform">
                  <Video className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">زيارات افتراضية (VR)</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed font-medium">استكشف أجمل المساجد حول العالم وتعرف على تاريخها وعمارتها من خلال تجربة واقع افتراضي فريدة.</p>
                <button className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all">ابدأ الجولة الافتراضية</button>
              </motion.div>
            </div>

            <div className="bg-slate-900 rounded-[2rem] lg:rounded-[2.5rem] p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6 lg:mb-8">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <Calendar className="w-6 h-6 lg:w-8 lg:h-8 text-teal-400" />
                  </div>
                  <h4 className="text-xl lg:text-2xl font-black">اللقاءات الحضارية القادمة</h4>
                </div>
                <div className="space-y-4">
                  {[
                    { title: "الإسلام وحقوق الإنسان: حوار مفتوح مع طلبة جامعة السوربون", date: "١٥ سبتمبر ٢٠٢٦", type: "Webinar" },
                    { title: "العمارة الإسلامية وتأثيرها في النهضة الأوروبية", date: "٢٢ سبتمبر ٢٠٢٦", type: "Online Workshop" }
                  ].map((event, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 lg:p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group gap-4">
                      <div className="flex-1">
                        <div className="font-bold text-base lg:text-lg mb-2 group-hover:text-teal-400 transition-colors leading-tight">{event.title}</div>
                        <div className="text-slate-400 text-xs lg:text-sm font-medium">{event.date} • {event.type}</div>
                      </div>
                      <Globe className="w-5 h-5 text-teal-400 shrink-0 group-hover:rotate-12 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ContactView;
