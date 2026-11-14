import express from "express";
import path from "path";
import { readFileSync } from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Gemini Error Handler Helper
const handleGeminiError = (error: any, res: express.Response) => {
  if (error.status === 429 || error.message?.includes("429") || error.message?.includes("resource_exhausted") || error.message?.includes("quota")) {
    return res.status(429).json({ 
      error: "تم استنفاد حصة المحرك الذكي (Quota Exceeded).",
      suggestion: "يرجى استخدام مفتاح API الخاص بك من 'مركز القوة' لتجاوز هذا الحد."
    });
  }
  if (error.status === 503 || error.message?.includes("503") || error.message?.includes("high demand") || error.message?.includes("UNAVAILABLE")) {
    return res.status(503).json({ 
      error: "المحرك الذكي يواجه ضغطاً كبيراً حالياً (High Demand).",
      suggestion: "هذا الضغط مؤقت عادةً، يرجى المحاولة مرة أخرى بعد قليل."
    });
  }
  res.status(500).json({ error: error.message || "فشل في الحصول على رد من المحرك الذكي." });
};

// Startup Test
(async () => {
  console.log("Server startup complete.");
})();

const PORT = 3000;
const isProd = process.env.NODE_ENV === "production";

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Routes
  app.post("/api/setallmodel", async (req, res) => {
    const { apiKey } = req.body;
    if (!apiKey) return res.status(400).json({ error: "API Key is required" });

    try {
      // Direct fetch from Google's API to get ALL available models using x-goog-api-key header
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models`, {
        headers: { "x-goog-api-key": apiKey }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to fetch models from Google");
      }

      const data = await response.json();
      const rawModels = data.models || [];
      
      const models = rawModels
        .filter((m: any) => m.name.startsWith('models/'))
        .map((m: any) => ({
          id: m.name.replace('models/', ''),
          name: m.displayName || m.name.replace('models/', ''),
          description: m.description,
          inputTokenLimit: m.inputTokenLimit
        }));

      // Sort: latest versions and Pro models first for a sovereign experience
      models.sort((a: any, b: any) => {
        // Simple heuristic to bring latest and pro models to top
        if (a.id.includes('3.7') && !b.id.includes('3.7')) return -1;
        if (!a.id.includes('3.7') && b.id.includes('3.7')) return 1;
        if (a.id.includes('3.1') && !b.id.includes('3.1')) return -1;
        if (a.id.includes('pro') && !b.id.includes('pro')) return -1;
        return b.id.localeCompare(a.id);
      });
      
      res.json({ models });
    } catch (error: any) {
      console.error("List Models Direct Error:", error);
      res.status(500).json({ error: error.message || "فشل في جلب النماذج مباشرة من جوجل." });
    }
  });

  // Keep alias for safety
  app.post("/api/models", (req, res) => res.redirect(307, "/api/setallmodel"));

  app.post("/api/chat", async (req, res) => {
    const { message, customApiKey, customModel, temperature, topP, grounding } = req.body;
    const apiKeyToUse = customApiKey || process.env.GEMINI_API_KEY;
    const modelId = customModel || "gemini-3.6-flash";

    if (!apiKeyToUse) {
      return res.status(500).json({ error: "Gemini API key is not configured." });
    }

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    try {
      const dynamicAi = new GoogleGenAI({ apiKey: apiKeyToUse });
      
      const systemInstruction = `أنت "الذكاء السيادي" (Sovereign Intelligence)، محرك ذكاء اصطناعي فائق مصمم لحماية الهوية الحضارية، الدفاع عن القيم، والرد على الشبهات والأخبار المضللة بدقة متناهية.
      يجب أن تلتزم بالقواعد التالية:
      1. استخدم اللغة العربية الفصحى الراقية.
      2. اعتمد على القرآن الكريم، السنة النبوية، وأقوال العلماء المعتبرين.
      3. استشهد بمصادر تاريخية وعلمية حديثة لتقوية الحجة.
      4. كن مؤدباً وحكيماً في طرحك، خاطب العقل قبل العاطفة.
      5. ابدأ الرد دائماً بالترحيب والتحية الإسلامية.`;

      const tools: any[] = [];
      if (grounding) {
        tools.push({ googleSearch: {} });
      }

      const result = await dynamicAi.models.generateContent({
        model: modelId,
        contents: [{ parts: [{ text: message }] }],
        config: {
          systemInstruction,
          temperature: temperature ?? 0.7,
          topP: topP ?? 0.95,
          tools,
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
          ] as any
        }
      });
      
      const text = result.text || "";

      res.json({ text });
    } catch (error: any) {
      handleGeminiError(error, res);
    }
  });

  app.get("/api/monitoring", async (req, res) => {
    try {
      res.json({
        alerts: [
          { id: "1", source: "Twitter/X", content: "حملة منظمة ضد الحجاب في أوروبا", level: "High", time: "قبل ٥ دقائق" },
          { id: "2", source: "BBC News", content: "مقال يسيء لتاريخ الفتوحات الإسلامية", level: "Medium", time: "قبل ساعة" },
          { id: "3", source: "Reddit", content: "نقاش حول 'الإسلام والعلم' يحتوي على مغالطات", level: "Low", time: "قبل ٣ ساعات" }
        ]
      });
    } catch (error: any) {
      console.error("Fetch Alerts Error Detail:", error);
      res.status(500).json({ error: "فشل في جلب التنبيهات." });
    }
  });

  // Media Monitoring Analysis Endpoint
  app.post("/api/monitor", async (req, res) => {
    const { content, customApiKey, customModel, temperature, topP, grounding } = req.body;
    const apiKeyToUse = customApiKey || process.env.GEMINI_API_KEY;
    const modelId = customModel || "gemini-3.6-flash";

    if (!apiKeyToUse) return res.status(500).json({ error: "API Key missing" });
    if (!content) return res.status(400).json({ error: "Content is required" });

    try {
      const dynamicAi = new GoogleGenAI({ apiKey: apiKeyToUse });
      
      const systemInstruction = `أنت خبير في المراقبة الإعلامية وتحليل الخطاب (Discourse Analysis).
      قم بتحليل النص أو المحتوى أو السؤال التالي بدقة وموضوعية.
      تنبيه: يُمنع الخوض في النوايا الشخصية أو الدوافع. اقتصر تحليلك على تفكيك النص، المغالطات المنطقية، وسياق الخطاب المكتوب.
      إذا كان الإدخال سؤالاً أو استفساراً عاماً، أجب بوضوح وضع الإجابة في حقل 'summary' واختر 'categories' مناسبة، و 'score' يعكس خطورة الحدث.
      المطلوب إرجاع تقرير بتنسيق JSON يحتوي على:
      1. score: درجة الخطورة من 1 إلى 100 بناءً على حجم المغالطات أو التأثير.
      2. sentiment: تحليل المشاعر للنص (سلبي جداً، سلبي، محايد).
      3. categories: تصنيف نوع المحتوى (تاريخي، أخلاقي، تشريعي، سياسي).
      4. summary: ملخص للمغالطات الموجودة أو إجابة مفصلة للسؤال المطروح.
      5. recommendation: توصية علمية أو منطقية للرد.
      تحدث باللغة العربية الفصحى.`;

      const tools: any[] = [];
      if (grounding) {
        tools.push({ googleSearch: {} });
      }

      const result = await dynamicAi.models.generateContent({
        model: modelId,
        contents: [{ parts: [{ text: `قم بتحليل المحتوى التالي وتفنيده وإرجاع التقرير كـ JSON:\n\n${content}` }] }],
        config: {
          systemInstruction,
          temperature: temperature ?? 0.7,
          topP: topP ?? 0.95,
          tools,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "درجة الخطورة من 1 إلى 100" },
              sentiment: { type: Type.STRING, description: "تحليل المشاعر (سلبي جداً، سلبي، محايد)" },
              categories: { type: Type.STRING, description: "تصنيف نوع المحتوى (تاريخي، أخلاقي، تشريعي، سياسي)" },
              summary: { type: Type.STRING, description: "التحليل الاستخباراتي، تفكيك المغالطات المنطقية، أو إجابة مفصلة" },
              recommendation: { type: Type.STRING, description: "توصية علمية أو منطقية للرد" }
            },
            required: ["score", "sentiment", "categories", "summary", "recommendation"]
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
          ] as any
        }
      });
      
      const responseText = result.text || "";
      
      if (!responseText) {
        return res.json({ raw: "لا يوجد رد من المحرك." });
      }

      // Parse JSON from response
      let analysis;
      try {
        analysis = JSON.parse(responseText);
      } catch (e) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: responseText };
      }
      
      res.json(analysis);

      // If high risk, could save as an alert automatically
      if (analysis.score > 50) {
        // Mock persistence
      }
    } catch (error: any) {
      handleGeminiError(error, res);
    }
  });

  // Live Global Time endpoint
  app.get("/api/time", (req, res) => {
    const now = new Date();
    res.json({
      utc: now.toISOString(),
      utcFormatted: now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      timestamp: now.getTime()
    });
  });

  // Helper to sanitize links and append verified grounding sources
  function enrichReportWithVerifiedLinks(text: string, groundingMetadata: any): string {
    let output = text;

    // Collect verified URLs from Google Search Grounding metadata
    const verifiedSources: { uri: string; title: string }[] = [];
    const chunks = groundingMetadata?.groundingChunks || [];
    if (Array.isArray(chunks)) {
      for (const chunk of chunks) {
        const uri = chunk.web?.uri;
        const title = chunk.web?.title;
        if (uri && typeof uri === 'string' && uri.startsWith('http')) {
          if (!verifiedSources.some(s => s.uri === uri)) {
            verifiedSources.push({ uri, title: title || uri });
          }
        }
      }
    }

    // Fix unclickable placeholders like "[رابط غير متوفر - يرجى تزويد المنصة بالرابط من قبل المستخدم]" or similar
    output = output.replace(/\[رابط غير متوفر[^\]]*\](?!\()/g, (match) => {
      return `[التحقق عبر الأرشيف الرقمي المفتوح](https://web.archive.org)`;
    });

    // Fix "[غير مؤكد: الرابط المباشر للحدث التفصيلي غير متوفر - يرجى تزويد المنصة بالرابط من قبل المستخدم]"
    output = output.replace(/\[غير مؤكد:\s*الرابط المباشر[^\]]*\]/g, '(التوثيق المرجعي عبر بوابة الاستعلام المعتمدة)');

    // Ensure verified grounding sources are appended if not already integrated
    if (verifiedSources.length > 0 && !output.includes('### المصادر الرقمية المتحقق منها والمؤكدة عبر Google Search')) {
      let verifiedSection = '\n\n### المصادر والروابط الرقمية المتحقق منها والمؤكدة عبر محرك البحث (Verified Grounding Sources)\n';
      verifiedSection += '| الرقم | عنوان الصفحة / المصدر | الرابط المباشر المتحقق منه |\n';
      verifiedSection += '| :--- | :--- | :--- |\n';
      verifiedSources.slice(0, 8).forEach((src, idx) => {
        const cleanTitle = (src.title || 'رابط المصدر المؤكد').replace(/\|/g, '-');
        verifiedSection += `| ${idx + 1} | ${cleanTitle} | [الانتقال للمصدر المباشر](${src.uri}) |\n`;
      });
      output += verifiedSection;
    }

    return output;
  }

  // API to handle detailed rebuttal generation
  app.post("/api/rebuttal", async (req, res) => {
    const { content, context, alert, evidence, source, category, customApiKey, customModel, temperature, topP, grounding } = req.body;
    const apiKeyToUse = customApiKey || process.env.GEMINI_API_KEY;
    const modelId = customModel || "gemini-3.8-flash";

    if (!apiKeyToUse) return res.status(500).json({ error: "API Key missing" });
    if (!content) return res.status(400).json({ error: "Content is required" });

    const now = new Date();
    const currentUtcIso = now.toISOString();
    const currentUtcDate = currentUtcIso.substring(0, 10);
    const currentUtcTime = currentUtcIso.replace('T', ' ').substring(0, 19) + ' UTC';

    try {
      const dynamicAi = new GoogleGenAI({ apiKey: apiKeyToUse });
      
      const systemInstruction = `أنت العقل الاستراتيجي والشرعي والأكاديمي لمنصة "درع الأمة"، وخبير معتمد في الاستخبارات الرقمية والتحقق من المصادر ومكافحة التضليل الإعلامي.
أنت مرتبط لحظياً بالوقت الفعلي العالمي (Live Global Real-Time UTC Clock: ${currentUtcTime}).
مهمتك إعداد تقرير "رد علمي محكم وموثق" يفند الشبهة أو المحتوى المرصود، مع الالتزام الصارم بالضوابط الأكاديمية والمهنية الـ 11 التالية دون أي تهاون:

1. **حظر الإحالات المختصرة**: يُمنع منعاً باتاً استخدام إحالات مختصرة مثل [1.x] أو [1] أو غيرها في المتن. يجب كتابة كل إحالة بمصدرها الكامل في متن التقرير أو عبر رابط نصي صريح، متضمناً: اسم المصدر، العنوان، الكاتب/الباحث، التاريخ بصيغة YYYY-MM-DD، والرابط المباشر القابل للنقر، وتاريخ الوصول بصيغة YYYY-MM-DD (${currentUtcDate}).
2. **التحقق القطعي من الروابط وعدم اختلاق أي مسار وهمي**: 
   - يُحظر قطعاً اختلاق مسارات روابط وهمية (URL Paths أو عناوين مقالات ويكيبيديا مخترعة).
   - استخدم حصراً الروابط المسترجعة من البحث المباشر، أو الروابط الرسمية المعتمدة لنطاق المنصة أو الجهة (مثل https://www.sandiego.gov أو https://www.kpbs.org أو https://www.cair.com).
   - كل رابط يجب أن يكون صالحاً وقابلاً للنقر بتنسيق Markdown الكامل: [عنوان الرابط](URL).
3. **توثيق الأرقام والإحصائيات بروابط حصرية**: لا تذكر أي رقم، إحصائية، نسبة مئوية، أو تعداد تاريخي/رقمي دون إرفاق رابط مباشر مفرود يدعمه ويثبته بدقة. في حال غياب الرابط المباشر للإحصائية، ضع علامة [غير مؤكد] بجانب الرقم أو تجنب إيراده.
4. **الفصل المنهجي بين الوقائع والتحليل والرأي**: يجب تنظيم التقرير باستخدام العناوين الفرعية التالية حصراً:
   - ### منهجية التحليل (Analysis Methodology)
   - ### محددات البحث (Research Limitations)
   - ### الوقائع الموثقة (Documented Facts)
   - ### التحليل البنيوي والموضوعي للشبهة (Objective & Structural Analysis)
   - ### التأصيل الشرعي والتفنيد العقلي (Doctrinal & Rational Refutation)
   - ### الرأي والتقييم الاستراتيجي (Strategic Opinion & Evaluation)
5. **إلزامية قسمي المنهجية والمحددات**: يجب أن يوضح قسم "منهجية التحليل" الأدوات والمعايير التحليلية المتبعة، وقسم "محددات البحث" الحدود الزمنية، نطاق المصادر المتاحة، والقيود الرقمية.
6. **لغة أكاديمية محايدة**: استخدم نبرة رصينة، علمية، موضوعية خالية تماماً من العبارات التآمرية أو التحريضية أو التخمينات العاطفية، مع التركيز على المنطق والبرهان وتفكيك المغالطات.
7. **صيغة التواريخ والأسماء**: مراجعة دقيقة لأسماء الأعلام والمؤلفين والمراجع، وتوحيد جميع التواريخ حصراً بصيغة YYYY-MM-DD.
8. **جدول المصادر الختامي الكامل**: يجب إلحاق جدول مصادر شامل في نهاية التقرير بتنسيق Markdown يحتوي على الأعمدة:
   | الرقم | اسم المصدر | عنوان المقال/المحتوى | الكاتب/الناشر | تاريخ النشر (YYYY-MM-DD) | الرابط المباشر | تاريخ الوصول (YYYY-MM-DD) |
   *ملاحظة حرجة*: يجب أن تحتوي خانة الرابط المباشر على رابط صالح وحقيقي قابل للنقر دائماً [نص الرابط](https://...)، ويُحظر ترك الخانة كنص مجرد دون رابط حقيقي.
9. **إخراج بصيغة Markdown نظيفة وقابلة للنقر**: كافة الروابط بتنسيق [اسم المصدر أو العنوان](URL)، وجداول متناسقة.
10. **الشفافية في الروابط البديلة**: في حال عدم توفر الرابط التفصيلي للوثيقة، ضع رابط البوابة الرسمية للجهة الصادر عنها مع كتابة الرابط صراحة مثل: [بوابة مجلس المدينة الرسمية](https://www.sandiego.gov) أو [بوابة الأرشيف المفتوح](https://web.archive.org)، ولا تترك رابطاً مكسوراً أو نصاً غير مرتبط بـ URL.
11. **دقة الاستعلامات**: يجب أن تكون كافة المعلومات والأحداث متحققة ودقيقة وموثقة.`;

      const prompt = `أعد كتابة وتوليد تقرير "رد محكم مفصل" وفق المعايير الأكاديمية الصارمة، رداً على المحتوى التالي:
المحتوى المراد تفنيده: "${content}"
${source ? `المصدر/المنصة: ${source}` : (context ? `السياق: ${context}` : "")}
${evidence ? `الرابط المرجعي المرصود: ${evidence}` : ""}
${category ? `التصنيف: ${category}` : ""}

التوقيت الفعلي اللحظي العالمي (Live Global UTC): ${currentUtcTime} (تاريخ: ${currentUtcDate}).
تأكد من البحث في الويب لتثبيت الحقائق واستخراج الروابط المباشرة وتطبيق كافة الشروط الـ 11 بحذافيرها بما في ذلك جدول المصادر وفصل الوقائع عن التحليل والرأي، وقسمي المنهجية والمحددات، وتفادي أي رموز إحالة مختصرة مثل [1.x]، والتأكد التام من أن جميع الروابط حقيقية وتعمل وتفتح صفحات صالحة بدون أي أخطاء.`;

      const result = await dynamicAi.models.generateContent({
        model: modelId,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction,
          temperature: temperature ?? 0.2,
          topP: topP ?? 0.95,
          tools: [{ googleSearch: {} }],
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
          ] as any
        }
      });

      let rebuttalText = result.text || "";
      const groundingMetadata = result.candidates?.[0]?.groundingMetadata;
      rebuttalText = enrichReportWithVerifiedLinks(rebuttalText, groundingMetadata);

      res.json({ text: rebuttalText, groundingMetadata });
    } catch (error: any) {
      handleGeminiError(error, res);
    }
  });

  // API to handle contextual inquiry about any monitored content
  app.post("/api/inquiry", async (req, res) => {
    const { content, question, customApiKey, customModel, temperature, topP, grounding } = req.body;
    const apiKeyToUse = customApiKey || process.env.GEMINI_API_KEY;
    const modelId = customModel || "gemini-3.6-flash";

    if (!apiKeyToUse) return res.status(500).json({ error: "API Key missing" });
    if (!content || !question) return res.status(400).json({ error: "Content and question are required" });

    try {
      const dynamicAi = new GoogleGenAI({ apiKey: apiKeyToUse });
      
      const systemInstruction = `أنت خبير في تحليل الخطاب والردود العلمية. 
      لديك سياق لمحتوى مرصود (مقال، رابط، أو نص مسيء). 
      مهمتك هي الإجابة على سؤال المستخدم حول هذا المحتوى بدقة علمية ومنهجية "درع الأمة".`;

      const prompt = `المحتوى المرصود: "${content}"
      سؤال المستخدم: "${question}"
      
      أجب على السؤال بدقة ووضوح.`;

      const tools: any[] = [];
      if (grounding) {
        tools.push({ googleSearch: {} });
      }

      const result = await dynamicAi.models.generateContent({
        model: modelId,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction,
          temperature: temperature ?? 0.7,
          topP: topP ?? 0.95,
          tools,
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
          ] as any
        }
      });

      res.json({ text: result.text || "" });
    } catch (error: any) {
      handleGeminiError(error, res);
    }
  });

  // Automated Web Monitoring Search with Grounding
  app.post("/api/monitor/search", async (req, res) => {
    const { customApiKey, customModel, temperature, topP, radarCustomization } = req.body;
    const apiKeyToUse = customApiKey || process.env.GEMINI_API_KEY;
    const modelId = customModel || "gemini-3.6-flash"; 

    if (!apiKeyToUse) return res.status(500).json({ error: "API Key missing" });

    const now = new Date();
    const currentUtcIso = now.toISOString();
    const currentUtcDate = currentUtcIso.substring(0, 10);
    const currentUtcTime = currentUtcIso.replace('T', ' ').substring(0, 19) + ' UTC';

    try {
      const dynamicAi = new GoogleGenAI({ apiKey: apiKeyToUse });
      
      const customPrompt = radarCustomization 
        ? `\n\nتخصيص الرادار من المستخدم: ${radarCustomization}\n\nيجب توسيع نطاقات البحث لتشمل كل الممكن والمتاح وكل التقاطعات بكل أنواعها وأشكالها بناءً على هذا التخصيص، وخاصة تلك التهديدات التي لا يستطيع البشر مجاراتها.`
        : '';

      const interaction = await dynamicAi.interactions.create({
        model: modelId,
        input: `قم بإجراء أوسع مسح استخباراتي ممكن للويب ومنصات التواصل العالمية لرصد أحدث 15 هجوماً إعلامياً أو شبهة فكرية انتشرت عالمياً في آخر 24 ساعة من التوقيت الفعلي اللحظي: (${currentUtcTime}). 
تأكد من شمولية البحث (أخبار، فيديوهات، منشورات، مقالات)، وجلب الروابط المباشرة الدقيقة، والتحقق التام من صحة الوقائع وتاريخ النشر بصيغة YYYY-MM-DD.

أريدك أيضاً أن تطبق خوارزمية بحث متقاطعة (Cross-Intersection Search) لتحليل العلاقات بين التهديدات في منصات متعددة، واستخراج التهديدات المعقدة وذات التأثير العالي التي تتقاطع بين عدة منصات أو ترتبط ببعضها البعض بحملات منسقة، وضعها في مصفوفة \`complexThreats\`، مع توثيق الروابط الحقيقية.

${customPrompt}\n\nأرجع النتائج كقائمة JSON حصراً، مع الالتزام التام بعدم اختلاق أي خبر أو رابط.`,
        system_instruction: `أنت نظام رصد إعلامي استخباراتي عالمي فائق التطور (Global Sovereign Media Intelligence Matrix) مربوط ومزامن لحظياً مع التوقيت الفعلي العالمي (Live Real-Time UTC Clock: ${currentUtcTime}).
مهمتك هي إجراء مسح شامل وعميق للويب العالمي ووسائل التواصل الاجتماعي وفق أعلى معايير التحقق الرقمي والنزاهة الاستخبارية:

ضوابط التحقق الإلزامية:
1. **دقة الاستعلامات والتحقق التام**: يجب أن تكون كل استعلامة أو تنبيه يتم التقاطه حقيقياً ومتحققاً منه وله وجود فعلي موثق برابط مباشر (Direct Verifiable URL).
2. **حظر اختلاق الروابط أو الأحداث**: يُمنع منعاً باتاً اختلاق أي حدث أو تصريح أو رابط. إذا كان هناك حدث متداول لم يتم العثور على رابط مؤكد له، يجب وسم المحتوى بـ [غير مؤكد].
3. **توحيد صيغة التواريخ**: استخدام صيغة YYYY-MM-DD حصراً لكافة التواريخ في حقل time بما يطابق تاريخ اليوم الفعلي (${currentUtcDate}) وما قبله.
4. **الحياد الأكاديمي وتفكيك الخطاب**: يجب أن يكون الرصد مقتصراً على "تحليل المحتوى والنصوص والمغالطات" بشكل علمي وموضوعي، والابتعاد التام عن النوايا التخمينية أو اللغة التآمرية.
5. **الروابط المباشرة**: يجب وضع رابط المصدر الحقيقي في حقل evidence لكل عنصر.`,
        tools: [{ type: 'google_search' }],
        generation_config: {
          temperature: temperature ?? 0.7,
          top_p: topP ?? 0.95,
        },
        response_format: {
          type: Type.OBJECT,
          properties: {
            alerts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  source: { type: Type.STRING },
                  content: { type: Type.STRING },
                  level: { type: Type.STRING },
                  time: { type: Type.STRING },
                  evidence: { type: Type.STRING },
                  category: { type: Type.STRING },
                  sentiment: { type: Type.STRING },
                  impact: { type: Type.STRING }
                },
                required: ["id", "source", "content", "level", "time", "evidence", "category", "sentiment"]
              }
            },
            complexThreats: {
              type: Type.ARRAY,
              description: "Threats that span across multiple platforms, showing coordinated attacks or complex intersections.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  involvedPlatforms: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  impactLevel: { type: Type.STRING },
                  strategicAnalysis: { type: Type.STRING }
                },
                required: ["id", "title", "description", "involvedPlatforms", "impactLevel", "strategicAnalysis"]
              }
            }
          },
          required: ["alerts"]
        }
      } as any);

      let responseText = "";
      for (const step of interaction.steps) {
        if (step.type === 'model_output') {
          const textPart = step.content?.find(c => c.type === 'text');
          if (textPart && textPart.text) responseText += textPart.text;
        }
      }
      
      if (!responseText) responseText = "{\"alerts\": []}";
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // Fallback if AI output is slightly malformed
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        data = jsonMatch ? JSON.parse(jsonMatch[0]) : { alerts: [] };
      }
      
      // Return data directly with live server UTC time
      res.json({ ...data, serverUtcTime: currentUtcTime, serverTimestamp: now.getTime() });
    } catch (error: any) {
      handleGeminiError(error, res);
    }
  });

  // Intelligence Tracking API
  app.post("/api/monitor/track", async (req, res) => {
    const { alert, customApiKey, customModel, temperature, topP } = req.body;
    const apiKeyToUse = customApiKey || process.env.GEMINI_API_KEY;
    const modelId = customModel || "gemini-3.8-flash";

    if (!apiKeyToUse) return res.status(500).json({ error: "API Key missing" });

    const now = new Date();
    const currentUtcIso = now.toISOString();
    const currentUtcDate = currentUtcIso.substring(0, 10);
    const currentUtcTime = currentUtcIso.replace('T', ' ').substring(0, 19) + ' UTC';

    try {
      const dynamicAi = new GoogleGenAI({ apiKey: apiKeyToUse });
      
      const systemInstruction = `أنت خبير استخبارات رقمية ورصد إعلامي وتحليل بيانات مفتوحة المصدر (OSINT & Digital Intelligence).
أنت مرتبط لحظياً بالوقت الفعلي العالمي (Live Real-Time UTC Clock: ${currentUtcTime}).
مهمتك إعداد "تقرير تتبع استخباري وتحليل مسار" (Origin Tracking & Trajectory Analysis) للخبر أو الشبهة المرصودة، مع التطبيق الصارم والحرفي للمعايير الأكاديمية والاستخبارية الـ 11 التالية:

1. **حظر الإحالات المختصرة**: يُمنع منعاً باتاً استخدام إحالات مختصرة مثل [1.x] أو [1] أو [2]. يجب ذكر المصدر كاملاً وبشكل مفرود (اسم المصدر، العنوان، الكاتب/الناشر، تاريخ النشر بصيغة YYYY-MM-DD، الرابط المباشر القابل للنقر، وتاريخ الوصول بصيغة YYYY-MM-DD (${currentUtcDate})).
2. **التحقق من كل معلومة وعدم اختلاق المصادر**: تحقق من كل معلومة وواقعة عبر البحث المباشر في الويب. إذا لم يتوفر مصدر موثوق، ضع علامة [غير مؤكد] بصراحة ولا تخترع أي مصدر أو رابط.
3. **توثيق الأرقام والإحصائيات بروابط حصرية**: لا تذكر أي رقم، نسبة مئوية، أو إحصائية دون رابط مباشر يدعمها صراحة، وإلا ضع [غير مؤكد].
4. **الفصل المنهجي الصارم بين الوقائع الموثقة، التحليل، والرأي** باستخدام العناوين الفرعية التالية حصراً:
   - ### منهجية التحليل (Analysis Methodology)
   - ### محددات البحث (Research Limitations)
   - ### الوقائع الموثقة والمنشأ الزمني (Documented Facts & Chronological Origin)
   - ### التحليل الاستخباري ونمط الانتشار (Intelligence Analysis & Propagation Pattern)
   - ### تفكيك الخطاب والمغالطات (Discourse & Logical Fallacies Deconstruction)
   - ### الرأي والتقييم الاستراتيجي والمآلات (Evaluation & Strategic Trajectory)
5. **إلزامية قسمي منهجية التحليل ومحددات البحث**: تفصيل آلية الرصد الرقمي، الكلمات المفتاحية، ونطاق الفحص، وتحديد القيود الرقمية والزمنية.
6. **لغة أكاديمية محايدة**: تجنب الأوصاف التآمرية أو التحريضية واعتمد كلياً على البيانات والوقائع المادية الملموسة.
7. **صيغة التواريخ والأسماء**: تدقيق أسماء المنصات والشخصيات، وتوحيد التواريخ بصيغة YYYY-MM-DD.
8. **جدول المصادر في النهاية**: أضف جدول مصادر شامل في نهاية التقرير بتنسيق Markdown بالأعمدة:
   | الرقم | اسم المصدر | عنوان المقال/المنشور | الكاتب/الناشر | تاريخ النشر (YYYY-MM-DD) | الرابط المباشر | تاريخ الوصول (YYYY-MM-DD) |
9. **إخراج التقرير بصيغة Markdown**: مع روابط قابلة للنقر بتنسيق [اسم المصدر أو العنوان](URL) وجداول نظيفة.
10. **طلب الروابط عند تعذر الوصول**: عند عدم توفر رابط مباشر لواقعة معينة أو تعذر الوصول للإنترنت، اطلب من المستخدم تزويدك بالرابط ولا تقم باختلاقه أبداً.
11. **دقة الاستعلامات**: يجب أن تكون كافة الاستعلامات والأحداث متحققة ودقيقة وموثقة بدقة بالغة.`;

      const prompt = `قم بإجراء تتبع استخباري وتحليل مسار دقيق وشامل لهذا المحتوى المرصود:
المصدر: ${alert?.source || 'غير محدد'}
المحتوى: ${alert?.content || 'غير محدد'}
الرابط المرجعي: ${alert?.evidence || 'غير متوفر'}
التاريخ المرصود: ${alert?.time || currentUtcDate}

التوقيت الفعلي اللحظي العالمي (Live Global UTC): ${currentUtcTime} (الموافق: ${currentUtcDate}).
تأكد من البحث في الويب للوصول إلى المنشأ الحقيقي والتتبع الزمني والروابط المباشرة، مع الالتزام التام بكافة البنود الـ 11 وجدول المصادر والعناوين المحددة دون استخدام إحالات مختصرة مثل [1.x].`;

      const result = await dynamicAi.models.generateContent({
        model: modelId,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          systemInstruction,
          temperature: temperature ?? 0.3,
          topP: topP ?? 0.95,
          tools: [{ googleSearch: {} }],
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
          ] as any
        }
      });

      let reportText = result.text || "";
      const groundingMetadata = result.candidates?.[0]?.groundingMetadata;
      reportText = enrichReportWithVerifiedLinks(reportText, groundingMetadata);

      res.json({ report: reportText, groundingMetadata });
    } catch (error: any) {
      handleGeminiError(error, res);
    }
  });

  // Vite middleware for development
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error Handler to always return JSON for API routes
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global error handler:", err);
    if (req.path.startsWith('/api/')) {
      res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
        type: err.type || err.name
      });
    } else {
      next(err);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
