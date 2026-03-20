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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    getUser()
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
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

  const getDashboardPath = () => user?.role === 'landlord' ? '/dashboard/landlord' : '/dashboard/tenant'

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Georgia, serif', background: '#faf8f5', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #f0ece6', borderTop: '3px solid #2d5a2d', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#888', fontSize: '0.9rem' }}>Loading profile…</p>
    </div>
  )

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
    <div style={{ fontFamily: 'Georgia, serif', background: '#faf8f5', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus { border-color: #2d5a2d !important; box-shadow: 0 0 0 3px rgba(45,90,45,0.1); }
        .save-btn:hover { background: #3a7a3a !important; }
        .save-btn { transition: background 0.15s !important; }
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
          .page-pad { padding: 1.5rem 1.1rem !important; }
        }
        @media (min-width: 641px) {
          .nav-mobile-btn { display: none !important; }
        }
      `}</style>

      {/* Sticky Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'white',
        backdropFilter: 'blur(12px)',
        padding: '0 1.25rem', height: '60px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : '0 1px 0 #f0ece6',
        transition: 'box-shadow 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: '32px', height: '32px', background: '#2d5a2d', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontSize: '16px' }}>🏠</span>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1a2e1a', letterSpacing: '-0.5px' }}>RentX</span>
        </div>

        {/* Desktop nav */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button onClick={() => router.push(getDashboardPath())} style={{ padding: '0.4rem 0.9rem', border: '1.5px solid #2d5a2d', borderRadius: '8px', background: 'transparent', color: '#2d5a2d', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Georgia, serif' }}>Dashboard</button>
          <button onClick={handleSignOut} style={{ padding: '0.4rem 0.9rem', border: '1.5px solid #1a2e1a', borderRadius: '8px', background: 'transparent', color: '#1a2e1a', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Georgia, serif' }}>Sign Out</button>
        </div>

        {/* Mobile back button */}
        <button className="nav-mobile-btn" onClick={() => router.push(getDashboardPath())}
          style={{ display: 'none', background: 'transparent', border: '1.5px solid #2d5a2d', borderRadius: '8px', cursor: 'pointer', padding: '0.4rem 0.75rem', color: '#2d5a2d', fontWeight: '700', fontSize: '0.82rem', fontFamily: 'Georgia, serif', alignItems: 'center' }}>
          ← Dashboard
        </button>
      </nav>

      <div className="page-pad" style={{ maxWidth: '520px', margin: '0 auto', padding: '2rem 1.5rem', animation: 'fadeUp 0.4s ease both' }}>

        <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#1a2e1a', margin: '0 0 1.5rem', letterSpacing: '-0.5px' }}>My Profile</h2>

        <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #f5f2ee' }}>

          {/* Profile header */}
          <div style={{ background: 'linear-gradient(135deg, #1a2e1a 0%, #2d5a2d 100%)', padding: '1.75rem 1.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '1.5rem', flexShrink: 0 }}>
              {name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p style={{ margin: '0 0 0.15rem', fontWeight: '800', color: 'white', fontSize: '1rem' }}>{name || 'Your Name'}</p>
              <p style={{ margin: '0 0 0.2rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', textTransform: 'capitalize' }}>{user?.role}</p>
              {user?.verified && (
                <span style={{ fontSize: '0.68rem', color: '#4ade80', fontWeight: '800', background: 'rgba(74,222,128,0.15)', padding: '0.12rem 0.45rem', borderRadius: '20px', border: '1px solid rgba(74,222,128,0.3)' }}>✓ Verified</span>
              )}
            </div>
          </div>

          {/* Form */}
          <div style={{ padding: '1.75rem' }}>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#444', fontSize: '0.82rem' }}>Email</label>
              <input value={user?.email} disabled style={{ ...inputStyle, background: '#f5f2ee', color: '#aaa', cursor: 'not-allowed' }} />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#444', fontSize: '0.82rem' }}>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={inputStyle} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: '700', color: '#444', fontSize: '0.82rem' }}>Phone Number</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 0241234567" style={inputStyle} />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.65rem 0.9rem', marginBottom: '1rem' }}>
                <p style={{ color: '#dc2626', margin: 0, fontSize: '0.82rem', fontWeight: '600' }}>{error}</p>
              </div>
            )}

            {success && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '0.65rem 0.9rem', marginBottom: '1rem' }}>
                <p style={{ color: '#16a34a', margin: 0, fontSize: '0.82rem', fontWeight: '700' }}>✓ Profile updated successfully</p>
              </div>
            )}

            <button className="save-btn" onClick={handleSave} disabled={saving}
              style={{ width: '100%', padding: '0.875rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '800', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1, fontFamily: 'Georgia, serif' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>

            <button onClick={handleSignOut}
              style={{ width: '100%', padding: '0.75rem', background: 'transparent', color: '#888', border: '1.5px solid #f0ece6', borderRadius: '10px', fontSize: '0.875rem', fontWeight: '600', cursor: 'pointer', fontFamily: 'Georgia, serif', marginTop: '0.75rem' }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}