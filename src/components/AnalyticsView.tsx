import React from 'react';
import { motion } from 'motion/react';
import { X, BarChart3, TrendingUp, PieChart as PieIcon, Info, Download, Filter } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const attackData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

const effectivenessData = [
  { name: 'علمي', value: 45, color: '#0d9488' },
  { name: 'قانوني', value: 25, color: '#475569' },
  { name: 'إعلامي', value: 30, color: '#f59e0b' },
];

const trendData = [
  { time: '01:00', attacks: 20, responses: 15 },
  { time: '04:00', attacks: 15, responses: 12 },
  { time: '08:00', attacks: 45, responses: 35 },
  { time: '12:00', attacks: 80, responses: 65 },
  { time: '16:00', attacks: 60, responses: 55 },
  { time: '20:00', attacks: 95, responses: 85 },
];

interface AnalyticsViewProps {
  onClose: () => void;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4 bg-slate-900/60 backdrop-blur-lg"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl h-full lg:h-[85vh] lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b flex items-center justify-between bg-amber-600 text-white shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center ml-3 shadow-inner">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold">وحدة التحليل والبيانات</h2>
              <p className="text-xs lg:text-sm text-amber-100">درع الأمة • لوحات تحكم الرصد والقياس</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden sm:flex px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold items-center gap-2 transition-colors">
              <Download className="w-4 h-4" />
              تصدير التقرير
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white">مؤشرات الرصد العام</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-amber-600">
                <Filter className="w-4 h-4" />
              </button>
              <select className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-400 outline-none cursor-pointer">
                <option>آخر ٣٠ يوم</option>
                <option>آخر ٧ أيام</option>
                <option>اليوم</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 pb-8">
            {/* Main Trend Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm lg:text-base">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                  معدل الهجمات مقابل سرعة الاستجابة
                </h4>
                <div className="flex gap-4 text-[10px] lg:text-xs font-bold">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-slate-300"></span> الهجمات
                  </div>
                  <div className="flex items-center gap-2 text-amber-600">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> الاستجابة
                  </div>
                </div>
              </div>
              <div className="h-64 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="attacks" stroke="#cbd5e1" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="responses" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Effectiveness Pie */}
            <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center overflow-hidden">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-8 self-start text-sm lg:text-base">توزيع فعالية الردود</h4>
              <div className="h-48 lg:h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={effectivenessData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {effectivenessData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2 w-full">
                {effectivenessData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px] lg:text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{item.name}</span>
                    </div>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Bar Chart */}
            <div className="lg:col-span-3 bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-8 text-sm lg:text-base">إحصائيات الهجوم الشهري</h4>
              <div className="h-64 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attackData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="value" fill="#fbbf24" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 p-4 bg-blue-50 rounded-2xl border border-blue-100 text-blue-800 text-xs lg:text-sm font-medium">
            <Info className="w-5 h-5 shrink-0" />
            ملاحظة: البيانات أعلاه تعتمد على خوارزميات تحليل المشاعر (Sentiment Analysis) وتصنيف المحتوى آلياً.
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsView;
