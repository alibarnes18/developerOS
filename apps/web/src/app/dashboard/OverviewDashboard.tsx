'use client'

import React, { useState } from 'react'
import type { Workspace, Project, Task, Note } from '@forge/types'
import { 
  Layers, 
  CheckSquare, 
  FileText, 
  Calendar, 
  AlertCircle, 
  ArrowRight, 
  TrendingUp,
  Clock,
  Globe,
  Briefcase
} from 'lucide-react'

interface OverviewDashboardProps {
  workspaceId: string
  projects: Project[]
  tasks: Task[]
  notes: Note[]
  allWorkspaces: Workspace[]
  allTasks: Task[]
  allProjects: Project[]
}

export default function OverviewDashboard({
  workspaceId,
  projects,
  tasks,
  notes,
  allWorkspaces,
  allTasks,
  allProjects
}: OverviewDashboardProps) {
  const [isGlobalView, setIsGlobalView] = useState(false)

  // Scoped Data Selection
  const activeWorkspaceProjects = isGlobalView ? allProjects : projects
  const activeWorkspaceTasks = isGlobalView ? allTasks : tasks
  const activeWorkspaceNotes = isGlobalView ? notes : notes // Wait, notes are already filtered in dashboard/page.tsx, but RLS secures notes to only owned workspaces anyway.

  // Stats Calculations
  const totalTasks = activeWorkspaceTasks.length
  const completedTasks = activeWorkspaceTasks.filter(t => t.status === 'done').length
  const pendingTasks = totalTasks - completedTasks
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Filter Overdue Tasks (due date in past, not completed)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  
  const overdueTasks = activeWorkspaceTasks.filter(t => {
    if (t.status === 'done' || !t.due_date) return false
    return new Date(t.due_date) < todayStart
  })

  // Filter Urgent Tasks (high priority, not completed)
  const urgentTasks = activeWorkspaceTasks.filter(t => t.priority === 'high' && t.status !== 'done')

  // Recent Notes (sort by updated_at desc, limit 3)
  const recentNotes = [...activeWorkspaceNotes]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3)

  // Compute Dynamic Activity Feed
  interface ActivityItem {
    id: string
    type: 'task' | 'project' | 'note'
    title: string
    action: string
    timestamp: Date
  }

  const activities: ActivityItem[] = []

  activeWorkspaceTasks.forEach(t => {
    activities.push({
      id: t.id,
      type: 'task',
      title: t.title,
      action: t.created_at === t.updated_at ? 'created task' : 'modified task',
      timestamp: new Date(t.updated_at)
    })
  })

  activeWorkspaceProjects.forEach(p => {
    activities.push({
      id: p.id,
      type: 'project',
      title: p.name,
      action: p.created_at === p.updated_at ? 'created project' : 'updated project',
      timestamp: new Date(p.updated_at)
    })
  })

  activeWorkspaceNotes.forEach(n => {
    activities.push({
      id: n.id,
      type: 'note',
      title: n.title || 'Untitled Note',
      action: n.created_at === n.updated_at ? 'written note' : 'modified note',
      timestamp: new Date(n.updated_at)
    })
  })

  const sortedActivities = activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 5)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* View Mode Toggle Header */}
      <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600 }}>
            {isGlobalView ? '🌐 Global Overview' : '🏠 Workspace Overview'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {isGlobalView 
              ? 'Monitoring statistics across Nakhchivan Club, Nexflow, and Personal projects' 
              : 'Workspace metrics, urgent tasks, and recent notes'}
          </p>
        </div>

        <button 
          onClick={() => setIsGlobalView(!isGlobalView)} 
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {isGlobalView ? <Briefcase size={14} /> : <Globe size={14} />}
          <span>{isGlobalView ? 'Switch to Active Workspace' : 'See Global Summary'}</span>
        </button>
      </div>

      {/* Metrics Row (Linear / Vercel style cards) */}
      <div className="stat-container">
        <div className="stat-widget">
          <div className="stat-icon">
            <CheckSquare size={16} />
          </div>
          <div>
            <div className="stat-label">Tasks Progress</div>
            <div className="stat-value">{completedTasks} / {totalTasks}</div>
          </div>
        </div>

        <div className="stat-widget" style={{ borderColor: overdueTasks.length > 0 ? 'var(--tag-text-high)' : 'var(--border-color)' }}>
          <div className="stat-icon" style={{ backgroundColor: overdueTasks.length > 0 ? 'var(--tag-bg-high)' : 'var(--bg-hover)' }}>
            <AlertCircle size={16} style={{ color: overdueTasks.length > 0 ? 'var(--tag-text-high)' : 'var(--text-primary)' }} />
          </div>
          <div>
            <div className="stat-label">Overdue Items</div>
            <div className="stat-value" style={{ color: overdueTasks.length > 0 ? 'var(--tag-text-high)' : 'var(--text-primary)' }}>
              {overdueTasks.length}
            </div>
          </div>
        </div>

        <div className="stat-widget">
          <div className="stat-icon">
            <Layers size={16} />
          </div>
          <div>
            <div className="stat-label">Total Projects</div>
            <div className="stat-value">{activeWorkspaceProjects.length}</div>
          </div>
        </div>

        <div className="stat-widget">
          <div className="stat-icon">
            <FileText size={16} />
          </div>
          <div>
            <div className="stat-label">Saved Notes</div>
            <div className="stat-value">{activeWorkspaceNotes.length}</div>
          </div>
        </div>
      </div>

      {/* Progress Bar Display */}
      <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="flex-between">
          <span style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={14} style={{ color: 'var(--accent-primary)' }} />
            <span>Workspace Completion Progress</span>
          </span>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{completionPercentage}%</span>
        </div>

        <div style={{ height: '6px', background: 'var(--bg-hover)', borderRadius: '999px', overflow: 'hidden' }}>
          <div 
            className="progress-bar-fill" 
            style={{ 
              height: '100%', 
              background: 'var(--accent-primary)', 
              width: `${completionPercentage}%` 
            }} 
          />
        </div>
      </div>

      {/* Grid: Attention Items & Recent Updates */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '28px' }}>
        
        {/* Left Side: Overdue & Urgent Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Overdue Section */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={15} style={{ color: 'var(--tag-text-high)' }} />
              <span>Overdue Action Items</span>
            </h3>

            {overdueTasks.length === 0 ? (
              <div style={{ border: '1px dashed var(--border-color)', padding: '20px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                No overdue tasks. All deadlines are met!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {overdueTasks.slice(0, 4).map(task => (
                  <div key={task.id} className="db-row" style={{ padding: '8px 12px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span className="badge badge-high" style={{ padding: '1px 6px', fontSize: '0.7rem', marginRight: '8px' }}>
                        Overdue
                      </span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{task.title}</span>
                    </div>
                    {task.due_date && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--tag-text-high)' }}>
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Urgent Items Section */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={15} style={{ color: 'var(--tag-text-medium)' }} />
              <span>Urgent Tasks (High Priority)</span>
            </h3>

            {urgentTasks.length === 0 ? (
              <div style={{ border: '1px dashed var(--border-color)', padding: '20px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                No urgent tasks pending.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {urgentTasks.slice(0, 4).map(task => (
                  <div key={task.id} className="db-row" style={{ padding: '8px 12px' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </span>
                    <span className="badge badge-high" style={{ padding: '1px 6px', fontSize: '0.7rem' }}>
                      High
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Recent Notes & Activity Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Recent Notes Section */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={15} style={{ color: 'var(--accent-primary)' }} />
              <span>Recent Notes</span>
            </h3>

            {recentNotes.length === 0 ? (
              <div style={{ border: '1px dashed var(--border-color)', padding: '20px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                No notes written yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {recentNotes.map(note => (
                  <div key={note.id} className="db-row" style={{ padding: '8px 12px' }}>
                    <span style={{ fontSize: '0.9rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {note.title || 'Untitled Note'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(note.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity Feed Section */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={15} />
              <span>Recent Activity Feed</span>
            </h3>

            {sortedActivities.length === 0 ? (
              <div style={{ border: '1px dashed var(--border-color)', padding: '20px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                No recent activity logged.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {sortedActivities.map((act, i) => (
                  <div key={`${act.id}-${i}`} className="db-row" style={{ padding: '8px 12px', fontSize: '0.85rem', border: 'none', borderBottom: '1px solid var(--border-color)', borderRadius: 0 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {act.action} <strong style={{ color: 'var(--text-primary)' }}>{act.title}</strong>
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      {act.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  )
}
