 import { useState, useRef, useEffect } from "react";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { ScrollArea } from "@/components/ui/scroll-area";
 import { supabase } from "@/integrations/supabase/client";
 import { useToast } from "@/hooks/use-toast";
 import { Loader2, Send, Bot, User, Sparkles, Save } from "lucide-react";
 
 interface Message {
   role: "user" | "assistant";
   content: string;
 }
 
 interface Dream {
   id: string;
   title: string;
   description: string | null;
   category: string;
 }
 
 interface StoryAgentDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   dream: Dream;
   onStorySaved?: () => void;
 }
 
 export function StoryAgentDialog({
   open,
   onOpenChange,
   dream,
   onStorySaved,
 }: StoryAgentDialogProps) {
   const [messages, setMessages] = useState<Message[]>([]);
   const [input, setInput] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [isSaving, setIsSaving] = useState(false);
   const scrollRef = useRef<HTMLDivElement>(null);
   const { toast } = useToast();
 
   useEffect(() => {
     if (open && messages.length === 0) {
       // Start conversation with initial greeting
       sendInitialMessage();
     }
   }, [open]);
 
   useEffect(() => {
     // Auto-scroll to bottom
     if (scrollRef.current) {
       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
     }
   }, [messages]);
 
   const sendInitialMessage = async () => {
     setIsLoading(true);
     try {
       const response = await supabase.functions.invoke("story-agent", {
         body: {
           messages: [
             {
               role: "user",
               content: "Hello! I'd like to create a story based on my dream. Can you help me develop it?",
             },
           ],
           dream: {
             title: dream.title,
             description: dream.description || "",
             category: dream.category,
           },
         },
       });
 
       if (response.error) throw new Error(response.error.message);
 
       setMessages([
         {
           role: "user",
           content: "Hello! I'd like to create a story based on my dream. Can you help me develop it?",
         },
         { role: "assistant", content: response.data.message },
       ]);
     } catch (error) {
       console.error("Initial message error:", error);
       toast({
         title: "Connection Error",
         description: "Failed to start conversation. Please try again.",
         variant: "destructive",
       });
     } finally {
       setIsLoading(false);
     }
   };
 
   const sendMessage = async () => {
     if (!input.trim() || isLoading) return;
 
     const userMessage = input.trim();
     setInput("");
     setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
     setIsLoading(true);
 
     try {
       const response = await supabase.functions.invoke("story-agent", {
         body: {
           messages: [...messages, { role: "user", content: userMessage }],
           dream: {
             title: dream.title,
             description: dream.description || "",
             category: dream.category,
           },
         },
       });
 
       if (response.error) throw new Error(response.error.message);
 
       setMessages((prev) => [
         ...prev,
         { role: "assistant", content: response.data.message },
       ]);
     } catch (error) {
       console.error("Message error:", error);
       toast({
         title: "Error",
         description: "Failed to get response. Please try again.",
         variant: "destructive",
       });
     } finally {
       setIsLoading(false);
     }
   };
 
   const saveAsStory = async () => {
     // Find the last substantial assistant message as the story
     const assistantMessages = messages.filter((m) => m.role === "assistant");
     if (assistantMessages.length === 0) {
       toast({
         title: "No Story to Save",
         description: "Generate some story content first!",
         variant: "destructive",
       });
       return;
     }
 
     // Get the longest assistant message as the story
     const story = assistantMessages.reduce((longest, current) =>
       current.content.length > longest.content.length ? current : longest
     ).content;
 
     setIsSaving(true);
     try {
       const { error } = await supabase
         .from("dreams")
         .update({ story })
         .eq("id", dream.id);
 
       if (error) throw error;
 
       toast({
         title: "Story Saved!",
         description: "The story has been saved to your dream.",
       });
 
       onStorySaved?.();
       onOpenChange(false);
     } catch (error) {
       console.error("Save error:", error);
       toast({
         title: "Save Failed",
         description: "Could not save the story. Please try again.",
         variant: "destructive",
       });
     } finally {
       setIsSaving(false);
     }
   };
 
   const handleClose = () => {
     setMessages([]);
     setInput("");
     onOpenChange(false);
   };
 
   return (
     <Dialog open={open} onOpenChange={handleClose}>
       <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0 gap-0">
         <DialogHeader className="p-6 pb-4 border-b border-border">
           <DialogTitle className="flex items-center gap-2">
             <Bot className="w-5 h-5 text-primary" />
             Story Agent - {dream.title}
           </DialogTitle>
         </DialogHeader>
 
         <ScrollArea className="flex-1 p-6" ref={scrollRef}>
           <div className="space-y-4">
             {messages.length === 0 && !isLoading && (
               <div className="text-center py-12">
                 <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                 <p className="text-muted-foreground">
                   Starting your story journey...
                 </p>
               </div>
             )}
 
             {messages.map((message, index) => (
               <div
                 key={index}
                 className={`flex gap-3 ${
                   message.role === "user" ? "justify-end" : "justify-start"
                 }`}
               >
                 {message.role === "assistant" && (
                   <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                     <Bot className="w-4 h-4 text-primary" />
                   </div>
                 )}
                 <div
                   className={`max-w-[80%] p-4 rounded-2xl ${
                     message.role === "user"
                       ? "bg-primary text-primary-foreground"
                       : "bg-muted"
                   }`}
                 >
                   <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                 </div>
                 {message.role === "user" && (
                   <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                     <User className="w-4 h-4 text-secondary-foreground" />
                   </div>
                 )}
               </div>
             ))}
 
             {isLoading && (
               <div className="flex gap-3 justify-start">
                 <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                   <Bot className="w-4 h-4 text-primary" />
                 </div>
                 <div className="bg-muted p-4 rounded-2xl">
                   <Loader2 className="w-5 h-5 animate-spin text-primary" />
                 </div>
               </div>
             )}
           </div>
         </ScrollArea>
 
         <div className="p-4 border-t border-border space-y-3">
           <div className="flex gap-2">
             <Input
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
               placeholder="Tell me more about your dream..."
               disabled={isLoading}
               className="flex-1"
             />
             <Button
               onClick={sendMessage}
               disabled={!input.trim() || isLoading}
               size="icon"
             >
               <Send className="w-4 h-4" />
             </Button>
           </div>
           
           {messages.length > 1 && (
             <Button
               onClick={saveAsStory}
               disabled={isSaving}
               variant="outline"
               className="w-full border-primary/50 hover:bg-primary/10"
             >
               {isSaving ? (
                 <>
                   <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                   Saving...
                 </>
               ) : (
                 <>
                   <Save className="w-4 h-4 mr-2" />
                   Save Best Response as Story
                 </>
               )}
             </Button>
           )}
         </div>
       </DialogContent>
     </Dialog>
   );
 }