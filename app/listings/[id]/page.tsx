'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [listing, setListing] = useState<any>(null)
  const [landlord, setLandlord] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [interested, setInterested] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activePhoto, setActivePhoto] = useState(0)
  const [listingId, setListingId] = useState<string>('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { id } = await params
      setListingId(id)
      fetchListing(id)
      checkUser(id)
    }
    init()
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const fetchListing = async (id: string) => {
    const { data } = await supabase.from('listings').select('*, listing_photos(*)').eq('id', id).single()
    setListing(data)
    if (data?.landlord_id) {
      const { data: landlordData } = await supabase.from('users').select('*').eq('id', data.landlord_id).single()
      setLandlord(landlordData)
    }
    setLoading(false)
  }

  const checkUser = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      const { data } = await supabase.from('interests').select('*').eq('tenant_id', user.id).eq('listing_id', id).single()
      if (data) setInterested(true)
    }
  }

  const handleInterest = async () => {
    if (!user) { router.push('/auth'); return }
    setSubmitting(true)
    await supabase.from('interests').insert({ tenant_id: user.id, listing_id: listingId })
    setInterested(true)
    setSubmitting(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Georgia, serif', background: '#faf8f5', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #f0ece6', borderTop: '3px solid #2d5a2d', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: '#888', fontSize: '0.9rem' }}>Loading property…</p>
    </div>
  )

  if (!listing) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Georgia, serif', background: '#faf8f5', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '3rem' }}>🏚️</div>
      <h3 style={{ color: '#1a2e1a' }}>Listing not found</h3>
      <button onClick={() => router.push('/')} style={{ padding: '0.65rem 1.5rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>← Back to Listings</button>
    </div>
  )

  const photos = listing.listing_photos || []

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: '#faf8f5', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .thumb:hover { opacity: 1 !important; }
        .interest-btn:hover { background: #3a7a3a !important; transform: translateY(-1px); }
        .interest-btn { transition: background 0.15s, transform 0.15s !important; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
          .detail-grid { grid-template-columns: 1fr !important; }
          .detail-photo { height: 260px !important; }
          .props-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .page-pad { padding: 1.25rem 1rem !important; }
          .cta-sticky { display: block !important; }
          .cta-sidebar { display: none !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-btn { display: none !important; }
          .cta-sticky { display: none !important; }
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
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button onClick={() => router.back()} style={{ padding: '0.4rem 0.9rem', border: '1.5px solid #ddd', borderRadius: '8px', background: 'transparent', color: '#555', fontWeight: '600', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Georgia, serif' }}>← Back</button>
          <button onClick={() => router.push('/')} style={{ padding: '0.4rem 0.9rem', border: '1.5px solid #2d5a2d', borderRadius: '8px', background: 'transparent', color: '#2d5a2d', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Georgia, serif' }}>All Listings</button>
        </div>
        <button className="nav-mobile-btn" onClick={() => router.back()}
          style={{ display: 'none', background: 'transparent', border: '1.5px solid #ddd', borderRadius: '8px', cursor: 'pointer', padding: '0.4rem 0.75rem', color: '#555', fontWeight: '600', fontSize: '0.82rem', fontFamily: 'Georgia, serif', alignItems: 'center' }}>
          ← Back
        </button>
      </nav>

      <div className="page-pad" style={{ maxWidth: '960px', margin: '0 auto', padding: '1.75rem 1.5rem', animation: 'fadeUp 0.4s ease both' }}>

        {/* Photo Gallery */}
        <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '1.75rem', background: '#e8e4de' }}>
          {photos.length > 0 ? (
            <div>
              <img
                src={photos[activePhoto]?.photo_url}
                alt={listing.title}
                className="detail-photo"
                style={{ width: '100%', height: '420px', objectFit: 'cover', display: 'block' }}
              />
              {photos.length > 1 && (
                <div style={{ display: 'flex', gap: '0.4rem', padding: '0.6rem', overflowX: 'auto', background: '#f5f2ee' }}>
                  {photos.map((photo: any, i: number) => (
                    <img key={i} src={photo.photo_url} alt="" className="thumb"
                      onClick={() => setActivePhoto(i)}
                      style={{ width: '70px', height: '52px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', flexShrink: 0, opacity: activePhoto === i ? 1 : 0.55, border: activePhoto === i ? '2.5px solid #2d5a2d' : '2.5px solid transparent', transition: 'opacity 0.15s, border-color 0.15s' }}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#bbb', gap: '0.75rem' }}>
              <span style={{ fontSize: '3rem' }}>🏠</span>
              <span style={{ fontSize: '0.9rem' }}>No photos available</span>
            </div>
          )}
        </div>

        {/* Main content — stacks on mobile */}
        <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.75rem' }}>

          {/* Left — Listing Info */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.65rem', fontWeight: '900', color: '#1a2e1a', margin: '0 0 0.2rem', letterSpacing: '-0.5px', lineHeight: 1.2 }}>{listing.title}</h2>
                <p style={{ color: '#777', margin: 0, fontSize: '0.9rem' }}>📍 {listing.location}</p>
              </div>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', background: listing.status === 'available' ? '#dcfce7' : '#fee2e2', color: listing.status === 'available' ? '#166534' : '#991b1b', border: `1px solid ${listing.status === 'available' ? '#bbf7d0' : '#fca5a5'}`, whiteSpace: 'nowrap' as const }}>
                {listing.status === 'available' ? '✓ Available' : '✕ Rented'}
              </span>
            </div>

            <p style={{ fontSize: '2rem', fontWeight: '900', color: '#2d5a2d', margin: '0 0 1.5rem', letterSpacing: '-0.75px' }}>
              ${listing.price}<span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#888' }}>/month</span>
            </p>

            {/* Property details */}
            <div className="props-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {[
                { icon: '🛏', label: 'Bedrooms', value: listing.bedrooms === 0 ? 'Studio' : listing.bedrooms },
                { icon: '🚿', label: 'Bathrooms', value: listing.bathrooms },
                { icon: '📐', label: 'Sq Ft', value: listing.sqft || 'N/A' },
                { icon: '📅', label: 'Available', value: listing.availability_date ? new Date(listing.availability_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Now' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'white', padding: '0.75rem 0.5rem', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f5f2ee' }}>
                  <div style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{item.icon}</div>
                  <p style={{ margin: '0 0 0.1rem', fontWeight: '800', color: '#1a2e1a', fontSize: '0.9rem' }}>{item.value}</p>
                  <p style={{ margin: 0, color: '#888', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f5f2ee', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#1a2e1a', marginTop: 0, fontSize: '0.95rem', fontWeight: '800', letterSpacing: '-0.3px' }}>About this property</h3>
              <p style={{ color: '#555', lineHeight: 1.85, margin: 0, fontSize: '0.875rem' }}>{listing.description}</p>
            </div>

            {/* Landlord card */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f5f2ee' }}>
              <h3 style={{ color: '#888', marginTop: 0, fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Listed by</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #2d5a2d, #4a8a4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '1rem', flexShrink: 0 }}>
                  {landlord?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p style={{ margin: '0 0 0.15rem', fontWeight: '800', color: '#1a2e1a', fontSize: '0.9rem' }}>{landlord?.name || 'Unknown'}</p>
                  {landlord?.verified && (
                    <span style={{ fontSize: '0.68rem', color: '#2d5a2d', fontWeight: '800', background: '#f0f7f0', padding: '0.12rem 0.45rem', borderRadius: '20px' }}>✓ Verified Landlord</span>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile sticky CTA — shown below content on mobile */}
            <div className="cta-sticky" style={{ display: 'none', marginTop: '1.5rem' }}>
              <InterestCTA listing={listing} interested={interested} submitting={submitting} onInterest={handleInterest} onBrowse={() => router.push('/')} />
            </div>
          </div>

          {/* Right sidebar — hidden on mobile, replaced by sticky CTA above */}
          <div className="cta-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f5f2ee' }}>
              <h3 style={{ color: '#888', marginTop: 0, fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Listed by</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #2d5a2d, #4a8a4a)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '1rem', flexShrink: 0 }}>
                  {landlord?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p style={{ margin: '0 0 0.15rem', fontWeight: '800', color: '#1a2e1a', fontSize: '0.9rem' }}>{landlord?.name || 'Unknown'}</p>
                  {landlord?.verified && (
                    <span style={{ fontSize: '0.68rem', color: '#2d5a2d', fontWeight: '800', background: '#f0f7f0', padding: '0.12rem 0.45rem', borderRadius: '20px' }}>✓ Verified Landlord</span>
                  )}
                </div>
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f5f2ee' }}>
              <InterestCTA listing={listing} interested={interested} submitting={submitting} onInterest={handleInterest} onBrowse={() => router.push('/')} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InterestCTA({ listing, interested, submitting, onInterest, onBrowse }: {
  listing: any, interested: boolean, submitting: boolean,
  onInterest: () => void, onBrowse: () => void
}) {
  if (listing.status === 'rented') return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2.25rem', marginBottom: '0.6rem' }}>🔒</div>
      <p style={{ color: '#888', fontWeight: '600', marginBottom: '1rem', fontSize: '0.875rem' }}>This property has already been rented</p>
      <button onClick={onBrowse} style={{ width: '100%', padding: '0.85rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
        Browse Other Listings
      </button>
    </div>
  )

  if (interested) return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2.25rem', marginBottom: '0.6rem' }}>✅</div>
      <p style={{ fontWeight: '800', color: '#2d5a2d', marginBottom: '0.3rem', fontSize: '0.95rem' }}>Interest Sent!</p>
      <p style={{ color: '#777', fontSize: '0.82rem', margin: '0 0 1rem' }}>The landlord will contact you shortly</p>
      <button onClick={onBrowse} style={{ width: '100%', padding: '0.7rem', background: '#f0f7f0', color: '#2d5a2d', border: '1.5px solid #bbf7d0', borderRadius: '10px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
        Browse More Listings
      </button>
    </div>
  )

  return (
    <div>
      <p style={{ color: '#666', fontSize: '0.84rem', marginBottom: '1.1rem', marginTop: 0, lineHeight: 1.7 }}>
        Interested in this property? Let the landlord know and they'll reach out to you directly.
      </p>
      <button
        className="interest-btn"
        onClick={onInterest}
        disabled={submitting}
        style={{ width: '100%', padding: '0.95rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '1rem', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, fontFamily: 'Georgia, serif' }}
      >
        {submitting ? 'Sending…' : "❤️ I'm Interested"}
      </button>
    </div>
  )
}
