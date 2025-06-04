"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Send, Bot, User, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function NutritionChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "¡Hola! Soy tu asistente nutricional de NutriGuide. ¿En qué puedo ayudarte hoy con tu alimentación y objetivos de salud?",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Add user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Call the AI API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar tu mensaje");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setError(err instanceof Error ? err.message : "Error inesperado");

      // Add error message to chat
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Lo siento, hay un problema técnico. Por favor intenta de nuevo en unos momentos.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col bg-warm-sand border-soft-rose/20">
      <CardHeader className="pb-3 border-b border-soft-rose/10 flex-shrink-0">
        <CardTitle className="text-xl font-medium flex items-center gap-2">
          <Bot className="w-6 h-6 text-coral" />
          Tu Asistente Nutricional con IA
        </CardTitle>
        <p className="text-sm text-charcoal/60 mt-1">
          Asistente personalizado según las recomendaciones de tu nutricionista
        </p>
        {error && (
          <div className="text-sm text-red-500 mt-2 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Messages Container - Takes up available space and scrolls */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-start gap-3 max-w-[80%]">
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-coral" />
                  </div>
                )}
                <div
                  className={`rounded-2xl px-5 py-4 ${
                    message.role === "user"
                      ? "bg-coral text-mist-white rounded-tr-none"
                      : "bg-sage-green/20 text-charcoal rounded-tl-none"
                  }`}
                >
                  <div className="text-sm leading-relaxed [&_li_p]:inline [&_li_p]:m-0 [&_li]:flex [&_li]:items-start [&_li]:gap-1">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <div className="mb-2 last:mb-0">{children}</div>
                        ),

                        strong: ({ children }) => (
                          <strong className="font-semibold">{children}</strong>
                        ),

                        em: ({ children }) => (
                          <em className="italic">{children}</em>
                        ),

                        code: ({ children }) => (
                          <code className="bg-black/10 px-1 py-0.5 rounded text-xs">
                            {children}
                          </code>
                        ),

                        ul: ({ children }) => (
                          <ul className="list-none my-2">{children}</ul>
                        ),

                        ol: ({ children }) => (
                          <ol className="list-none my-2">{children}</ol>
                        ),

                        li: ({ children }) => (
                          <li className="text-sm leading-relaxed flex items-start gap-2 mb-1">
                            <span className="text-charcoal/60 font-medium min-w-[1.5rem]">
                              •
                            </span>
                            <span className="flex-1">{children}</span>
                          </li>
                        ),

                        // Prevent unwanted elements
                        h1: ({ children }) => (
                          <div className="font-semibold text-base mb-1">
                            {children}
                          </div>
                        ),

                        h2: ({ children }) => (
                          <div className="font-semibold text-sm mb-1">
                            {children}
                          </div>
                        ),

                        h3: ({ children }) => (
                          <div className="font-semibold text-sm mb-1">
                            {children}
                          </div>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <p className="text-xs opacity-70 mt-2 text-right">
                    {message.timestamp}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-soft-rose/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-soft-rose" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-coral" />
                </div>
                <div className="bg-sage-green/20 text-charcoal rounded-2xl rounded-tl-none px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />

                    <span className="text-sm">
                      Tu asistente está pensando...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section - Fixed at bottom */}
        <div className="flex-shrink-0 p-6 border-t border-soft-rose/10 bg-mist-white/50">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Pregúntame sobre nutrición, recetas, o tus objetivos de salud..."
              className="flex-1 px-4 py-3 rounded-xl bg-mist-white border border-soft-rose/20 focus:outline-none focus:ring-2 focus:ring-soft-rose/50 text-charcoal resize-none min-h-[50px] max-h-24 text-sm"
              disabled={isLoading}
              rows={1}
              style={{ height: "auto" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 96) + "px"; // max-h-24 = 96px
              }}
            />

            <Button
              onClick={handleSendMessage}
              className="rounded-xl bg-coral hover:bg-coral/90 text-mist-white flex-shrink-0 h-[50px] w-[50px]"
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
