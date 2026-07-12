import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'
import SetupGuide from '@/components/SetupGuide'
import type { Workspace, Project, Task, Note } from '@forge/types'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  if (!supabase) {
    return <SetupGuide />
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch workspaces owned by user
  const { data: workspaces } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: true })

  // Fetch projects (RLS will filter to owned workspaces)
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: true })

  // Fetch tasks (RLS will filter to owned workspaces)
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch notes (RLS will filter to owned workspaces)
  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <DashboardClient 
      user={user}
      initialWorkspaces={(workspaces as Workspace[]) || []}
      initialProjects={(projects as Project[]) || []}
      initialTasks={(tasks as Task[]) || []}
      initialNotes={(notes as Note[]) || []}
    />
  )
}
