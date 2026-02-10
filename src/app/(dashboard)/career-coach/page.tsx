'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppStore } from '@/store/app-store'
import { isAnnual } from '@/lib/plan-helpers'
import { AnnualUpgradePrompt } from '@/components/ui/annual-upgrade-prompt'
import { ChatMessage } from '@/components/career-coach/chat-message'
import { ChatInput } from '@/components/career-coach/chat-input'
import { ConversationList } from '@/components/career-coach/conversation-list'
import { GraduationCap } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Conversation {
  id: string
  title: string
  updated_at: string
}

export default function CareerCoachPage() {
  const { profile } = useAppStore()
  const userIsAnnual = isAnnual(profile)

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingContent, scrollToBottom])

  // Load conversations on mount
  useEffect(() => {
    if (!userIsAnnual) return
    loadConversations()
  }, [userIsAnnual])

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/ai/career-coach/conversations')
      const data = await res.json()
      if (data.conversations) {
        setConversations(data.conversations)
      }
    } catch {
      // silently fail
    }
  }

  const loadConversation = async (id: string) => {
    try {
      const res = await fetch(`/api/ai/career-coach/conversations/${id}`)
      const data = await res.json()
      if (data.conversation) {
        setActiveConvId(id)
        setMessages((data.conversation.messages as Message[]) || [])
      }
    } catch {
      // silently fail
    }
  }

  const handleNewChat = () => {
    setActiveConvId(null)
    setMessages([])
    setStreamingContent('')
  }

  const handleDeleteConversation = async (id: string) => {
    try {
      await fetch(`/api/ai/career-coach/conversations/${id}`, { method: 'DELETE' })
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (activeConvId === id) {
        handleNewChat()
      }
    } catch {
      // silently fail
    }
  }

  const handleSend = async (message: string) => {
    setIsStreaming(true)
    setStreamingContent('')

    // Optimistically add user message
    const newMessages = [...messages, { role: 'user' as const, content: message }]
    setMessages(newMessages)

    try {
      const res = await fetch('/api/ai/career-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationId: activeConvId || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to send message')
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const jsonStr = line.slice(6)

          try {
            const event = JSON.parse(jsonStr)

            if (event.type === 'text') {
              fullContent += event.content
              setStreamingContent(fullContent)
            } else if (event.type === 'done') {
              // Set the conversation ID (for new conversations)
              if (event.conversationId) {
                setActiveConvId(event.conversationId)
              }
            } else if (event.type === 'error') {
              throw new Error(event.content)
            }
          } catch (parseErr) {
            // Skip malformed JSON lines
            if (parseErr instanceof SyntaxError) continue
            throw parseErr
          }
        }
      }

      // Add assistant message to state
      if (fullContent) {
        setMessages((prev) => [...prev, { role: 'assistant', content: fullContent }])
      }
      setStreamingContent('')

      // Refresh conversation list
      loadConversations()
    } catch (err) {
      console.error('Career Coach error:', err)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
      setStreamingContent('')
    } finally {
      setIsStreaming(false)
    }
  }

  if (!userIsAnnual) {
    return (
      <div className="max-w-lg mx-auto py-12">
        <AnnualUpgradePrompt
          feature="Career Coach"
          description="Get personalized career advice from an experienced coach. Covers resume strategy, interview prep, salary negotiation, career transitions, and more."
        />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6">
      {/* Sidebar - conversation list */}
      <div className="w-64 border-r border-gray-200 bg-gray-50 hidden lg:block">
        <ConversationList
          conversations={conversations}
          activeId={activeConvId}
          onSelect={loadConversation}
          onNew={handleNewChat}
          onDelete={handleDeleteConversation}
        />
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-amber-700" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Career Coach</h1>
              <p className="text-xs text-gray-500">Your personal career advisor</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 && !isStreaming && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <GraduationCap className="h-12 w-12 text-amber-200 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 mb-2">How can I help you today?</h2>
              <p className="text-sm text-gray-500 max-w-md mb-6">
                I can help with resume strategy, interview preparation, career transitions, salary negotiation, and more.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
                {[
                  'How should I prepare for a behavioral interview?',
                  'What salary should I negotiate for a senior role?',
                  'How do I transition from engineering to product management?',
                  'Review my career trajectory and suggest next steps',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="text-left text-sm text-gray-600 p-3 rounded-xl border border-gray-200 hover:border-brand hover:bg-brand/5 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}

          {isStreaming && streamingContent && (
            <ChatMessage role="assistant" content={streamingContent} isStreaming />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} isStreaming={isStreaming} />
      </div>
    </div>
  )
}
