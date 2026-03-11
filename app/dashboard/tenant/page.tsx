'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function TenantDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [interests, setInterests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
    await fetchInterests(user.id)
    setLoading(false)
  }

  const fetchInterests = async (uid: string) => {
    const { data } = await supabase
      .from('interests')
      .select('*, listings(*, listing_photos(*), users(name, phone, email, verified))')
      .eq('tenant_id', uid)
      .order('created_at', { ascending: false })
    setInterests(data || [])
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Georgia, serif', background: '#faf8f5', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #f0ece6', borderTop: '3px solid #2d5a2d', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#888', fontSize: '0.9rem' }}>Loading your interests…</p>
    </div>
  )

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: '#faf8f5', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .interest-card { transition: box-shadow 0.2s, transform 0.2s; }
        .interest-card:hover { box-shadow: 0 12px 36px rgba(0,0,0,0.1) !important; transform: translateY(-3px); }
      `}</style>

      {/* Sticky Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'white',
        backdropFilter: 'blur(12px)',
        padding: '0 2rem', height: '64px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : '0 1px 0 #f0ece6',
        transition: 'box-shadow 0.3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: '32px', height: '32px', background: '#2d5a2d', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '16px' }}>🏠</span>
          </div>
          <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e1a', letterSpacing: '-0.5px' }}>RentX</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', background: '#f0f7f0', borderRadius: '20px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#2d5a2d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 'bold' }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <span style={{ color: '#2d5a2d', fontSize: '0.85rem', fontWeight: '600' }}>{user?.name?.split(' ')[0]}</span>
          </div>
          <button onClick={() => router.push('/')} style={{ padding: '0.45rem 1rem', border: '1.5px solid #2d5a2d', borderRadius: '8px', background: 'transparent', color: '#2d5a2d', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>Browse Listings</button>
          <button onClick={() => router.push('/profile')} style={{ padding: '0.45rem 1rem', border: '1.5px solid #ddd', borderRadius: '8px', background: 'transparent', color: '#555', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>Profile</button>
          <button onClick={handleSignOut} style={{ padding: '0.45rem 1rem', border: '1.5px solid #1a2e1a', borderRadius: '8px', background: 'transparent', color: '#1a2e1a', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem', animation: 'fadeUp 0.4s ease both' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1a2e1a', margin: 0, letterSpacing: '-0.5px' }}>My Interests</h2>
          <p style={{ color: '#888', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            {interests.length > 0 ? `You've expressed interest in ${interests.length} propert${interests.length === 1 ? 'y' : 'ies'}` : 'Properties you express interest in will appear here'}
          </p>
        </div>

        {/* Summary chips */}
        {interests.length > 0 && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap', animation: 'fadeUp 0.4s ease 0.05s both' }}>
            <span style={{ background: '#f0f7f0', color: '#2d5a2d', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
              {interests.filter(i => i.listings?.status === 'available').length} still available
            </span>
            <span style={{ background: '#fef2f2', color: '#dc2626', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700' }}>
              {interests.filter(i => i.listings?.status === 'rented').length} rented
            </span>
          </div>
        )}

        {/* Empty state */}
        {interests.length === 0 && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '5rem 2rem', textAlign: 'center', border: '2px dashed #e8e4de', animation: 'fadeUp 0.4s ease 0.05s both' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h4 style={{ color: '#1a2e1a', fontSize: '1.3rem', fontWeight: '800', margin: '0 0 0.5rem' }}>No interests yet</h4>
            <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Browse listings and tap "I'm Interested" on homes you like</p>
            <button onClick={() => router.push('/')} style={{ padding: '0.75rem 2rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '0.95rem', fontFamily: 'Georgia, serif' }}>
              Browse Listings
            </button>
          </div>
        )}

        {/* Interest cards */}
        {interests.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {interests.map((interest, idx) => {
              const listing = interest.listings
              const landlord = listing?.users
              const isAvailable = listing?.status === 'available'
              return (
                <div key={interest.id} className="interest-card" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #f5f2ee', animation: `fadeUp 0.4s ease ${idx * 0.06}s both` }}>
                  {/* Photo */}
                  <div style={{ height: '190px', background: '#e8e4de', overflow: 'hidden', position: 'relative', cursor: 'pointer' }} onClick={() => router.push(`/listings/${listing?.id}`)}>
                    {listing?.listing_photos?.[0] ? (
                      <img src={listing.listing_photos[0].photo_url} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', filter: !isAvailable ? 'grayscale(0.3)' : 'none' }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                    ) : (
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#bbb', gap: '0.5rem' }}>
                        <span style={{ fontSize: '2.5rem' }}>🏠</span>
                        <span style={{ fontSize: '0.78rem' }}>No photo</span>
                      </div>
                    )}
                    {/* Gradient */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)', pointerEvents: 'none' }} />
                    {/* Status badge */}
                    <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', background: isAvailable ? '#4ade80' : '#f87171', color: isAvailable ? '#0f1e0f' : 'white', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {isAvailable ? 'Available' : 'Rented'}
                    </span>
                    {/* Interest confirmed badge */}
                    <span style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', background: 'rgba(0,0,0,0.55)', color: 'white', backdropFilter: 'blur(4px)' }}>
                      ✓ Interested
                    </span>
                    {/* Price */}
                    <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem' }}>
                      <span style={{ color: 'white', fontWeight: '900', fontSize: '1.15rem', letterSpacing: '-0.5px', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>${listing?.price}<span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: '600' }}>/mo</span></span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '1.1rem 1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.25rem', color: '#1a2e1a', fontWeight: '800', fontSize: '0.95rem', letterSpacing: '-0.3px', cursor: 'pointer' }} onClick={() => router.push(`/listings/${listing?.id}`)}>
                      {listing?.title}
                    </h4>
                    <p style={{ margin: '0 0 0.8rem', color: '#888', fontSize: '0.8rem' }}>📍 {listing?.location}</p>

                    {/* Property details */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.9rem', paddingBottom: '0.9rem', borderBottom: '1px solid #f5f2ee' }}>
                      <span style={{ color: '#555', fontSize: '0.78rem' }}>🛏 <strong style={{ color: '#1a2e1a' }}>{listing?.bedrooms === 0 ? 'Studio' : listing?.bedrooms} bed</strong></span>
                      <span style={{ color: '#555', fontSize: '0.78rem' }}>🚿 <strong style={{ color: '#1a2e1a' }}>{listing?.bathrooms} bath</strong></span>
                    </div>

                    {/* Landlord contact — the key feature */}
                    <div style={{ background: '#f8f9fa', borderRadius: '10px', padding: '0.85rem 1rem', border: '1px solid #f0ece6' }}>
                      <p style={{ margin: '0 0 0.4rem', fontSize: '0.72rem', fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Landlord Contact</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2d5a2d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: '800', flexShrink: 0 }}>
                          {landlord?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: '700', color: '#1a2e1a', fontSize: '0.85rem' }}>
                            {landlord?.name || 'Unknown'}
                            {landlord?.verified && <span style={{ marginLeft: '0.35rem', fontSize: '0.65rem', color: '#2d5a2d', fontWeight: '800' }}>✓ Verified</span>}
                          </p>
                        </div>
                      </div>
                      {landlord?.phone && (
                        <a href={`tel:${landlord.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2d5a2d', fontSize: '0.82rem', fontWeight: '700', textDecoration: 'none', marginBottom: '0.4rem' }}>
                          📞 {landlord.phone}
                        </a>
                      )}
                      {landlord?.phone && (
                        <a
                          href={`https://wa.me/${landlord.phone.replace(/\D/g, '')}?text=Hello, I'm interested in your property "${listing?.title}" on RentX. Is it still available?`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.85rem', background: '#dcfce7', color: '#16a34a', border: '1.5px solid #bbf7d0', borderRadius: '7px', fontSize: '0.75rem', fontWeight: '700', textDecoration: 'none', marginTop: '0.1rem' }}
                        >
                          💬 WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}