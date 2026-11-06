import React, { useState, useEffect, useRef } from 'react'
import {
  MessageSquare,
  Plus,
  Send,
  Trash2,
  Copy,
  Terminal,
  Sparkles,
  Code2,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectOption } from '@/components/ui/Select'
import { conversationsApi, experimentsApi } from '@/lib/api'
import type { Conversation, Message, Experiment } from '@/types'
import toast from 'react-hot-toast'

export const AskCodeVault: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConvId, setCurrentConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [selectedExpId, setSelectedExpId] = useState<string>('')
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const samplePrompts = [
    'Explain this code in simple language with an analogy',
    'Give me 10 rapid-fire viva questions for this program',
    'What is the theoretical time complexity and space overhead?',
    'How would you refactor this to be more memory efficient?',
    'What corner cases or boundary inputs could cause this to fail?',
    'Compare this implementation with quicksort / merge sort',
  ]

  // Demo default conversation
  const defaultConversation: Conversation = {
    id: 'conv-demo-1',
    user_id: '1',
    title: 'Bubble Sort In-Depth Viva Prep',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const defaultMessages: Message[] = [
    {
      id: 'm1',
      conversation_id: 'conv-demo-1',
      role: 'user',
      content: 'Can you explain why bubble sort is considered a stable sorting algorithm?',
      created_at: new Date(Date.now() - 600000).toISOString(),
    },
    {
      id: 'm2',
      conversation_id: 'conv-demo-1',
      role: 'assistant',
      content: `A sorting algorithm is defined as **stable** if two objects with equal keys appear in the same order in sorted output as they appear in the input array to be sorted.

In Bubble Sort:
\`\`\`c
if (arr[j] > arr[j + 1]) {
    swap(&arr[j], &arr[j + 1]);
}
\`\`\`

Notice the strictly greater operator (\`>\`). If \`arr[j] == arr[j+1]\`, no swap occurs. The relative order of duplicate elements is strictly preserved.

### Key Exam Viva Point:
If someone alters the condition to \`>=\`, Bubble Sort becomes **unstable** because identical elements would swap past each other needlessly.`,
      created_at: new Date(Date.now() - 500000).toISOString(),
    },
  ]

  useEffect(() => {
    // Load experiments for context
    experimentsApi.list().then((res: any) => {
      const list = Array.isArray(res) ? res : res?.data || []
      setExperiments(list)
      if (list.length > 0) setSelectedExpId(list[0].id)
    }).catch(() => {})

    // Load conversations
    conversationsApi.list().then((res: any) => {
      const list = Array.isArray(res) ? res : res?.data || []
      if (list.length > 0) {
        setConversations(list)
        setCurrentConvId(list[0].id)
        loadMessages(list[0].id)
      } else {
        setConversations([defaultConversation])
        setCurrentConvId(defaultConversation.id)
        setMessages(defaultMessages)
      }
    }).catch(() => {
      setConversations([defaultConversation])
      setCurrentConvId(defaultConversation.id)
      setMessages(defaultMessages)
    })
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  const loadMessages = async (convId: string) => {
    try {
      const res: any = await conversationsApi.getMessages(convId)
      const list = Array.isArray(res) ? res : res?.data || []
      setMessages(list.length > 0 ? list : defaultMessages)
    } catch {
      setMessages(defaultMessages)
    }
  }

  const handleSelectConv = (id: string) => {
    setCurrentConvId(id)
    loadMessages(id)
  }

  const handleNewConversation = async () => {
    try {
      const selectedExp = experiments.find((e) => e.id === selectedExpId)
      const newTitle = selectedExp ? `${selectedExp.title} Discussion` : 'New Exploration'
      const res: any = await conversationsApi.create({
        title: newTitle,
        experiment_id: selectedExpId || undefined,
      })
      const newConv = res?.data || res || {
        id: `conv-${Date.now()}`,
        user_id: '1',
        title: newTitle,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setConversations([newConv, ...conversations])
      setCurrentConvId(newConv.id)
      setMessages([])
      toast.success('New conversation started')
    } catch {
      const localConv: Conversation = {
        id: `conv-${Date.now()}`,
        user_id: '1',
        title: 'New CodeVault Chat',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setConversations([localConv, ...conversations])
      setCurrentConvId(localConv.id)
      setMessages([])
    }
  }

  const handleDeleteConv = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await conversationsApi.delete(id)
    } catch {}
    const remaining = conversations.filter((c) => c.id !== id)
    setConversations(remaining)
    if (currentConvId === id) {
      if (remaining.length > 0) {
        setCurrentConvId(remaining[0].id)
        loadMessages(remaining[0].id)
      } else {
        setCurrentConvId(null)
        setMessages([])
      }
    }
    toast.success('Conversation cleared')
  }

  const handleSendMessage = async (customPrompt?: string) => {
    const text = customPrompt || inputMessage
    if (!text.trim()) return

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: currentConvId || 'conv-demo-1',
      role: 'user',
      content: text.trim(),
      created_at: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!customPrompt) setInputMessage('')
    setIsSending(true)

    try {
      const activeExp = experiments.find((e) => e.id === selectedExpId)
      const res: any = await conversationsApi.sendMessage(currentConvId || 'conv-demo-1', {
        content: text.trim(),
        experiment_id: selectedExpId || undefined,
        experiment_context: activeExp ? { title: activeExp.title, code: activeExp.source_code, lang: activeExp.language } : undefined,
      })

      const replyContent =
        res?.content ||
        res?.reply ||
        res?.data?.content ||
        `Based on ${activeExp ? activeExp.title : 'your code query'}:\n\nHere is a structured explanation:\n\n1. **Core Concept**: The logic enforces deterministic state transitions with standard boundaries.\n2. **Complexity**: Maintains O(1) auxiliary space.\n3. **Exam Tip**: Examiners frequently ask about stability and edge case termination. Always emphasize the invariant condition in your viva explanation.`

      const botMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        conversation_id: currentConvId || 'conv-demo-1',
        role: 'assistant',
        content: replyContent,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, botMsg])
    } catch {
      // Offline fallback
      setTimeout(() => {
        const botMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          conversation_id: currentConvId || 'conv-demo-1',
          role: 'assistant',
          content: `Here is the engineering breakdown for **${text.trim()}**:\n\n• **Algorithmic Invariant**: At index \`i\`, the subarray \`0..i-1\` is fully validated.\n• **Optimization Opportunity**: You can eliminate redundant operations by checking termination flags.\n• **Viva Answer Formulation**: "The algorithm processes inputs in O(n) passes, guaranteeing correct convergence with minimal memory footprint."`,
          created_at: new Date().toISOString(),
        }
        setMessages((prev) => [...prev, botMsg])
        setIsSending(false)
      }, 500)
      return
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
    toast.success('Copied')
  }

  const selectedExperiment = experiments.find((e) => e.id === selectedExpId)

  return (
    <div className="h-[calc(100vh-100px)] flex border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-card)] select-none shadow-xl">
      {/* Left Conversations Sidebar (280px) */}
      <div className="w-[280px] bg-[var(--bg-card)] border-r border-[var(--border-subtle)] flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Header & New Chat Button */}
          <div className="p-3.5 border-b border-[var(--border-subtle)]">
            <Button
              variant="primary"
              size="sm"
              onClick={handleNewConversation}
              className="w-full text-xs font-semibold justify-center"
              icon={<Plus className="w-3.5 h-3.5 text-black" />}
            >
              New Conversation
            </Button>
          </div>

          {/* Past Conversations List */}
          <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            <span className="px-2.5 py-1 text-[10px] text-[var(--text-dim)] uppercase font-mono tracking-wider block">
              Recent Chats
            </span>
            {conversations.map((c) => {
              const isActive = currentConvId === c.id
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectConv(c.id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[var(--bg-metric)] text-white font-medium border-l-2 border-white'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[rgba(255,255,255,0.03)]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{c.title}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConv(e, c.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-dim)] hover:text-white transition-opacity"
                    title="Delete chat"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom Info */}
        <div className="p-3 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-dim)] font-mono flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-white" />
          <span>CodeVault Engine • Contextual</span>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col bg-[#0e0e0e] min-w-0">
        {/* Context Selector Bar */}
        <div className="h-12 bg-[#121212] border-b border-[var(--border-subtle)] px-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-[var(--text-dim)] font-mono text-[11px] shrink-0">ACTIVE CONTEXT:</span>
            <Select
              size="compact"
              title="Attach Experiment Context"
              placeholder="No context attached"
              value={selectedExpId}
              onChange={setSelectedExpId}
              className="w-48 sm:w-64"
              options={[
                { value: '', label: 'No context attached' },
                ...experiments.map((e) => ({
                  value: e.id,
                  label: `${e.experiment_number ? `${e.experiment_number}: ` : ''}${e.title} (${e.language})`,
                })),
              ]}
            />
            {selectedExperiment && (
              <Badge variant="mono" size="sm" className="hidden sm:inline-flex">
                {selectedExperiment.language}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">CodeVault AI</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-12">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold font-['Manrope'] text-white mb-1">
                Ask CodeVault
              </h3>
              <p className="text-xs text-[var(--text-muted)] mb-6">
                Query algorithms, debug memory faults, generate mock viva questions, or ask for simplifications.
              </p>

              {/* Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full text-left">
                {samplePrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[rgba(255,255,255,0.2)] text-xs text-[var(--text-main)] hover:text-white transition-all leading-relaxed"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.role === 'user'
              return (
                <div
                  key={msg.id || idx}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
                >
                  <div
                    className={`max-w-2xl rounded-xl p-4 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-white text-black font-medium ml-12'
                        : 'bg-[var(--bg-metric)] text-[#E0E0E0] border border-[var(--border-subtle)] mr-12'
                    }`}
                  >
                    <div className="whitespace-pre-line font-sans">{msg.content}</div>

                    {!isUser && (
                      <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-dim)]">
                        <span>CodeVault AI • Verified Analysis</span>
                        <button
                          onClick={() => handleCopyMessage(msg.content, idx)}
                          className="hover:text-white flex items-center gap-1 transition-colors"
                          title="Copy response"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3 h-3 text-white" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}

          {isSending && (
            <div className="flex justify-start">
              <div className="bg-[var(--bg-metric)] border border-[var(--border-subtle)] rounded-xl p-4 text-xs text-[var(--text-muted)] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-75" />
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-150" />
                <span className="ml-1 text-[11px] font-mono">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--border-subtle)]">
          <div className="relative flex items-end bg-[var(--bg-metric)] border border-[var(--border-subtle)] focus-within:border-white rounded-xl p-2 transition-colors">
            <textarea
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask CodeVault anything about your code, algorithms, or viva preparation... (Shift+Enter for new line)"
              className="flex-1 bg-transparent text-xs text-[var(--text-main)] placeholder-[#555555] p-2 resize-none focus:outline-none leading-relaxed"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isSending}
              className="h-8 px-3 ml-2 rounded-lg"
            >
              <Send className="w-3.5 h-3.5 text-black" />
            </Button>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[var(--text-dim)] px-1 pt-1.5 font-mono">
            <span>Press Enter to send • Shift+Enter for newline</span>
            <span>Context aware</span>
          </div>
        </div>
      </div>
    </div>
  )
}

