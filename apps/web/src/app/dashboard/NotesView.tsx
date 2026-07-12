'use client'

import React, { useState, useTransition } from 'react'
import type { Project, Task, Note } from '@forge/types'
import { Plus, Search, Calendar, Folder, CheckSquare, Trash2, Save, FileText, Eye, Edit3 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { createNote, updateNote, deleteNote } from './notes-actions'

interface NotesViewProps {
  workspaceId: string
  projects: Project[]
  tasks: Task[]
  notes: Note[]
}

export default function NotesView({
  workspaceId,
  projects,
  tasks,
  notes
}: NotesViewProps) {
  const [isPending, startTransition] = useTransition()
  
  // States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [editorTab, setEditorTab] = useState<'edit' | 'preview'>('edit')

  // Selected note form state
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteProjectId, setNoteProjectId] = useState('')
  const [noteTaskId, setNoteTaskId] = useState('')

  const selectedNote = notes.find(n => n.id === selectedNoteId)

  // Filter notes by search query
  const filteredNotes = notes.filter(note => {
    const titleMatch = note.title.toLowerCase().includes(searchQuery.toLowerCase())
    const contentMatch = note.content.toLowerCase().includes(searchQuery.toLowerCase())
    return titleMatch || contentMatch
  })

  // Select note handler
  const handleSelectNote = (note: Note) => {
    setSelectedNoteId(note.id)
    setNoteTitle(note.title)
    setNoteContent(note.content)
    setNoteProjectId(note.project_id || '')
    setNoteTaskId(note.task_id || '')
    setEditorTab('edit') // reset tab
  }

  // Create note handler
  const handleCreateNewNote = () => {
    startTransition(async () => {
      const res = await createNote(
        workspaceId,
        null,
        null,
        'Untitled Note',
        ''
      )
      if (res.success && res.note) {
        handleSelectNote(res.note)
      } else if (res.error) {
        alert(res.error)
      }
    })
  }

  // Save note handler
  const handleSaveNote = () => {
    if (!selectedNoteId) return

    startTransition(async () => {
      const res = await updateNote(
        selectedNoteId,
        noteTitle,
        noteContent,
        noteProjectId || null,
        noteTaskId || null
      )
      if (res.error) {
        alert(res.error)
      }
    })
  }

  // Delete note handler
  const handleDeleteNote = (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return

    startTransition(async () => {
      const res = await deleteNote(noteId)
      if (res.success) {
        if (selectedNoteId === noteId) {
          setSelectedNoteId(null)
        }
      } else if (res.error) {
        alert(res.error)
      }
    })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px', minHeight: '500px' }}>
      
      {/* Left Column: Search & Notes List */}
      <div style={{ borderRight: '1px solid var(--border-color)', paddingRight: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button onClick={handleCreateNewNote} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={isPending}>
          <Plus size={15} />
          <span>New Note</span>
        </button>

        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="form-input"
            style={{ width: '100%', paddingLeft: '32px' }}
          />
        </div>

        {/* Note Rows list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', maxHeight: '450px' }}>
          {filteredNotes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No notes found.
            </div>
          ) : (
            filteredNotes.map(note => {
              const noteProject = projects.find(p => p.id === note.project_id)
              return (
                <div 
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className="sidebar-item"
                  style={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '4px',
                    padding: '10px 12px',
                    backgroundColor: selectedNoteId === note.id ? 'var(--bg-active)' : 'transparent',
                    color: selectedNoteId === note.id ? 'var(--text-primary)' : 'var(--text-secondary)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                    <FileText size={14} style={{ flexShrink: 0 }} />
                    <span style={{ fontWeight: selectedNoteId === note.id ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                      {note.title || 'Untitled Note'}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                    {note.content ? note.content.substring(0, 40) + (note.content.length > 40 ? '...' : '') : 'No content'}
                  </span>

                  {noteProject && (
                    <span style={{ fontSize: '0.7rem', background: 'var(--tag-bg-low)', padding: '1px 6px', borderRadius: '3px', color: 'var(--tag-text-low)' }}>
                      📁 {noteProject.name}
                    </span>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right Column: Markdown Editor */}
      <div>
        {!selectedNoteId ? (
          <div className="empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderStyle: 'solid' }}>
            <FileText size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h4>Select a note or create a new one</h4>
            <p style={{ fontSize: '0.85rem' }}>Organize notes, documents, and key decisions.</p>
          </div>
        ) : (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header controls */}
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setEditorTab('edit')} 
                  className={`btn ${editorTab === 'edit' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px' }}
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => setEditorTab('preview')} 
                  className={`btn ${editorTab === 'preview' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 12px' }}
                >
                  <Eye size={13} />
                  <span>Preview</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleSaveNote} className="btn btn-primary" style={{ padding: '6px 12px' }} disabled={isPending}>
                  <Save size={13} />
                  <span>{isPending ? 'Saving...' : 'Save'}</span>
                </button>
                <button onClick={() => handleDeleteNote(selectedNoteId)} className="btn btn-danger" style={{ padding: '6px 12px' }} disabled={isPending}>
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Note Title */}
            <div className="form-group">
              <input 
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note Title"
                className="form-input"
                style={{ fontSize: '1.5rem', fontWeight: 600, border: 'none', borderBottom: '1px solid transparent', padding: '8px 0', borderRadius: 0 }}
              />
            </div>

            {/* Markdown Textarea or Live Preview */}
            {editorTab === 'edit' ? (
              <div className="form-group">
                <textarea 
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Start writing notes in markdown format..."
                  className="form-input"
                  style={{ minHeight: '300px', resize: 'vertical', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.6' }}
                />
              </div>
            ) : (
              <div 
                style={{ 
                  minHeight: '300px', 
                  padding: '16px 20px', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-sidebar)',
                  color: 'var(--text-primary)'
                }}
                className="markdown-body"
              >
                {noteContent ? (
                  <ReactMarkdown>{noteContent}</ReactMarkdown>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Note is empty.</p>
                )}
              </div>
            )}

            {/* Associations Footer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Folder size={12} />
                  <span>Link Project</span>
                </label>
                <select 
                  value={noteProjectId}
                  onChange={(e) => setNoteProjectId(e.target.value)}
                  className="form-select"
                >
                  <option value="">No linked project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckSquare size={12} />
                  <span>Link Task</span>
                </label>
                <select 
                  value={noteTaskId}
                  onChange={(e) => setNoteTaskId(e.target.value)}
                  className="form-select"
                >
                  <option value="">No linked task</option>
                  {tasks.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  )
}
