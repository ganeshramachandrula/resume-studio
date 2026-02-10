'use client'

import { Plus, MessageCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Conversation {
  id: string
  title: string
  updated_at: string
}

interface ConversationListProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}

export function ConversationList({ conversations, activeId, onSelect, onNew, onDelete }: ConversationListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3">
        <Button onClick={onNew} variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4" /> New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {conversations.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-8 px-2">
            No conversations yet. Start a new chat to get career advice.
          </p>
        )}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={cn(
              'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors',
              activeId === conv.id
                ? 'bg-brand/10 text-brand'
                : 'text-gray-600 hover:bg-gray-100'
            )}
            onClick={() => onSelect(conv.id)}
          >
            <MessageCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-sm truncate">{conv.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(conv.id)
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-opacity"
            >
              <Trash2 className="h-3 w-3 text-gray-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
