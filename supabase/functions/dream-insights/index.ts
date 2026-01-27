import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DreamInsightRequest {
  type: "summary" | "action_steps" | "motivation";
  dream: {
    title: string;
    description: string;
    category: string;
    priority: string;
    milestones?: { title: string; completed: boolean }[];
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, dream } = (await req.json()) as DreamInsightRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    const dreamContext = `
Dream Title: ${dream.title}
Description: ${dream.description || "No description provided"}
Category: ${dream.category}
Priority: ${dream.priority}
${dream.milestones ? `Milestones: ${dream.milestones.map(m => `${m.completed ? "✓" : "○"} ${m.title}`).join(", ")}` : ""}
    `.trim();

    switch (type) {
      case "summary":
        systemPrompt = "You are a thoughtful life coach helping people understand and articulate their dreams and goals. Be warm, insightful, and encouraging. Keep responses concise but meaningful.";
        userPrompt = `Please provide a brief, insightful summary of this dream/goal that captures its essence and importance:\n\n${dreamContext}\n\nProvide a 2-3 sentence summary that reflects on why this dream matters and its potential impact.`;
        break;

      case "action_steps":
        systemPrompt = "You are a strategic life coach who helps people turn dreams into actionable plans. Be practical, specific, and encouraging. Focus on achievable next steps.";
        userPrompt = `Based on this dream/goal, suggest 3-5 concrete, actionable steps the person can take to move closer to achieving it:\n\n${dreamContext}\n\nProvide numbered steps that are specific, measurable, and achievable. Start with smaller steps and progress to larger ones.`;
        break;

      case "motivation":
        systemPrompt = "You are an inspiring life coach who helps people stay motivated and connected to their dreams. Be uplifting, genuine, and powerful. Use vivid imagery and emotional resonance.";
        userPrompt = `Provide a short, powerful motivational message for someone pursuing this dream:\n\n${dreamContext}\n\nWrite 2-3 sentences that will inspire them to keep going, remind them why this matters, and help them visualize success.`;
        break;

      default:
        throw new Error("Invalid insight type");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI service temporarily unavailable");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Unable to generate insight at this time.";

    return new Response(
      JSON.stringify({ insight: content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Dream insights error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
