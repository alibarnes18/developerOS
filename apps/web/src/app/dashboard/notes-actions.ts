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

export async function createNote(
  workspaceId: string,
  projectId: string | null,
  taskId: string | null,
  title: string,
  content: string
) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (!title.trim()) return { error: 'Note title is required' }

  const { data, error } = await supabase
    .from('notes')
    .insert([{
      workspace_id: workspaceId,
      project_id: projectId || null,
      task_id: taskId || null,
      title,
      content: content || ''
    }])
    .select()

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true, note: data[0] }
}

export async function updateNote(
  noteId: string,
  title: string,
  content: string,
  projectId: string | null,
  taskId: string | null
) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (!title.trim()) return { error: 'Note title is required' }

  const { data, error } = await supabase
    .from('notes')
    .update({
      title,
      content: content || '',
      project_id: projectId || null,
      task_id: taskId || null
    })
    .eq('id', noteId)
    .select()

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true, note: data[0] }
}

export async function deleteNote(noteId: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return { success: true }
}
