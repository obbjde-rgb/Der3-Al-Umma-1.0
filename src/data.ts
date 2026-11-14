import { 
  ShieldCheck, 
  Search, 
  ShieldAlert, 
  GraduationCap, 
  Video, 
  Languages, 
  BarChart3, 
  Handshake, 
  LibraryBig, 
  Scale, 
  Coins,
  Cpu,
  LucideIcon,
  Zap,
  Target,
  Trophy,
  Users
} from "lucide-react";

export interface StrategyAxis {
  title: string;
  goal: string;
  method: string;
}

export interface PlatformModule {
  id: string;
  title: string;
  icon: LucideIcon;
  goal: string;
  content: string;
  tech: string;
  output?: string;
  color: string;
}

export const strategyAxes: StrategyAxis[] = [
  { title: "الدفاع السلبي", goal: "تفنيد الشبهات", method: "قاعدة بيانات علمية ضخمة + AI Chatbot" },
  { title: "الدفاع الإيجابي", goal: "بناء صورة إيجابية", method: "إبراز إنجازات المسلمين + قصص نجاح" },
  { title: "الهجوم البنّاء", goal: "تقديم البديل", method: "نموذج حضاري متكامل يُجيب على تحديات العصر" },
  { title: "التمكين الداخلي", goal: "تأهيل المسلمين", method: "تدريب على المناظرة والإعلام والخطاب الفعّال" }
];

export const platformModules: PlatformModule[] = [
  {
    id: "scientific-response",
    title: "وحدة الردود العلمية",
    icon: ShieldCheck,
    goal: "الرد على كل شبهة مُثارة ضد الإسلام",
    content: "5000+ رد مُحكَّم، مصنف حسب الموضوع (المرأة، العنف، الرق، العلم، الحدود...)",
    tech: "RAG-based AI Chatbot يُجيب بمصادر موثقة",
    color: "bg-blue-500"
  },
  {
    id: "media-monitoring",
    title: "وحدة المراقبة الإعلامية",
    icon: ShieldAlert,
    goal: "رصد الهجوم فور حدوثه",
    content: "مراقبة آلاف المصادر (صحف، قنوات، منصات تواصل)",
    tech: "NLP + Sentiment Analysis + Image Recognition",
    output: "تنبيهات فورية + تقارير دورية + تصنيف الخطر",
    color: "bg-red-500"
  },
  {
    id: "intellectual-training",
    title: "وحدة التأهيل الفكري",
    icon: GraduationCap,
    goal: "إنتاج جيل من السفراء المؤهلين",
    content: "دورات في المناظرة، الإعلام الرقمي، فهم الشبهات، بناء الحجة",
    tech: "منصة تعليمية تفاعلية + شهادات معتمدة + مستويات تقدمية",
    color: "bg-emerald-500"
  },
  {
    id: "media-production",
    title: "وحدة الإنتاج الإعلامي",
    icon: Video,
    goal: "إنتاج محتوى دفاعي بجودة احترافية",
    content: "فيديوهات قصيرة، انفوجرافيك، بودكاست، كتب إلكترونية",
    tech: "محرر رسومي مُدمج (مثل Canva) + قوالب جاهزة + فرق تطوعية",
    color: "bg-purple-500"
  },
  {
    id: "smart-translation",
    title: "وحدة الترجمة الذكية",
    icon: Languages,
    goal: "الوصول لكل لغة في العالم",
    content: "ترجمة كل المحتوى إلى 50+ لغة",
    tech: "AI Translation + مراجعة بشرية + قاموس مصطلحات إسلامية مُعتمد",
    color: "bg-indigo-500"
  },
  {
    id: "data-analysis",
    title: "وحدة التحليل والبيانات",
    icon: BarChart3,
    goal: "فهم العدو وفهم الواقع",
    content: "لوحات تحكم تُظهر حجم الهجوم، تأثير الردود، اتجاهات الرأي العام",
    tech: "Big Data Analytics + Sentiment Analysis + Predictive Modeling",
    color: "bg-amber-500"
  },
  {
    id: "civilizational-contact",
    title: "وحدة التواصل الحضاري",
    icon: Handshake,
    goal: "كسر الحواجز مع غير المسلمين",
    content: "أسئلة وأجوبة مباشرة، زيارات افتراضية للمساجد، برامج تبادل ثقافي",
    tech: "بث مباشر + VR Tours + Community Moderation",
    color: "bg-teal-500"
  },
  {
    id: "civilizational-library",
    title: "وحدة المكتبة الحضارية",
    icon: LibraryBig,
    goal: "تغيير الصورة النمطية عن المسلمين",
    content: "سير علماء ومخترعين وفنانين مسلمين، إنجازات الحضارة الإسلامية",
    tech: "Timeline تفاعلي + Biographies + Interactive Maps",
    color: "bg-cyan-500"
  },
  {
    id: "legal-defense",
    title: "وحدة الدفاع القانوني",
    icon: Scale,
    goal: "محاربة خطاب الكراهية قانونياً",
    content: "توجيه شكاوى، توثيق جرائم إسلاموفوبيا، الضغط على المنصات",
    tech: "نماذج قانونية جاهزة + ربط مع محامين + Reporting System",
    color: "bg-slate-700"
  },
  {
    id: "crowdfunding",
    title: "وحدة التمويل الجماعي",
    icon: Coins,
    goal: "استدامة المشروع مالياً",
    content: "تمويل حملات إعلامية، ترجمة كتب، إنتاج أفلام وثائقية",
    tech: "Crowdfunding Platform + شفافية مالية كاملة + تقارير دورية",
    color: "bg-orange-500"
  },
  {
    id: "ai-power-center",
    title: "مركز القوة الذكي",
    icon: Cpu,
    goal: "التحكم في النماذج وتحديثها سحابياً",
    content: "إدارة مفاتيح API، تحديث قائمة النماذج من جوجل، واختبار الأداء في المختبر.",
    tech: "Dynamic Model Updates + API Key Vault + Cloud Sync",
    color: "bg-indigo-600"
  },
  {
    id: "scholar-review",
    title: "مركز المراجعة العلمية",
    icon: ShieldCheck,
    goal: "ضمان دقة ونزاهة الردود العلمية",
    content: "مراجعة الردود المولدة بواسطة الـ AI وتعديلها وإجازتها للنشر النهائي.",
    tech: "Scholar Dashboard + Workflow Management + Scholarly Review",
    color: "bg-slate-900"
  }
];

export const roadmap = [
  { stage: "1. الأساس", duration: "6 أشهر", goal: "MVP: الردود + المراقبة + التأهيل", icon: Zap },
  { stage: "2. التوسع", duration: "6 أشهر", goal: "+50 لغة + الترجمة + الإنتاج الإعلامي", icon: Target },
  { stage: "3. التمكين", duration: "6 أشهر", goal: "التحليلات + الدفاع القانوني + الشراكات", icon: Users },
  { stage: "4. الريادة", duration: "مستمر", goal: "AI Generative + VR + شبكة عالمية", icon: Trophy }
];
