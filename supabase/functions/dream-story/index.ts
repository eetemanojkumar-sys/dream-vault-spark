import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DreamStoryRequest {
  dream: {
    title: string;
    description: string;
    category: string;
  };
  tone?: string;
  stream?: boolean;
}

const tonePrompts: Record<string, string> = {
  inspirational: "Write in an uplifting, motivational tone that makes the reader feel empowered.",
  poetic: "Write in a lyrical, poetic style with rich metaphors and beautiful imagery.",
  adventure: "Write in an exciting, action-packed adventure style with vivid scenes.",
  "sci-fi": "Write in a futuristic, science-fiction style with imaginative technology and worlds.",
  fantasy: "Write in a magical, fantasy style with enchanting elements and wonder.",
  philosophical: "Write in a contemplative, philosophical style exploring deeper meaning.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dream, tone = "inspirational", stream = false } = (await req.json()) as DreamStoryRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const toneInstruction = tonePrompts[tone] || tonePrompts.inspirational;

    const systemPrompt = `You are a master storyteller who transforms dreams and aspirations into immersive, vivid narratives. Write in first-person perspective, making the reader feel like they are living the dream. Use rich sensory details, emotions, and imagery. The story should be inspiring and paint a beautiful picture of the dream realized. ${toneInstruction}`;

    const userPrompt = `Transform this dream into an immersive first-person narrative story (3-4 paragraphs):

Dream Title: ${dream.title}
Description: ${dream.description || "No description provided"}
Category: ${dream.category}

Write the story as if the dreamer is living their accomplished dream. Include sensory details - what they see, hear, feel. Make it emotional and inspiring.`;

    console.log("Generating dream story for:", dream.title, "tone:", tone, "stream:", stream);

    if (stream) {
      // Streaming response
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_completion_tokens: 2500,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error("AI service temporarily unavailable");
      }

      // Pipe the stream through
      return new Response(response.body, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Non-streaming response
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

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
      throw new Error("AI service temporarily unavailable");
    }

    const data = await response.json();
    const story = data.choices?.[0]?.message?.content
      || data.choices?.[0]?.text
      || "Unable to generate story at this time.";

    console.log("Story generated successfully, length:", story.length);

    return new Response(
      JSON.stringify({ story }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Dream story error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
