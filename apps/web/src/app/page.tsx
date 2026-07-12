import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import SetupGuide from '@/components/SetupGuide'

export default async function LandingPage() {
  const supabase = await createClient()

  if (!supabase) {
    return <SetupGuide />
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="auth-wrapper" style={{ flexDirection: 'column', gap: '40px', padding: '40px' }}>
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: '800px',
        width: '100%',
        padding: '60px 40px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div className="auth-logo" style={{ fontSize: '3.5rem', marginBottom: '0' }}>Forge</div>
        
        <h1 style={{ fontSize: '2.5rem', lineHeight: '1.2', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
          Your Unified Personal Workspace
        </h1>
        
        <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
          An elegant, workspace-scoped environment to manage tasks, projects, notes, and decisions. Replaces scattered files with a structured daily routine.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
          {user ? (
            <Link href="/dashboard" className="btn btn-primary" style={{ fontSize: '1rem', padding: '12px 28px' }}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn btn-primary" style={{ fontSize: '1rem', padding: '12px 28px' }}>
                Open Forge
              </Link>
              <a href="#features" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '12px 28px' }}>
                Learn More
              </a>
            </>
          )}
        </div>
      </div>

      {/* Features Showcase */}
      <div id="features" style={{
        maxWidth: '1000px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginTop: '20px'
      }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', fontWeight: 600 }}>Workspaces</div>
          <p style={{ fontSize: '0.9rem' }}>
            Isolate tasks and projects by context (e.g. Work, Personal, Side Projects). Zero data bleeding.
          </p>
        </div>

        <div className="glass-panel animate-fade-in" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ color: 'var(--accent-secondary)', fontSize: '1.5rem', fontWeight: 600 }}>Task CRUD</div>
          <p style={{ fontSize: '0.9rem' }}>
            Easily manage task priority, status, and due dates. Organize everything under projects.
          </p>
        </div>

        <div className="glass-panel animate-fade-in" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', fontWeight: 600 }}>Knowledge Base</div>
          <p style={{ fontSize: '0.9rem' }}>
            Write decisions down in a markdown notes editor scoped per workspace (coming in v0.2).
          </p>
        </div>
      </div>
    </div>
  )
}
