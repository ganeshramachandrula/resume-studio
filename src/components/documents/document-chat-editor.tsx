'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Send, Undo2, Save, Bot, User } from 'lucide-react'
import { DOCUMENT_TYPE_LABELS } from '@/lib/constants'
import type { DocumentType } from '@/types/database'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface DocumentChatEditorProps {
  documentId: string
  documentType: DocumentType
  initialContent: Record<string, unknown>
  onSave: (content: Record<string, unknown>) => Promise<void>
}

function DocumentPreviewPanel({ content, documentType }: { content: Record<string, unknown>; documentType: string }) {
  // Generic JSON-based preview for any document type
  return (
    <div className="text-sm space-y-3 max-h-[600px] overflow-y-auto">
      {Object.entries(content).map(([key, value]) => {
        if (typeof value === 'string') {
          return (
            <div key={key}>
              <p className="text-xs text-gray-500 mb-0.5">{key.replace(/_/g, ' ')}</p>
              <p className="text-gray-700 whitespace-pre-wrap">{value}</p>
            </div>
          )
        }
        if (Array.isArray(value)) {
          return (
            <div key={key}>
              <p className="text-xs text-gray-500 mb-1">{key.replace(/_/g, ' ')}</p>
              {value.map((item, i) => (
                <div key={i} className="ml-2 mb-1 text-gray-700 text-sm">
                  {typeof item === 'string' ? (
                    <p className="pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-brand">{item}</p>
                  ) : typeof item === 'object' && item !== null ? (
                    <div className="p-2 bg-gray-50 rounded-lg mb-1">
                      {Object.entries(item as Record<string, unknown>).map(([k, v]) => (
                        <p key={k} className="text-xs"><span className="text-gray-500">{k.replace(/_/g, ' ')}:</span> {String(v)}</p>
                      ))}
                    </div>
                  ) : (
                    <p>{String(item)}</p>
                  )}
                </div>
              ))}
            </div>
          )
        }
        if (typeof value === 'object' && value !== null) {
          return (
            <div key={key}>
              <p className="text-xs text-gray-500 mb-1 font-medium">{key.replace(/_/g, ' ')}</p>
              <div className="ml-2 p-2 bg-gray-50 rounded-lg">
                {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
                  <p key={k} className="text-xs mb-0.5">
                    <span className="text-gray-500">{k.replace(/_/g, ' ')}:</span>{' '}
                    <span className="text-gray-700">{Array.isArray(v) ? (v as string[]).join(', ') : String(v)}</span>
                  </p>
                ))}
              </div>
            </div>
          )
        }
        if (typeof value === 'number') {
          return (
            <div key={key}>
              <p className="text-xs text-gray-500 mb-0.5">{key.replace(/_/g, ' ')}</p>
              <p className="text-gray-700 font-medium">{value}</p>
            </div>
          )
        }
        return null
      })}
    </div>
  )
}

export function DocumentChatEditor({ documentId, documentType, initialContent, onSave }: DocumentChatEditorProps) {
  const [content, setContent] = useState<Record<string, unknown>>(initialContent)
  const [history, setHistory] = useState<Record<string, unknown>[]>([initialContent])
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `I can help you refine this ${DOCUMENT_TYPE_LABELS[documentType] || documentType}. Tell me what you'd like to change — for example:\n\n- "Make the summary more concise"\n- "Add more metrics to the experience bullets"\n- "Change the tone to be more confident"\n- "Fix the greeting to address Sarah Chen"`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async () => {
    if (!input.trim() || loading) return
    const instruction = input.trim()
    setInput('')

    const userMsg: ChatMessage = { role: 'user', content: instruction, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/api/ai/document-editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId,
          documentType,
          currentContent: content,
          instruction,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Edit failed')

      const updatedContent = data.content as Record<string, unknown>
      setContent(updatedContent)
      setHistory((prev) => [...prev, updatedContent])
      setHasChanges(true)

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: "Done! I've updated the document. You can see the changes in the preview on the right. Want to make any other adjustments?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err: unknown) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `Sorry, I couldn't apply that edit: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
    }
    setLoading(false)
  }

  const handleUndo = () => {
    if (history.length <= 1) return
    const newHistory = history.slice(0, -1)
    setHistory(newHistory)
    setContent(newHistory[newHistory.length - 1])
    setHasChanges(newHistory.length > 1)
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: 'Undone! Reverted to previous version.', timestamp: new Date() },
    ])
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(content)
      setHasChanges(false)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Document saved successfully!', timestamp: new Date() },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Failed to save. Please try again.', timestamp: new Date() },
      ])
    }
    setSaving(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Chat panel */}
      <div className="flex flex-col border rounded-xl overflow-hidden bg-white">
        <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">AI Editor</h3>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleUndo}
              disabled={history.length <= 1 || loading}
              className="h-7 text-xs"
            >
              <Undo2 className="h-3 w-3" /> Undo
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="h-7 text-xs"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
              Save
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[500px]">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="h-6 w-6 rounded-full bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-brand" />
                </div>
              )}
              <div
                className={`rounded-xl px-3 py-2 text-sm max-w-[85%] whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-brand text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2">
              <div className="h-6 w-6 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5 text-brand" />
              </div>
              <div className="bg-gray-100 rounded-xl px-3 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Tell me what to change..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={handleSubmit} disabled={!input.trim() || loading} size="sm">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Document preview panel */}
      <div className="border rounded-xl overflow-hidden bg-white">
        <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">
            {DOCUMENT_TYPE_LABELS[documentType] || documentType} Preview
          </h3>
          {hasChanges && (
            <Badge variant="secondary" className="text-xs">Unsaved changes</Badge>
          )}
        </div>
        <div className="p-4 overflow-y-auto max-h-[600px]">
          <DocumentPreviewPanel content={content} documentType={documentType} />
        </div>
      </div>
    </div>
  )
}
