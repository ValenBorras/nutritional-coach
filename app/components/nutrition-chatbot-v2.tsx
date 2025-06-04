"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { UserAvatar } from "@/app/components/ui/user-avatar";
import {
  Send,
  Bot,
  User,
  Loader2,
  Plus,
  MessageSquare,
  Archive,
  MoreVertical,
  Menu,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAuth } from "@/hooks/use-auth";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  created_at?: string;
}

interface Chat {
  id: string;
  title: string;
  lastMessageAt: string;
  messageCount: number;
}

interface NutritionChatbotProps {
  chatId?: string | null; // If provided, load this specific chat
  onChatChange?: (chatId: string | null) => void; // Callback when chat changes
  showChatList?: boolean; // Whether to show the chat history sidebar
}

export default function NutritionChatbot({
  chatId,
  onChatChange,
  showChatList = false,
}: NutritionChatbotProps) {
  const { user } = useAuth();
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
  const [currentChatId, setCurrentChatId] = useState<string | null>(
    chatId || null,
  );
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if we're on mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chats list if showChatList is true
  useEffect(() => {
    if (showChatList) {
      loadChats();
    }
  }, [showChatList]);

  // Load specific chat when chatId changes
  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      loadChat(chatId);
    }
  }, [chatId]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    if (isMobileSidebarOpen && isMobile) {
      const handleClickOutside = () => setIsMobileSidebarOpen(false);
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isMobileSidebarOpen, isMobile]);

  const loadChats = async () => {
    try {
      setLoadingChats(true);
      const response = await fetch("/api/chats");
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setLoadingChats(false);
    }
  };

  const loadChat = async (chatId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/chats/${chatId}`);
      if (response.ok) {
        const data = await response.json();
        const chat = data.chat;

        // Convert database messages to component format
        const loadedMessages =
          chat.messages?.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            created_at: msg.created_at,
          })) || [];

        // If no messages in DB, start with welcome message
        if (loadedMessages.length === 0) {
          loadedMessages.push({
            role: "assistant",
            content:
              "¡Hola! Soy tu asistente nutricional de NutriGuide. ¿En qué puedo ayudarte hoy con tu alimentación y objetivos de salud?",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          });
        }

        setMessages(loadedMessages);
        setCurrentChatId(chatId);
        onChatChange?.(chatId);

        // Close mobile sidebar after selecting chat
        if (isMobile) {
          setIsMobileSidebarOpen(false);
        }
      }
    } catch (error) {
      console.error("Error loading chat:", error);
      setError("Error al cargar la conversación");
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = async (title?: string) => {
    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title || "Nueva conversación",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newChatId = data.chat.id;

        // Reset to initial state for new chat
        setMessages([
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
        setCurrentChatId(newChatId);
        onChatChange?.(newChatId);

        // Refresh chats list
        if (showChatList) {
          loadChats();
        }

        return newChatId;
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      setError("Error al crear nueva conversación");
    }
    return null;
  };

  // Function to auto-create chat title from first user message
  const generateChatTitle = (message: string): string => {
    // Take first 50 characters or until first sentence ends
    let title =
      message.length > 50 ? message.substring(0, 50) + "..." : message;

    // If it ends with a sentence, use that
    const sentenceEnd = message.indexOf(".");
    if (sentenceEnd > 0 && sentenceEnd < 50) {
      title = message.substring(0, sentenceEnd);
    }

    return title || "Nueva conversación";
  };

  // Function to generate intelligent title based on conversation content
  const generateIntelligentTitle = async (
    userMessage: string,
    assistantResponse: string,
  ): Promise<string> => {
    try {
      const response = await fetch("/api/chat/generate-title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage,
          assistantResponse,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.title || "Nueva conversación";
      }
    } catch (error) {
      console.error("Error generating intelligent title:", error);
    }

    // Fallback to extracting key topic from user message
    return extractTopicFromMessage(userMessage);
  };

  // Fallback function to extract topic from message
  const extractTopicFromMessage = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    // Common nutrition topics and their descriptive titles
    const topicMap: { [key: string]: string } = {
      "masa muscular": "Plan para ganar masa muscular",
      "ganar peso": "Estrategias para ganar peso",
      "perder peso": "Plan para pérdida de peso",
      "bajar de peso": "Plan para pérdida de peso",
      diabetes: "Alimentación para diabetes",
      colesterol: "Dieta para controlar colesterol",
      hipertensión: "Alimentación para hipertensión",
      vegetariano: "Plan de alimentación vegetariano",
      vegano: "Plan de alimentación vegano",
      proteína: "Fuentes de proteína",
      recetas: "Recetas saludables",
      desayuno: "Ideas para desayuno",
      cena: "Opciones para cena",
      merienda: "Ideas para meriendas",
      suplementos: "Consulta sobre suplementos",
      ejercicio: "Nutrición y ejercicio",
      embarazo: "Alimentación durante embarazo",
      lactancia: "Nutrición en lactancia",
      niños: "Alimentación infantil",
      ancianos: "Nutrición en adultos mayores",
    };

    // Find matching topic
    for (const [keyword, title] of Object.entries(topicMap)) {
      if (lowerMessage.includes(keyword)) {
        return title;
      }
    }

    // If no specific topic found, create a generic descriptive title
    if (lowerMessage.includes("comer") || lowerMessage.includes("comida")) {
      return "Consulta sobre alimentación";
    }
    if (lowerMessage.includes("dieta") || lowerMessage.includes("plan")) {
      return "Plan nutricional personalizado";
    }

    // Last resort: use first few words
    const words = message.split(" ").slice(0, 4).join(" ");
    return words.length > 3 ? `Consulta: ${words}` : "Nueva conversación";
  };

  const startNewSessionChat = () => {
    // Start a new session-only chat (not saved)
    setMessages([
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
    setCurrentChatId(null);
    onChatChange?.(null);
  };

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
    const currentInput = input;
    setInput("");
    setIsLoading(true);
    setError(null);

    // Check if this is the first user message (only welcome message exists)
    const isFirstUserMessage =
      messages.length === 1 && messages[0].role === "assistant";

    try {
      // For first user message, don't create conversation yet - send as session first
      const chatIdToUse = isFirstUserMessage ? null : currentChatId;

      // Call the AI API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          chatId: chatIdToUse, // null for first message, existing chatId for subsequent
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

      // NOW create conversation only after successful AI response for first message
      if (isFirstUserMessage && !currentChatId) {
        try {
          // Generate intelligent title based on the complete exchange
          const intelligentTitle = await generateIntelligentTitle(
            currentInput,
            data.message,
          );

          // Create conversation with intelligent title
          const createResponse = await fetch("/api/chats", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: intelligentTitle,
            }),
          });

          if (createResponse.ok) {
            const chatData = await createResponse.json();
            const newChatId = chatData.chat.id;

            // Save both messages to the new conversation
            const messagesToSave = [
              {
                role: "user",
                content: currentInput,
                chatId: newChatId,
              },
              {
                role: "assistant",
                content: data.message,
                chatId: newChatId,
              },
            ];

            // Save both messages
            for (const messageData of messagesToSave) {
              await fetch(`/api/chats/${newChatId}/messages`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  role: messageData.role,
                  content: messageData.content,
                }),
              });
            }

            // Update state with new chat ID
            setCurrentChatId(newChatId);
            onChatChange?.(newChatId);

            // Refresh chats list to show new conversation
            if (showChatList) {
              loadChats();
            }

            console.log(
              `✅ Conversación creada y guardada: "${intelligentTitle}"`,
            );
          }
        } catch (error) {
          console.error(
            "Error creating conversation after successful exchange:",
            error,
          );
          // Conversation creation failed, but chat continues in session mode
        }
      }

      // Update chat ID if it was created during the conversation (for subsequent messages)
      if (data.chatId && !currentChatId) {
        setCurrentChatId(data.chatId);
        onChatChange?.(data.chatId);
      }
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

      // Don't create conversation if there was an error
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

  const archiveChat = async (chatIdToArchive: string) => {
    try {
      await fetch(`/api/chats/${chatIdToArchive}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "archived",
        }),
      });

      // Refresh chats list
      loadChats();

      // If the archived chat is currently open, start a new session
      if (chatIdToArchive === currentChatId) {
        startNewSessionChat();
      }
    } catch (error) {
      console.error("Error archiving chat:", error);
    }
  };

  return (
    <div className="h-full flex relative">
      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Chat List Sidebar */}
      {showChatList && (
        <div
          className={`
          ${
            isMobile
              ? `fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ${
                  isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : "relative"
          }
          w-80 bg-warm-sand/50 flex flex-col border border-soft-rose/20 rounded-l-lg
        `}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-soft-rose/20 flex items-center justify-between">
            <Button
              onClick={() => createNewChat()}
              className="flex-1 bg-coral hover:bg-coral/90 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva Conversación
            </Button>

            {/* Close button for mobile */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 p-2"
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Chats List */}
          <div className="flex-1 overflow-y-auto p-2">
            {loadingChats ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-coral" />
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center py-8 text-charcoal/60 text-sm">
                No hay conversaciones guardadas.
                <br />
                <span className="text-xs text-charcoal/50">
                  Las conversaciones se guardan después del primer intercambio
                  completo
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`group p-3 rounded-lg border cursor-pointer transition-colors ${
                      chat.id === currentChatId
                        ? "bg-coral/10 border-coral/30"
                        : "bg-white/60 border-soft-rose/20 hover:bg-white/80"
                    }`}
                    onClick={() => loadChat(chat.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-charcoal text-sm truncate">
                          {chat.title}
                        </h4>
                        <p className="text-xs text-charcoal/60 mt-1">
                          {chat.messageCount} mensajes
                        </p>
                        <p className="text-xs text-charcoal/50">
                          {new Date(chat.lastMessageAt).toLocaleDateString()}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveChat(chat.id);
                            }}
                          >
                            <Archive className="w-3 h-3 mr-2" />
                            Archivar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <Card
        className={`
        flex-1 flex flex-col bg-warm-sand border-soft-rose/20
        ${showChatList && !isMobile ? "rounded-l-none" : ""}
        ${showChatList && isMobile ? "rounded-none" : ""}
      `}
      >
        <CardHeader className="pb-3 border-b border-soft-rose/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Mobile hamburger menu */}
              {isMobile && showChatList && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 mr-2"
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <Menu className="w-4 h-4" />
                </Button>
              )}

              <Bot className="w-6 h-6 text-coral" />
              <div>
                <CardTitle className="text-xl font-medium">
                  Tu Asistente Nutricional con IA
                </CardTitle>
                <p className="text-sm text-charcoal/60 mt-1">
                  {currentChatId
                    ? "Conversación guardada automáticamente"
                    : "Modo sesión - se guardará después del primer intercambio"}
                </p>
              </div>
            </div>

            {!showChatList && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startNewSessionChat}
                  className="text-xs"
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Sesión
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => createNewChat()}
                  className="text-xs"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Nuevo
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-500 mt-2 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
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
                            <strong className="font-semibold">
                              {children}
                            </strong>
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

                          li: ({ children, ...props }) => (
                            <li
                              className="text-sm leading-relaxed flex items-start gap-2 mb-1"
                              {...props}
                            >
                              <span className="text-charcoal/60 font-medium min-w-[1.5rem]">
                                •
                              </span>
                              <span className="flex-1">{children}</span>
                            </li>
                          ),

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
                    <UserAvatar
                      src={user?.image}
                      name={user?.name}
                      size="sm"
                      className="flex-shrink-0 mt-1"
                    />
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

            <div ref={messagesEndRef} />
          </div>

          {/* Input Section */}
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
                  target.style.height =
                    Math.min(target.scrollHeight, 96) + "px";
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
    </div>
  );
}
