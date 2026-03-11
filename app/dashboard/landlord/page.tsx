'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function LandlordDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [interests, setInterests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
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
    await fetchListings(user.id)
    await fetchInterests(user.id)
    setLoading(false)
  }

  const fetchListings = async (uid: string) => {
    const { data } = await supabase.from('listings').select('*, listing_photos(*)').eq('landlord_id', uid).order('created_at', { ascending: false })
    setListings(data || [])
  }

  const fetchInterests = async (uid: string) => {
    const { data: myListings } = await supabase.from('listings').select('id').eq('landlord_id', uid)
    if (!myListings || myListings.length === 0) { setInterests([]); return }
    const listingIds = myListings.map((l: any) => l.id)
    const { data } = await supabase
      .from('interests')
      .select('*, listings(title, price, location), users(name, phone, email)')
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false })
    setInterests(data || [])
  }

  const markAsRented = async (id: string) => {
    await supabase.from('listings').update({ status: 'rented' }).eq('id', id)
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'rented' } : l))
  }

  const markAsAvailable = async (id: string) => {
    await supabase.from('listings').update({ status: 'available' }).eq('id', id)
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: 'available' } : l))
  }

  const deleteListing = async (id: string) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    setDeletingId(id)
    await supabase.from('listing_photos').delete().eq('listing_id', id)
    await supabase.from('interests').delete().eq('listing_id', id)
    await supabase.from('listings').delete().eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
    setInterests(prev => prev.filter(i => i.listing_id !== id))
    setDeletingId(null)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const totalInterests = interests.length
  const activeListings = listings.filter(l => l.status === 'available').length
  const rentedListings = listings.filter(l => l.status === 'rented').length

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Georgia, serif', background: '#faf8f5', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #f0ece6', borderTop: '3px solid #2d5a2d', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#888', fontSize: '0.9rem' }}>Loading your dashboard…</p>
    </div>
  )

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: '#faf8f5', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .listing-card { transition: box-shadow 0.2s, transform 0.2s; }
        .listing-card:hover { box-shadow: 0 8px 30px rgba(0,0,0,0.1) !important; transform: translateY(-2px); }
        .action-btn:hover { opacity: 0.85; }
        .delete-btn:hover { background: #fee2e2 !important; color: #dc2626 !important; border-color: #fca5a5 !important; }
        .interest-card { transition: box-shadow 0.2s; }
        .interest-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.08) !important; }
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
          <button onClick={() => router.push('/profile')} style={{ padding: '0.45rem 1rem', border: '1.5px solid #ddd', borderRadius: '8px', background: 'transparent', color: '#555', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}>Profile</button>
          <button onClick={handleSignOut} style={{ padding: '0.45rem 1rem', border: '1.5px solid #1a2e1a', borderRadius: '8px', background: 'transparent', color: '#1a2e1a', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', animation: 'fadeUp 0.4s ease both' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#1a2e1a', margin: 0, letterSpacing: '-0.5px' }}>Landlord Dashboard</h2>
            <p style={{ color: '#888', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>Manage your properties and tenant enquiries</p>
          </div>
          <button onClick={() => router.push('/listings/create')} style={{ padding: '0.75rem 1.5rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.1rem' }}>+</span> New Listing
          </button>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2.5rem', animation: 'fadeUp 0.4s ease 0.05s both' }}>
          {[
            { value: listings.length, label: 'Total Listings', icon: '🏠', color: '#2d5a2d', bg: '#f0f7f0' },
            { value: activeListings, label: 'Available', icon: '✅', color: '#059669', bg: '#ecfdf5' },
            { value: rentedListings, label: 'Rented', icon: '🔒', color: '#b45309', bg: '#fffbeb' },
            { value: totalInterests, label: 'Total Interests', icon: '❤️', color: '#dc2626', bg: '#fef2f2' },
          ].map((stat, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f0ece6', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{stat.icon}</div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: '900', color: stat.color, letterSpacing: '-0.5px', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: '600', marginTop: '2px' }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* My Listings */}
        <div style={{ marginBottom: '3rem', animation: 'fadeUp 0.4s ease 0.1s both' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1a2e1a', margin: '0 0 1.25rem', letterSpacing: '-0.3px' }}>My Properties</h3>

          {listings.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center', border: '2px dashed #e8e4de' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🏡</div>
              <h4 style={{ color: '#1a2e1a', fontWeight: '800', marginBottom: '0.5rem' }}>No listings yet</h4>
              <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Create your first listing and start connecting with tenants</p>
              <button onClick={() => router.push('/listings/create')} style={{ padding: '0.75rem 1.75rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer' }}>
                Create First Listing
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {listings.map((listing, idx) => (
                <div key={listing.id} className="listing-card" style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f5f2ee', animation: `fadeUp 0.4s ease ${idx * 0.05}s both` }}>
                  {/* Photo */}
                  <div style={{ height: '180px', background: '#e8e4de', overflow: 'hidden', position: 'relative', cursor: 'pointer' }} onClick={() => router.push(`/listings/${listing.id}`)}>
                    {listing.listing_photos?.[0] ? (
                      <img src={listing.listing_photos[0].photo_url} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                    ) : (
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#bbb', gap: '0.5rem' }}>
                        <span style={{ fontSize: '2rem' }}>🏠</span>
                        <span style={{ fontSize: '0.75rem' }}>No photo</span>
                      </div>
                    )}
                    {/* Gradient */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70px', background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)', pointerEvents: 'none' }} />
                    {/* Status badge */}
                    <span style={{
                      position: 'absolute', top: '0.75rem', right: '0.75rem',
                      padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800',
                      background: listing.status === 'available' ? '#4ade80' : '#f87171',
                      color: listing.status === 'available' ? '#0f1e0f' : 'white',
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {listing.status === 'available' ? 'Available' : 'Rented'}
                    </span>
                    {/* Price on photo */}
                    <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem' }}>
                      <span style={{ color: 'white', fontWeight: '900', fontSize: '1.1rem', letterSpacing: '-0.5px', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>${listing.price}<span style={{ fontSize: '0.7rem', opacity: 0.85, fontWeight: '600' }}>/mo</span></span>
                    </div>
                    {/* Interest count badge */}
                    {interests.filter(i => i.listing_id === listing.id).length > 0 && (
                      <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: '#dc2626', color: 'white', borderRadius: '20px', padding: '0.2rem 0.6rem', fontSize: '0.7rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        ❤️ {interests.filter(i => i.listing_id === listing.id).length}
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '1rem 1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.25rem', color: '#1a2e1a', fontWeight: '800', fontSize: '0.95rem', letterSpacing: '-0.3px', cursor: 'pointer' }} onClick={() => router.push(`/listings/${listing.id}`)}>
                      {listing.title}
                    </h4>
                    <p style={{ margin: '0 0 1rem', color: '#888', fontSize: '0.8rem' }}>📍 {listing.location}</p>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="action-btn"
                        onClick={() => listing.status === 'available' ? markAsRented(listing.id) : markAsAvailable(listing.id)}
                        style={{
                          flex: 1, padding: '0.55rem', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', borderRadius: '8px', transition: 'opacity 0.15s', fontFamily: 'Georgia, serif',
                          background: listing.status === 'available' ? '#fff7ed' : '#f0f7f0',
                          color: listing.status === 'available' ? '#b45309' : '#2d5a2d',
                          border: `1.5px solid ${listing.status === 'available' ? '#fed7aa' : '#bbf7d0'}`,
                        }}
                      >
                        {listing.status === 'available' ? '🔒 Mark Rented' : '✅ Mark Available'}
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteListing(listing.id)}
                        disabled={deletingId === listing.id}
                        style={{ padding: '0.55rem 0.75rem', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer', borderRadius: '8px', border: '1.5px solid #f0ece6', background: 'transparent', color: '#aaa', transition: 'all 0.15s', fontFamily: 'Georgia, serif' }}
                      >
                        {deletingId === listing.id ? '…' : '🗑️'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tenant Interests */}
        <div style={{ animation: 'fadeUp 0.4s ease 0.15s both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1a2e1a', margin: 0, letterSpacing: '-0.3px' }}>Tenant Interests</h3>
            {interests.length > 0 && (
              <span style={{ background: '#fee2e2', color: '#dc2626', padding: '0.2rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800' }}>
                {interests.length} enquir{interests.length === 1 ? 'y' : 'ies'}
              </span>
            )}
          </div>

          {interests.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '3.5rem 2rem', textAlign: 'center', border: '2px dashed #e8e4de' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <h4 style={{ color: '#1a2e1a', fontWeight: '800', margin: '0 0 0.5rem' }}>No tenant interests yet</h4>
              <p style={{ color: '#888', fontSize: '0.875rem', margin: 0 }}>When tenants express interest in your listings, their contact info will appear here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {interests.map((interest, idx) => (
                <div key={interest.id} className="interest-card" style={{ background: 'white', borderRadius: '14px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f5f2ee', animation: `fadeUp 0.4s ease ${idx * 0.04}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {/* Avatar */}
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #2d5a2d, #4a8a4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '1rem', flexShrink: 0 }}>
                        {interest.users?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p style={{ margin: '0 0 0.2rem', fontWeight: '800', color: '#1a2e1a', fontSize: '0.95rem' }}>{interest.users?.name || 'Unknown Tenant'}</p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          {interest.users?.phone && (
                            <a href={`tel:${interest.users.phone}`} style={{ color: '#2d5a2d', fontSize: '0.82rem', fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              📞 {interest.users.phone}
                            </a>
                          )}
                          {interest.users?.email && (
                            <a href={`mailto:${interest.users.email}`} style={{ color: '#666', fontSize: '0.82rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              ✉️ {interest.users.email}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0 0 0.2rem', color: '#1a2e1a', fontWeight: '700', fontSize: '0.82rem' }}>{interest.listings?.title}</p>
                      <p style={{ margin: '0 0 0.3rem', color: '#888', fontSize: '0.78rem' }}>📍 {interest.listings?.location}</p>
                      <p style={{ margin: 0, color: '#999', fontSize: '0.72rem' }}>{new Date(interest.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  {/* WhatsApp CTA */}
                  {interest.users?.phone && (
                    <div style={{ marginTop: '0.9rem', paddingTop: '0.9rem', borderTop: '1px solid #f5f2ee' }}>
                      <a
                        href={`https://wa.me/${interest.users.phone.replace(/\D/g, '')}?text=Hello ${interest.users.name}, I saw your interest in my property "${interest.listings?.title}" on RentX. I'd like to discuss it with you.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.45rem 1rem', background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #bbf7d0', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '700', textDecoration: 'none', transition: 'background 0.15s' }}
                      >
                        💬 Message on WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}