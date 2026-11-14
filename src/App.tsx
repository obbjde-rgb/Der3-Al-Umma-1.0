/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { strategyAxes, platformModules, roadmap } from './data';
import { 
  Shield, 
  ChevronDown, 
  Search, 
  LayoutDashboard, 
  Info, 
  MessageSquare, 
  Bell,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import React, { useState } from 'react';
import ModuleCard from './components/ModuleCard';
import ResponseView from './components/ResponseView';
import MonitoringView from './components/MonitoringView';
import TrainingView from './components/TrainingView';
import LibraryView from './components/LibraryView';
import LegalView from './components/LegalView';
import AnalyticsView from './components/AnalyticsView';
import ContactView from './components/ContactView';
import ProductionView from './components/ProductionView';
import TranslationView from './components/TranslationView';
import CrowdfundingView from './components/CrowdfundingView';
import ScholarReviewView from './components/ScholarReviewView';
import AIPowerCenter from './components/AIPowerCenter';
import Roadmap from './components/Roadmap';
import ThemeToggle from './components/ThemeToggle';

import { useAuth } from './components/AuthProvider';
import AuthModal from './components/AuthModal';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';

export default function App() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, profile, loading, isAdmin, isScholar, isAmbassador } = useAuth();
  const [alerts, setAlerts] = useState<any[]>([]);

  React.useEffect(() => {
    let unsubscribe = () => {};

    const setupAlertsListener = async () => {
      try {
        const { collection, onSnapshot, orderBy, limit, query } = await import('firebase/firestore');
        const { db } = await import('./lib/firebase');
        
        const cached = localStorage.getItem('sovereign_alerts_cache');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAlerts(parsed.slice(0, 50));
            }
          } catch (e) {
             // ignore
          }
        }

        const q = query(collection(db, "alerts"), orderBy("createdAt", "desc"), limit(50));
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedAlerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (fetchedAlerts.length > 0) {
            setAlerts(fetchedAlerts);
          } else if (!cached) {
            // Provide mock alerts if db is empty and no cache
            setAlerts([
              { id: "1", source: "Twitter/X", content: "حملة منظمة ضد الحجاب في أوروبا", level: "High", time: "قبل ٥ دقائق" },
              { id: "2", source: "BBC News", content: "مقال يسيء لتاريخ الفتوحات الإسلامية", level: "Medium", time: "قبل ساعة" },
              { id: "3", source: "Reddit", content: "نقاش حول 'الإسلام والعلم' يحتوي على مغالطات", level: "Low", time: "قبل ٣ ساعات" }
            ]);
          }
        }, (error: any) => {
          console.warn("Network error fetching alerts from Firebase, using fallback (likely quota exceeded):", error?.message);
          if (alerts.length === 0 && !cached) {
            setAlerts([
              { id: "1", source: "Twitter/X", content: "حملة منظمة ضد الحجاب في أوروبا", level: "High", time: "قبل ٥ دقائق" },
              { id: "2", source: "BBC News", content: "مقال يسيء لتاريخ الفتوحات الإسلامية", level: "Medium", time: "قبل ساعة" },
              { id: "3", source: "Reddit", content: "نقاش حول 'الإسلام والعلم' يحتوي على مغالطات", level: "Low", time: "قبل ٣ ساعات" }
            ]);
          }
        });
      } catch (e: any) {
        console.warn("Network error fetching alerts from Firebase, using fallback:", e?.message);
        if (alerts.length === 0) {
            setAlerts([
              { id: "1", source: "Twitter/X", content: "حملة منظمة ضد الحجاب في أوروبا", level: "High", time: "قبل ٥ دقائق" },
              { id: "2", source: "BBC News", content: "مقال يسيء لتاريخ الفتوحات الإسلامية", level: "Medium", time: "قبل ساعة" },
              { id: "3", source: "Reddit", content: "نقاش حول 'الإسلام والعلم' يحتوي على مغالطات", level: "Low", time: "قبل ٣ ساعات" }
            ]);
        }
      }
    };
    
    setupAlertsListener();
    return () => unsubscribe();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-200 relative font-['Tajawal'] selection:bg-teal-200 selection:text-teal-900 bg-slate-50 dark:bg-slate-950">
      <div className="islamic-pattern"></div>
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-600/20">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">درع الأمة</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500 dark:text-slate-400">
            <a href="#" className="text-teal-600 border-b-2 border-teal-600 pb-1">الرئيسية</a>
            <a href="#philosophy" className="hover:text-teal-600 transition-colors">الرؤية</a>
            <a href="#units" className="hover:text-teal-600 transition-colors">الوحدات</a>
            <a href="#roadmap" className="hover:text-teal-600 transition-colors">خارطة الطريق</a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/50 animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => signOut(auth)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
                >
                  خروج
                </button>
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <div className="text-[10px] font-black text-teal-600 uppercase tracking-tighter leading-none mb-1">
                      {profile?.role || 'user'}
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                      {profile?.displayName || user.displayName}
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 font-black text-sm">
                    {profile?.displayName?.[0] || user.displayName?.[0] || 'U'}
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all"
              >
                تأمين الوصول
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative pt-40 pb-20 px-6 lg:px-8 text-center overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-5xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full border border-teal-100 text-teal-700 text-sm font-bold mb-8">
            <Sparkles className="w-4 h-4" />
            <span>منصة متكاملة للدفاع عن ثوابت الأمة</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 leading-[1.2]">
            درع الأمة: درعك الفكري <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-blue-600">في وجه الشبهات</span>
          </h1>
          
          <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl mx-auto font-medium mb-10">
            أكبر منظومة رقمية متكاملة تدمج بين الذكاء الاصطناعي والبحث العلمي الرصين 
            للتصدي للهجوم على الإسلام وبناء جيل مؤهل حضارياً وفكرياً.
          </p>

          <div className="flex flex-wrap justify-center gap-4 px-4">
            <button 
              onClick={() => setActiveModule('scientific-response')}
              className="px-6 lg:px-10 py-4 lg:py-5 bg-teal-600 text-white rounded-2xl font-black text-base lg:text-lg shadow-2xl shadow-teal-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              <Search className="w-5 h-5 lg:w-6 lg:h-6" />
              ابدأ تفنيد الشبهات
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById('philosophy');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 lg:px-10 py-4 lg:py-5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-base lg:text-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all w-full sm:w-auto justify-center"
            >
              تعرف على المنهجية
            </button>
          </div>
        </motion.div>
      </header>

      {/* Floating Assistant */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setActiveModule('scientific-response')}
        className="fixed bottom-8 right-8 z-[100] w-16 h-16 bg-teal-600 text-white rounded-full shadow-2xl shadow-teal-600/40 flex items-center justify-center group"
      >
        <MessageSquare className="w-8 h-8 group-hover:scale-110 transition-transform" />
        <div className="absolute right-full mr-4 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          تحدث مع المحرك الذكي
        </div>
      </motion.button>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-24 bg-white dark:bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">الفلسفة الاستراتيجية</h2>
            <div className="w-20 h-1.5 bg-teal-600 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {strategyAxes.map((axis, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col"
              >
                <div className="text-teal-600 font-black text-xl mb-4">{axis.title}</div>
                <div className="text-slate-800 dark:text-slate-200 font-bold mb-3">{axis.goal}</div>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{axis.method}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Grid */}
      <section id="units" className="py-24 px-6 lg:px-8 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">غرفة العمليات المركزية</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                عشر وحدات متكاملة تعمل بتناغم تام لتشكيل الدرع الرقمي الشامل للأمة، مدعومة بأحدث تقنيات الذكاء الاصطناعي والبيانات الضخمة.
              </p>
            </div>
            
            {/* Command Center Stats */}
            <div className="flex gap-4">
              <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="text-teal-600 font-black text-xl mb-1">٨٥٤+</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ردود علمية</div>
              </div>
              <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="text-red-600 font-black text-xl mb-1">١٢٠</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">هجمات مرصودة</div>
              </div>
              <div className="bg-white dark:bg-slate-900 px-6 py-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="text-blue-600 font-black text-xl mb-1">٤.٢ك</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">سفير حضاري</div>
              </div>
            </div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {platformModules
              .filter(module => module.id !== 'scholar-review' || isScholar)
              .map((module) => (
                <ModuleCard 
                  key={module.id} 
                  module={module} 
                  onClick={(id) => setActiveModule(id)} 
                />
              ))}
          </motion.div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="py-24 px-6 lg:px-8 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">خارطة الطريق الاستراتيجية</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">الخطة الزمنية للوصول إلى الريادة العالمية</p>
          </div>
          
          <Roadmap />
        </div>
      </section>

      {/* Tech Stack Footer */}
      <footer className="py-20 bg-slate-900 text-white px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center text-white">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-black">البنية التقنية المتطورة</h3>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              نعتمد على أحدث التقنيات في بناء المنصة لضمان السرعة، الأمان، والقدرة على التوسع العالمي. 
              من الذكاء الاصطناعي التوليدي إلى قواعد البيانات المتجهة (Vector DB).
            </p>
            <div className="flex flex-wrap gap-3">
              {['PostgreSQL', 'Redis', 'Elasticsearch', 'LLMs', 'React Native', 'Vector DB'].map(tech => (
                <span key={tech} className="px-4 py-2 bg-white/5 rounded-lg border border-white/10 text-sm font-mono text-teal-400">
                  {tech}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-white/5 rounded-3xl p-8 border border-white/10 relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-32 bg-white/5 rounded-2xl flex flex-col items-center justify-center">
                  <div className="text-teal-400 text-2xl font-black">99.9%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">Availability</div>
                </div>
                <div className="h-48 bg-white/5 rounded-2xl flex flex-col items-center justify-center p-4">
                  <div className="w-12 h-1 bg-teal-500 rounded-full mb-4"></div>
                  <div className="w-20 h-1 bg-teal-500/30 rounded-full mb-4"></div>
                  <div className="text-xs text-slate-400 text-center">Microservices Infrastructure</div>
                </div>
              </div>
              <div className="space-y-4 mt-8">
                <div className="h-48 bg-white/5 rounded-2xl flex flex-col items-center justify-center">
                  <div className="text-teal-400 text-4xl font-black mb-2">50+</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">Languages</div>
                </div>
                <div className="h-32 bg-white/5 rounded-2xl flex flex-col items-center justify-center">
                  <Sparkles className="w-8 h-8 text-amber-500 mb-2" />
                  <div className="text-xs text-slate-400">AI Driven</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-teal-500" />
            <span className="text-xl font-black">درع الأمة</span>
          </div>
          <div className="text-slate-500 dark:text-slate-400 text-sm">
            © 2026 درع الأمة — جميع الحقوق محفوظة لخدمة الإسلام
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {activeModule === 'scientific-response' && (
          <ResponseView onClose={() => setActiveModule(null)} />
        )}
        {activeModule === 'media-monitoring' && (
          <MonitoringView alerts={alerts} onClose={() => setActiveModule(null)} />
        )}
        {activeModule === 'intellectual-training' && (
          <TrainingView onClose={() => setActiveModule(null)} />
        )}
        {activeModule === 'civilizational-library' && (
          <LibraryView onClose={() => setActiveModule(null)} />
        )}
        {activeModule === 'legal-defense' && (
          <LegalView onClose={() => setActiveModule(null)} />
        )}
        {activeModule === 'data-analysis' && (
          <AnalyticsView onClose={() => setActiveModule(null)} />
        )}
        {activeModule === 'civilizational-contact' && (
          <ContactView onClose={() => setActiveModule(null)} />
        )}
        {activeModule === 'media-production' && (
          <ProductionView onClose={() => setActiveModule(null)} />
        )}
        {activeModule === 'smart-translation' && (
          <TranslationView onClose={() => setActiveModule(null)} />
        )}
        {activeModule === 'crowdfunding' && (
          <CrowdfundingView onClose={() => setActiveModule(null)} />
        )}
        {activeModule === 'scholar-review' && (
          <ScholarReviewView onClose={() => setActiveModule(null)} />
        )}
        {activeModule === 'ai-power-center' && (
          <AIPowerCenter onClose={() => setActiveModule(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal onClose={() => setIsAuthModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
