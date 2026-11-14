import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Languages, Globe, Send, Loader2, Copy, CheckCircle } from 'lucide-react';

interface TranslationViewProps {
  onClose: () => void;
}

const TranslationView: React.FC<TranslationViewProps> = ({ onClose }) => {
  const [text, setText] = useState('');
  const [targetLang, setTargetLang] = useState('English');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setResult('');

    try {
      const customApiKey = localStorage.getItem('custom_gemini_key');
      const customModel = localStorage.getItem('custom_gemini_model');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: `Translate the following text to ${targetLang}. Make sure the translation is accurate and maintains the professional/scientific tone: \n\n${text}`,
          customApiKey: customApiKey,
          customModel: customModel,
          temperature: Number(localStorage.getItem('gemini_temp')) || 0.3, // Lower temp for translation
          topP: Number(localStorage.getItem('gemini_top_p')) || 0.95
        })
      });

      const data = await response.json().catch(() => ({ error: 'فشل في قراءة الرد من الخادم.' }));
      if (data.error) throw new Error(data.error);
      setResult(data.text);
    } catch (error) {
      setResult('عذراً، حدث خطأ أثناء الترجمة. يرجى التأكد من اتصال الخادم.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4 bg-slate-900/60 backdrop-blur-lg"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-full lg:h-[80vh] lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b flex items-center justify-between bg-indigo-600 text-white shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center ml-3 shadow-inner">
              <Languages className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold">وحدة الترجمة الذكية</h2>
              <p className="text-xs lg:text-sm text-indigo-100">درع الأمة • نقل الرسالة إلى كل لسان</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 lg:p-10 overflow-y-auto bg-slate-50/30">
          <div className="max-w-4xl mx-auto space-y-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
              {/* Input Area */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">النص الأصلي (العربية)</span>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Source</div>
                </div>
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="أدخل النص المراد ترجمته هنا..."
                  className="w-full h-48 lg:h-64 p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-slate-800 dark:text-slate-200 font-medium leading-relaxed resize-none shadow-sm"
                ></textarea>
              </div>

              {/* Controls & Result */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between px-2">
                  <select 
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="bg-transparent border-none text-sm font-bold text-indigo-600 outline-none cursor-pointer"
                  >
                    <option>English</option>
                    <option>French</option>
                    <option>German</option>
                    <option>Spanish</option>
                    <option>Chinese</option>
                  </select>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Target</div>
                </div>
                
                <div className="relative">
                  <div className={`w-full h-48 lg:h-64 p-6 rounded-[2rem] bg-indigo-50/30 border border-indigo-100 text-slate-800 dark:text-slate-200 font-medium leading-relaxed overflow-y-auto ${!result && 'flex items-center justify-center text-slate-400'}`}>
                    {isLoading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                        <span className="text-sm">جاري الترجمة بواسطة AI...</span>
                      </div>
                    ) : result ? (
                      <p className="whitespace-pre-wrap text-sm lg:text-base">{result}</p>
                    ) : (
                      "ستظهر الترجمة هنا..."
                    )}
                  </div>
                  {result && !isLoading && (
                    <button 
                      onClick={handleCopy}
                      className="absolute bottom-4 left-4 p-2 lg:p-3 bg-white dark:bg-slate-900 text-indigo-600 rounded-xl shadow-md hover:scale-105 transition-all flex items-center gap-2 text-[10px] lg:text-xs font-bold border border-indigo-50"
                    >
                      {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      {copied ? 'تم النسخ' : 'نسخ النص'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button 
                onClick={handleTranslate}
                disabled={isLoading || !text.trim()}
                className="w-full sm:w-auto px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-3"
              >
                <Globe className="w-6 h-6" />
                ترجمة فورية ذكية
              </button>
            </div>

            <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex flex-col sm:flex-row items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 shadow-inner">
                <Languages className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h5 className="font-bold text-blue-900 mb-1 text-sm lg:text-base">عن وحدة الترجمة</h5>
                <p className="text-xs lg:text-sm text-blue-700 leading-relaxed font-medium">تعتمد هذه الوحدة على أحدث نماذج اللغة الضخمة لضمان ترجمة لا تكتفي بنقل الكلمات، بل تنقل المعنى السياقي والحضاري للرسالة، مما يضمن وصول الردود العلمية لغير الناطقين بالعربية بدقة تامة.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TranslationView;
