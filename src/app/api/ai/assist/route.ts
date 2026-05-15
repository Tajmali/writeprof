import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyToken } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const requestSchema = z.object({
  type: z.enum(["outline", "grammar", "paraphrase", "citation", "research", "seo"]),
  content: z.string().min(10),
  context: z.string().optional(),
  style: z.string().optional(),
});

const SYSTEM_PROMPTS: Record<string, string> = {
  outline: "You are an expert academic writer. Generate a detailed, well-structured outline for the given topic. Include main sections, subsections, and key points for each section. Format clearly with Roman numerals and letters.",
  grammar: "You are a professional editor and grammar expert. Review the provided text and correct all grammar, spelling, punctuation, and style errors. Return the corrected text with brief explanations of major changes.",
  paraphrase: "You are a skilled writer. Paraphrase the given text to make it original while preserving the meaning. Improve clarity and flow. Avoid plagiarism by using completely different sentence structures and vocabulary.",
  citation: "You are an academic citation expert. Format the provided source information into the requested citation style (APA, MLA, Chicago, Harvard). Provide both in-text citation and full bibliography entry.",
  research: "You are a research assistant. Provide comprehensive background information, key facts, recent developments, and reliable source suggestions for the given research topic. Be thorough and academic.",
  seo: "You are an SEO content strategist. Analyze the provided content or topic and generate SEO-optimized suggestions including: keyword recommendations, meta description, title tags, content structure improvements, and readability enhancements.",
};

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { type, content, context, style } = requestSchema.parse(body);

    const systemPrompt = SYSTEM_PROMPTS[type];
    const userMessage = context
      ? `Topic/Content: ${content}\n\nAdditional Context: ${context}${style ? `\n\nStyle: ${style}` : ""}`
      : content;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });

    const result = message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({
      success: true,
      data: { result, type, tokensUsed: message.usage.input_tokens + message.usage.output_tokens },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    }
    console.error("AI assist error:", err);
    return NextResponse.json({ success: false, error: "AI service unavailable" }, { status: 500 });
  }
}
