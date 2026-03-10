'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [role, setRole] = useState('tenant')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      const { data: profile } = await supabase.from('users').select('role').eq('id', data.user.id).single()
      if (profile?.role === 'landlord') router.push('/dashboard/landlord')
      else router.push('/dashboard/tenant')
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      if (data.user) {
        await supabase.from('users').insert({ id: data.user.id, name, email, phone, role })
        if (role === 'landlord') router.push('/dashboard/landlord')
        else router.push('/dashboard/tenant')
      }
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box' as const,
    color: '#1a2e1a',
    background: 'white',
    outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f5f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '12px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a2e1a', marginBottom: '0.25rem', marginTop: 0 }}>RentX</h1>
        <p style={{ color: '#666', marginBottom: '2rem', marginTop: 0 }}>{isLogin ? 'Welcome back' : 'Create your account'}</p>

        {/* Toggle */}
        <div style={{ display: 'flex', background: '#f0f0f0', borderRadius: '8px', padding: '4px', marginBottom: '1.5rem' }}>
          <button onClick={() => setIsLogin(true)} style={{ flex: 1, padding: '0.5rem', border: 'none', borderRadius: '6px', background: isLogin ? 'white' : 'transparent', fontWeight: isLogin ? 'bold' : 'normal', cursor: 'pointer', color: '#1a2e1a' }}>Login</button>
          <button onClick={() => setIsLogin(false)} style={{ flex: 1, padding: '0.5rem', border: 'none', borderRadius: '6px', background: !isLogin ? 'white' : 'transparent', fontWeight: !isLogin ? 'bold' : 'normal', cursor: 'pointer', color: '#1a2e1a' }}>Sign Up</button>
        </div>

        {/* Role selector */}
        {!isLogin && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>I am a</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setRole('tenant')} style={{ flex: 1, padding: '0.75rem', border: `2px solid ${role === 'tenant' ? '#2d5a2d' : '#ddd'}`, borderRadius: '8px', background: role === 'tenant' ? '#f0f7f0' : 'white', cursor: 'pointer', fontWeight: role === 'tenant' ? 'bold' : 'normal', color: role === 'tenant' ? '#2d5a2d' : '#333' }}>Tenant</button>
              <button onClick={() => setRole('landlord')} style={{ flex: 1, padding: '0.75rem', border: `2px solid ${role === 'landlord' ? '#2d5a2d' : '#ddd'}`, borderRadius: '8px', background: role === 'landlord' ? '#f0f7f0' : 'white', cursor: 'pointer', fontWeight: role === 'landlord' ? 'bold' : 'normal', color: role === 'landlord' ? '#2d5a2d' : '#333' }}>Landlord</button>
            </div>
          </div>
        )}

        {/* Name */}
        {!isLogin && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" style={inputStyle} />
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" style={inputStyle} />
        </div>

        {/* Phone */}
        {!isLogin && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>Phone Number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 8900" style={inputStyle} />
          </div>
        )}

        {/* Password */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" style={inputStyle} />
        </div>

        {error && <p style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '0.875rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
        </button>
      </div>
    </div>
  )
}