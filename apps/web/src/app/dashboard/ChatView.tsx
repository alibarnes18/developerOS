'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import ReactMarkdown from 'react-markdown'
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react'

export default function ChatView({ workspaceId }: { workspaceId: string }) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: `/api/v1/workspaces/${workspaceId}/ai/chat`
    }),
    onError: (err) => {
      console.error('Chat error:', err)
    }
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }} className="animate-fade-in">
      {/* Header Title Section */}
      <div>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '2.2rem' }}>
          🤖 Workspace AI Chat
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Ask questions about your tasks, projects, and notes in this workspace.
        </p>
      </div>

      {/* Main Chat Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-panel, #1A1D26)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {messages.length === 0 ? (
            <div className="empty-state" style={{ margin: 'auto', border: 'none', backgroundColor: 'transparent' }}>
              <Bot size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Hi! I'm your workspace AI.</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
                I can help you prioritize tasks, summarize meeting notes, and find information across this workspace.
              </p>
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id} style={{
                display: 'flex',
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                gap: '16px',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  backgroundColor: m.role === 'user' ? 'var(--bg-hover)' : 'var(--accent-forge, #FF6B35)',
                  color: m.role === 'user' ? 'var(--text-primary)' : '#FFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {m.role === 'user' ? <UserIcon size={18} /> : <Bot size={18} />}
                </div>
                
                <div style={{
                  backgroundColor: m.role === 'user' ? 'var(--bg-hover)' : 'transparent',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border-color)',
                  padding: '16px',
                  borderRadius: '12px',
                  borderTopRightRadius: m.role === 'user' ? '4px' : '12px',
                  borderTopLeftRadius: m.role === 'user' ? '12px' : '4px',
                  maxWidth: '80%',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-inter, Inter, sans-serif)'
                }} className={m.role === 'assistant' ? 'markdown-body' : ''}>
                  {m.role === 'assistant' ? (
                    <ReactMarkdown>{m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n')}</ReactMarkdown>
                  ) : (
                    m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('\n')
                  )}
                </div>
              </div>
            ))
          )}
          
          {isLoading && (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                backgroundColor: 'var(--accent-forge, #FF6B35)',
                color: '#FFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <Bot size={18} />
              </div>
              <div style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div style={{ color: 'var(--tag-text-high)', fontSize: '0.9rem', padding: '16px', backgroundColor: 'var(--tag-bg-high)', borderRadius: '8px' }}>
              Error: {error.message}
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-base)'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px' }}>
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about your workspace..."
              style={{
                flex: 1,
                padding: '14px 20px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-panel, #1A1D26)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              style={{
                width: '52px', height: '52px',
                borderRadius: '8px',
                backgroundColor: input.trim() && !isLoading ? 'var(--accent-forge, #FF6B35)' : 'var(--bg-hover)',
                color: input.trim() && !isLoading ? '#FFF' : 'var(--text-muted)',
                border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: input.trim() && !isLoading ? 'pointer' : 'default',
                transition: 'background-color 0.2s'
              }}
            >
              <Send size={20} style={{ transform: 'translateX(2px)' }} />
            </button>
          </form>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .markdown-body p:last-child { margin-bottom: 0; }
        .markdown-body p:first-child { margin-top: 0; }
        .markdown-body ul, .markdown-body ol { padding-left: 20px; margin-top: 8px; margin-bottom: 8px; }
        .markdown-body li { margin-bottom: 4px; }
      `}</style>
    </div>
  )
}
