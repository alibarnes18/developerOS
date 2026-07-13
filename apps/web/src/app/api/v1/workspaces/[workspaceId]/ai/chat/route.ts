import { openai } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(
  req: Request,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { messages } = await req.json()
    const { workspaceId } = await params

    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 })
    }

    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client missing' }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify workspace belongs to user
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .eq('owner_id', user.id)
      .single()

    if (wsError || !workspace) {
      return NextResponse.json({ error: 'Workspace not found or unauthorized' }, { status: 404 })
    }

    // Fetch context data
    const [tasksRes, projectsRes, notesRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('workspace_id', workspaceId),
      supabase.from('projects').select('*').eq('workspace_id', workspaceId),
      supabase.from('notes').select('*').eq('workspace_id', workspaceId)
    ])

    const tasks = tasksRes.data || []
    const projects = projectsRes.data || []
    const notes = notesRes.data || []

    // Build Context String
    let contextStr = `Workspace Context for "${workspace.name}":\n\n`
    
    if (projects.length > 0) {
      contextStr += `Projects:\n`
      projects.forEach(p => {
        contextStr += `- ${p.name}: ${p.description || 'No description'}\n`
      })
      contextStr += '\n'
    }

    if (tasks.length > 0) {
      contextStr += `Tasks:\n`
      tasks.forEach(t => {
        const projectName = t.project_id ? projects.find(p => p.id === t.project_id)?.name : 'No Project'
        contextStr += `- [${t.status}] ${t.title} (Priority: ${t.priority}, Due: ${t.due_date ? new Date(t.due_date).toLocaleDateString() : 'None'}, Project: ${projectName})\n  Description: ${t.description || 'None'}\n`
      })
      contextStr += '\n'
    }

    if (notes.length > 0) {
      contextStr += `Notes:\n`
      notes.forEach(n => {
        contextStr += `--- Note: ${n.title} ---\n${n.content}\n\n`
      })
    }

    // Call AI Provider
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: `You are Forge AI, an intelligent assistant integrated into a developer's workspace. Your goal is to help the user manage their tasks, projects, and answer questions based strictly on their workspace notes and data.

Here is the data from the user's current workspace:
${contextStr}

If the user asks about their tasks, projects, or notes, use the context provided to answer accurately. If they ask a general question, answer normally but be concise. Do not invent tasks or notes that do not exist in the context. Format your output using Markdown. Always be helpful, concise, and professional.`,
      messages,
    })

    return result.toTextStreamResponse()

  } catch (error: any) {
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
