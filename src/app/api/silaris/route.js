import { NextResponse } from 'next/server';

const SYSTEM_PROMPT = `
Kamu adalah SiLaris (Jarvis), Asisten Marketing AI cerdas untuk aplikasi PWA Larisi. 
Tugas utamamu adalah membantu pengguna (UMKM) merencanakan dan membuat konten pemasaran di media sosial (Instagram, TikTok, Facebook).
Gaya bahasamu profesional tapi santai, ramah, layaknya seorang Social Media Manager berpengalaman.
Panggil pengguna dengan sebutan "Bos".
Jangan berhalusinasi. Jawab dengan ringkas dan padat.
`;

const TOOLS_SCHEMA = [
  {
    type: "function",
    function: {
      name: "create_campaign",
      description: "Membuat draft campaign pemasaran otomatis di aplikasi. Panggil ini JIKA pengguna meminta untuk dibuatkan campaign, konten, jadwal, atau ide postingan.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Judul campaign singkat yang menarik" },
          platform: { type: "string", description: "Instagram, TikTok, atau Facebook" },
          caption: { type: "string", description: "Draft caption untuk postingan ini" }
        },
        required: ["title", "platform"]
      }
    }
  }
];

const GEMINI_TOOLS_SCHEMA = [
  {
    functionDeclarations: [
      {
        name: "create_campaign",
        description: "Membuat draft campaign pemasaran otomatis di aplikasi. Panggil ini JIKA pengguna meminta untuk dibuatkan campaign, konten, jadwal, atau ide postingan.",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING", description: "Judul campaign singkat yang menarik" },
            platform: { type: "STRING", description: "Instagram, TikTok, atau Facebook" },
            caption: { type: "STRING", description: "Draft caption untuk postingan ini" }
          },
          required: ["title", "platform"]
        }
      }
    ]
  }
];

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const provider = process.env.AI_PROVIDER || 'groq'; // Default ke groq untuk testing

    if (provider === 'gemini') {
      // ==========================================
      // PROVIDER: GOOGLE GEMINI
      // ==========================================
      if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: 'Gemini API Key belum dikonfigurasi.' }, { status: 500 });
      }

      const geminiMessages = (messages || []).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: geminiMessages,
          tools: GEMINI_TOOLS_SCHEMA,
        })
      });

      const data = await response.json();
      if (!response.ok) return NextResponse.json({ error: data.error?.message || 'Gagal menghubungi Gemini' }, { status: response.status });

      const firstPart = data.candidates?.[0]?.content?.parts?.[0];
      
      if (firstPart?.functionCall) {
        const funcCall = firstPart.functionCall;
        return NextResponse.json({ message: { role: 'assistant', type: 'tool_call', name: funcCall.name, args: funcCall.args, content: `⏳ Mengeksekusi aksi: ${funcCall.name}...` } });
      }

      return NextResponse.json({ message: { role: 'assistant', type: 'text', content: firstPart?.text || '' } });

    } else {
      // ==========================================
      // PROVIDER: GROQ (Default Testing)
      // ==========================================
      if (!process.env.GROQ_API_KEY) {
        return NextResponse.json({ error: 'Groq API Key belum dikonfigurasi.' }, { status: 500 });
      }

      const groqMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...(messages || [])
      ];

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: groqMessages,
          temperature: 0.2, // Turunkan temperature agar AI fokus memanggil function
          tools: TOOLS_SCHEMA,
          tool_choice: "auto"
        })
      });

      const data = await response.json();
      if (!response.ok) return NextResponse.json({ error: data.error?.message || 'Gagal menghubungi Groq' }, { status: response.status });

      const aiMessage = data.choices[0].message;

      if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        const toolCall = aiMessage.tool_calls[0];
        const args = JSON.parse(toolCall.function.arguments);
        return NextResponse.json({ message: { role: 'assistant', type: 'tool_call', name: toolCall.function.name, args: args, content: `⏳ Mengeksekusi aksi: ${toolCall.function.name}...` } });
      }

      return NextResponse.json({ message: { role: 'assistant', type: 'text', content: aiMessage.content || '' } });
    }

  } catch (error) {
    console.error('SiLaris API Error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server SiLaris.' }, { status: 500 });
  }
}
