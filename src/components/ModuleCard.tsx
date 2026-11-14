import React from 'react';
import { motion } from 'motion/react';
import { platformModules, PlatformModule } from '../data';
import { ArrowLeft } from 'lucide-react';

interface ModuleCardProps {
  module: PlatformModule;
  onClick: (id: string) => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick }) => {
  const Icon = module.icon;
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(module.id)}
      className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer group transition-all duration-300 hover:shadow-xl relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-2 h-full ${module.color}`}></div>
      <div className="flex items-start mb-4">
        <div className={`w-14 h-14 rounded-2xl ${module.color} flex items-center justify-center text-white shadow-lg shadow-blue-200 ml-4`}>
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1 group-hover:text-teal-700 transition-colors">{module.title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-1">{module.goal}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="font-bold text-slate-800 dark:text-slate-200 ml-1">المحتوى:</span>
          {module.content}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 italic">
          <span className="font-bold text-slate-700 dark:text-slate-300 ml-1">التقنية:</span>
          {module.tech}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-400 group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
};

export default ModuleCard;
