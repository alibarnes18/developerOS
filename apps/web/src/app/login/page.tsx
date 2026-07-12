'use client'

import React, { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { login, signup } from './actions'

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
      {pending ? 'Processing...' : label}
    </button>
  )
}

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)
    const result = mode === 'login' 
      ? await login(null, formData)
      : await signup(null, formData)

    if (result && 'error' in result && result.error) {
      setError(result.error)
    } else if (result && 'success' in result && result.success) {
      setSuccess(result.success)
      if (mode === 'signup') {
        // clear inputs and shift to login mode
        e.currentTarget.reset()
        setMode('login')
      }
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <div className="auth-logo">Forge</div>
          <h1 className="auth-title">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="auth-subtitle">
            {mode === 'login' 
              ? 'Enter your credentials to access your workspaces' 
              : 'Get started with Forge personal manager today'}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            fontSize: '0.85rem',
            color: 'var(--color-danger)',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px',
            fontSize: '0.85rem',
            color: 'var(--color-success)',
            marginBottom: '20px'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input 
              id="email"
              name="email"
              type="email"
              required
              className="form-input"
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              id="password"
              name="password"
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
            />
          </div>

          <SubmitButton label={mode === 'login' ? 'Log In' : 'Sign Up'} />
        </form>

        <div className="auth-divider">or</div>

        <button 
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setError(null)
            setSuccess(null)
          }}
          className="btn btn-secondary"
          style={{ width: '100%' }}
        >
          {mode === 'login' ? 'Create a new account' : 'Already have an account? Log In'}
        </button>
      </div>
    </div>
  )
}
