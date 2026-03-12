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
  const [scrolled, setScrolled] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', price: '',
    bedrooms: '', bathrooms: '', sqft: '',
    location: '', availability_date: ''
  })

  useEffect(() => {
    checkUser()
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
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
      sqft: form.sqft ? parseFloat(form.sqft) : null,
      location: form.location,
      availability_date: form.availability_date || null,
      status: 'available'
    }).select().single()

    if (listingError) { setError(listingError.message); setLoading(false); return }

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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem',
    border: '1.5px solid #e8e4de', borderRadius: '8px',
    fontSize: '0.95rem', boxSizing: 'border-box',
    marginTop: '0.4rem', color: '#1a2e1a',
    background: '#fdfcfb', fontFamily: 'Georgia, serif',
    outline: 'none',
  }

  const steps = ['Basic Info', 'Property Details', 'Photos']

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: '#faf8f5', minHeight: '100vh' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        input:focus, select:focus, textarea:focus { border-color: #2d5a2d !important; box-shadow: 0 0 0 3px rgba(45,90,45,0.1); }
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
        {/* Logo — always goes home */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <div style={{ width: '32px', height: '32px', background: '#2d5a2d', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '16px' }}>🏠</span>
          </div>
          <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e1a', letterSpacing: '-0.5px' }}>RentX</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => router.push('/dashboard/landlord')}
            style={{ padding: '0.45rem 1rem', border: '1.5px solid #ddd', borderRadius: '8px', background: 'transparent', color: '#555', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Georgia, serif' }}
          >
            ← Dashboard
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '620px', margin: '0 auto', padding: '2.5rem 2rem', animation: 'fadeUp 0.4s ease both' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: '#1a2e1a', margin: '0 0 0.25rem', letterSpacing: '-0.5px' }}>List Your Property</h2>
          <p style={{ color: '#888', margin: 0, fontSize: '0.9rem' }}>Step {step} of 3 — {steps[step - 1]}</p>
        </div>

        {/* Progress bar */}
        <div style={{ background: '#eee8e0', borderRadius: '99px', height: '6px', marginBottom: '2rem', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(90deg, #2d5a2d, #4ade80)', height: '6px', borderRadius: '99px', width: `${(step / 3) * 100}%`, transition: 'width 0.4s ease' }} />
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: step === i + 1 ? 1 : 0.45 }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: step > i ? '#2d5a2d' : step === i + 1 ? '#2d5a2d' : '#ddd', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '800', flexShrink: 0 }}>
                {step > i ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: step === i + 1 ? '700' : '500', color: step === i + 1 ? '#1a2e1a' : '#aaa', whiteSpace: 'nowrap' as const }}>{s}</span>
              {i < 2 && <span style={{ color: '#ddd', marginLeft: '0.25rem' }}>—</span>}
            </div>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid #f5f2ee' }}>

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h3 style={{ color: '#1a2e1a', marginTop: 0, fontWeight: '800', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Basic Information</h3>
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontWeight: '700', color: '#444', fontSize: '0.85rem' }}>Property Title</label>
                <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="e.g. Sunny 2-bedroom apartment in East Legon" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontWeight: '700', color: '#444', fontSize: '0.85rem' }}>Location</label>
                <input value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g. East Legon, Accra" style={inputStyle} />
              </div>
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontWeight: '700', color: '#444', fontSize: '0.85rem' }}>Monthly Rent (GHS)</label>
                <input value={form.price} onChange={e => update('price', e.target.value)} type="number" placeholder="e.g. 2500" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '700', color: '#444', fontSize: '0.85rem' }}>Available From</label>
                <input value={form.availability_date} onChange={e => update('availability_date', e.target.value)} type="date" style={inputStyle} />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <h3 style={{ color: '#1a2e1a', marginTop: 0, fontWeight: '800', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Property Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '700', color: '#444', fontSize: '0.85rem' }}>Bedrooms</label>
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
                  <label style={{ display: 'block', fontWeight: '700', color: '#444', fontSize: '0.85rem' }}>Bathrooms</label>
                  <select value={form.bathrooms} onChange={e => update('bathrooms', e.target.value)} style={inputStyle}>
                    <option value="">Select</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3+</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontWeight: '700', color: '#444', fontSize: '0.85rem' }}>Square Footage <span style={{ color: '#aaa', fontWeight: '500' }}>(optional)</span></label>
                <input value={form.sqft} onChange={e => update('sqft', e.target.value)} type="number" placeholder="e.g. 850" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '700', color: '#444', fontSize: '0.85rem' }}>Description</label>
                <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe your property — location highlights, nearby amenities, condition..." rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <h3 style={{ color: '#1a2e1a', marginTop: 0, fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Upload Photos</h3>
              <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Properties with photos get significantly more interest. Add at least one clear photo.
              </p>
              <label style={{
                display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center',
                padding: '2rem', border: '2px dashed #d1d5db', borderRadius: '12px',
                background: '#faf8f5', cursor: 'pointer', gap: '0.5rem',
              }}>
                <span style={{ fontSize: '2rem' }}>📸</span>
                <span style={{ color: '#555', fontWeight: '700', fontSize: '0.9rem' }}>Click to upload photos</span>
                <span style={{ color: '#aaa', fontSize: '0.78rem' }}>JPG, PNG, WEBP supported</span>
                <input type="file" multiple accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>

              {photos.length > 0 && (
                <div>
                  <p style={{ color: '#555', fontSize: '0.82rem', fontWeight: '700', margin: '1.25rem 0 0.75rem' }}>{photos.length} photo{photos.length !== 1 ? 's' : ''} selected</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {photos.map((photo, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={URL.createObjectURL(photo)} alt="" style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '8px', display: 'block' }} />
                        {i === 0 && <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: '#2d5a2d', color: 'white', fontSize: '0.6rem', fontWeight: '700', padding: '1px 5px', borderRadius: '4px' }}>Cover</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && <p style={{ color: '#dc2626', marginTop: '1rem', fontSize: '0.85rem', fontWeight: '600' }}>{error}</p>}
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f5f2ee' }}>
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                style={{ padding: '0.7rem 1.5rem', border: '1.5px solid #ddd', borderRadius: '8px', background: 'transparent', color: '#555', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'Georgia, serif' }}
              >
                ← Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                style={{ padding: '0.7rem 1.75rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'Georgia, serif' }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ padding: '0.7rem 1.75rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.9rem', opacity: loading ? 0.7 : 1, fontFamily: 'Georgia, serif' }}
              >
                {loading ? 'Publishing…' : '🚀 Publish Listing'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}