import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, Radio, Globe, AlertTriangle, Search, Activity, BarChart3, PieChart as PieChartIcon, ArrowUpRight, Loader2, Info, MessageSquare, ShieldCheck, ChevronRight, Send, HelpCircle, Radar, Clock, Filter, ExternalLink, AlertCircle, Copy, Share2, Settings, RefreshCw, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// High-fidelity Markdown renderer for Academic & Intelligence Reports
const ReportRenderer: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="prose prose-invert max-w-none text-slate-200 font-normal leading-relaxed text-xs lg:text-sm space-y-4">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a
              {...props}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 underline font-bold inline-flex items-center gap-1 transition-colors break-all"
            >
              <span>{props.children}</span>
              <ExternalLink className="w-3 h-3 inline-block shrink-0 opacity-80" />
            </a>
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 border border-slate-700/80 rounded-2xl shadow-xl bg-slate-950/70">
              <table {...props} className="min-w-full text-right text-xs border-collapse divide-y divide-slate-800" />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead {...props} className="bg-slate-800/90 text-slate-100" />
          ),
          th: ({ node, ...props }) => (
            <th {...props} className="px-4 py-3 font-black text-xs tracking-wider border-b border-slate-700 text-red-300 whitespace-nowrap" />
          ),
          td: ({ node, ...props }) => (
            <td {...props} className="px-4 py-3 text-slate-300 text-xs border-b border-slate-800/60 leading-normal" />
          ),
          h2: ({ node, ...props }) => (
            <h2 {...props} className="text-base lg:text-lg font-black text-white mt-8 mb-4 pb-2 border-b border-white/10 flex items-center gap-2" />
          ),
          h3: ({ node, ...props }) => (
            <h3 {...props} className="text-sm lg:text-base font-black text-slate-100 mt-6 mb-3 pb-1 border-b border-slate-800 flex items-center gap-2 text-red-400" />
          ),
          h4: ({ node, ...props }) => (
            <h4 {...props} className="text-xs lg:text-sm font-bold text-slate-200 mt-4 mb-2" />
          ),
          p: ({ node, ...props }) => (
            <p {...props} className="mb-4 text-slate-300 leading-relaxed" />
          ),
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc list-inside space-y-1.5 mb-4 text-slate-300 pr-2" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal list-inside space-y-1.5 mb-4 text-slate-300 pr-2" />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote {...props} className="border-r-4 border-red-500/80 pr-4 py-1 my-4 bg-red-950/20 rounded-l-xl text-slate-300 italic" />
          )
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};

interface MonitoringViewProps {
  alerts: any[];
  onClose: () => void;
}

const mockChartData = [
  { name: '00:00', value: 12 },
  { name: '04:00', value: 18 },
  { name: '08:00', value: 45 },
  { name: '12:00', value: 30 },
  { name: '16:00', value: 55 },
  { name: '20:00', value: 38 },
  { name: '23:59', value: 25 },
];

const sentimentData = [
  { name: 'سلبي جداً', value: 40, color: '#ef4444' },
  { name: 'سلبي', value: 35, color: '#f59e0b' },
  { name: 'محايد', value: 25, color: '#3b82f6' },
];

const MonitoringView: React.FC<MonitoringViewProps> = ({ alerts: initialAlerts, onClose }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'complex' | 'scan'>('dashboard');
  const [complexThreats, setComplexThreats] = useState<any[]>([]);
  const [scanContent, setScanContent] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isAutoMonitoring, setIsAutoMonitoring] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [radarCustomization, setRadarCustomization] = useState(() => localStorage.getItem('radar_customization') || '');
  const [showRadarSettings, setShowRadarSettings] = useState(false);
  const [localAlerts, setLocalAlerts] = useState(() => {
    if (initialAlerts && initialAlerts.length > 0) return initialAlerts;
    const cached = localStorage.getItem('sovereign_alerts_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse cached alerts', e);
      }
    }
    return [];
  });
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  
  // Interaction states
  const [isGeneratingRebuttal, setIsGeneratingRebuttal] = useState(false);
  const [rebuttalText, setRebuttalText] = useState<string | null>(null);
  const [inquiryText, setInquiryText] = useState('');
  const [inquiryResponse, setInquiryResponse] = useState<string | null>(null);
  const [isInquiring, setIsInquiring] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingReport, setTrackingReport] = useState<string | null>(null);

  // Real-time Global UTC Observatory Time State
  const [currentUtcTime, setCurrentUtcTime] = useState<Date>(new Date());
  const [timeOffsetMs, setTimeOffsetMs] = useState<number>(0);
  const [isSyncingTime, setIsSyncingTime] = useState<boolean>(false);

  // Synchronize with server global time
  const syncServerTime = async () => {
    setIsSyncingTime(true);
    try {
      const res = await fetch('/api/time');
      if (res.ok) {
        const data = await res.json();
        if (data.timestamp) {
          const clientNow = Date.now();
          setTimeOffsetMs(data.timestamp - clientNow);
        }
      }
    } catch (e) {
      console.warn("Time sync notice:", e);
    } finally {
      setIsSyncingTime(false);
    }
  };

  useEffect(() => {
    syncServerTime();
    const interval = setInterval(() => {
      setCurrentUtcTime(new Date(Date.now() + timeOffsetMs));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeOffsetMs]);

  const [isCopied, setIsCopied] = useState(false);
  const [isTrackCopied, setIsTrackCopied] = useState(false);

  const handleCopyTrack = () => {
    if (trackingReport) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(trackingReport);
        setIsTrackCopied(true);
        setTimeout(() => setIsTrackCopied(false), 2000);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = trackingReport;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setIsTrackCopied(true);
          setTimeout(() => setIsTrackCopied(false), 2000);
        } catch (err) {
          console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
      }
    }
  };

  const handleShareTrack = async () => {
    if (trackingReport && navigator.share) {
      try {
        await navigator.share({
          title: 'تقرير التتبع الاستخباري - درع الأمة',
          text: trackingReport,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      handleCopyTrack();
    }
  };

  const handleCopy = () => {
    if (rebuttalText) {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(rebuttalText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        // Fallback for older browsers or insecure contexts
        const textArea = document.createElement("textarea");
        textArea.value = rebuttalText;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
          console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
      }
    }
  };

  const trackIntelligence = async (alert: any) => {
    if (isTracking) return;
    setIsTracking(true);
    setTrackingReport(null);
    try {
      const response = await fetch('/api/monitor/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          alert,
          customApiKey: localStorage.getItem('custom_gemini_key'),
          customModel: localStorage.getItem('custom_gemini_model'),
          temperature: Number(localStorage.getItem('gemini_temp')) || 0.3,
          topP: Number(localStorage.getItem('gemini_top_p')) || 0.95,
          grounding: true
        })
      });
      const data = await response.json().catch(() => ({ error: 'فشل في قراءة الرد من الخادم.' }));
      if (!response.ok) {
        setTrackingReport(`**خطأ في التتبع:**\n\n${data.error || 'حدث خطأ غير معروف'}\n\n*${data.suggestion || ''}*`);
        return;
      }
      if (data.report) {
        setTrackingReport(data.report);
      }
    } catch (error: any) {
      setTrackingReport(`**حدث خطأ في الاتصال بالخادم.**\n\nيرجى التأكد من اتصالك بالإنترنت. التفاصيل: ${error?.message}`);
    } finally {
      setIsTracking(false);
    }
  };

  useEffect(() => {
    localStorage.setItem('radar_customization', radarCustomization);
  }, [radarCustomization]);

  const fetchLiveAlerts = async () => {
    try {
      const response = await fetch('/api/monitor/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customApiKey: localStorage.getItem('custom_gemini_key'),
          customModel: localStorage.getItem('custom_gemini_model'),
          temperature: Number(localStorage.getItem('gemini_temp')) || 0.7,
          topP: Number(localStorage.getItem('gemini_top_p')) || 0.95,
          grounding: localStorage.getItem('gemini_grounding') === 'true',
          radarCustomization
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'فشل في قراءة الرد من الخادم.' }));
        return;
      }

      const data = await response.json().catch(() => ({ error: 'فشل في قراءة الرد من الخادم.' }));
      
      if (data.complexThreats && data.complexThreats.length > 0) {
        setComplexThreats(data.complexThreats);
      }

      if (data.alerts && data.alerts.length > 0) {
        try {
          const { collection, doc, setDoc } = await import('firebase/firestore');
          const { db } = await import('../lib/firebase');
          
          setLocalAlerts(prev => {
            // Deduplicate by content to avoid showing the exact same alert if the model repeats itself
            const existingContents = new Set(prev.map(a => a.content.trim()));
            const genuinelyNewAlerts = data.alerts.filter((a: any) => !existingContents.has(a.content.trim()));
            
            const processedAlerts = genuinelyNewAlerts.map((alert: any) => ({
              ...alert,
              id: `auto-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Guarantee unique ID
              createdAt: Date.now()
            }));

            if (processedAlerts.length > 0) {
              // Save to Firebase asynchronously
              processedAlerts.forEach(async (alertToSave: any) => {
                try {
                  await setDoc(doc(collection(db, "alerts"), alertToSave.id), alertToSave);
                } catch (e: any) {
                  console.warn("Error saving live alert to Firebase, continuing with local state", e?.message);
                }
              });
            }

            return [...processedAlerts, ...prev];
          });
        } catch (err: any) {
          console.warn("Failed to load Firebase modules for live alerts", err?.message);
        }
      }
      setLastScanTime(data?.serverUtcTime ? data.serverUtcTime.substring(11) : (new Date().toISOString().replace('T', ' ').substring(11, 19) + ' UTC'));
    } catch (error: any) {
      // Silently handle fetch error
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem('sovereign_alerts_cache');
    
    let unsubscribe = () => {};

    const loadInitialAlerts = async () => {
      try {
        const { collection, onSnapshot, orderBy, limit, query } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        const q = query(collection(db, "alerts"), orderBy("createdAt", "desc"), limit(100));
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          const fetchedAlerts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (fetchedAlerts.length > 0) {
            setLocalAlerts(prev => {
              const existingIds = new Set(fetchedAlerts.map(a => a.id));
              const missingFromFirebase = prev.filter(a => !existingIds.has(a.id));
              return [...fetchedAlerts, ...missingFromFirebase].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 500);
            });
          } else if (!cached && localAlerts.length === 0) {
            setLocalAlerts([
              { id: "1", source: "Twitter/X", content: "حملة وسائط منظمة تستهدف الرموز الإسلامية والتشريعات الأسرية", level: "High", time: "2026-09-19", evidence: "https://x.com", score: 85, category: "تشريعي" },
              { id: "2", source: "BBC News", content: "تقرير نقاشي حول قضايا الفقه وتاريخ التشريعات", level: "Medium", time: "2026-09-18", evidence: "https://www.bbc.com/news", score: 65, category: "تاريخي" },
              { id: "3", source: "Reddit", content: "نقاش أكاديمي حول 'الإسلام والمنهج العلمي' ودحض المغالطات الاستشراقية", level: "Low", time: "2026-09-17", evidence: "https://www.reddit.com", score: 30, category: "فلسفي" }
            ]);
          }
        }, (error: any) => {
          console.warn("Firebase quota or network error, using fallback:", error?.message);
          if (!cached && localAlerts.length === 0) {
            setLocalAlerts([
              { id: "1", source: "Twitter/X", content: "حملة وسائط منظمة تستهدف الرموز الإسلامية والتشريعات الأسرية", level: "High", time: "2026-09-19", evidence: "https://x.com", score: 85, category: "تشريعي" },
              { id: "2", source: "BBC News", content: "تقرير نقاشي حول قضايا الفقه وتاريخ التشريعات", level: "Medium", time: "2026-09-18", evidence: "https://www.bbc.com/news", score: 65, category: "تاريخي" },
              { id: "3", source: "Reddit", content: "نقاش أكاديمي حول 'الإسلام والمنهج العلمي' ودحض المغالطات الاستشراقية", level: "Low", time: "2026-09-17", evidence: "https://www.reddit.com", score: 30, category: "فلسفي" }
            ]);
          }
        });
      } catch (error: any) {
        console.warn("Failed to setup Firebase listener, using fallback:", error?.message);
        if (!cached && localAlerts.length === 0) {
          setLocalAlerts([
            { id: "1", source: "Twitter/X", content: "حملة وسائط منظمة تستهدف الرموز الإسلامية والتشريعات الأسرية", level: "High", time: "2026-09-19", evidence: "https://x.com", score: 85, category: "تشريعي" },
            { id: "2", source: "BBC News", content: "تقرير نقاشي حول قضايا الفقه وتاريخ التشريعات", level: "Medium", time: "2026-09-18", evidence: "https://www.bbc.com/news", score: 65, category: "تاريخي" },
            { id: "3", source: "Reddit", content: "نقاش أكاديمي حول 'الإسلام والمنهج العلمي' ودحض المغالطات الاستشراقية", level: "Low", time: "2026-09-17", evidence: "https://www.reddit.com", score: 30, category: "فلسفي" }
          ]);
        }
      }
    };
    loadInitialAlerts();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (localAlerts && localAlerts.length > 0) {
      localStorage.setItem('sovereign_alerts_cache', JSON.stringify(localAlerts.slice(0, 500)));
    }
  }, [localAlerts]);

  useEffect(() => {
    let interval: any;
    if (isAutoMonitoring) {
      fetchLiveAlerts();
      interval = setInterval(fetchLiveAlerts, 60000); // More frequent: every 1 minute
    }
    return () => clearInterval(interval);
  }, [isAutoMonitoring]);

  const handleScan = async () => {
    if (!scanContent.trim() || isScanning) return;
    setIsScanning(true);
    setAnalysisResult(null);
    try {
      const response = await fetch('/api/monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: scanContent,
          customApiKey: localStorage.getItem('custom_gemini_key'),
          customModel: localStorage.getItem('custom_gemini_model'),
          temperature: Number(localStorage.getItem('gemini_temp')) || 0.7,
          topP: Number(localStorage.getItem('gemini_top_p')) || 0.95,
          grounding: localStorage.getItem('gemini_grounding') === 'true'
        })
      });
      
      const data = await response.json().catch(() => ({ error: 'فشل في قراءة الرد من الخادم.' }));
      setAnalysisResult(data);
      
      if (!response.ok) {
        const errorAlert = {
          id: `error-${Date.now()}`,
          source: 'نظام الفحص السيادي',
          time: 'الآن',
          content: `**خطأ:** ${data.error || 'حدث خطأ غير معروف'}\n\n*${data.suggestion || ''}*`,
          level: 'Medium',
          category: 'رسالة نظام',
          sentiment: 'محايد',
          createdAt: Date.now()
        };
        setLocalAlerts([errorAlert, ...localAlerts]);
        setActiveTab('dashboard');
        setSelectedAlert(errorAlert);
        setScanContent('');
        return;
      }

      const newAlert = {
        id: `manual-${Date.now()}`,
        source: 'نظام الفحص السيادي',
        time: 'الآن',
        content: (data.summary || data.raw || scanContent) + (data.recommendation ? `\n\n**التوصية:**\n${data.recommendation}` : ''),
        level: data.score > 70 ? 'High' : data.score > 40 ? 'Medium' : 'Low',
        category: data.categories || 'تحليل ذكي',
        sentiment: data.sentiment || 'تحت التحليل',
        evidence: scanContent.startsWith('http') ? scanContent : null,
        createdAt: Date.now()
      };

      try {
        const { collection, doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        await setDoc(doc(collection(db, "alerts"), newAlert.id), newAlert);
      } catch (err: any) {
        console.warn("Failed to save manual alert to Firebase, using local cache:", err?.message);
      }

      setLocalAlerts([newAlert, ...localAlerts]);
      
      // Auto-switch to dashboard and open the new alert
      setActiveTab('dashboard');
      setSelectedAlert(newAlert);
      setScanContent('');
    } catch (error: any) {
      // Silently handle error, UI handles state
    } finally {
      setIsScanning(false);
    }
  };

  const generateRebuttal = async (alert: any) => {
    if (isGeneratingRebuttal) return;
    setIsGeneratingRebuttal(true);
    setRebuttalText(null);
    try {
      const response = await fetch('/api/rebuttal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: alert.content,
          context: alert.source,
          alert: alert,
          evidence: alert.evidence,
          category: alert.category,
          source: alert.source,
          customApiKey: localStorage.getItem('custom_gemini_key'),
          customModel: localStorage.getItem('custom_gemini_model'),
          temperature: Number(localStorage.getItem('gemini_temp')) || 0.3,
          topP: Number(localStorage.getItem('gemini_top_p')) || 0.95,
          grounding: true
        })
      });
      const data = await response.json().catch(() => ({ error: 'فشل في قراءة الرد من الخادم.' }));
      if (!response.ok) {
        setRebuttalText(`**خطأ في توليد الرد المحكم:**\n\n${data.error || 'حدث خطأ غير معروف'}\n\n*${data.suggestion || ''}*`);
        return;
      }
      setRebuttalText(data.text);
    } catch (error: any) {
      setRebuttalText(`**حدث خطأ في الاتصال بالخادم.**\n\nيرجى التأكد من اتصالك بالإنترنت. التفاصيل: ${error?.message}`);
    } finally {
      setIsGeneratingRebuttal(false);
    }
  };

  const askAboutAlert = async () => {
    if (!inquiryText.trim() || !selectedAlert || isInquiring) return;
    setIsInquiring(true);
    setInquiryResponse(null);
    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: selectedAlert.content,
          question: inquiryText,
          customApiKey: localStorage.getItem('custom_gemini_key'),
          customModel: localStorage.getItem('custom_gemini_model'),
          temperature: Number(localStorage.getItem('gemini_temp')) || 0.7,
          topP: Number(localStorage.getItem('gemini_top_p')) || 0.95,
          grounding: localStorage.getItem('gemini_grounding') === 'true'
        })
      });
      const data = await response.json().catch(() => ({ error: 'فشل في قراءة الرد من الخادم.' }));
      if (!response.ok) {
        setInquiryResponse(`**خطأ:**\n\n${data.error || 'حدث خطأ غير معروف'}\n\n*${data.suggestion || ''}*`);
        return;
      }
      setInquiryResponse(data.text);
    } catch (error: any) {
      setInquiryResponse(`**حدث خطأ في الاتصال بالخادم.**\n\nيرجى التأكد من اتصالك بالإنترنت. التفاصيل: ${error?.message}`);
    } finally {
      setIsInquiring(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4 bg-slate-900/80 backdrop-blur-2xl"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-7xl h-full lg:h-[95vh] lg:rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-white/20">
        {/* Top Header */}
        <div className="px-6 lg:px-10 py-4 lg:py-8 border-b bg-white dark:bg-slate-900 flex flex-col lg:flex-row lg:items-center justify-between shrink-0 gap-4">
          <div className="flex items-center justify-between lg:justify-start lg:gap-10">
            <div className="flex items-center">
              <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-red-600 flex items-center justify-center ml-3 lg:ml-5 shadow-2xl shadow-red-600/30">
                <ShieldAlert className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">رادار الرصد السيادي</h2>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Global Media Surveillance Active</span>
                </div>
              </div>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 lg:p-1.5 rounded-xl lg:rounded-2xl gap-0.5 lg:gap-1">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 lg:px-8 py-1.5 lg:py-2.5 rounded-lg lg:rounded-xl text-[10px] lg:text-sm font-black transition-all ${activeTab === 'dashboard' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300'}`}
              >
                غرفة العمليات
              </button>
              <button 
                onClick={() => setActiveTab('complex')}
                className={`px-4 lg:px-8 py-1.5 lg:py-2.5 rounded-lg lg:rounded-xl text-[10px] lg:text-sm font-black transition-all flex items-center gap-2 ${activeTab === 'complex' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300'}`}
              >
                التهديدات المتقاطعة
                {complexThreats.length > 0 && (
                  <span className="w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] lg:text-[10px]">{complexThreats.length}</span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('scan')}
                className={`px-4 lg:px-8 py-1.5 lg:py-2.5 rounded-lg lg:rounded-xl text-[10px] lg:text-sm font-black transition-all ${activeTab === 'scan' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300'}`}
              >
                فحص فوري
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-4 lg:gap-6">
            <div className={`flex items-center gap-2 lg:gap-3 px-4 lg:px-6 py-2 lg:py-3 rounded-xl lg:rounded-2xl border transition-all flex-1 lg:flex-initial relative ${isAutoMonitoring ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
              
              <button 
                onClick={() => setShowRadarSettings(!showRadarSettings)}
                className={`p-1.5 lg:p-2 rounded-full transition-all ${radarCustomization ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400'}`}
                title="تخصيص الرادار"
              >
                <Settings className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>

              <div className="text-right ml-1 lg:ml-2">
                <div className="text-[7px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Radar Status</div>
                <div className={`text-[9px] lg:text-[11px] font-black leading-none ${isAutoMonitoring ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                  {isAutoMonitoring ? (
                    <span className="flex items-center gap-1">
                      نشط
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    </span>
                  ) : 'متوقف'}
                </div>
              </div>
              <button 
                onClick={() => setIsAutoMonitoring(!isAutoMonitoring)}
                className={`w-10 lg:w-14 h-5 lg:h-7 rounded-full relative transition-colors duration-300 ${isAutoMonitoring ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <div 
                  className={`absolute top-1 w-3 h-3 lg:w-5 lg:h-5 rounded-full bg-white shadow-lg transition-all duration-300 ${isAutoMonitoring ? 'right-6 lg:right-8' : 'right-1'}`}
                />
              </button>

              <AnimatePresence>
                {showRadarSettings && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 lg:right-0 mt-2 w-72 lg:w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl lg:rounded-2xl shadow-xl p-4 z-50 text-right"
                  >
                    <h4 className="text-sm lg:text-base font-black text-slate-900 dark:text-white mb-2">تخصيص عدسة الرادار</h4>
                    <p className="text-[10px] lg:text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
                      أدخل تعليمات إضافية لتوجيه الرادار. سيتم توسيع البحث تلقائياً ليشمل كافة التقاطعات والتهديدات المعقدة بناءً على هذا التخصيص.
                    </p>
                    <textarea 
                      value={radarCustomization}
                      onChange={(e) => setRadarCustomization(e.target.value)}
                      placeholder="مثال: ركز على الهجمات المتعلقة بالذكاء الاصطناعي وتزييف الهوية..."
                      className="w-full h-20 lg:h-24 p-2 lg:p-3 text-xs lg:text-sm border border-slate-200 dark:border-slate-700 rounded-lg lg:rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white mb-3"
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => { setRadarCustomization(''); setShowRadarSettings(false); }}
                        className="px-3 lg:px-4 py-1.5 lg:py-2 text-[10px] lg:text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        إزالة التخصيص
                      </button>
                      <button 
                        onClick={() => {
                          setShowRadarSettings(false);
                          if (isAutoMonitoring) {
                            fetchLiveAlerts();
                          }
                        }}
                        className="px-3 lg:px-4 py-1.5 lg:py-2 text-[10px] lg:text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                      >
                        تطبيق ومزامنة
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button onClick={onClose} className="p-2 lg:p-4 hover:bg-slate-100 dark:bg-slate-800/50 rounded-full transition-all text-slate-400 hover:text-slate-900 dark:hover:text-white">
              <X className="w-6 h-6 lg:w-8 lg:h-8" />
            </button>
          </div>
        </div>

        {/* Live Global Real-Time Observatory Status Ribbon */}
        <div className="bg-slate-950 border-b border-slate-800/80 px-4 lg:px-10 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-3 shadow-inner">
          <div className="flex flex-wrap items-center gap-2.5 lg:gap-4">
            <div className="flex items-center gap-2 bg-emerald-950/90 text-emerald-400 border border-emerald-800/90 px-3 py-1 rounded-full text-[10px] lg:text-[11px] font-black shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="tracking-wider">بث الرصد المباشر (LIVE)</span>
            </div>

            {/* Global Real-Time UTC Clock */}
            <div className="flex items-center gap-2 font-mono bg-slate-900/90 text-slate-100 border border-slate-800 px-3 py-1 rounded-xl shadow-sm">
              <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-[10px] text-slate-400 font-sans font-bold">الوقت العالمي (UTC):</span>
              <span className="font-mono font-black text-amber-400 tracking-wider text-xs lg:text-sm">
                {currentUtcTime.toISOString().replace('T', ' ').substring(0, 19)} UTC
              </span>
            </div>

            {/* Local Operator Time */}
            <div className="hidden md:flex items-center gap-2 font-mono bg-slate-900/60 text-slate-300 border border-slate-800/60 px-2.5 py-1 rounded-xl text-[11px]">
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="text-slate-400 font-sans">محلي:</span>
              <span className="font-bold text-slate-200">
                {currentUtcTime.toLocaleTimeString('ar-EG', { hour12: false })}
              </span>
            </div>

            {/* Makkah Time */}
            <div className="hidden xl:flex items-center gap-2 font-mono bg-slate-900/60 text-slate-300 border border-slate-800/60 px-2.5 py-1 rounded-xl text-[11px]">
              <span className="text-emerald-400 text-xs">🕋</span>
              <span className="text-slate-400 font-sans">توقيت مكة:</span>
              <span className="font-bold text-slate-200">
                {new Date(currentUtcTime.getTime() + (3 * 3600 * 1000)).toLocaleTimeString('ar-EG', { hour12: false })} (GMT+3)
              </span>
            </div>
          </div>

          {/* Sync & Radar Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            <span className="text-[9px] lg:text-[10px] text-slate-400 hidden sm:inline font-mono">
              {lastScanTime ? `آخر نبضة رادار: ${lastScanTime}` : 'المزامنة الذرية متصلة بالشبكة'}
            </span>
            <button
              onClick={() => {
                syncServerTime();
                fetchLiveAlerts();
              }}
              disabled={isScanning || isSyncingTime}
              className="flex items-center gap-1.5 px-3 py-1 bg-red-600/90 hover:bg-red-600 active:scale-95 text-white rounded-lg text-[10px] font-bold transition-all shadow-md shadow-red-950/50 disabled:opacity-50 cursor-pointer"
              title="مزامنة فورية مع خوادم التوقيت العالمي وشبكة الرصد"
            >
              <RefreshCw className={`w-3 h-3 ${isScanning || isSyncingTime ? 'animate-spin' : ''}`} />
              <span>مزامنة الوقت والرادار</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-10 bg-slate-50/50 custom-scrollbar">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' ? (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6 lg:space-y-10"
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    <StatsCard icon={<Radio className="w-4 h-4 lg:w-5 lg:h-5" />} label="تنبيهات اليوم" value={localAlerts?.length || 0} color="red" trend="+12%" />
                    <StatsCard icon={<Activity className="w-4 h-4 lg:w-5 lg:h-5" />} label="مستوى التهديد" value="حرج" color="amber" />
                    <StatsCard icon={<Globe className="w-4 h-4 lg:w-5 lg:h-5" />} label="تغطية الرصد" value="100%" color="blue" />
                    <StatsCard icon={<ShieldCheck className="w-4 h-4 lg:w-5 lg:h-5" />} label="ردود محكمة" value="24" color="emerald" trend="+5" />
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-10">
                    {/* Alerts Feed */}
                    <div className="xl:col-span-2 space-y-4 lg:space-y-6">
                      <div className="flex items-center justify-between px-2 lg:px-4">
                        <h3 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                          <Radio className="w-5 h-5 lg:w-6 lg:h-6 text-red-600 animate-pulse" />
                          آخر الرصودات الميدانية
                        </h3>
                        <span className="hidden sm:inline text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Intelligence Feed</span>
                      </div>
                      
                      <div className="space-y-3 lg:space-y-4">
                        {!localAlerts || localAlerts.length === 0 ? (
                          <div className="bg-white dark:bg-slate-900 p-12 lg:p-20 rounded-[2rem] lg:rounded-[3rem] border border-slate-200 dark:border-slate-700 text-center space-y-4 shadow-sm">
                            <Loader2 className="w-12 h-12 text-slate-200 animate-spin mx-auto" />
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">جاري مسح الويب والتطبيقات...</p>
                          </div>
                        ) : (
                          localAlerts.map((alert) => (
                            <AlertItem 
                              key={alert.id} 
                              alert={alert} 
                              isSelected={selectedAlert?.id === alert.id}
                              isGenerating={isGeneratingRebuttal && selectedAlert?.id === alert.id}
                              onQuickRebuttal={(a: any) => {
                                setSelectedAlert(a);
                                generateRebuttal(a);
                              }}
                              onClick={() => {
                                setSelectedAlert(alert);
                                setRebuttalText(null);
                                setTrackingReport(null);
                                setInquiryResponse(null);
                                setInquiryText('');
                              }} 
                            />
                          ))
                        )}
                      </div>
                    </div>

                    {/* Analytics Sidebar */}
                    <div className="space-y-6 lg:space-y-8">
                      <div className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2rem] lg:rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 lg:space-y-6">
                        <h3 className="text-base lg:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-red-600" />
                          منحنى الهجمات (٢٤ ساعة)
                        </h3>
                        <div className="h-40 lg:h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockChartData}>
                              <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={3} fill="url(#colorValue)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-slate-900 p-6 lg:p-8 rounded-[2rem] lg:rounded-[3rem] text-white space-y-4 lg:space-y-6 shadow-2xl">
                        <h3 className="text-base lg:text-lg font-black flex items-center gap-2">
                          <PieChartIcon className="w-5 h-5 text-red-500" />
                          توزيع المشاعر الإعلامية
                        </h3>
                        <div className="space-y-4">
                          {sentimentData.map((item) => (
                            <div key={item.name} className="space-y-2">
                              <div className="flex items-center justify-between text-[10px] lg:text-[11px] font-black uppercase">
                                <span>{item.name}</span>
                                <span>{item.value}%</span>
                              </div>
                              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${item.value}%` }}
                                  className="h-full"
                                  style={{ backgroundColor: item.color }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : activeTab === 'complex' ? (
                <motion.div 
                  key="complex"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6 lg:space-y-10"
                >
                  <div className="flex items-center justify-between px-2 lg:px-4 mb-4">
                    <div>
                      <h3 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <Radar className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-500" />
                        التهديدات المتقاطعة (Cross-Intersection Analysis)
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm lg:text-base">
                        تحليل استخباراتي للعلاقات والروابط المعقدة بين التهديدات والحملات المنسقة عبر منصات متعددة.
                      </p>
                    </div>
                  </div>

                  {complexThreats.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                      {complexThreats.map((threat, index) => (
                        <div key={threat.id || index} className="bg-white dark:bg-slate-900 p-6 lg:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/40 relative overflow-hidden">
                          <div className={`absolute top-0 right-0 w-1.5 h-full ${threat.impactLevel === 'High' ? 'bg-red-500' : threat.impactLevel === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                          
                          <div className="flex flex-col xl:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                              <h4 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white">{threat.title}</h4>
                              <p className="text-sm lg:text-base text-slate-600 dark:text-slate-300 leading-relaxed">{threat.description}</p>
                              
                              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-700">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">التحليل الاستراتيجي (Strategic Analysis)</span>
                                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{threat.strategicAnalysis}</p>
                              </div>
                            </div>
                            
                            <div className="w-full xl:w-64 shrink-0 space-y-4">
                              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">المنصات المتقاطعة</span>
                                <div className="flex flex-wrap gap-2">
                                  {threat.involvedPlatforms?.map((platform: string) => (
                                    <span key={platform} className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] lg:text-xs font-black rounded-lg">
                                      {platform}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">مستوى التأثير</span>
                                <div className={`text-base font-black ${threat.impactLevel === 'High' ? 'text-red-500' : threat.impactLevel === 'Medium' ? 'text-amber-500' : 'text-blue-500'}`}>
                                  {threat.impactLevel}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mb-6">
                        <ShieldCheck className="w-10 h-10 text-slate-400" />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2">لا توجد تهديدات متقاطعة</h4>
                      <p className="text-slate-500">يقوم الرادار بمسح المنصات باستمرار بحثاً عن الحملات المنسقة والروابط المعقدة.</p>
                    </div>
                  )}
                </motion.div>
              ) : activeTab === 'scan' ? (
                <div className="max-w-4xl mx-auto py-8 lg:py-10 space-y-8 lg:space-y-10">
                   <div className="text-center space-y-4 lg:space-y-6 mb-8 lg:mb-12">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-red-600 rounded-[2rem] lg:rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_20px_50px_rgba(220,38,38,0.4)]">
                      <Search className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                    </div>
                    <h3 className="text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">نظام الفحص السيادي</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-base lg:text-lg font-medium max-w-2xl mx-auto leading-relaxed">قم بلصق أي رابط، نص، أو محتوى مشبوه ليتم تحليله استخباراتياً وتفنيده عبر محرك Gemini 3.7 المتطور.</p>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-6 lg:p-10 rounded-[2.5rem] lg:rounded-[3.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/50 space-y-6 lg:space-y-8">
                    <div className="space-y-4">
                      <label className="text-xs lg:text-sm font-black text-slate-800 dark:text-slate-200 px-3 flex items-center gap-2">
                        <Info className="w-4 h-4 lg:w-5 lg:h-5 text-red-500" />
                        المحتوى المراد إخضاعه للفحص
                      </label>
                      <textarea 
                        value={scanContent}
                        onChange={(e) => setScanContent(e.target.value)}
                        placeholder="انسخ النص أو الرابط هنا..."
                        className="w-full h-48 lg:h-64 p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] bg-slate-50 dark:bg-slate-800 border-none focus:ring-4 focus:ring-red-100 transition-all outline-none text-slate-800 dark:text-slate-200 text-lg lg:text-xl font-medium leading-relaxed resize-none shadow-inner"
                      />
                    </div>

                    <div className="flex justify-center">
                      <button 
                        onClick={handleScan}
                        disabled={isScanning || !scanContent.trim()}
                        className="w-full sm:w-auto px-12 lg:px-20 py-4 lg:py-6 bg-red-600 text-white rounded-[1.5rem] lg:rounded-[2rem] font-black text-xl lg:text-2xl shadow-[0_20px_60px_rgba(220,38,38,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                      >
                        {isScanning ? <Loader2 className="w-6 h-6 lg:w-8 lg:h-8 animate-spin" /> : <ShieldAlert className="w-6 h-6 lg:w-8 lg:h-8" />}
                        تشغيل محرك التحليل
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Action Sidebar (Selected Alert) */}
          <AnimatePresence>
            {selectedAlert && (
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="fixed lg:relative inset-0 lg:inset-auto lg:w-[500px] border-r bg-white dark:bg-slate-900 flex flex-col shrink-0 z-50 lg:z-10 shadow-[-20px_0_50px_rgba(0,0,0,0.1)] lg:shadow-[-20px_0_50px_rgba(0,0,0,0.05)]"
              >
                <div className="p-4 lg:p-8 border-b bg-slate-50/50 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelectedAlert(null)} className="lg:hidden p-2 hover:bg-slate-200 rounded-full transition-colors mr-2">
                      <ChevronRight className="w-6 h-6 text-slate-900 dark:text-white rotate-180" />
                    </button>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${selectedAlert.level === 'High' ? 'bg-red-600 text-white shadow-red-600/20' : 'bg-amber-500 text-white shadow-amber-500/20'}`}>
                      <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm lg:text-base font-black text-slate-900 dark:text-white leading-tight">تحليل الرصد</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedAlert.category}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedAlert(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 lg:space-y-10 custom-scrollbar">
                  {/* Alert Content Summary */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المحتوى المرصود</div>
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                        selectedAlert.sentiment === 'سلبي' ? 'bg-red-100 text-red-600' : 
                        selectedAlert.sentiment === 'محايد' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                      }`}>
                        المشاعر: {selectedAlert.sentiment || 'تحت التحليل'}
                      </span>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-800 italic text-slate-600 dark:text-slate-400 leading-relaxed font-medium text-sm lg:text-base shadow-inner">
                      "{selectedAlert.content}"
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {selectedAlert.evidence && (
                        <a href={selectedAlert.evidence} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] lg:text-xs font-black hover:bg-blue-100 transition-all border border-blue-100 shadow-sm">
                          <Globe className="w-4 h-4" />
                          رابط المصدر المباشر
                        </a>
                      )}
                      {selectedAlert.impact && (
                        <div className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-[10px] lg:text-xs font-black border border-amber-100 shadow-sm">
                          الانتشار: {selectedAlert.impact}
                        </div>
                      )}
                      <button 
                        onClick={() => trackIntelligence(selectedAlert)}
                        disabled={isTracking}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] lg:text-xs font-black hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg shadow-slate-900/20"
                      >
                        {isTracking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radar className="w-4 h-4" />}
                        تتبع المسار الاستخباري
                      </button>
                    </div>
                  </div>

                  {/* Tracking Report */}
                  <AnimatePresence>
                    {trackingReport && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4 p-6 bg-slate-900 rounded-[2rem] lg:rounded-[2.5rem] border border-white/10 shadow-2xl"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-black text-[10px] lg:text-sm flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            تقرير التتبع الاستخباري
                          </h4>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={handleCopyTrack}
                              className={`p-2 rounded-xl border transition-all ${
                                isTrackCopied ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white/10 border-white/10 text-white hover:bg-white/20'
                              }`}
                              title="نسخ التقرير"
                            >
                              {isTrackCopied ? <ShieldCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <button 
                              onClick={handleShareTrack}
                              className="p-2 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all"
                              title="مشاركة التقرير"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <ReportRenderer content={trackingReport} />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Inquiry Section */}
                  <div className="space-y-6">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">استفسار ذكي حول المحتوى</div>
                    <div className="relative group">
                      <textarea 
                        value={inquiryText}
                        onChange={(e) => setInquiryText(e.target.value)}
                        placeholder="اسأل عن أي جزء في المقال أو الصورة..."
                        className="w-full p-6 pb-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-600 transition-all outline-none text-slate-900 dark:text-white font-medium leading-relaxed resize-none h-40 text-sm shadow-inner"
                      />
                      <button 
                        onClick={askAboutAlert}
                        disabled={isInquiring || !inquiryText.trim()}
                        className="absolute bottom-4 left-4 p-3 lg:p-4 bg-slate-900 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50 shadow-slate-900/20"
                      >
                        {isInquiring ? <Loader2 className="w-5 h-5 lg:w-6 lg:h-6 animate-spin" /> : <Send className="w-5 h-5 lg:w-6 lg:h-6" />}
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {inquiryResponse && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 lg:p-8 bg-blue-50 rounded-[2rem] border border-blue-100 space-y-3 relative overflow-hidden shadow-sm"
                        >
                          <div className="absolute top-0 right-0 w-1.5 h-full bg-blue-500"></div>
                          <div className="flex items-center gap-2 text-blue-700 font-black text-[10px] lg:text-xs uppercase mb-2">
                            <HelpCircle className="w-4 h-4" />
                            الرد العلمي الاستفساري
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed text-xs lg:text-base">{inquiryResponse}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Detailed Rebuttal Section */}
                  <div className="space-y-6 pt-6 border-t pb-10">
                    <div className="flex items-center justify-between px-1">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تفنيد الشبهة</div>
                      <button 
                        onClick={() => generateRebuttal(selectedAlert)}
                        disabled={isGeneratingRebuttal}
                        className="flex items-center gap-2 text-[10px] lg:text-xs font-black text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        {isGeneratingRebuttal ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                        {rebuttalText ? 'توليد رد جديد' : 'إنشاء رد محكم'}
                      </button>
                    </div>

                    <AnimatePresence>
                      {rebuttalText && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-6 lg:p-10 bg-slate-900 text-white rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl relative group border border-white/5"
                        >
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/20">
                              <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                            </div>
                            <h5 className="font-black text-base lg:text-lg">الرد الشرعي المفصل</h5>
                          </div>
                          <ReportRenderer content={rebuttalText} />
                          <button 
                            onClick={handleCopy}
                            className={`mt-8 w-full py-4 rounded-2xl font-black text-[10px] lg:text-xs transition-all border shadow-lg ${
                              isCopied 
                                ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-600/20' 
                                : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                            }`}
                          >
                            {isCopied ? 'تم نسخ الرد بنجاح ✓' : 'نسخ الرد الدفاعي'}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="lg:hidden p-4 border-t bg-white dark:bg-slate-900 shrink-0">
                  <button 
                    onClick={() => setSelectedAlert(null)}
                    className="w-full py-4 bg-slate-100 dark:bg-slate-800/50 text-slate-900 dark:text-white rounded-2xl font-black text-sm active:scale-95 transition-all"
                  >
                    إغلاق المعاينة والعودة
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>

  );
};

// Sub-components
const StatsCard = ({ icon, label, value, color, trend }: any) => (
  <div className="bg-white dark:bg-slate-900 p-4 lg:p-6 rounded-2xl lg:rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
    <div className={`absolute top-0 right-0 w-1.5 lg:w-2 h-full transition-all duration-500 ${
      color === 'red' ? 'bg-red-500 group-hover:w-full group-hover:opacity-5' : 
      color === 'amber' ? 'bg-amber-500 group-hover:w-full group-hover:opacity-5' : 
      color === 'blue' ? 'bg-blue-500 group-hover:w-full group-hover:opacity-5' : 
      'bg-emerald-500 group-hover:w-full group-hover:opacity-5'
    }`}></div>
    <div className="relative z-10">
      <div className="text-slate-400 text-[8px] lg:text-[10px] font-black uppercase mb-2 lg:mb-3 flex items-center gap-2">
        <span className={`${
          color === 'red' ? 'text-red-500' : 
          color === 'amber' ? 'text-amber-500' : 
          color === 'blue' ? 'text-blue-500' : 'text-emerald-500'
        }`}>{icon}</span>
        {label}
      </div>
      <div className="flex items-baseline gap-1 lg:gap-2">
        <div className="text-2xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</div>
        {trend && <span className="text-[8px] lg:text-[10px] font-black text-emerald-600 mb-0.5 lg:mb-1">{trend}</span>}
      </div>
    </div>
  </div>
);

const AlertItem = ({ alert, onClick, isSelected, onQuickRebuttal, isGenerating }: any) => (
  <motion.div 
    layout
    onClick={onClick}
    className={`p-4 lg:p-6 rounded-2xl lg:rounded-[2.5rem] border transition-all cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
      isSelected ? 'bg-white dark:bg-slate-900 border-slate-900 shadow-xl scale-[1.02]' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-slate-400 shadow-sm'
    }`}
  >
    <div className="flex items-center gap-4 lg:gap-6 flex-1">
      <div className={`w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
        alert.level === 'High' ? 'bg-red-50 text-red-600' : 
        alert.level === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
      }`}>
        <AlertTriangle className="w-5 h-5 lg:w-7 lg:h-7" />
      </div>
      <div className="space-y-1 overflow-hidden flex-1">
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <span className="font-black text-slate-900 dark:text-white text-sm lg:text-lg truncate">{alert.source}</span>
          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 text-[8px] lg:text-[9px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase flex items-center gap-1 font-mono">
            <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
            {alert.time}
          </span>
          <span className="text-[8px] lg:text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{alert.category}</span>
        </div>
        <p className="text-xs lg:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl line-clamp-2">
          {alert.content}
        </p>
      </div>
    </div>
    <div className="flex items-center justify-between lg:justify-end gap-3 lg:gap-4 shrink-0">
      <div className="flex flex-col items-end lg:hidden">
         <span className="text-[8px] font-black text-slate-400 uppercase mb-1">Impact: {alert.impact || 'Unknown'}</span>
      </div>
      
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onQuickRebuttal(alert);
        }}
        disabled={isGenerating}
        className="flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-slate-900 text-white rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black hover:bg-red-600 transition-all disabled:opacity-50"
      >
        {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
        رد فوري
      </button>

      <div className="flex items-center gap-3">
        <div className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[8px] lg:text-[9px] font-black tracking-[0.2em] uppercase ${
          alert.level === 'High' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 
          alert.level === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
        }`}>
          {alert.level === 'High' ? 'Critical' : alert.level === 'Medium' ? 'Warning' : 'Info'}
        </div>
        <ChevronRight className={`w-4 h-4 lg:w-5 lg:h-5 transition-all ${isSelected ? 'rotate-90 text-slate-900 dark:text-white' : 'text-slate-300'}`} />
      </div>
    </div>
  </motion.div>
);

export default MonitoringView;
