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
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    getUser()
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
    setUser(profile)
    fetchListings(user.id)
    fetchInterests(user.id)
    setLoading(false)
  }

  const fetchListings = async (uid: string) => {
    const { data } = await supabase.from('listings').select('*, listing_photos(*)').eq('landlord_id', uid)
    setListings(data || [])
  }

  const fetchInterests = async (uid: string) => {
    const { data } = await supabase
      .from('interests')
      .select('*, listings(*), users(*)')
      .eq('listings.landlord_id', uid)
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
    if (!confirm('Are you sure you want to delete this listing?')) return
    setDeleting(id)
    await supabase.from('listing_photos').delete().eq('listing_id', id)
    await supabase.from('interests').delete().eq('listing_id', id)
    await supabase.from('listings').delete().eq('id', id)
    setListings(prev => prev.filter(l => l.id !== id))
    setDeleting(null)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>Loading...</div>

  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#f8f5f0', minHeight: '100vh' }}>
      <nav style={{ background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a2e1a', margin: 0, cursor: 'pointer' }} onClick={() => router.push('/')}>RentX</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ color: '#666' }}>👋 {user?.name}</span>
          <button onClick={() => router.push('/profile')} style={{ padding: '0.5rem 1.25rem', border: '2px solid #ddd', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}>Profile</button>
          <button onClick={handleSignOut} style={{ padding: '0.5rem 1.25rem', border: '2px solid #ddd', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1a2e1a', margin: 0 }}>My Listings</h2>
            <p style={{ color: '#666', margin: '0.25rem 0 0' }}>{listings.length} {listings.length === 1 ? 'property' : 'properties'} listed</p>
          </div>
          <button onClick={() => router.push('/listings/create')} style={{ padding: '0.75rem 1.5rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
            + New Listing
          </button>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div style={{ background: 'white', borderRadius: '12px', padding: '4rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏠</div>
            <h3 style={{ color: '#1a2e1a', marginBottom: '0.5rem' }}>No listings yet</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>Create your first listing and start connecting with tenants</p>
            <button onClick={() => router.push('/listings/create')} style={{ padding: '0.75rem 1.5rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Create Listing</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {listings.map(listing => (
              <div key={listing.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                <div style={{ height: '180px', background: '#e8e0d5', overflow: 'hidden', position: 'relative' }}>
                  {listing.listing_photos?.[0] ? (
                    <img src={listing.listing_photos[0].photo_url} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>No photo</div>
                  )}
                  <span style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', background: listing.status === 'available' ? '#d4edda' : '#f8d7da', color: listing.status === 'available' ? '#2d5a2d' : '#721c24' }}>
                    {listing.status === 'available' ? 'Available' : 'Rented'}
                  </span>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h4 style={{ margin: '0 0 0.25rem', color: '#1a2e1a' }}>{listing.title}</h4>
                  <p style={{ margin: '0 0 0.5rem', color: '#666', fontSize: '0.9rem' }}>📍 {listing.location}</p>
                  <p style={{ margin: '0 0 1rem', fontWeight: 'bold', color: '#2d5a2d', fontSize: '1.1rem' }}>${listing.price}/mo</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => listing.status === 'available' ? markAsRented(listing.id) : markAsAvailable(listing.id)}
                      style={{ flex: 1, padding: '0.6rem', border: `2px solid ${listing.status === 'available' ? '#dc3545' : '#2d5a2d'}`, borderRadius: '8px', background: 'transparent', color: listing.status === 'available' ? '#dc3545' : '#2d5a2d', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                      {listing.status === 'available' ? 'Mark Rented' : 'Mark Available'}
                    </button>
                    <button
                      onClick={() => deleteListing(listing.id)}
                      disabled={deleting === listing.id}
                      style={{ padding: '0.6rem 0.75rem', border: '2px solid #dc3545', borderRadius: '8px', background: 'transparent', color: '#dc3545', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                      {deleting === listing.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Interests Section */}
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1a2e1a', marginBottom: '1.5rem' }}>Tenant Interests</h2>
          {interests.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '12px', padding: '3rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <p style={{ color: '#666', margin: 0 }}>No tenants have expressed interest yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {interests.map(interest => (
                <div key={interest.id} style={{ background: 'white', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold', color: '#1a2e1a' }}>{interest.users?.name}</p>
                    <p style={{ margin: '0 0 0.25rem', color: '#666', fontSize: '0.9rem' }}>📞 {interest.users?.phone}</p>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Interested in: {interest.listings?.title}</p>
                  </div>
                  <span style={{ color: '#999', fontSize: '0.8rem' }}>{new Date(interest.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}