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
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dream } = (await req.json()) as DreamStoryRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a master storyteller who transforms dreams and aspirations into immersive, vivid narratives. Write in first-person perspective, making the reader feel like they are living the dream. Use rich sensory details, emotions, and imagery. The story should be inspiring and paint a beautiful picture of the dream realized.`;

    const userPrompt = `Transform this dream into an immersive first-person narrative story (2-3 paragraphs):

Dream Title: ${dream.title}
Description: ${dream.description || "No description provided"}
Category: ${dream.category}

Write the story as if the dreamer is living their accomplished dream. Include sensory details - what they see, hear, feel. Make it emotional and inspiring.`;

    console.log("Generating dream story for:", dream.title);

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
        max_tokens: 800,
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
    const story = data.choices?.[0]?.message?.content || "Unable to generate story at this time.";

    console.log("Story generated successfully");

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
