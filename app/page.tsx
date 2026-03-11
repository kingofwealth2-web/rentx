'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

export default function HomePage() {
  const router = useRouter()
  const [listings, setListings] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    fetchListings()
    checkUser()
  }, [])

  const fetchListings = async () => {
    const { data } = await supabase.from('listings').select(`*, listing_photos(*)`).eq('status', 'available')
    setListings(data || [])
  }

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
      setUserProfile(profile)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserProfile(null)
  }

  const filtered = listings.filter(l => {
    const matchSearch = l.title?.toLowerCase().includes(search.toLowerCase()) || l.location?.toLowerCase().includes(search.toLowerCase())
    const matchPrice = maxPrice ? l.price <= parseInt(maxPrice) : true
    const matchBeds = bedrooms ? l.bedrooms === parseInt(bedrooms) : true
    return matchSearch && matchPrice && matchBeds
  })

  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#f8f5f0', minHeight: '100vh' }}>

      <nav style={{ background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a2e1a', margin: 0 }}>RentX</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ color: '#666' }}>👋 {userProfile?.name}</span>
              <button
                onClick={() => router.push(userProfile?.role === 'landlord' ? '/dashboard/landlord' : '/dashboard/tenant')}
                style={{ padding: '0.5rem 1.25rem', border: '2px solid #2d5a2d', borderRadius: '8px', background: 'transparent', color: '#2d5a2d', fontWeight: 'bold', cursor: 'pointer' }}>
                Dashboard
              </button>
              <button
                onClick={() => router.push('/profile')}
                style={{ padding: '0.5rem 1.25rem', border: '2px solid #2d5a2d', borderRadius: '8px', background: 'transparent', color: '#2d5a2d', fontWeight: 'bold', cursor: 'pointer' }}>
                Profile
              </button>
              <button
                onClick={handleSignOut}
                style={{ padding: '0.5rem 1.25rem', border: '2px solid #1a2e1a', borderRadius: '8px', background: 'transparent', color: '#1a2e1a', fontWeight: 'bold', cursor: 'pointer' }}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button onClick={() => router.push('/auth')} style={{ padding: '0.5rem 1.25rem', border: '2px solid #2d5a2d', borderRadius: '8px', background: 'transparent', color: '#2d5a2d', fontWeight: 'bold', cursor: 'pointer' }}>Login</button>
              <button onClick={() => router.push('/auth')} style={{ padding: '0.5rem 1.25rem', border: 'none', borderRadius: '8px', background: '#2d5a2d', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Sign Up</button>
            </>
          )}
        </div>
      </nav>

      <div style={{ background: 'linear-gradient(135deg, #1a2e1a 0%, #2d5a2d 100%)', padding: '5rem 2rem', textAlign: 'center', color: 'white' }}>
        <h2 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem', lineHeight: 1.2, marginTop: 0 }}>Find Your Next Home</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', opacity: 0.85 }}>The easiest way to find and list rental homes in your city</p>
        <div style={{ display: 'flex', gap: '1rem', maxWidth: '700px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by location or title..." style={{ flex: 2, padding: '0.875rem 1rem', borderRadius: '8px', border: 'none', fontSize: '1rem', minWidth: '200px', color: '#1a2e1a', background: 'white' }} />
          <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max price" type="number" style={{ flex: 1, padding: '0.875rem 1rem', borderRadius: '8px', border: 'none', fontSize: '1rem', minWidth: '120px', color: '#1a2e1a', background: 'white' }} />
          <select value={bedrooms} onChange={e => setBedrooms(e.target.value)} style={{ flex: 1, padding: '0.875rem 1rem', borderRadius: '8px', border: 'none', fontSize: '1rem', minWidth: '120px', color: '#1a2e1a', background: 'white' }}>
            <option value="">Any beds</option>
            <option value="0">Studio</option>
            <option value="1">1 bed</option>
            <option value="2">2 beds</option>
            <option value="3">3 beds</option>
            <option value="4">4+ beds</option>
          </select>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a2e1a', marginBottom: '1.5rem' }}>
          {filtered.length > 0 ? `${filtered.length} Available ${filtered.length === 1 ? 'Property' : 'Properties'}` : 'No listings yet'}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {filtered.map(listing => (
            <div key={listing.id} onClick={() => router.push(`/listings/${listing.id}`)}
              style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
              <div style={{ height: '200px', background: '#e8e0d5', overflow: 'hidden' }}>
                {listing.listing_photos?.[0] ? (
                  <img src={listing.listing_photos[0].photo_url} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '0.9rem' }}>No photo yet</div>
                )}
              </div>
              <div style={{ padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', color: '#1a2e1a' }}>{listing.title}</h4>
                <p style={{ margin: '0 0 0.75rem', color: '#666', fontSize: '0.9rem' }}>📍 {listing.location}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2d5a2d' }}>${listing.price}/mo</span>
                  <span style={{ color: '#666', fontSize: '0.85rem' }}>{listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} bed`} · {listing.bathrooms} bath</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '5rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a2e1a', marginBottom: '3rem' }}>How RentX Works</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
            {[
              { icon: '🔍', title: 'Browse Listings', desc: 'Search available homes in your city for free, no account needed' },
              { icon: '❤️', title: 'Express Interest', desc: 'Sign up and hit "I\'m Interested" on any home you like' },
              { icon: '📞', title: 'Connect Directly', desc: 'The landlord receives your contact and reaches out to you' },
            ].map((step, i) => (
              <div key={i} style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{step.icon}</div>
                <h4 style={{ color: '#1a2e1a', marginBottom: '0.5rem' }}>{step.title}</h4>
                <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {!user && (
          <div style={{ marginTop: '4rem', background: 'linear-gradient(135deg, #1a2e1a 0%, #2d5a2d 100%)', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: 'white' }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem', marginTop: 0 }}>Are you a landlord?</h3>
            <p style={{ opacity: 0.85, marginBottom: '1.5rem', fontSize: '1.1rem' }}>List your property for free and connect with tenants instantly</p>
            <button onClick={() => router.push('/auth')} style={{ padding: '0.875rem 2rem', background: 'white', color: '#2d5a2d', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>List Your Property</button>
          </div>
        )}
      </div>
    </div>
  )
}