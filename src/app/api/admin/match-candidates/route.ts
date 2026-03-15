import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30;

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    const { job } = await req.json();

    // Get all candidates from DB
    const { data: candidates, error } = await db()
      .from("candidates")
      .select("*")
      .not("status", "eq", "quit");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    // Build job summary for Gemini
    const jobSummary = `
求人情報:
企業名: ${job.company}
職種: ${job.position_ja} / ${job.position_vn}
業種: ${job.industry}
おすすめポイント: ${job.osusume_point || ""}
職務内容: ${job.job_description || ""}
応募要件: ${job.requirements || ""}
資格: ${job.qualifications || ""}
語学力: ${job.language_skill || job.jlpt_min || ""}
学歴: ${job.education || ""}
勤務地: ${job.work_location || job.location || ""}
給与: ${job.annual_income || job.salary || ""}
雇用形態: ${job.employment_type || ""}
勤務時間: ${job.work_hours || ""}
    `.trim();

    // Build candidates summary
    const candidatesSummary = candidates.map((c, i) => `
候補者${i+1}:
ID: ${c.id}
名前: ${c.name}
業種: ${c.skill}
日本語: ${c.jlpt}
ステータス: ${c.status}
備考: ${c.note || ""}
AI分析: ${c.ai_data ? JSON.stringify(c.ai_data).slice(0, 300) : "なし"}
    `.trim()).join("\n---\n");

    const prompt = `あなたはAseka株式会社の優秀なHRマッチングAIです。
以下の求人情報と候補者リストを分析し、この求人に最適な候補者TOP3を選んでください。

${jobSummary}

===候補者リスト===
${candidatesSummary}

各候補者のマッチ度を0-100%で評価し、理由を日本語とベトナム語で説明してください。
ONLY return valid JSON array (no markdown):
[
  {
    "candidateId": "uuid",
    "candidateName": "name",
    "matchPct": 85,
    "reasonJa": "理由（日本語）",
    "reasonVn": "Lý do (tiếng Việt)",
    "strengths": ["強み1", "強み2"]
  }
]`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1500 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.text();
      throw new Error(`Gemini error: ${geminiRes.status}`);
    }

    const geminiData = await geminiRes.json();
    const raw = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const cleaned = raw.replace(/```json\n?/g,"").replace(/```\n?/g,"").trim();
    const matches = JSON.parse(cleaned);

    // Enrich with full candidate data
    const enriched = matches.map((m: {candidateId: string; candidateName: string; matchPct: number; reasonJa: string; reasonVn: string; strengths: string[]}) => {
      const cand = candidates.find(c => c.id === m.candidateId);
      return { ...m, candidate: cand || null };
    }).filter((m: {candidate: unknown}) => m.candidate !== null);

    return NextResponse.json({ matches: enriched });

  } catch (err) {
    console.error("Match error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}