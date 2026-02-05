 import "https://deno.land/x/xhr@0.1.0/mod.ts";
 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type",
 };
 
 interface Message {
   role: "user" | "assistant" | "system";
   content: string;
 }
 
 interface RequestBody {
   messages: Message[];
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
     const { messages, dream }: RequestBody = await req.json();
 
     const systemPrompt = `You are a creative storytelling AI agent specialized in crafting dream narratives. You're helping the user develop a story based on their dream.
 
 Dream Context:
 - Title: ${dream.title}
 - Description: ${dream.description}
 - Category: ${dream.category}
 
 Your role:
 1. Engage in creative dialogue about the dream
 2. Ask clarifying questions to enrich the story
 3. Offer creative suggestions and story directions
 4. Generate vivid, immersive narrative passages when asked
 5. Help develop characters, settings, and plot elements
 6. Be encouraging and imaginative
 
 Keep responses conversational but engaging. When generating story passages, make them vivid and first-person. Always stay focused on the dream context provided.`;
 
     const fullMessages: Message[] = [
       { role: "system", content: systemPrompt },
       ...messages,
     ];
 
     const response = await fetch(
       "https://api.ai.lovable.dev/v1/chat/completions",
       {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({
           model: "openai/gpt-5",
           messages: fullMessages,
           max_completion_tokens: 1500,
         }),
       }
     );
 
     if (!response.ok) {
       const errorText = await response.text();
       console.error("AI API error:", errorText);
       throw new Error(`AI API returned status ${response.status}`);
     }
 
     const data = await response.json();
     const assistantMessage = data.choices[0].message.content;
 
     return new Response(
       JSON.stringify({ message: assistantMessage }),
       {
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       }
     );
   } catch (error: unknown) {
     console.error("Story agent error:", error);
     const errorMessage = error instanceof Error ? error.message : "Failed to generate response";
     return new Response(
       JSON.stringify({ error: errorMessage }),
       {
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       }
     );
   }
 });