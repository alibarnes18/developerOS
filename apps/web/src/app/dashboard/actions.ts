'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

async function getSupabase() {
  const supabase = await createClient()
  if (!supabase) {
    throw new Error('Supabase client configuration is missing!')
  }
  return supabase
}

export async function createWorkspace(name: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }
  if (!name.trim()) return { error: 'Workspace name is required' }

  const { data, error } = await supabase
    .from('workspaces')
    .insert([{ name, owner_id: user.id }])
    .select()

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true, workspace: data[0] }
}

export async function createProject(workspaceId: string, name: string, description: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (!name.trim()) return { error: 'Project name is required' }

  const { data, error } = await supabase
    .from('projects')
    .insert([{ workspace_id: workspaceId, name, description: description || null }])
    .select()

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true, project: data[0] }
}

export async function createTask(
  workspaceId: string,
  projectId: string | null,
  title: string,
  description: string,
  status: string,
  priority: string,
  dueDate: string | null
) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (!title.trim()) return { error: 'Task title is required' }

  const { data, error } = await supabase
    .from('tasks')
    .insert([{
      workspace_id: workspaceId,
      project_id: projectId || null,
      title,
      description: description || null,
      status: status || 'todo',
      priority: priority || 'medium',
      due_date: dueDate || null
    }])
    .select()

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true, task: data[0] }
}

export async function updateTask(
  taskId: string,
  title: string,
  description: string,
  status: string,
  priority: string,
  dueDate: string | null
) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('tasks')
    .update({
      title,
      description: description || null,
      status,
      priority,
      due_date: dueDate || null
    })
    .eq('id', taskId)
    .select()

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true, task: data[0] }
}

export async function deleteTask(taskId: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}
