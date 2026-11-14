import React from 'react';
import { motion } from 'motion/react';
import { roadmap } from '../data';

const Roadmap = () => {
  return (
    <div className="py-12">
      <div className="relative">
        {/* Connection line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 hidden lg:block"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {roadmap.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:bg-teal-600 group-hover:text-white transition-all duration-300">
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-teal-600 font-bold text-sm mb-1">{item.duration}</div>
                <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">{item.stage}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{item.goal}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
