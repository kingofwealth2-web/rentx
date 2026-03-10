'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getUser()
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
    setUser(profile)
    setName(profile?.name || '')
    setPhone(profile?.phone || '')
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess(false)
    const { error } = await supabase.from('users').update({ name, phone }).eq('id', user.id)
    if (error) { setError(error.message); setSaving(false); return }
    setSuccess(true)
    setSaving(false)
    setTimeout(() => setSuccess(false), 3000)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>Loading...</div>

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box' as const,
    color: '#1a2e1a',
    background: 'white',
  }

  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#f8f5f0', minHeight: '100vh' }}>
      <nav style={{ background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a2e1a', margin: 0, cursor: 'pointer' }} onClick={() => router.push('/')}>RentX</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => router.push(user?.role === 'landlord' ? '/dashboard/landlord' : '/dashboard/tenant')}
            style={{ padding: '0.5rem 1.25rem', border: '2px solid #2d5a2d', borderRadius: '8px', background: 'transparent', color: '#2d5a2d', fontWeight: 'bold', cursor: 'pointer' }}>
            Dashboard
          </button>
          <button onClick={handleSignOut} style={{ padding: '0.5rem 1.25rem', border: '2px solid #ddd', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1a2e1a', marginBottom: '2rem' }}>My Profile</h2>

        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: '#2d5a2d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.75rem' }}>
              {name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#1a2e1a', fontSize: '1.1rem' }}>{name}</p>
              <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.9rem', textTransform: 'capitalize' }}>{user?.role}</p>
              {user?.verified && <span style={{ fontSize: '0.8rem', color: '#2d5a2d', fontWeight: 'bold' }}>✓ Verified</span>}
            </div>
          </div>

          {/* Email - read only */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>Email</label>
            <input value={user?.email} disabled style={{ ...inputStyle, background: '#f5f5f5', color: '#999', cursor: 'not-allowed' }} />
          </div>

          {/* Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={inputStyle} />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>Phone Number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Your phone number" style={inputStyle} />
          </div>

          {error && <p style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
          {success && <p style={{ color: '#2d5a2d', marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 'bold' }}>✓ Profile updated successfully</p>}

          <button onClick={handleSave} disabled={saving} style={{ width: '100%', padding: '0.875rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}