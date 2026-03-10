'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function CreateListing() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    location: '',
    availability_date: ''
  })

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (profile?.role !== 'landlord') router.push('/')
  }

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setPhotos(Array.from(e.target.files))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: listing, error: listingError } = await supabase.from('listings').insert({
      landlord_id: user.id,
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      bedrooms: parseInt(form.bedrooms),
      bathrooms: parseInt(form.bathrooms),
      sqft: parseFloat(form.sqft),
      location: form.location,
      availability_date: form.availability_date,
      status: 'available'
    }).select().single()

    if (listingError) { setError(listingError.message); setLoading(false); return }

    // Upload photos
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i]
      const fileName = `${listing.id}/${Date.now()}-${file.name}`
      const { data: upload } = await supabase.storage.from('listing-photos').upload(fileName, file)
      if (upload) {
        const { data: urlData } = supabase.storage.from('listing-photos').getPublicUrl(fileName)
        await supabase.from('listing_photos').insert({ listing_id: listing.id, photo_url: urlData.publicUrl, order_index: i })
      }
    }

    router.push('/dashboard/landlord')
    setLoading(false)
  }

  const inputStyle = { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' as const, marginTop: '0.5rem' }
  const labelStyle = { display: 'block' as const, fontWeight: 'bold' as const, color: '#333' }

  return (
    <div style={{ fontFamily: 'Georgia, serif', background: '#f8f5f0', minHeight: '100vh' }}>
      <nav style={{ background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1a2e1a', margin: 0, cursor: 'pointer' }} onClick={() => router.push('/')}>RentX</h1>
        <button onClick={() => router.push('/dashboard/landlord')} style={{ padding: '0.5rem 1.25rem', border: '2px solid #ddd', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}>Back to Dashboard</button>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1a2e1a', marginBottom: '0.5rem' }}>List Your Property</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>Step {step} of 3</p>

        {/* Progress bar */}
        <div style={{ background: '#e0e0e0', borderRadius: '8px', height: '6px', marginBottom: '2rem' }}>
          <div style={{ background: '#2d5a2d', height: '6px', borderRadius: '8px', width: `${(step / 3) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>

          {/* Step 1 - Basic Info */}
          {step === 1 && (
            <div>
              <h3 style={{ color: '#1a2e1a', marginTop: 0 }}>Basic Information</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Property Title</label>
                <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Sunny 2-bedroom apartment" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Location</label>
                <input value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g. Downtown, Main Street" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Monthly Price ($)</label>
                <input value={form.price} onChange={e => update('price', e.target.value)} type="number" placeholder="e.g. 1200" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Available From</label>
                <input value={form.availability_date} onChange={e => update('availability_date', e.target.value)} type="date" style={inputStyle} />
              </div>
            </div>
          )}

          {/* Step 2 - Details */}
          {step === 2 && (
            <div>
              <h3 style={{ color: '#1a2e1a', marginTop: 0 }}>Property Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={labelStyle}>Bedrooms</label>
                  <select value={form.bedrooms} onChange={e => update('bedrooms', e.target.value)} style={inputStyle}>
                    <option value="">Select</option>
                    <option value="0">Studio</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Bathrooms</label>
                  <select value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} style={inputStyle}>
                    <option value="">Select</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3+</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Square Footage</label>
                <input value={form.sqft} onChange={e => update('sqft', e.target.value)} type="number" placeholder="e.g. 850" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe your property..." rows={5} style={{ ...inputStyle, resize: 'vertical' as const }} />
              </div>
            </div>
          )}

          {/* Step 3 - Photos */}
          {step === 3 && (
            <div>
              <h3 style={{ color: '#1a2e1a', marginTop: 0 }}>Upload Photos</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Add photos of your property. Good photos attract more tenants.</p>
              <input type="file" multiple accept="image/*" onChange={handlePhotoChange} style={{ marginBottom: '1rem' }} />
              {photos.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
                  {photos.map((photo, i) => (
                    <img key={i} src={URL.createObjectURL(photo)} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                  ))}
                </div>
              )}
              {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} style={{ padding: '0.75rem 1.5rem', border: '2px solid #ddd', borderRadius: '8px', background: 'transparent', cursor: 'pointer', fontWeight: 'bold' }}>Back</button>
            ) : <div />}
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} style={{ padding: '0.75rem 1.5rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Next</button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} style={{ padding: '0.75rem 1.5rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                {loading ? 'Publishing...' : 'Publish Listing'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}