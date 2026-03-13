'use client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

function SkeletonCard() {
  return (
    <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
      <div style={{ height: '200px', background: 'linear-gradient(90deg, #f0ede8 25%, #e8e4de 50%, #f0ede8 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ padding: '1.25rem' }}>
        <div style={{ height: '14px', background: '#f0ede8', borderRadius: '6px', marginBottom: '10px', width: '70%', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ height: '12px', background: '#f0ede8', borderRadius: '6px', marginBottom: '14px', width: '50%', animation: 'shimmer 1.5s infinite' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ height: '20px', background: '#f0ede8', borderRadius: '6px', width: '35%', animation: 'shimmer 1.5s infinite' }} />
          <div style={{ height: '20px', background: '#f0ede8', borderRadius: '6px', width: '30%', animation: 'shimmer 1.5s infinite' }} />
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [listings, setListings] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetchListings()
    checkUser()
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const fetchListings = async () => {
    const { data } = await supabase.from('listings').select('*, listing_photos(*)').eq('status', 'available')
    setListings(data || [])
    setLoading(false)
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
    setMenuOpen(false)
  }

  const getDashboardPath = () => userProfile?.role === 'landlord' ? '/dashboard/landlord' : '/dashboard/tenant'

  const isNew = (createdAt: string) => {
    if (!createdAt) return false
    return (Date.now() - new Date(createdAt).getTime()) < 1000 * 60 * 60 * 24 * 3
  }

  const filtered = listings.filter(l => {
    const matchSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.location?.toLowerCase().includes(search.toLowerCase())
    const matchPrice = !maxPrice || l.price <= parseInt(maxPrice)
    const matchBeds = !bedrooms || l.bedrooms === parseInt(bedrooms)
    return matchSearch && matchPrice && matchBeds
  })

  return (
    <div style={{ fontFamily: "'Georgia', serif", background: '#faf8f5', minHeight: '100vh' }}>
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .listing-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 32px rgba(0,0,0,0.1) !important; }
        .listing-card { transition: transform 0.25s ease, box-shadow 0.25s ease !important; }
        .filter-select:focus { outline: none; border-color: #2d5a2d !important; box-shadow: 0 0 0 3px rgba(45,90,45,0.1); }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-card { transition: transform 0.2s; }

        /* Mobile menu */
        .mobile-menu { animation: slideDown 0.2s ease both; }

        /* Responsive: hide desktop nav items on mobile */
        @media (max-width: 640px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
          .hero-title { font-size: 2rem !important; letter-spacing: -0.5px !important; }
          .hero-sub { font-size: 0.95rem !important; }
          .hero-padding { padding: 3rem 1.25rem 2.5rem !important; }
          .search-box { flex-direction: column !important; }
          .search-box input, .search-box select { min-width: unset !important; width: 100% !important; }
          .stats-bar { gap: 1.25rem !important; padding: 1rem 1.25rem !important; }
          .section-pad { padding: 2rem 1.25rem !important; }
          .cta-box { padding: 2rem 1.25rem !important; }
          .cta-title { font-size: 1.5rem !important; }
        }
        @media (min-width: 641px) {
          .nav-mobile-btn { display: none !important; }
          .mobile-menu-overlay { display: none !important; }
        }
      `}</style>

      {/* Sticky Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: scrolled ? 'rgba(255,255,255,0.97)' : 'white',
        backdropFilter: 'blur(12px)',
        padding: '0 1.25rem',
        height: '60px',
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
          {user && userProfile ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.7rem', background: '#f0f7f0', borderRadius: '20px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#2d5a2d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '11px', fontWeight: 'bold' }}>
                  {userProfile?.name?.[0]?.toUpperCase()}
                </div>
                <span style={{ color: '#2d5a2d', fontSize: '0.82rem', fontWeight: '600' }}>{userProfile?.name?.split(' ')[0]}</span>
              </div>
              <button onClick={() => router.push(getDashboardPath())} style={{ padding: '0.4rem 0.9rem', border: '1.5px solid #2d5a2d', borderRadius: '8px', background: 'transparent', color: '#2d5a2d', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Georgia, serif' }}>Dashboard</button>
              <button onClick={() => router.push('/profile')} style={{ padding: '0.4rem 0.9rem', border: '1.5px solid #ddd', borderRadius: '8px', background: 'transparent', color: '#555', fontWeight: '600', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Georgia, serif' }}>Profile</button>
              <button onClick={handleSignOut} style={{ padding: '0.4rem 0.9rem', border: '1.5px solid #1a2e1a', borderRadius: '8px', background: 'transparent', color: '#1a2e1a', fontWeight: '700', cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'Georgia, serif' }}>Sign Out</button>
            </>
          ) : (
            <>
              <button onClick={() => router.push('/auth')} style={{ padding: '0.4rem 0.9rem', border: 'none', background: 'transparent', color: '#555', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'Georgia, serif' }}>Sign In</button>
              <button onClick={() => router.push('/auth')} style={{ padding: '0.4rem 1.1rem', border: 'none', borderRadius: '8px', background: '#2d5a2d', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'Georgia, serif' }}>Get Started</button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-mobile-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.25rem', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}
        >
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#1a2e1a', borderRadius: '2px', transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ display: 'block', width: '16px', height: '2px', background: '#1a2e1a', borderRadius: '2px', opacity: menuOpen ? 0 : 1, transition: 'all 0.2s' }} />
          <span style={{ display: 'block', width: '22px', height: '2px', background: '#1a2e1a', borderRadius: '2px', transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </nav>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="mobile-menu-overlay" style={{ position: 'fixed', top: '60px', left: 0, right: 0, zIndex: 199, background: 'white', borderBottom: '1px solid #f0ece6', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {user && userProfile ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f0f7f0', borderRadius: '10px', marginBottom: '0.25rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2d5a2d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                  {userProfile?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: '700', color: '#1a2e1a', fontSize: '0.9rem' }}>{userProfile?.name}</p>
                  <p style={{ margin: 0, color: '#888', fontSize: '0.75rem', textTransform: 'capitalize' }}>{userProfile?.role}</p>
                </div>
              </div>
              <button onClick={() => { router.push(getDashboardPath()); setMenuOpen(false) }} style={{ padding: '0.75rem 1rem', border: '1.5px solid #2d5a2d', borderRadius: '10px', background: 'transparent', color: '#2d5a2d', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left', fontFamily: 'Georgia, serif' }}>Dashboard</button>
              <button onClick={() => { router.push('/profile'); setMenuOpen(false) }} style={{ padding: '0.75rem 1rem', border: '1.5px solid #ddd', borderRadius: '10px', background: 'transparent', color: '#555', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left', fontFamily: 'Georgia, serif' }}>Profile</button>
              <button onClick={handleSignOut} style={{ padding: '0.75rem 1rem', border: '1.5px solid #f0ece6', borderRadius: '10px', background: 'transparent', color: '#888', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', textAlign: 'left', fontFamily: 'Georgia, serif' }}>Sign Out</button>
            </>
          ) : (
            <>
              <button onClick={() => { router.push('/auth'); setMenuOpen(false) }} style={{ padding: '0.75rem 1rem', border: '1.5px solid #2d5a2d', borderRadius: '10px', background: 'transparent', color: '#2d5a2d', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', fontFamily: 'Georgia, serif' }}>Sign In</button>
              <button onClick={() => { router.push('/auth'); setMenuOpen(false) }} style={{ padding: '0.75rem 1rem', border: 'none', borderRadius: '10px', background: '#2d5a2d', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem', fontFamily: 'Georgia, serif' }}>Get Started</button>
            </>
          )}
        </div>
      )}

      {/* Hero */}
      <div className="hero-padding" style={{
        background: 'linear-gradient(160deg, #0f1e0f 0%, #1a2e1a 50%, #243824 100%)',
        padding: '4rem 1.5rem 3.5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,90,45,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', position: 'relative', animation: 'fadeUp 0.6s ease both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '20px', padding: '0.3rem 0.9rem', marginBottom: '1.25rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulse-dot 2s infinite', flexShrink: 0 }} />
            <span style={{ color: '#4ade80', fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Listings Updated Daily</span>
          </div>

          <h2 className="hero-title" style={{ fontSize: 'clamp(1.9rem, 6vw, 3.5rem)', fontWeight: '900', color: 'white', margin: '0 0 0.85rem', lineHeight: 1.15, letterSpacing: '-1px' }}>
            Find Your Perfect<br /><span style={{ color: '#4ade80' }}>Rental Home</span>
          </h2>
          <p className="hero-sub" style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.65)', marginBottom: '2rem', lineHeight: 1.7 }}>
            The easiest way to find and list rental homes.<br />No agents. No fees. Connect directly.
          </p>

          {/* Search bar — stacks on mobile */}
          <div className="search-box" style={{ background: 'white', borderRadius: '14px', padding: '0.65rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', boxShadow: '0 16px 48px rgba(0,0,0,0.3)' }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍  Search by location or name..."
              style={{ flex: '1 1 180px', padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1.5px solid #f0ece6', fontSize: '0.95rem', color: '#1a2e1a', background: '#faf8f5', fontFamily: 'Georgia, serif', minWidth: 0 }}
            />
            <input
              value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
              placeholder="Max price" type="number"
              style={{ flex: '0 1 110px', padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1.5px solid #f0ece6', fontSize: '0.95rem', color: '#1a2e1a', background: '#faf8f5', fontFamily: 'Georgia, serif', minWidth: 0 }}
            />
            <select
              value={bedrooms} onChange={e => setBedrooms(e.target.value)}
              style={{ flex: '0 1 110px', padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1.5px solid #f0ece6', fontSize: '0.95rem', color: '#1a2e1a', background: '#faf8f5', fontFamily: 'Georgia, serif', cursor: 'pointer', minWidth: 0 }}
            >
              <option value="">Any beds</option>
              <option value="0">Studio</option>
              <option value="1">1 bed</option>
              <option value="2">2 beds</option>
              <option value="3">3 beds</option>
              <option value="4">4+ beds</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #f0ece6' }}>
        <div className="stats-bar" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap', padding: '1.1rem 1.5rem' }}>
          {[
            { value: listings.length + '+', label: 'Active Listings' },
            { value: '100%', label: 'Free to Browse' },
            { value: 'Direct', label: 'Landlord Contact' },
            { value: '0', label: 'Agent Fees' },
          ].map((stat, i) => (
            <div key={i} className="stat-card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#2d5a2d', letterSpacing: '-0.5px' }}>{stat.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#888', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Listings */}
      <div className="section-pad" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a2e1a', margin: 0, letterSpacing: '-0.3px' }}>
            {loading ? 'Loading...' : filtered.length > 0 ? `${filtered.length} Available ${filtered.length === 1 ? 'Property' : 'Properties'}` : 'No listings found'}
          </h3>
          {!loading && search && <p style={{ color: '#888', fontSize: '0.82rem', margin: '4px 0 0' }}>Results for "{search}"</p>}
          {(search || maxPrice || bedrooms) && (
            <button onClick={() => { setSearch(''); setMaxPrice(''); setBedrooms('') }} style={{ padding: '0.35rem 0.85rem', border: '1.5px solid #ddd', borderRadius: '20px', background: 'transparent', color: '#666', fontSize: '0.78rem', cursor: 'pointer', fontWeight: '600', fontFamily: 'Georgia, serif' }}>
              ✕ Clear filters
            </button>
          )}
        </div>

        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem', background: 'white', borderRadius: '16px', border: '2px dashed #e8e4de' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>🏘️</div>
            <h4 style={{ color: '#1a2e1a', fontSize: '1.2rem', fontWeight: '800', margin: '0 0 0.5rem' }}>No properties found</h4>
            <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              {search || maxPrice || bedrooms ? 'Try adjusting your filters' : 'No listings available right now — check back soon'}
            </p>
            {(search || maxPrice || bedrooms) && (
              <button onClick={() => { setSearch(''); setMaxPrice(''); setBedrooms('') }} style={{ padding: '0.65rem 1.5rem', background: '#2d5a2d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>Clear Filters</button>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {filtered.map((listing, idx) => (
              <div key={listing.id} className="listing-card" onClick={() => router.push(`/listings/${listing.id}`)}
                style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', cursor: 'pointer', animation: `fadeUp 0.4s ease ${idx * 0.04}s both` }}>
                <div style={{ height: '200px', background: '#e8e4de', overflow: 'hidden', position: 'relative' }}>
                  {listing.listing_photos?.[0] ? (
                    <img src={listing.listing_photos[0].photo_url} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#bbb', gap: '0.5rem' }}>
                      <span style={{ fontSize: '2.5rem' }}>🏠</span>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>No photo yet</span>
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)', pointerEvents: 'none' }} />
                  {isNew(listing.created_at) && (
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', background: '#4ade80', color: '#0f1e0f', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.68rem', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase' }}>New</div>
                  )}
                  <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem' }}>
                    <span style={{ color: 'white', fontWeight: '900', fontSize: '1.15rem', letterSpacing: '-0.5px', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>${listing.price}<span style={{ fontSize: '0.72rem', fontWeight: '600', opacity: 0.9 }}>/mo</span></span>
                  </div>
                </div>
                <div style={{ padding: '1rem 1.1rem' }}>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: '800', color: '#1a2e1a', lineHeight: 1.3 }}>{listing.title}</h4>
                  <p style={{ margin: '0 0 0.8rem', color: '#888', fontSize: '0.8rem' }}>📍 {listing.location}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.7rem', borderTop: '1px solid #f5f2ee' }}>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <span style={{ color: '#555', fontSize: '0.78rem' }}>🛏 <strong style={{ color: '#1a2e1a' }}>{listing.bedrooms === 0 ? 'Studio' : listing.bedrooms}</strong></span>
                      <span style={{ color: '#555', fontSize: '0.78rem' }}>🚿 <strong style={{ color: '#1a2e1a' }}>{listing.bathrooms}</strong></span>
                      {listing.sqft && (
                        <span style={{ color: '#555', fontSize: '0.78rem' }}>📐 <strong style={{ color: '#1a2e1a' }}>{listing.sqft}</strong></span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#2d5a2d', fontWeight: '700', background: '#f0f7f0', padding: '0.18rem 0.55rem', borderRadius: '20px' }}>Available</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How it works */}
        <div style={{ marginTop: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-block', padding: '0.25rem 0.9rem', background: '#f0f7f0', borderRadius: '20px', color: '#2d5a2d', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>Simple Process</div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#1a2e1a', margin: 0, letterSpacing: '-0.5px' }}>How RentX Works</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '🔍', step: '01', title: 'Browse Listings', desc: 'Search available homes for free — no account needed.' },
              { icon: '❤️', step: '02', title: 'Express Interest', desc: 'Create a free account and tap "I\'m Interested" on homes you like.' },
              { icon: '📞', step: '03', title: 'Connect Directly', desc: 'The landlord gets your contact info and reaches out to you.' },
            ].map((step, i) => (
              <div key={i} style={{ background: 'white', padding: '1.5rem', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '1.5rem', fontWeight: '900', color: '#f5f2ee' }}>{step.step}</div>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{step.icon}</div>
                <h4 style={{ color: '#1a2e1a', fontWeight: '800', margin: '0 0 0.4rem', fontSize: '0.95rem' }}>{step.title}</h4>
                <p style={{ color: '#777', fontSize: '0.83rem', lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Landlord CTA */}
        {!user && (
          <div className="cta-box" style={{ marginTop: '3.5rem', background: 'linear-gradient(135deg, #1a2e1a 0%, #2d5a2d 100%)', borderRadius: '18px', padding: '2.5rem 2rem', textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>🏡</div>
            <h3 className="cta-title" style={{ fontSize: '1.75rem', fontWeight: '900', margin: '0 0 0.6rem', letterSpacing: '-0.5px' }}>Are you a landlord?</h3>
            <p style={{ opacity: 0.75, marginBottom: '1.75rem', fontSize: '0.95rem', lineHeight: 1.7 }}>List your property for free and connect with tenants directly.</p>
            <button onClick={() => router.push('/auth')} style={{ padding: '0.85rem 2rem', background: 'white', color: '#2d5a2d', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'Georgia, serif' }}>
              List Your Property Free →
            </button>
          </div>
        )}
      </div>

      <footer style={{ borderTop: '1px solid #eee8e0', padding: '1.5rem', textAlign: 'center', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <div style={{ width: '22px', height: '22px', background: '#2d5a2d', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontSize: '11px' }}>🏠</span>
          </div>
          <span style={{ fontWeight: '800', color: '#1a2e1a', fontSize: '0.9rem' }}>RentX</span>
        </div>
        <p style={{ color: '#bbb', fontSize: '0.75rem', margin: 0 }}>Connecting landlords and tenants directly. No fees, no agents.</p>
      </footer>
    </div>
  )
}
