import React from 'react'

export default function SetupGuide() {
  return (
    <div className="auth-wrapper" style={{ minHeight: '100vh', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel animate-fade-in" style={{ maxWidth: '600px', width: '100%', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="auth-logo" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Forge</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: 'var(--color-warning)' }}>Supabase Configuration Required</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            It looks like your local environment variables are not configured yet. Forge requires a connected Supabase project to handle auth and data storage.
          </p>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>How to setup your environment:</h3>
          <ol style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>
              <strong>Create a Supabase project:</strong> Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-secondary)' }}>supabase.com</a> and sign up or log in to create a new project.
            </li>
            <li>
              <strong>Apply SQL Schema:</strong> Open the <em>SQL Editor</em> in your Supabase dashboard, copy the contents of the file <code>packages/db/migrations/01_init_schema.sql</code>, paste it there, and click <strong>Run</strong>.
            </li>
            <li>
              <strong>Create Environment File:</strong> Create a file named <code>.env.local</code> in the <code>apps/web/</code> directory of this project.
            </li>
            <li>
              <strong>Add credentials:</strong> Copy the code block below, paste it into your <code>.env.local</code>, and replace the placeholder values with your project's API settings (found under Project Settings &gt; API in Supabase).
            </li>
          </ol>
        </div>

        <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '16px', position: 'relative' }}>
          <pre style={{ margin: 0, fontSize: '0.85rem', color: '#c084fc', overflowX: 'auto', fontFamily: 'monospace' }}>
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here`}
          </pre>
        </div>

        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Once the file is saved, restart your development server using <code>npm run dev</code>.
        </div>
      </div>
    </div>
  )
}
