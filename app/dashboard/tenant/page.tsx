'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function TenantDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [interests, setInterests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUser()
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
    setUser(profile)
    fetchInterests(user.id)
    setLoading(false)
  }

  const fetchInterests = async (uid: string) => {
    const { data } = await supabase
      .from('interests')
      .select('*, listings(*, listing_photos(*))')
      .eq('tenant_id', uid)
    setInterests(data || [])
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>Loading...</div>

  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#f8f5f0', minHeight: '100vh' }}>
      <nav style={{ background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a2e1a', margin: 0, cursor: 'pointer' }} onClick={() => router.push('/')}>RentX</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#666' }}>👋 {user?.name}</span>
          <button onClick={() => router.push('/')} style={{ padding: '0.5rem 1.25rem', border: '2px solid #2d5a2d', borderRadius: '8px', background: 'transparent', color: '#2d5a2d', fontWeight: 'bold', cursor: 'pointer' }}>Browse Listings</button>
          <button onClick={handleSignOut} style={{ padding: '0.5rem 1.25rem', border: '2px solid #ddd', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1a2e1a', margin: 0 }}>My Interests</h2>
          <p style={{ color: '#666', margin: '0.25rem 0 0' }}>Properties you have expressed interest in</p>
        </div>

        {interests.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '12px', padding: '4rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ color: '#1a2e1a', marginBottom: '0.5rem' }}>No interests yet</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>Browse listings and hit "I'm Interested" on homes you like</p>
            <button onClick={() => router.push('/')} style={{ padding: '0.75rem 1.5rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Browse Listings</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {interests.map(interest => (
              <div key={interest.id} onClick={() => router.push(`/listings/${interest.listings?.id}`)}
                style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                <div style={{ height: '180px', background: '#e8e0d5', overflow: 'hidden' }}>
                  {interest.listings?.listing_photos?.[0] ? (
                    <img src={interest.listings.listing_photos[0].photo_url} alt={interest.listings.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>No photo</div>
                  )}
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.25rem', color: '#1a2e1a' }}>{interest.listings?.title}</h4>
                  <p style={{ margin: '0 0 0.5rem', color: '#666', fontSize: '0.9rem' }}>📍 {interest.listings?.location}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#2d5a2d', fontSize: '1.1rem' }}>${interest.listings?.price}/mo</span>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: '#d4edda', color: '#2d5a2d' }}>Interested ✓</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}