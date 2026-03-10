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

  useEffect(() => {
    const init = async () => {
      const { id } = await params
      setListingId(id)
      fetchListing(id)
      checkUser(id)
    }
    init()
  }, [])

  const fetchListing = async (id: string) => {
    const { data } = await supabase
      .from('listings')
      .select('*, listing_photos(*)')
      .eq('id', id)
      .single()
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

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>Loading...</div>
  if (!listing) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Georgia, serif' }}>Listing not found</div>

  const photos = listing.listing_photos || []

  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#f8f5f0', minHeight: '100vh' }}>
      <nav style={{ background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a2e1a', margin: 0, cursor: 'pointer' }} onClick={() => router.push('/')}>RentX</h1>
        <button onClick={() => router.push('/')} style={{ padding: '0.5rem 1.25rem', border: '2px solid #ddd', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}>← Back</button>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem', background: '#e8e0d5' }}>
          {photos.length > 0 ? (
            <div>
              <img src={photos[activePhoto]?.photo_url} alt={listing.title} style={{ width: '100%', height: '450px', objectFit: 'cover' }} />
              {photos.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', overflowX: 'auto' }}>
                  {photos.map((photo: any, i: number) => (
                    <img key={i} src={photo.photo_url} alt="" onClick={() => setActivePhoto(i)}
                      style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', opacity: activePhoto === i ? 1 : 0.6, border: activePhoto === i ? '2px solid #2d5a2d' : 'none' }} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>No photos available</div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a2e1a', margin: '0 0 0.25rem' }}>{listing.title}</h2>
                <p style={{ color: '#666', margin: 0 }}>📍 {listing.location}</p>
              </div>
              <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', background: listing.status === 'available' ? '#d4edda' : '#f8d7da', color: listing.status === 'available' ? '#2d5a2d' : '#721c24' }}>
                {listing.status === 'available' ? 'Available' : 'Rented'}
              </span>
            </div>

            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2d5a2d', margin: '0 0 1.5rem' }}>${listing.price}<span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#666' }}>/month</span></p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Bedrooms', value: listing.bedrooms === 0 ? 'Studio' : listing.bedrooms },
                { label: 'Bathrooms', value: listing.bathrooms },
                { label: 'Sq Ft', value: listing.sqft || 'N/A' },
                { label: 'Available', value: listing.availability_date ? new Date(listing.availability_date).toLocaleDateString() : 'Now' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'white', padding: '1rem', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold', color: '#1a2e1a', fontSize: '1.1rem' }}>{item.value}</p>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.8rem' }}>{item.label}</p>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 style={{ color: '#1a2e1a', marginTop: 0 }}>About this property</h3>
              <p style={{ color: '#444', lineHeight: 1.8, margin: 0 }}>{listing.description}</p>
            </div>
          </div>

          <div>
            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', marginBottom: '1rem' }}>
              <h3 style={{ color: '#1a2e1a', marginTop: 0 }}>Listed by</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#2d5a2d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  {landlord?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p style={{ margin: '0 0 0.25rem', fontWeight: 'bold', color: '#1a2e1a' }}>{landlord?.name}</p>
                  {landlord?.verified && <span style={{ fontSize: '0.8rem', color: '#2d5a2d', fontWeight: 'bold' }}>✓ Verified</span>}
                </div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              {listing.status === 'rented' ? (
                <div style={{ textAlign: 'center', color: '#666' }}>
                  <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>This property has been rented</p>
                  <button onClick={() => router.push('/')} style={{ width: '100%', padding: '0.875rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Browse Other Listings</button>
                </div>
              ) : interested ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                  <p style={{ fontWeight: 'bold', color: '#2d5a2d', marginBottom: '0.25rem' }}>Interest Sent!</p>
                  <p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>The landlord will contact you soon</p>
                </div>
              ) : (
                <div>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem', marginTop: 0 }}>Interested in this property? Let the landlord know and they will reach out to you directly.</p>
                  <button onClick={handleInterest} disabled={submitting} style={{ width: '100%', padding: '0.875rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer' }}>
                    {submitting ? 'Sending...' : "I'm Interested"}
                  </button>
                  {!user && <p style={{ color: '#999', fontSize: '0.8rem', textAlign: 'center', marginBottom: 0 }}>You'll be asked to sign in first</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}