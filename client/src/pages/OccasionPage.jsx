import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { Filter, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ui/ProductCard'
import { formatVND } from '../utils/helpers'

const SORT_OPTIONS = [
  { value: 'newest',    label: 'Mới nhất' },
  { value: 'bestseller',label: 'Bán chạy' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc',label: 'Giá giảm dần' },
]

const PRICE_RANGES = [
  { label: 'Dưới 200,000đ',    min: 0,      max: 200000  },
  { label: '200,000 – 400,000đ', min: 200000, max: 400000  },
  { label: '400,000 – 700,000đ', min: 400000, max: 700000  },
  { label: 'Trên 700,000đ',    min: 700000, max: 9999999  },
]

const DEFAULT_BANNERS = {
  'sinh-nhat':  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=400&fit=crop',
  'tinh-yeu':   'https://images.unsplash.com/photo-1548460848-d7b0da0e01e0?w=1200&h=400&fit=crop',
  'khai-truong':'https://images.unsplash.com/photo-1490750967868-88df5691cc56?w=1200&h=400&fit=crop',
  'cuoi':       'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=1200&h=400&fit=crop',
  'chia-buon':  'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=1200&h=400&fit=crop',
}
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1485637701894-09ad422f6de6?w=1200&h=400&fit=crop'

export default function OccasionPage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const [occasion, setOccasion] = useState(null)
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [occLoading, setOccLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [priceRange, setPriceRange] = useState(null)

  const sort   = searchParams.get('sort')  || 'bestseller'
  const page   = parseInt(searchParams.get('page') || '1')
  const LIMIT  = 12

  const setParam = (k, v) => {
    const next = new URLSearchParams(searchParams)
    if (v) next.set(k, v); else next.delete(k)
    next.delete('page')
    setSearchParams(next)
  }

  // Fetch occasion info
  useEffect(() => {
    setOccLoading(true)
    api.get(`/occasions/${slug}`)
      .then(r => setOccasion(r.data))
      .catch(() => setOccasion(null))
      .finally(() => setOccLoading(false))
  }, [slug])

  // Fetch products
  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ sort, page, limit: LIMIT })
    if (priceRange) { params.set('minPrice', priceRange.min); params.set('maxPrice', priceRange.max) }

    api.get(`/occasions/${slug}/products?${params}`)
      .then(r => { setProducts(r.data.data || []); setTotal(r.data.total || 0) })
      .catch(() => { setProducts([]); setTotal(0) })
      .finally(() => setLoading(false))
  }, [slug, sort, page, priceRange])

  const totalPages = Math.ceil(total / LIMIT)
  const banner = occasion?.bannerImage || DEFAULT_BANNERS[slug] || DEFAULT_BANNER

  if (occLoading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>

  if (!occasion) return (
    <div className="empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-state__icon">🌸</div>
      <div className="empty-state__title">Không tìm thấy dịp tặng hoa</div>
      <div className="empty-state__desc" style={{ marginBottom: '1.5rem' }}>Đường dẫn không tồn tại hoặc dịp đã bị ẩn.</div>
      <Link to="/shop"><button className="btn btn-primary">Xem tất cả hoa</button></Link>
    </div>
  )

  return (
    <div style={{ background: 'var(--color-bg)', paddingBottom: '4rem' }}>
      {/* Banner */}
      <div className="occasion-banner" style={{ borderRadius: 0, marginBottom: 0, height: '300px' }}>
        <img src={banner} alt={occasion.label} loading="lazy" />
        <div className="occasion-banner__overlay">
          <div className="occasion-banner__text" style={{ paddingTop: '2rem' }}>
            {/* Breadcrumb */}
            <nav className="breadcrumb" style={{ marginBottom: '1rem', '--color-text-muted': 'rgba(255,255,255,.7)' }}>
              <Link to="/" style={{ color: 'rgba(255,255,255,.7)' }}>Trang chủ</Link>
              <span className="breadcrumb-sep">/</span>
              <span style={{ color: '#fff', fontWeight: 500 }}>{occasion.label}</span>
            </nav>
            <h1 style={{ color: '#fff' }}>
              {occasion.icon} {occasion.label}
            </h1>
            {occasion.description && (
              <p style={{ color: 'rgba(255,255,255,.88)', marginTop: '.5rem' }}>{occasion.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem' }}>
        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '.9rem' }}>
            {loading ? 'Đang tải...' : `${total} mẫu hoa phù hợp`}
          </div>
          <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Filter button (mobile) */}
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setFilterOpen(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}
            >
              <SlidersHorizontal size={16} /> Lọc {filterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {/* Sort */}
            <select
              className="form-select"
              style={{ width: 'auto', padding: '.4rem 2rem .4rem .75rem', fontSize: '.875rem' }}
              value={sort}
              onChange={e => setParam('sort', e.target.value)}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Filter bar */}
        {filterOpen && (
          <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--r-xl)', padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 700, color: 'var(--color-heading)', marginBottom: '1rem', fontSize: '.9rem' }}>Lọc theo giá</div>
            <div style={{ display: 'flex', gap: '.625rem', flexWrap: 'wrap' }}>
              <button
                className={`btn btn-sm ${!priceRange ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setPriceRange(null)}
              >
                Tất cả
              </button>
              {PRICE_RANGES.map(pr => (
                <button
                  key={pr.label}
                  className={`btn btn-sm ${priceRange?.label === pr.label ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setPriceRange(priceRange?.label === pr.label ? null : pr)}
                >
                  {pr.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: '1.5rem' }}>
            {[...Array(LIMIT)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '340px', borderRadius: 'var(--r-xl)' }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">{occasion.icon}</div>
            <div className="empty-state__title">Chưa có mẫu hoa cho dịp "{occasion.label}"</div>
            <div className="empty-state__desc" style={{ marginBottom: '1.5rem' }}>
              Chúng tôi đang cập nhật thêm. Bạn có thể xem toàn bộ hoa tươi của chúng tôi.
            </div>
            <Link to="/shop"><button className="btn btn-primary">Xem tất cả hoa</button></Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: '1.5rem' }}>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => setParam('page', String(page - 1))}
              disabled={page <= 1}
            >
              ←
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`page-btn${page === i + 1 ? ' active' : ''}`}
                onClick={() => setParam('page', String(i + 1))}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="page-btn"
              onClick={() => setParam('page', String(page + 1))}
              disabled={page >= totalPages}
            >
              →
            </button>
          </div>
        )}

        {/* Content from admin */}
        {occasion.content && (
          <div style={{ marginTop: '3rem', background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--r-xl)', padding: '2rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--color-heading)', marginBottom: '1rem' }}>
              Tư vấn chọn hoa {occasion.label}
            </h3>
            <div style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
              {occasion.content}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
