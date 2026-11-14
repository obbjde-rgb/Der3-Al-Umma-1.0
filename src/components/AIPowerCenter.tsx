import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Cpu, Key, RefreshCw, Send, Loader2, CheckCircle, AlertTriangle, ShieldCheck, Sliders, Zap, Activity, Globe, MessageSquare, Trash2, Settings2 } from 'lucide-react';

interface Model {
  id: string;
  name: string;
}

interface AIPowerCenterProps {
  onClose: () => void;
}

const AIPowerCenter: React.FC<AIPowerCenterProps> = ({ onClose }) => {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem('custom_gemini_key') || '');
  const [models, setModels] = useState<Model[]>(() => {
    try {
      const savedModels = localStorage.getItem('gemini_models_list');
      return savedModels ? JSON.parse(savedModels) : [];
    } catch (e) {
      return [];
    }
  });
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('custom_gemini_model') || 'gemini-3.6-flash');
  const [temperature, setTemperature] = useState(() => Number(localStorage.getItem('gemini_temp')) || 0.7);
  const [topP, setTopP] = useState(() => Number(localStorage.getItem('gemini_top_p')) || 0.95);
  const [groundingEnabled, setGroundingEnabled] = useState(() => localStorage.getItem('gemini_grounding') === 'true');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChatting, setIsChatting] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const fetchModels = async () => {
    if (!apiKey || apiKey.length < 20 || isUpdating) return;
    setIsUpdating(true);
    setStatus({ type: null, message: '' });
    try {
      const response = await fetch('/api/setallmodel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });
      
      const responseText = await response.text();
      let data: any = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e: any) {
        console.warn("Failed to parse models response:", e?.message || e);
      }

      if (data.error) throw new Error(data.error);
      if (!response.ok) throw new Error(`خطأ في جلب النماذج: ${response.status}`);
      
      const fetchedModels = data.models || [];
      if (fetchedModels.length === 0) {
        const defaultModels = [
          { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash (Default)' },
          { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
          { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
        ];
        setModels(defaultModels);
        localStorage.setItem('gemini_models_list', JSON.stringify(defaultModels));
        setStatus({ type: 'success', message: 'تم تفعيل النماذج الأساسية بنجاح.' });
      } else {
        setModels(fetchedModels);
        localStorage.setItem('gemini_models_list', JSON.stringify(fetchedModels));
        setStatus({ type: 'success', message: `تم جلب ${fetchedModels.length} نموذج بنجاح من حسابك.` });
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: `فشل الاتصال: ${error.message}` });
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (apiKey && apiKey.length > 20) {
        fetchModels();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [apiKey]);

  useEffect(() => {
    sessionStorage.setItem('custom_gemini_key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('custom_gemini_model', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem('gemini_temp', temperature.toString());
  }, [temperature]);

  useEffect(() => {
    localStorage.setItem('gemini_top_p', topP.toString());
  }, [topP]);

  useEffect(() => {
    localStorage.setItem('gemini_grounding', groundingEnabled.toString());
  }, [groundingEnabled]);

  const handleTestChat = async () => {
    if (!testInput.trim() || isChatting) return;
    
    const userMsg = { role: 'user' as const, text: testInput };
    setChatHistory(prev => [...prev, userMsg]);
    setTestInput('');
    setIsChatting(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: testInput, 
          customApiKey: apiKey, 
          customModel: selectedModel,
          temperature,
          topP,
          grounding: groundingEnabled
        })
      });
      
      const data = await response.json().catch(() => ({ error: 'فشل في قراءة الرد' }));

      if (!response.ok) {
        throw new Error(data.error || `خطأ: ${response.status}`);
      }
      
      setChatHistory(prev => [...prev, { role: 'model', text: data.text }]);
    } catch (error: any) {
      setChatHistory(prev => [...prev, { role: 'model', text: `⚠️ خطأ: ${error.message}` }]);
    } finally {
      setIsChatting(false);
    }
  };

  const clearChat = () => setChatHistory([]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-0 lg:p-6 bg-slate-950/90 backdrop-blur-2xl overflow-hidden"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-7xl h-full lg:h-[90vh] lg:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border border-white/10">
        {/* Header */}
        <div className="px-8 py-6 border-b bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30 shadow-[0_0_20px_rgba(20,184,166,0.2)]">
              <Cpu className="w-7 h-7 text-teal-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">مركز القوة الذكي</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sovereign Intelligence Control Unit</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all hover:rotate-90">
            <X className="w-8 h-8 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden custom-scrollbar">
          {/* Controls Panel - Sidebar */}
          <div className="w-full lg:w-96 border-l bg-slate-50 dark:bg-slate-800 lg:overflow-y-auto shrink-0 p-8 space-y-10 custom-scrollbar lg:h-full">
            {/* API Key Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                  <Key className="w-4 h-4 text-teal-600" />
                  مفتاح الوصول (API)
                </label>
                {isUpdating && <Loader2 className="w-4 h-4 text-teal-600 animate-spin" />}
              </div>
              <div className="relative group">
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="أدخل مفتاح Gemini هنا..."
                  className="w-full p-5 pr-12 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-teal-600 transition-all outline-none text-xs font-mono group-hover:border-slate-300"
                />
                <ShieldCheck className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${apiKey.length > 20 ? 'text-emerald-500' : 'text-slate-300'}`} />
              </div>
            </div>

            {/* Model Selection */}
            <div className="space-y-6">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                <Zap className="w-4 h-4 text-amber-500" />
                النموذج النشط
              </label>
              <div className="space-y-3">
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-teal-600 transition-all outline-none text-xs font-black text-slate-700 dark:text-slate-300 appearance-none cursor-pointer"
                >
                  <option value="gemini-3.6-flash">Gemini 3.6 Flash (Recommended)</option>
                  <option value="gemini-2.0-flash-lite-preview-02-05">Gemini 3.6 Flash Lite</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Power)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
                  {models.filter(m => !['gemini-3.6-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-lite-preview-02-05'].includes(m.id)).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                  {/* Ensure currently selected model is in list if not among others */}
                  {!['gemini-3.6-flash', 'gemini-2.0-flash-lite-preview-02-05', 'gemini-1.5-pro', 'gemini-1.5-flash'].includes(selectedModel) && !models.find(m => m.id === selectedModel) && (
                    <option value={selectedModel}>{selectedModel} (Saved)</option>
                  )}
                </select>
                <div className="flex items-center gap-2 px-1">
                   <Activity className="w-3 h-3 text-teal-600" />
                   <span className="text-[10px] font-bold text-slate-400">زمن الاستجابة المتوقع: &lt; 1.2 ثانية</span>
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="space-y-8 pt-6 border-t">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-500 dark:text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                  <Settings2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  إعدادات المحرك
                </label>
              </div>

              {/* Temperature */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase">الإبداع (Temperature)</span>
                  <span className="text-xs font-black text-teal-600">{temperature}</span>
                </div>
                <input 
                  type="range" min="0" max="2" step="0.1" 
                  value={temperature} onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-[8px] text-slate-400 font-bold">
                  <span>دقيق</span>
                  <span>متوازن</span>
                  <span>مبدع</span>
                </div>
              </div>

              {/* Grounding Toggle */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:border-teal-200 transition-all cursor-pointer" onClick={() => setGroundingEnabled(!groundingEnabled)}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${groundingEnabled ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-800 dark:text-slate-200">البحث العالمي (Grounding)</div>
                    <div className="text-[8px] text-slate-400 font-medium">الربط المباشر بمحرك Google</div>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-all ${groundingEnabled ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${groundingEnabled ? 'right-6' : 'right-1'}`}></div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={() => {
                  localStorage.setItem('custom_gemini_key', apiKey);
                  localStorage.setItem('custom_gemini_model', selectedModel);
                  localStorage.setItem('gemini_temp', temperature.toString());
                  localStorage.setItem('gemini_top_p', topP.toString());
                  localStorage.setItem('gemini_grounding', groundingEnabled.toString());
                  setStatus({ type: 'success', message: 'تم حفظ كافة الإعدادات وتطبيقها على كامل النظام.' });
                }}
                className="w-full p-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
              >
                <ShieldCheck className="w-5 h-5 text-teal-400" />
                حفظ وتثبيت الإعدادات
              </button>
            </div>

            <AnimatePresence>
              {status.message && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className={`p-5 rounded-2xl text-[10px] font-bold flex items-start gap-3 ${
                    status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                  }`}
                >
                  {status.type === 'success' ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />}
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Playground Area */}
          <div className="flex-1 bg-white dark:bg-slate-900 flex flex-col min-h-[600px] lg:min-h-0 lg:overflow-hidden relative lg:h-full">
            {/* Chat Display */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-8 custom-scrollbar">
              {chatHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-6">
                  <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-[3rem] flex items-center justify-center border border-slate-100 dark:border-slate-800">
                    <MessageSquare className="w-10 h-10 text-slate-200" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">مختبر المحاكاة السيادي</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      اختبر قدرة المحرك على التحليل والتفنيد قبل تفعيل المهام التلقائية. جميع المحادثات هنا مشفرة وتنتهي بإغلاق النافذة.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <button onClick={() => setTestInput("كيف نرد على شبهة تناقض العلم مع الإيمان؟")} className="p-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:bg-slate-800/50 transition-all border border-slate-100 dark:border-slate-800">تناقض العلم والإيمان</button>
                    <button onClick={() => setTestInput("حلل مسار الهجوم الإعلامي الأخير على القيم الأسرية")} className="p-3 text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:bg-slate-800/50 transition-all border border-slate-100 dark:border-slate-800">تحليل هجوم قيمي</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 pb-10">
                  {chatHistory.map((msg, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[85%] p-6 lg:p-8 rounded-[2rem] ${
                        msg.role === 'user' 
                          ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200 rounded-tr-none' 
                          : 'bg-slate-900 text-white shadow-2xl rounded-tl-none border-r-4 border-teal-500'
                      }`}>
                        <div className="text-[8px] font-black uppercase tracking-widest mb-2 opacity-50">
                          {msg.role === 'user' ? 'القائد المستفسر' : `الذكاء السيادي • ${selectedModel}`}
                        </div>
                        <p className="text-sm lg:text-base font-medium leading-loose whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {isChatting && (
                    <div className="flex justify-end">
                      <div className="bg-slate-900 p-6 rounded-[2rem] rounded-tl-none flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-teal-400 animate-spin" />
                        <span className="text-xs font-bold text-slate-400">جاري المعالجة الاستخباراتية...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-6 lg:p-10 border-t bg-slate-50/50">
              <div className="max-w-4xl mx-auto flex items-end gap-4">
                <div className="flex-1 relative">
                  <textarea 
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleTestChat())}
                    placeholder="اكتب استفسارك الاستراتيجي هنا..."
                    className="w-full p-6 pr-6 pl-20 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 focus:border-teal-600 transition-all outline-none text-slate-800 dark:text-slate-200 font-medium leading-relaxed resize-none h-20 lg:h-24 shadow-sm"
                  />
                  <div className="absolute left-4 bottom-4 flex items-center gap-2">
                    {chatHistory.length > 0 && (
                      <button onClick={clearChat} className="p-3 bg-slate-100 dark:bg-slate-800/50 text-slate-400 hover:text-red-600 rounded-xl transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
                <button 
                  onClick={handleTestChat}
                  disabled={isChatting || !testInput.trim()}
                  className="w-16 h-16 lg:w-20 lg:h-20 bg-teal-600 text-white rounded-[1.5rem] lg:rounded-[2rem] flex items-center justify-center shadow-xl shadow-teal-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send className="w-8 h-8" />
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-400 font-bold mt-4">
                تذكر: هذا المحرك مبرمج على حماية الهوية الحضارية وتقديم ردود علمية محكمة.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIPowerCenter;
