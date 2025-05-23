"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Send, Bot, User } from "lucide-react"

export default function NutritionChatbot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello Jane! I'm your NutriGuide assistant. How can I help you today with your nutrition goals?",
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [input, setInput] = useState("")

  const handleSendMessage = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages([...messages, userMessage])
    setInput("")

    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponses = [
        "Based on Dr. Rebecca's recommendations, try adding more leafy greens to your lunch today. How about a spinach salad with your protein?",
        "I notice you've been having trouble sleeping. Dr. Rebecca suggests having a cup of chamomile tea before bed and avoiding screens for an hour before sleep.",
        "Great job on staying hydrated yesterday! Remember Dr. Rebecca's advice to include a source of protein with each meal to help maintain stable energy levels.",
        "For your afternoon snack, Dr. Rebecca recommends something with both protein and healthy fats. How about some Greek yogurt with a few almonds?",
      ]

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]

      const assistantMessage = {
        role: "assistant",
        content: randomResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setMessages((prevMessages) => [...prevMessages, assistantMessage])
    }, 1000)
  }

  return (
    <Card className="h-full flex flex-col bg-warm-sand border-soft-rose/20">
      <CardHeader className="pb-3 border-b border-soft-rose/10">
        <CardTitle className="text-lg font-medium flex items-center gap-2">Your Nutrition Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-coral text-mist-white rounded-tr-none"
                    : "bg-sage-green/20 text-charcoal rounded-tl-none"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1 text-right">{message.timestamp}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-soft-rose/10 mt-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask your nutrition question..."
              className="flex-1 px-4 py-2 rounded-full bg-mist-white border border-soft-rose/20 focus:outline-none focus:ring-2 focus:ring-soft-rose/50 text-charcoal"
            />
            <Button
              onClick={handleSendMessage}
              className="rounded-full bg-coral hover:bg-coral/90 text-mist-white"
              size="icon"
            >
              <Send size={18} />
            </Button>
          </div>
          <p className="text-xs text-charcoal/60 mt-2 text-center">Guidance based on Dr. Rebecca's recommendations</p>
        </div>
      </CardContent>
    </Card>
  )
}
