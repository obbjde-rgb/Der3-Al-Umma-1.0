import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, ShieldCheck, History, BookOpen, Loader2, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { collection, query, where, getDocs, addDoc, serverTimestamp, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from './AuthProvider';

interface Message {
  role: 'user' | 'ai';
  text: string;
  isScholarly?: boolean;
}

interface ResponseViewProps {
  onClose: () => void;
}

const ResponseView: React.FC<ResponseViewProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'السلام عليكم ورحمة الله وبركاته. أنا المحرك الذكي لوحدة الردود العلمية. كيف يمكنني مساعدتكم في تفنيد أي شبهة اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleCopy = (text: string, index: number) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      document.body.removeChild(textArea);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const searchExistingResponse = async (text: string) => {
    try {
      const q = query(
        collection(db, 'doubts_responses'),
        where('status', '==', 'published'),
        where('doubt', '==', text),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].data().response;
      }
      return null;
    } catch (error: any) {
      console.warn("Error searching responses, falling back to generation:", error?.message);
      return null;
    }
  };

  const saveResponseForReview = async (doubt: string, response: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'doubts_responses'), {
        doubt,
        response,
        status: 'pending_review',
        authorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'doubts_responses');
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // 1. Check for existing scholarly response
      const existing = await searchExistingResponse(userMessage);
      if (existing) {
        setMessages(prev => [...prev, { role: 'ai', text: existing, isScholarly: true }]);
        setIsLoading(false);
        return;
      }

      // 2. Call AI if no existing response
      const customApiKey = localStorage.getItem('custom_gemini_key');
      const customModel = localStorage.getItem('custom_gemini_model');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          customApiKey: customApiKey,
          customModel: customModel,
          temperature: Number(localStorage.getItem('gemini_temp')) || 0.7,
          topP: Number(localStorage.getItem('gemini_top_p')) || 0.95,
          grounding: localStorage.getItem('gemini_grounding') === 'true'
        })
      });

      const responseText = await response.text();
      let data: any = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch (e: any) {
        console.warn("Failed to parse chat response:", e?.message || e);
      }

      if (!response.ok) {
        if (response.status === 429) {
          setMessages(prev => [...prev, { 
            role: 'ai', 
            text: `⚠️ ${data.error || 'تم تجاوز الحصة.'}\n\nيُرجى الانتظار لمدة ${data.retryAfter || 'دقيقة'} تقريباً قبل المحاولة مجدداً.\n\n💡 نصيحة المهندس: يمكنك إدخال مفتاح API الخاص بك في "مركز القوة الذكي" لتجاوز حدود الاستخدام العامة للمنصة.` 
          }]);
          return;
        }
        if (response.status === 503) {
          setMessages(prev => [...prev, { 
            role: 'ai', 
            text: `⚠️ ${data.error || 'المحرك الذكي يواجه ضغطاً كبيراً.'}\n\n${data.suggestion || 'الرجاء المحاولة لاحقاً.'}` 
          }]);
          return;
        }
        throw new Error(data.error || `خطأ في الاتصال: ${response.status}`);
      }

      setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
      
      // 3. Save as pending review if authenticated
      if (user) {
        await saveResponseForReview(userMessage, data.text);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'ai', text: `عذراً، حدث خطأ أثناء الاتصال بالمحرك الذكي. ${error.message || 'يرجى التأكد من إعداد GEMINI_API_KEY في الإعدادات.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 lg:p-4 bg-slate-900/60 backdrop-blur-lg"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-full lg:h-[80vh] lg:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden relative border border-white/20">
        {/* Header */}
        <div className="p-4 lg:p-6 border-b flex items-center justify-between bg-teal-600 text-white shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center ml-3 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg lg:text-xl font-bold">وحدة الردود العلمية (AI)</h2>
              <p className="text-xs lg:text-sm text-teal-100">درع الأمة • نظام الاستجابة الذكي</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 border-l bg-slate-50 dark:bg-slate-800 p-6 hidden md:block overflow-y-auto shrink-0">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <History className="w-4 h-4 text-teal-600" />
              الكلمات الشائعة
            </h3>
            <div className="space-y-2">
              {["حقوق المرأة", "مفهوم الجهاد", "الإسلام والعلم", "شبهات المستشرقين"].map((tag) => (
                <button 
                  key={tag} 
                  onClick={() => setInput(tag)}
                  className="w-full text-right px-4 py-3 text-sm text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 hover:text-teal-700 rounded-xl transition-all border border-transparent hover:border-teal-100 hover:shadow-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
            
            <div className="mt-10">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-600" />
                المصادر المعتمدة
              </h3>
              <div className="space-y-3 text-xs text-slate-500 dark:text-slate-400">
                {["التفسير الميسر", "صحيح البخاري ومسلم", "الموسوعات الفقهية"].map((source) => (
                  <div key={source} className="flex items-center p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-2"></span>
                    {source}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat area */}
          <div ref={scrollRef} className="flex-1 flex flex-col p-4 lg:p-8 space-y-6 overflow-y-auto bg-slate-50/30 scroll-smooth custom-scrollbar">
            {messages.map((msg, i) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i}
                className={`p-4 lg:p-5 rounded-2xl max-w-[90%] lg:max-w-[85%] shadow-sm border relative transition-all ${
                  msg.role === 'ai' 
                    ? 'bg-white dark:bg-slate-900 rounded-tr-none border-slate-100 dark:border-slate-800 self-start text-slate-800 dark:text-slate-200' 
                    : 'bg-teal-600 rounded-tl-none border-teal-500 self-end text-white shadow-lg shadow-teal-600/20'
                }`}
              >
                {msg.role === 'ai' && msg.isScholarly && (
                  <div className="flex items-center gap-1.5 mb-3 text-[10px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100">
                    <CheckCircle className="w-3.5 h-3.5" />
                    رد محكم ومعتمد
                  </div>
                )}
                {msg.role === 'ai' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed">
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-600 dark:text-teal-400 hover:underline font-bold inline-flex items-center gap-1 transition-colors break-all"
                          >
                            <span>{props.children}</span>
                            <ExternalLink className="w-3 h-3 inline-block shrink-0 opacity-80" />
                          </a>
                        ),
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-4 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm bg-slate-50/50 dark:bg-slate-950/50">
                            <table {...props} className="min-w-full text-right text-xs border-collapse divide-y divide-slate-200 dark:divide-slate-800" />
                          </div>
                        ),
                        thead: ({ node, ...props }) => (
                          <thead {...props} className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100" />
                        ),
                        th: ({ node, ...props }) => (
                          <th {...props} className="px-3 py-2 font-black text-xs border-b border-slate-200 dark:border-slate-700 whitespace-nowrap" />
                        ),
                        td: ({ node, ...props }) => (
                          <td {...props} className="px-3 py-2 text-xs border-b border-slate-100 dark:border-slate-800/60" />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 {...props} className="text-sm lg:text-base font-black text-teal-600 dark:text-teal-400 mt-4 mb-2 pb-1 border-b border-slate-200 dark:border-slate-800" />
                        ),
                        p: ({ node, ...props }) => (
                          <p {...props} className="mb-3 leading-relaxed" />
                        )
                      }}
                    >
                      {msg.text}
                    </Markdown>
                  </div>
                ) : (
                  <p className="leading-relaxed whitespace-pre-wrap font-medium text-sm lg:text-base">
                    {msg.text}
                  </p>
                )}
                {msg.role === 'ai' && (
                  <button 
                    onClick={() => handleCopy(msg.text, i)}
                    className={`mt-4 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold border ${
                      copiedIndex === i 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {copiedIndex === i ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        تم النسخ
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        نسخ الرد
                      </>
                    )}
                  </button>
                )}
                {msg.role === 'ai' && !msg.isScholarly && i === messages.length - 1 && user && (
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-start gap-2 text-[10px] font-bold text-slate-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    تم إرسال هذا الرد للمراجعة العلمية لضمان الدقة التامة.
                  </div>
                )}
              </motion.div>
            ))}
            {isLoading && (
              <div className="bg-white dark:bg-slate-900 p-4 lg:p-5 rounded-2xl rounded-tr-none shadow-sm border border-slate-100 dark:border-slate-800 self-start flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
                <span className="text-slate-500 dark:text-slate-400 text-sm lg:text-base font-medium">جاري تحليل الشبهة وتوليد الرد...</span>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 lg:p-8 bg-white dark:bg-slate-900 border-t shrink-0">
          <div className="relative max-w-4xl mx-auto">
            <textarea 
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="اكتب الشبهة أو السؤال هنا..."
              className="w-full p-4 lg:p-5 pr-4 lg:pr-5 pl-14 lg:pl-16 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border-none focus:ring-2 focus:ring-teal-500 transition-all font-medium resize-none overflow-hidden text-sm lg:text-base shadow-inner"
              style={{ minHeight: '60px' }}
            />
            <button 
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="absolute left-3 bottom-3 p-2.5 lg:p-3 bg-teal-600 text-white rounded-xl shadow-lg shadow-teal-600/30 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all"
            >
              <Send className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
          </div>
          <p className="text-[10px] lg:text-[11px] text-slate-400 mt-3 text-center font-medium">
            هذا الرد يتم توليده بواسطة الذكاء الاصطناعي بناءً على المصادر الإسلامية المعتمدة.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ResponseView;

