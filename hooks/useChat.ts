import { useState, useCallback } from 'react'

interface Chat {
  id: string
  title: string
  lastMessageAt: string
  messageCount: number
  lastMessage?: string
}

export function useChat() {
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [loading, setLoading] = useState(false)

  const loadChats = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/chats')
      if (response.ok) {
        const data = await response.json()
        setChats(data.chats || [])
      }
    } catch (error) {
      console.error('Error loading chats:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const createChat = useCallback(async (title?: string) => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title || 'Nueva conversación'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        await loadChats() // Refresh the list
        return data.chat.id
      }
    } catch (error) {
      console.error('Error creating chat:', error)
    }
    return null
  }, [loadChats])

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadChats() // Refresh the list
        if (currentChatId === chatId) {
          setCurrentChatId(null)
        }
        return true
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
    return false
  }, [currentChatId, loadChats])

  const archiveChat = useCallback(async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'archived'
        }),
      })

      if (response.ok) {
        await loadChats() // Refresh the list
        if (currentChatId === chatId) {
          setCurrentChatId(null)
        }
        return true
      }
    } catch (error) {
      console.error('Error archiving chat:', error)
    }
    return false
  }, [currentChatId, loadChats])

  return {
    currentChatId,
    setCurrentChatId,
    chats,
    loading,
    loadChats,
    createChat,
    deleteChat,
    archiveChat,
  }
} 