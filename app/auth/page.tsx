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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1.5px solid #e8e4de',
    borderRadius: '8px',
    fontSize: '0.95rem',
    boxSizing: 'border-box',
    color: '#1a2e1a',
    background: '#fdfcfb',
    outline: 'none',
    fontFamily: 'Georgia, serif',
    marginTop: '0.35rem',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f5', fontFamily: 'Georgia, serif' }}>
      <style>{`
        input:focus, select:focus { border-color: #2d5a2d !important; box-shadow: 0 0 0 3px rgba(45,90,45,0.1); }
        .submit-btn:hover { background: #3a7a3a !important; }
        .submit-btn { transition: background 0.15s !important; }
      `}</style>

      {/* Navbar */}
      <nav style={{
        background: 'white',
        padding: '0 1.25rem',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 1px 0 #f0ece6',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: '32px', height: '32px', background: '#2d5a2d', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontSize: '16px' }}>🏠</span>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1a2e1a', letterSpacing: '-0.5px' }}>RentX</span>
        </div>
      </nav>

      {/* Card */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2.5rem 1.25rem', minHeight: 'calc(100vh - 60px)' }}>
        <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #f5f2ee', overflow: 'hidden' }}>

          {/* Card header */}
          <div style={{ background: 'linear-gradient(135deg, #1a2e1a 0%, #2d5a2d 100%)', padding: '2rem 2rem 1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.15)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '14px' }}>🏠</span>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '800', fontSize: '1rem', letterSpacing: '-0.3px' }}>RentX</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'white', margin: '0 0 0.2rem', letterSpacing: '-0.5px' }}>
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.875rem' }}>
              {isLogin ? 'Sign in to your RentX account' : 'Join RentX and find your home'}
            </p>
          </div>

          {/* Card body */}
          <div style={{ padding: '1.75rem 2rem 2rem' }}>

            {/* Toggle */}
            <div style={{ display: 'flex', background: '#f5f2ee', borderRadius: '10px', padding: '3px', marginBottom: '1.5rem' }}>
              <button onClick={() => setIsLogin(true)} style={{ flex: 1, padding: '0.55rem', border: 'none', borderRadius: '8px', background: isLogin ? 'white' : 'transparent', fontWeight: isLogin ? '800' : '600', cursor: 'pointer', color: isLogin ? '#1a2e1a' : '#888', fontSize: '0.875rem', fontFamily: 'Georgia, serif', boxShadow: isLogin ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
                Sign In
              </button>
              <button onClick={() => setIsLogin(false)} style={{ flex: 1, padding: '0.55rem', border: 'none', borderRadius: '8px', background: !isLogin ? 'white' : 'transparent', fontWeight: !isLogin ? '800' : '600', cursor: 'pointer', color: !isLogin ? '#1a2e1a' : '#888', fontSize: '0.875rem', fontFamily: 'Georgia, serif', boxShadow: !isLogin ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
                Sign Up
              </button>
            </div>

            {/* Role selector */}
            {!isLogin && (
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontWeight: '700', color: '#444', fontSize: '0.82rem' }}>I am a</label>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem' }}>
                  {['tenant', 'landlord'].map(r => (
                    <button key={r} onClick={() => setRole(r)} style={{ flex: 1, padding: '0.65rem', border: `1.5px solid ${role === r ? '#2d5a2d' : '#e8e4de'}`, borderRadius: '8px', background: role === r ? '#f0f7f0' : '#fdfcfb', cursor: 'pointer', fontWeight: role === r ? '800' : '600', color: role === r ? '#2d5a2d' : '#888', fontSize: '0.875rem', fontFamily: 'Georgia, serif', transition: 'all 0.15s', textTransform: 'capitalize' }}>
                      {r === 'tenant' ? '🔍 ' : '🏡 '}{r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Name */}
            {!isLogin && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '700', color: '#444', fontSize: '0.82rem' }}>Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Kwame Mensah" style={inputStyle} />
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#444', fontSize: '0.82rem' }}>Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="you@example.com" style={inputStyle} />
            </div>

            {/* Phone */}
            {!isLogin && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '700', color: '#444', fontSize: '0.82rem' }}>Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 0241234567" style={inputStyle} />
              </div>
            )}

            {/* Password */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#444', fontSize: '0.82rem' }}>Password</label>
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••" style={inputStyle} />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.65rem 0.9rem', marginBottom: '1rem' }}>
                <p style={{ color: '#dc2626', margin: 0, fontSize: '0.82rem', fontWeight: '600' }}>{error}</p>
              </div>
            )}

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading}
              style={{ width: '100%', padding: '0.875rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: 'Georgia, serif' }}
            >
              {loading ? 'Please wait…' : isLogin ? 'Sign In →' : 'Create Account →'}
            </button>

            <p style={{ textAlign: 'center', marginTop: '1.25rem', marginBottom: 0, color: '#888', fontSize: '0.8rem' }}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#2d5a2d', fontWeight: '700', cursor: 'pointer' }}>
                {isLogin ? 'Sign up free' : 'Sign in'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}