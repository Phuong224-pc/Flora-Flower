import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useParams, Link } from 'react-router-dom'
import { Search, Filter, X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ui/ProductCard'

const TYPES      = ['Bó hoa','Giỏ hoa','Hộp hoa','Bình hoa','Kệ hoa']
const FLOWERS    = ['Hồng','Hướng dương','Tulip','Lan','Cẩm chướng','Hoa phối']
const SORT_OPTIONS = [
  { value: 'newest',    label: 'Mới nhất' },
  { value: 'bestseller',label: 'Bán chạy' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc',label: 'Giá giảm dần' },
]
const PRICE_RANGES = [
  { label: 'Tất cả giá',     min: 0,   max: 0    },
  { label: 'Dưới 300K',     min: 0,   max: 300000},
  { label: '300K – 600K',   min: 300000, max: 600000},
  { label: '600K – 1 triệu',min: 600000, max: 1000000},
  { label: 'Trên 1 triệu',  min: 1000000, max: 0  },
]

const catMap = {
  'sinh-nhat':'Sinh nhật','tinh-yeu':'Tình yêu','chuc-mung':'Chúc mừng',
  'khai-truong':'Khai trương','cuoi':'Cưới','cam-on':'Cảm ơn','chia-buon':'Chia buồn',
}

// Compact filter group with toggle
function FilterGroup({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 .5rem', fontWeight: 700, color: 'var(--color-heading)', fontSize: '.875rem' }}
      >
        {title}
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

function RadioPill({ label, checked, onChange }) {
  return (
    <label style={{ display: 'block', cursor: 'pointer', padding: '.3rem .5rem', borderRadius: 'var(--r-md)', fontSize: '.85rem', background: checked ? 'var(--color-primary-bg)' : 'transparent', color: checked ? 'var(--color-primary)' : 'var(--color-text)', fontWeight: checked ? 700 : 400, transition: 'all .15s', marginBottom: '.15rem' }}>
      <input type="radio" checked={checked} onChange={onChange} style={{ display: 'none' }} />
      {label}
    </label>
  )
}

const EMPTY_FILTERS = { q: '', sort: 'newest', occasion: '', type: '', flowerType: '', priceRange: 0, inStock: false }

export default function Shop() {
  const [searchParams] = useSearchParams()
  const { category } = useParams()
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [showFilter, setShowFilter] = useState(true)
  const [viewMode, setViewMode]   = useState('grid') // 'grid' | 'list'
  const [occasions, setOccasions] = useState([])     // fetch từ API
  const LIMIT = 12

  // Fetch occasions từ API
  useEffect(() => {
    api.get('/occasions?menuOnly=false')
      .then(res => setOccasions((res.data || []).map(o => o.label).filter(Boolean)))
      .catch(() => {})
  }, [])

  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    q:        searchParams.get('q') || '',
    sort:     searchParams.get('sort') || 'newest',
    occasion: category ? (catMap[category] || '') : '',
  })

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.q)           params.set('q', filters.q)
      if (filters.sort)        params.set('sort', filters.sort)
      if (filters.occasion)    params.set('occasion', filters.occasion)
      if (filters.type)        params.set('type', filters.type)
      if (filters.flowerType)  params.set('flowerType', filters.flowerType)
      if (filters.inStock)     params.set('inStock', 'true')
      const pr = PRICE_RANGES[filters.priceRange]
      if (pr.min) params.set('minPrice', pr.min)
      if (pr.max) params.set('maxPrice', pr.max)
      params.set('page', page)
      params.set('limit', LIMIT)
      const res = await api.get(`/products?${params}`)
      setProducts(res.data.data || res.data || [])
      setTotal(res.data.total ?? (res.data.data ?? res.data ?? []).length)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filters, page])

  useEffect(() => { loadProducts() }, [loadProducts])

  const handleFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }))
    setPage(1)
  }

  const resetFilters = () => {
    setFilters({ ...EMPTY_FILTERS, q: '' })
    setPage(1)
  }

  const activeCount = [
    filters.occasion, filters.type, filters.flowerType,
    filters.inStock ? 'instock' : '',
    filters.priceRange > 0 ? 'price' : '',
  ].filter(Boolean).length

  const totalPages = Math.ceil(total / LIMIT)
  const pageTitle = category ? (catMap[category] ? `Hoa ${catMap[category]}` : 'Tất cả mẫu hoa') : 'Tất cả mẫu hoa'

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '80vh' }}>

      {/* Page header */}
      <div style={{ background: 'linear-gradient(135deg, #fff0f3 0%, #ffe4e6 50%, #fdf0f2 100%)', padding: '2.5rem 0 2rem', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          {/* Breadcrumb */}
          <div className="breadcrumb" style={{ marginBottom: '1rem' }}>
            <Link to="/" className="breadcrumb-link" style={{ color: 'var(--color-text-muted)', fontSize: '.8rem' }}>Trang chủ</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current" style={{ fontSize: '.8rem', color: 'var(--color-heading)' }}>{pageTitle}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', color: 'var(--color-heading)', marginBottom: '.4rem' }}>
                {pageTitle}
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '.9rem' }}>
                Tìm thấy <strong style={{ color: 'var(--color-primary)' }}>{total}</strong> mẫu hoa phù hợp
              </p>
            </div>

            {/* Quick occasion pills */}
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              {occasions.slice(0, 4).map(o => (
                <button
                  key={o}
                  onClick={() => handleFilter('occasion', filters.occasion === o ? '' : o)}
                  className="btn btn-sm"
                  style={{
                    background: filters.occasion === o ? 'var(--color-primary)' : 'rgba(255,255,255,.8)',
                    color: filters.occasion === o ? '#fff' : 'var(--color-text-muted)',
                    border: `1px solid ${filters.occasion === o ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--r-full)', fontSize: '.78rem',
                  }}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '1.5rem 1.5rem 4rem' }}>

        {/* Active filter chips */}
        {activeCount > 0 && (
          <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem', padding: '.75rem', background: 'var(--color-primary-bg)', borderRadius: 'var(--r-lg)', alignItems: 'center' }}>
            <span style={{ fontSize: '.78rem', color: 'var(--color-text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>Đang lọc:</span>
            {filters.occasion && (
              <span className="filter-chip">🎁 {filters.occasion} <button onClick={() => handleFilter('occasion', '')}>×</button></span>
            )}
            {filters.type && (
              <span className="filter-chip">🌸 {filters.type} <button onClick={() => handleFilter('type', '')}>×</button></span>
            )}
            {filters.flowerType && (
              <span className="filter-chip">💐 {filters.flowerType} <button onClick={() => handleFilter('flowerType', '')}>×</button></span>
            )}
            {filters.priceRange > 0 && (
              <span className="filter-chip">💰 {PRICE_RANGES[filters.priceRange].label} <button onClick={() => handleFilter('priceRange', 0)}>×</button></span>
            )}
            {filters.inStock && (
              <span className="filter-chip">✅ Còn hàng <button onClick={() => handleFilter('inStock', false)}>×</button></span>
            )}
            <button onClick={resetFilters} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: '.78rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}>
              Xóa tất cả
            </button>
          </div>
        )}

        {/* Search + Sort bar */}
        <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="header-search" style={{ flex: 1, minWidth: '200px' }}>
            <Search size={15} color="var(--color-text-light)" />
            <input
              placeholder="Tìm mẫu hoa, loại hoa..."
              value={filters.q}
              onChange={e => handleFilter('q', e.target.value)}
              style={{ fontSize: '.875rem' }}
            />
            {filters.q && (
              <button onClick={() => handleFilter('q', '')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '.2rem' }}>
                <X size={13} color="var(--color-text-light)" />
              </button>
            )}
          </div>

          <select className="form-select" style={{ width: 'auto' }} value={filters.sort} onChange={e => handleFilter('sort', e.target.value)}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <button
            className={`btn btn-sm ${showFilter ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowFilter(!showFilter)}
            style={{ position: 'relative' }}
          >
            <SlidersHorizontal size={15} /> Bộ lọc
            {activeCount > 0 && (
              <span style={{ position: 'absolute', top: '-.4rem', right: '-.4rem', background: 'var(--color-error)', color: '#fff', borderRadius: '50%', width: '1.1rem', height: '1.1rem', fontSize: '.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeCount}
              </span>
            )}
          </button>

          {/* View mode */}
          <div style={{ display: 'flex', border: '1.5px solid var(--color-border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
            {[{ m: 'grid', icon: '⊞' }, { m: 'list', icon: '≡' }].map(({ m, icon }) => (
              <button key={m} onClick={() => setViewMode(m)} style={{ padding: '.4rem .6rem', background: viewMode === m ? 'var(--color-primary)' : '#fff', color: viewMode === m ? '#fff' : 'var(--color-text-muted)', border: 'none', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* Main content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: showFilter ? '240px 1fr' : '1fr', gap: '1.75rem' }}>

          {/* Sidebar */}
          {showFilter && (
            <aside style={{ position: 'sticky', top: 'calc(var(--header-h) + 1rem)', height: 'fit-content' }}>
              <div className="card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontWeight: 700, color: 'var(--color-heading)', fontSize: '.95rem' }}>Bộ lọc</h3>
                  {activeCount > 0 && (
                    <button className="btn btn-ghost btn-sm" onClick={resetFilters} style={{ fontSize: '.75rem', padding: '.25rem .5rem' }}>
                      <X size={12} /> Xóa lọc ({activeCount})
                    </button>
                  )}
                </div>

                <FilterGroup title="Khoảng giá">
                  {PRICE_RANGES.map((r, i) => (
                    <RadioPill key={i} label={r.label} checked={filters.priceRange === i} onChange={() => handleFilter('priceRange', i)} />
                  ))}
                </FilterGroup>

                <FilterGroup title="Dịp sử dụng">
                  {occasions.map(o => (
                    <RadioPill key={o} label={o} checked={filters.occasion === o} onChange={() => handleFilter('occasion', filters.occasion === o ? '' : o)} />
                  ))}
                </FilterGroup>

                <FilterGroup title="Kiểu trình bày" defaultOpen={false}>
                  {TYPES.map(t => (
                    <RadioPill key={t} label={t} checked={filters.type === t} onChange={() => handleFilter('type', filters.type === t ? '' : t)} />
                  ))}
                </FilterGroup>

                <FilterGroup title="Loại hoa" defaultOpen={false}>
                  {FLOWERS.map(f => (
                    <RadioPill key={f} label={f} checked={filters.flowerType === f} onChange={() => handleFilter('flowerType', filters.flowerType === f ? '' : f)} />
                  ))}
                </FilterGroup>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600, color: filters.inStock ? 'var(--color-success)' : 'var(--color-text)' }}>
                    <input type="checkbox" checked={filters.inStock} onChange={e => handleFilter('inStock', e.target.checked)}
                      style={{ accentColor: 'var(--color-success)', width: '1rem', height: '1rem' }} />
                    Chỉ hiện còn hàng
                  </label>
                </div>
              </div>
            </aside>
          )}

          {/* Product area */}
          <div>
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: '340px', borderRadius: 'var(--r-xl)' }} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--color-primary-bg)', borderRadius: 'var(--r-2xl)' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🌸</div>
                <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-heading)', marginBottom: '.75rem' }}>
                  Không tìm thấy mẫu hoa
                </h3>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <button className="btn btn-primary" onClick={resetFilters}>Xóa bộ lọc</button>
              </div>
            ) : (
              <>
                {/* Results info */}
                <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Hiển thị {Math.min((page - 1) * LIMIT + 1, total)}–{Math.min(page * LIMIT, total)} / {total} sản phẩm
                </div>

                {viewMode === 'grid' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${showFilter ? 3 : 4}, 1fr)`, gap: '1.25rem' }}>
                    {products.map(p => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        showFeaturedBadge={filters.sort !== 'bestseller' && filters.sort !== 'newest'}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
                    {products.map(p => <ListProductCard key={p.id} product={p} />)}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Trước</button>
                    {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                      const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i
                      return (
                        <button key={p} onClick={() => setPage(p)}
                          className="btn btn-sm"
                          style={{ background: page === p ? 'var(--color-primary)' : '#fff', color: page === p ? '#fff' : 'var(--color-text)', border: '1.5px solid', borderColor: page === p ? 'var(--color-primary)' : 'var(--color-border)', minWidth: '2.25rem' }}>
                          {p}
                        </button>
                      )
                    })}
                    <button className="btn btn-outline btn-sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Sau →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// List view card
function ListProductCard({ product }) {
  const price = product.variants?.[0]?.price || product.basePrice || 0
  return (
    <Link to={`/product/${product.slug || product.id}`} style={{ textDecoration: 'none' }}>
      <div className="card" style={{ display: 'flex', gap: '1.25rem', padding: '1rem', transition: 'all var(--transition)' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = 'var(--color-primary-light)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: 'var(--r-lg)', overflow: 'hidden', flexShrink: 0, background: 'var(--color-primary-bg)' }}>
          <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1548460848-d7b0da0e01e0?w=100&h=100&fit=crop'}
            alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1548460848-d7b0da0e01e0?w=100&h=100&fit=crop' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '.72rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '.25rem' }}>{product.type}</div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', color: 'var(--color-heading)', marginBottom: '.4rem' }}>{product.name}</h3>
          <p style={{ fontSize: '.82rem', color: 'var(--color-text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {product.description}
          </p>
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '.5rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-primary)' }}>
            {new Intl.NumberFormat('vi-VN').format(price)}đ
          </div>
          <button className="btn btn-primary btn-sm">Chọn mua</button>
        </div>
      </div>
    </Link>
  )
}
