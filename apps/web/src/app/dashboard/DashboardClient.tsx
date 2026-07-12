'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { Workspace, Project, Task, TaskStatus, TaskPriority, Note } from '@forge/types'
import { 
  LogOut, 
  Folder, 
  Plus, 
  CheckSquare, 
  Layers, 
  AlertCircle, 
  Calendar, 
  Edit2, 
  Trash2, 
  Briefcase,
  X,
  Check,
  FileText,
  Zap
} from 'lucide-react'
import { logout } from '../login/actions'
import { 
  createWorkspace, 
  createProject, 
  createTask, 
  updateTask, 
  deleteTask 
} from './actions'
import { createNote } from './notes-actions'
import NotesView from './NotesView'

interface DashboardClientProps {
  user: User
  initialWorkspaces: Workspace[]
  initialProjects: Project[]
  initialTasks: Task[]
  initialNotes: Note[]
}

export default function DashboardClient({
  user,
  initialWorkspaces,
  initialProjects,
  initialTasks,
  initialNotes
}: DashboardClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // State
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(
    initialWorkspaces[0]?.id || ''
  )
  const [currentView, setCurrentView] = useState<'tasks' | 'notes'>('tasks')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all') // 'all' or specific projectId
  
  // Modals
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showQuickNoteModal, setShowQuickNoteModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Form states
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  
  // Task form state
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDesc, setTaskDesc] = useState('')
  const [taskProjId, setTaskProjId] = useState('')
  const [taskStatus, setTaskStatus] = useState<TaskStatus>('todo')
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium')
  const [taskDueDate, setTaskDueDate] = useState('')

  // Quick note form state
  const [quickNoteTitle, setQuickNoteTitle] = useState('')
  const [quickNoteContent, setQuickNoteContent] = useState('')

  const activeWorkspace = initialWorkspaces.find(w => w.id === activeWorkspaceId)
  const activeProjects = initialProjects.filter(p => p.workspace_id === activeWorkspaceId)
  const activeTasks = initialTasks.filter(t => t.workspace_id === activeWorkspaceId)
  const activeNotes = initialNotes.filter(n => n.workspace_id === activeWorkspaceId)

  // Filtering tasks by selected project
  const filteredTasks = selectedProjectId === 'all'
    ? activeTasks
    : activeTasks.filter(t => t.project_id === selectedProjectId)

  // Handlers
  const handleLogout = async () => {
    await logout()
  }

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWorkspaceName.trim()) return

    startTransition(async () => {
      const res = await createWorkspace(newWorkspaceName)
      if (res.success && res.workspace) {
        setNewWorkspaceName('')
        setShowWorkspaceModal(false)
        setActiveWorkspaceId(res.workspace.id)
        setSelectedProjectId('all')
      } else if (res.error) {
        alert(res.error)
      }
    })
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProjectName.trim() || !activeWorkspaceId) return

    startTransition(async () => {
      const res = await createProject(activeWorkspaceId, newProjectName, newProjectDesc)
      if (res.success) {
        setNewProjectName('')
        setNewProjectDesc('')
        setShowProjectModal(false)
      } else if (res.error) {
        alert(res.error)
      }
    })
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim() || !activeWorkspaceId) return

    startTransition(async () => {
      const res = await createTask(
        activeWorkspaceId,
        taskProjId || null,
        taskTitle,
        taskDesc,
        taskStatus,
        taskPriority,
        taskDueDate || null
      )
      if (res.success) {
        resetTaskForm()
        setShowTaskModal(false)
      } else if (res.error) {
        alert(res.error)
      }
    })
  }

  const handleCreateQuickNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quickNoteTitle.trim() || !activeWorkspaceId) return

    startTransition(async () => {
      const res = await createNote(
        activeWorkspaceId,
        null,
        null,
        quickNoteTitle,
        quickNoteContent
      )
      if (res.success) {
        setQuickNoteTitle('')
        setQuickNoteContent('')
        setShowQuickNoteModal(false)
        setCurrentView('notes') // switch to notes view immediately
      } else if (res.error) {
        alert(res.error)
      }
    })
  }

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask || !editingTask.title.trim()) return

    startTransition(async () => {
      const res = await updateTask(
        editingTask.id,
        editingTask.title,
        editingTask.description || '',
        editingTask.status,
        editingTask.priority,
        editingTask.due_date || null
      )
      if (res.success) {
        setEditingTask(null)
      } else if (res.error) {
        alert(res.error)
      }
    })
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    startTransition(async () => {
      const res = await deleteTask(taskId)
      if (res.error) {
        alert(res.error)
      }
    })
  }

  const handleQuickStatusCycle = async (task: Task) => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      'todo': 'in_progress',
      'in_progress': 'done',
      'done': 'todo'
    }
    const updated = nextStatus[task.status]
    startTransition(async () => {
      await updateTask(task.id, task.title, task.description || '', updated, task.priority, task.due_date)
    })
  }

  const resetTaskForm = () => {
    setTaskTitle('')
    setTaskDesc('')
    setTaskProjId('')
    setTaskStatus('todo')
    setTaskPriority('medium')
    setTaskDueDate('')
  }

  const openEditTask = (task: Task) => {
    setEditingTask(task)
  }

  // Dashboard Stats Calculations
  const totalTasksCount = activeTasks.length
  const pendingTasksCount = activeTasks.filter(t => t.status !== 'done').length
  const completedTasksCount = activeTasks.filter(t => t.status === 'done').length

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px' }}>
          <Briefcase size={18} style={{ color: 'var(--accent-primary)' }} />
          <div className="auth-logo" style={{ fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => router.push('/')}>
            Forge
          </div>
        </div>

        {/* Workspace List & Switcher */}
        <div style={{ padding: '0 4px' }}>
          <div className="flex-between" style={{ padding: '0 10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Workspaces
            </span>
            <button 
              onClick={() => setShowWorkspaceModal(true)} 
              className="btn" 
              style={{ padding: '2px 4px', border: 'none' }}
            >
              <Plus size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {initialWorkspaces.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0 10px' }}>No workspaces. Create one.</p>
            ) : (
              initialWorkspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspaceId(ws.id)
                    setSelectedProjectId('all')
                  }}
                  className={`sidebar-item ${activeWorkspaceId === ws.id ? 'active' : ''}`}
                >
                  <Briefcase size={15} style={{ opacity: activeWorkspaceId === ws.id ? 1 : 0.7 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ws.name}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Workspace Navigation Views */}
        {activeWorkspaceId && (
          <div style={{ padding: '0 4px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                onClick={() => setCurrentView('tasks')}
                className={`sidebar-item ${currentView === 'tasks' ? 'active' : ''}`}
              >
                <CheckSquare size={15} />
                <span>Tasks</span>
              </button>
              <button
                onClick={() => setCurrentView('notes')}
                className={`sidebar-item ${currentView === 'notes' ? 'active' : ''}`}
              >
                <FileText size={15} />
                <span>Notes ({activeNotes.length})</span>
              </button>

              <button 
                onClick={() => setShowQuickNoteModal(true)} 
                className="sidebar-item"
                style={{ marginTop: '8px', border: '1px dashed var(--border-color)', justifyContent: 'center', gap: '6px' }}
              >
                <Zap size={14} style={{ color: 'var(--tag-text-medium)' }} />
                <span>Quick Note</span>
              </button>
            </div>
          </div>
        )}

        {/* Sidebar Nav (Projects filtering - only shown on Tasks View) */}
        {activeWorkspaceId && currentView === 'tasks' && (
          <div style={{ padding: '0 4px' }}>
            <div className="flex-between" style={{ padding: '0 10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Projects
              </span>
              <button 
                onClick={() => setShowProjectModal(true)} 
                className="btn" 
                style={{ padding: '2px 4px', border: 'none' }}
              >
                <Plus size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                onClick={() => setSelectedProjectId('all')}
                className={`sidebar-item ${selectedProjectId === 'all' ? 'active' : ''}`}
              >
                <Layers size={15} />
                <span>All Projects</span>
              </button>

              {activeProjects.map(proj => (
                <button
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`sidebar-item ${selectedProjectId === proj.id ? 'active' : ''}`}
                >
                  <Folder size={15} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {proj.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer info & Logout */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', paddingLeft: '12px', paddingRight: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Developer mode
            </span>
          </div>

          <button onClick={handleLogout} className="sidebar-item" style={{ color: 'var(--tag-text-high)', marginTop: '8px' }}>
            <LogOut size={15} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-layout">
        {/* Top Navbar */}
        <header className="top-nav">
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 500 }}>
              {activeWorkspace ? activeWorkspace.name : 'No Active Workspace'}
            </h4>
          </div>

          {activeWorkspaceId && currentView === 'tasks' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowTaskModal(true)} className="btn btn-primary">
                <Plus size={14} />
                <span>New Task</span>
              </button>
            </div>
          )}
        </header>

        {/* Inner Content Container */}
        <div className="content-container animate-fade-in">
          {!activeWorkspaceId ? (
            <div className="empty-state">
              <AlertCircle size={40} style={{ color: 'var(--text-secondary)', marginBottom: '12px' }} />
              <h3>No workspace created yet</h3>
              <p>Create your first workspace to start organizing your projects and tasks.</p>
              <button onClick={() => setShowWorkspaceModal(true)} className="btn btn-primary">
                <Plus size={14} />
                <span>Create Workspace</span>
              </button>
            </div>
          ) : (
            <>
              {currentView === 'tasks' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {/* Header Title Section (Notion Style) */}
                  <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '2.2rem' }}>
                      📝 {activeWorkspace?.name}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      Manage workspace workflows, set priorities, and track execution.
                    </p>
                  </div>

                  {/* Stats Counters (Notion Style Widgets) */}
                  <div className="stat-container">
                    <div className="stat-widget">
                      <div className="stat-icon">
                        <Layers size={18} />
                      </div>
                      <div>
                        <div className="stat-label">Projects</div>
                        <div className="stat-value">{activeProjects.length}</div>
                      </div>
                    </div>

                    <div className="stat-widget">
                      <div className="stat-icon">
                        <CheckSquare size={18} />
                      </div>
                      <div>
                        <div className="stat-label">Active Tasks</div>
                        <div className="stat-value">{pendingTasksCount} / {totalTasksCount}</div>
                      </div>
                    </div>

                    <div className="stat-widget">
                      <div className="stat-icon">
                        <Check size={18} style={{ color: 'var(--color-success)' }} />
                      </div>
                      <div>
                        <div className="stat-label">Completed</div>
                        <div className="stat-value">{completedTasksCount}</div>
                      </div>
                    </div>
                  </div>

                  {/* Task list */}
                  <div>
                    <div className="flex-between" style={{ padding: '0 4px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                        {selectedProjectId === 'all' 
                          ? '📋 Tasks' 
                          : `📁 ${activeProjects.find(p => p.id === selectedProjectId)?.name || 'Project'}`}
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {filteredTasks.length} total
                      </span>
                    </div>

                    {filteredTasks.length === 0 ? (
                      <div className="empty-state" style={{ borderStyle: 'solid' }}>
                        <CheckSquare size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                        <h4>No tasks in this view</h4>
                        <p style={{ fontSize: '0.85rem' }}>Get started by creating a new task.</p>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {filteredTasks.map(task => {
                          const taskProject = activeProjects.find(p => p.id === task.project_id)
                          return (
                            <div key={task.id} className="db-row">
                              <div 
                                onClick={() => handleQuickStatusCycle(task)}
                                style={{ 
                                  cursor: 'pointer', 
                                  color: task.status === 'done' ? 'var(--color-success)' : 'var(--text-muted)',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Cycle task status"
                              >
                                {task.status === 'done' ? (
                                  <Check size={18} style={{ background: 'var(--tag-bg-done)', color: 'var(--tag-text-done)', padding: '2px', borderRadius: '4px' }} />
                                ) : (
                                  <div style={{ width: '16px', height: '16px', border: '1px solid var(--text-muted)', borderRadius: '3px' }} />
                                )}
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <h4 style={{ 
                                    fontSize: '0.95rem', 
                                    textDecoration: task.status === 'done' ? 'line-through' : 'none',
                                    color: task.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    fontWeight: 500
                                  }}>
                                    {task.title}
                                  </h4>

                                  {task.due_date && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                      <Calendar size={12} />
                                      {new Date(task.due_date).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>

                                {task.description && (
                                  <p style={{ 
                                    fontSize: '0.82rem', 
                                    color: 'var(--text-secondary)',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {task.description}
                                  </p>
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className={`badge badge-${task.status === 'in_progress' ? 'progress' : task.status}`}>
                                  {task.status.replace('_', ' ')}
                                </span>

                                <span className={`badge badge-${task.priority}`}>
                                  {task.priority}
                                </span>

                                {taskProject && (
                                  <span className="badge badge-low" style={{ background: 'var(--tag-bg-medium)', color: 'var(--tag-text-medium)' }}>
                                    {taskProject.name}
                                  </span>
                                )}

                                <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                                  <button 
                                    onClick={() => openEditTask(task)} 
                                    className="btn" 
                                    style={{ padding: '4px', border: 'none' }}
                                    title="Edit"
                                  >
                                    <Edit2 size={13} style={{ opacity: 0.7 }} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteTask(task.id)} 
                                    className="btn" 
                                    style={{ padding: '4px', border: 'none', color: 'var(--tag-text-high)' }}
                                    title="Delete"
                                  >
                                    <Trash2 size={13} style={{ opacity: 0.7 }} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Header Title Section (Notion Style) */}
                  <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '2.2rem' }}>
                      📓 Notes & Knowledge Base
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      Keep decisions, meeting notes, and ideas organized inside this workspace.
                    </p>
                  </div>

                  <NotesView 
                    workspaceId={activeWorkspaceId}
                    projects={activeProjects}
                    tasks={activeTasks}
                    notes={initialNotes}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ======================================= */}
      {/* MODALS / OVERLAYS */}
      {/* ======================================= */}

      {/* 1. Workspace Creator Modal */}
      {showWorkspaceModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(1px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="auth-card animate-fade-in" style={{ padding: '24px', width: '90%', maxWidth: '400px' }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <h3>Create Workspace</h3>
              <button onClick={() => setShowWorkspaceModal(false)} className="btn" style={{ padding: '4px', border: 'none' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="form-input" 
                  placeholder="e.g., Nakhchivan Club, Side Hustle" 
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowWorkspaceModal(false)} className="btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Project Creator Modal */}
      {showProjectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(1px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="auth-card animate-fade-in" style={{ padding: '24px', width: '90%', maxWidth: '400px' }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <h3>Create Project</h3>
              <button onClick={() => setShowProjectModal(false)} className="btn" style={{ padding: '4px', border: 'none' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="form-input" 
                  placeholder="e.g., Marketing, Website Dev" 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="form-input" 
                  placeholder="Optional details..."
                  style={{ minHeight: '60px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowProjectModal(false)} className="btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Task Creator Modal */}
      {showTaskModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(1px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="auth-card animate-fade-in" style={{ padding: '24px', width: '90%', maxWidth: '460px' }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <h3>Create Task</h3>
              <button onClick={() => setShowTaskModal(false)} className="btn" style={{ padding: '4px', border: 'none' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input 
                  type="text" 
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="form-input" 
                  placeholder="e.g., Finish roadmap specs" 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="form-input" 
                  placeholder="Optional description..."
                  style={{ minHeight: '50px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Project</label>
                  <select 
                    value={taskProjId} 
                    onChange={(e) => setTaskProjId(e.target.value)}
                    className="form-select"
                  >
                    <option value="">No Project</option>
                    {activeProjects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input 
                    type="date" 
                    value={taskDueDate} 
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select 
                    value={taskStatus} 
                    onChange={(e) => setTaskStatus(e.target.value as TaskStatus)}
                    className="form-select"
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select 
                    value={taskPriority} 
                    onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                    className="form-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button type="button" onClick={() => { setShowTaskModal(false); resetTaskForm(); }} className="btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Task Editor Modal */}
      {editingTask && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(1px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="auth-card animate-fade-in" style={{ padding: '24px', width: '90%', maxWidth: '460px' }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <h3>Edit Task</h3>
              <button onClick={() => setEditingTask(null)} className="btn" style={{ padding: '4px', border: 'none' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleUpdateTask}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input 
                  type="text" 
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="form-input" 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="form-input" 
                  style={{ minHeight: '50px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select 
                    value={editingTask.status} 
                    onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as TaskStatus })}
                    className="form-select"
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select 
                    value={editingTask.priority} 
                    onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as TaskPriority })}
                    className="form-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input 
                  type="date" 
                  value={editingTask.due_date ? editingTask.due_date.substring(0, 10) : ''} 
                  onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button type="button" onClick={() => setEditingTask(null)} className="btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Quick-Capture Note Modal */}
      {showQuickNoteModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(1px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="auth-card animate-fade-in" style={{ padding: '24px', width: '90%', maxWidth: '440px' }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} style={{ color: 'var(--tag-text-medium)' }} />
                <h3>Quick Capture Note</h3>
              </div>
              <button onClick={() => setShowQuickNoteModal(false)} className="btn" style={{ padding: '4px', border: 'none' }}>
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleCreateQuickNote}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input 
                  type="text" 
                  value={quickNoteTitle}
                  onChange={(e) => setQuickNoteTitle(e.target.value)}
                  className="form-input" 
                  placeholder="e.g., Talk points with Ali" 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Note Content (Markdown)</label>
                <textarea 
                  value={quickNoteContent}
                  onChange={(e) => setQuickNoteContent(e.target.value)}
                  className="form-input" 
                  placeholder="Write ideas or notes down quickly..."
                  style={{ minHeight: '120px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowQuickNoteModal(false)} className="btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isPending}>
                  {isPending ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
