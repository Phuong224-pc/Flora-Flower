import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Heart, ShoppingCart, Truck, Star, ChevronRight,
  MessageSquare, Shield, RotateCcw, Minus, Plus,
  Calendar, Clock, Share2, CheckCircle
} from 'lucide-react'
import api from '../services/api'
import useCartStore from '../store/useCartStore'
import useToastStore from '../store/useToastStore'
import ProductCard from '../components/ui/ProductCard'
import { formatVND, formatDate, renderStars } from '../utils/helpers'

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1548460848-d7b0da0e01e0?w=700&h=525&fit=crop',
  'https://images.unsplash.com/photo-1485637701894-09ad422f6de6?w=700&h=525&fit=crop',
  'https://images.unsplash.com/photo-1490750967868-88df5691cc56?w=700&h=525&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&h=525&fit=crop',
]

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCartStore()
  const toast = useToastStore()

  const [product, setProduct]           = useState(null)
  const [related, setRelated]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity]         = useState(1)
  const [activeImg, setActiveImg]       = useState(0)
  const [activeTab, setActiveTab]       = useState('desc')
  const [cardMessage, setCardMessage]   = useState('')
  const [wishlisted, setWishlisted]     = useState(false)
  const [addedAnim, setAddedAnim]       = useState(false)

  useEffect(() => { loadProduct() }, [slug])

  const loadProduct = async () => {
    setLoading(true)
    setActiveImg(0)
    try {
      const res = await api.get(`/products/${slug}`)
      const p = res.data
      setProduct(p)
      setSelectedVariant(p.variants?.[0] || null)
      setQuantity(1)
      // Related products
      try {
        const relRes = await api.get(`/products?limit=8`)
        setRelated((relRes.data.data || relRes.data).filter(r => r.id !== p.id).slice(0, 4))
      } catch {}
    } catch {
      navigate('/shop')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCart = () => {
    if (!selectedVariant) { toast.warning('Vui lòng chọn phiên bản'); return }
    if (selectedVariant.stock === 0) { toast.warning('Phiên bản này tạm hết hàng'); return }
    addToCart(product, selectedVariant, quantity, { cardMessage })
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng 🌸`)
    setAddedAnim(true)
    setTimeout(() => setAddedAnim(false), 1500)
  }

  const handleBuyNow = () => {
    if (!selectedVariant) { toast.warning('Vui lòng chọn phiên bản'); return }
    if (selectedVariant.stock === 0) { toast.warning('Phiên bản này tạm hết hàng'); return }
    addToCart(product, selectedVariant, quantity, { cardMessage })
    navigate('/checkout')
  }

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>
  if (!product) return null

  const images = product.images?.length ? product.images : [FALLBACK_IMAGES[0]]
  const displayImages = images.length < 4
    ? [...images, ...FALLBACK_IMAGES.slice(0, 4 - images.length)]
    : images

  const price = selectedVariant?.price || product.variants?.[0]?.price || 0
  const hasDiscount = product.originalPrice && product.originalPrice > price
  const discountPct = hasDiscount ? Math.round((1 - price / product.originalPrice) * 100) : 0
  const isOutOfStock = selectedVariant?.stock === 0
  const avgRating = product.averageRating || product.rating || 0

  const PERKS = [
    { icon: <Truck size={16} />, label: 'Giao trong 2–4 tiếng nội thành' },
    { icon: <Shield size={16} />, label: 'Cam kết hoa tươi, đúng mẫu' },
    { icon: <RotateCcw size={16} />, label: 'Hoàn tiền nếu không đúng yêu cầu' },
    { icon: <MessageSquare size={16} />, label: 'Hỗ trợ tư vấn 08:00 – 21:00' },
  ]

  return (
    <div style={{ background: 'var(--color-bg)' }}>
      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>

        {/* Breadcrumb */}
        <nav className="breadcrumb" style={{ marginBottom: '1.5rem' }}>
          <Link to="/">Trang chủ</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/shop">Tất cả hoa</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* Main product layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '4rem' }}>

          {/* ── IMAGE GALLERY ── */}
          <div>
            <div className="img-gallery">
              {/* Main image */}
              <div className="img-gallery__main" style={{ position: 'relative' }}>
                <img
                  src={displayImages[activeImg]}
                  alt={product.name}
                  onError={e => { e.target.src = FALLBACK_IMAGES[activeImg % FALLBACK_IMAGES.length] }}
                />
                {hasDiscount && (
                  <span style={{
                    position: 'absolute', top: '1rem', left: '1rem',
                    background: 'var(--color-error)', color: '#fff', padding: '.3rem .75rem',
                    borderRadius: 'var(--r-full)', fontWeight: 700, fontSize: '.8rem',
                  }}>
                    -{discountPct}%
                  </span>
                )}
                {product.isFeatured && !hasDiscount && (
                  <span style={{
                    position: 'absolute', top: '1rem', left: '1rem',
                    background: 'var(--color-primary)', color: '#fff', padding: '.3rem .75rem',
                    borderRadius: 'var(--r-full)', fontWeight: 700, fontSize: '.8rem',
                  }}>
                    Nổi bật
                  </span>
                )}
              </div>
              {/* Thumbnails */}
              <div className="img-gallery__thumbs">
                {displayImages.map((img, i) => (
                  <button
                    key={i}
                    className={`img-gallery__thumb${activeImg === i ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    aria-label={`Xem ảnh ${i + 1}`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`}
                      onError={e => { e.target.src = FALLBACK_IMAGES[i % FALLBACK_IMAGES.length] }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── PRODUCT INFO ── */}
          <div>
            {/* Type badge */}
            {product.type && (
              <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.5rem' }}>
                {product.type}
              </div>
            )}

            {/* Name */}
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-heading)', marginBottom: '.75rem', lineHeight: 1.25 }}>
              {product.name}
            </h1>

            {/* Rating */}
            {avgRating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
                <span style={{ color: '#f59e0b', fontSize: '1rem' }}>{renderStars(avgRating)}</span>
                <span style={{ fontWeight: 700, fontSize: '.9rem' }}>{avgRating.toFixed(1)}</span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '.85rem' }}>({product.reviewCount || 0} đánh giá)</span>
                {product.soldCount > 0 && (
                  <span style={{ color: 'var(--color-text-light)', fontSize: '.82rem' }}>· Đã bán {product.soldCount}</span>
                )}
              </div>
            )}

            {/* Price */}
            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '2.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {formatVND(price)}
              </span>
              {hasDiscount && (
                <span style={{ textDecoration: 'line-through', color: 'var(--color-text-light)', fontSize: '1.1rem', marginLeft: '.75rem' }}>
                  {formatVND(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Variants */}
            {product.variants?.length > 1 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 600, fontSize: '.9rem', color: 'var(--color-heading)', marginBottom: '.625rem' }}>
                  Chọn kích thước / phiên bản:
                </div>
                <div style={{ display: 'flex', gap: '.625rem', flexWrap: 'wrap' }}>
                  {product.variants.map(v => (
                    <button
                      key={v.sku || v.size}
                      onClick={() => setSelectedVariant(v)}
                      style={{
                        padding: '.5rem 1.1rem', borderRadius: 'var(--r-lg)',
                        border: `2px solid ${selectedVariant?.sku === v.sku ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: selectedVariant?.sku === v.sku ? 'var(--color-primary-bg)' : '#fff',
                        color: v.stock === 0 ? 'var(--color-text-light)' : 'var(--color-text)',
                        fontWeight: 600, fontSize: '.875rem', cursor: v.stock === 0 ? 'not-allowed' : 'pointer',
                        opacity: v.stock === 0 ? .55 : 1, transition: 'all var(--transition)',
                        position: 'relative',
                      }}
                      disabled={v.stock === 0}
                    >
                      {v.size}
                      <span style={{ display: 'block', fontSize: '.72rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                        {formatVND(v.price)}
                      </span>
                      {v.stock === 0 && (
                        <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#94a3b8', color: '#fff', fontSize: '.6rem', padding: '.1rem .35rem', borderRadius: 'var(--r-full)', fontWeight: 700 }}>
                          Hết
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Card message */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '.9rem', color: 'var(--color-heading)', marginBottom: '.5rem' }}>
                <MessageSquare size={15} style={{ verticalAlign: 'middle', marginRight: '.3rem' }} />
                Lời nhắn trên thiệp (tùy chọn)
              </label>
              <textarea
                className="form-textarea"
                value={cardMessage}
                onChange={e => setCardMessage(e.target.value)}
                placeholder="Nhập lời nhắn gửi kèm hoa... (không bắt buộc)"
                rows={2}
                maxLength={200}
                style={{ fontSize: '.875rem' }}
              />
              <div style={{ fontSize: '.75rem', color: 'var(--color-text-light)', textAlign: 'right' }}>
                {cardMessage.length}/200
              </div>
            </div>

            {/* Quantity + Add to cart */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Qty */}
              <div className="qty-selector">
                <button className="qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}><Minus size={15} /></button>
                <input className="qty-input" value={quantity} readOnly aria-label="Số lượng" />
                <button className="qty-btn" onClick={() => setQuantity(q => q + 1)} disabled={isOutOfStock}><Plus size={15} /></button>
              </div>

              {/* Add to cart */}
              <button
                className={`btn btn-primary btn-lg${addedAnim ? ' scale-95' : ''}`}
                onClick={handleAddCart}
                disabled={isOutOfStock}
                style={{ flex: 1, transition: 'all .15s', transform: addedAnim ? 'scale(.97)' : 'scale(1)' }}
              >
                {addedAnim
                  ? <><CheckCircle size={18} /> Đã thêm!</>
                  : isOutOfStock
                    ? 'Tạm hết hàng'
                    : <><ShoppingCart size={18} /> Thêm vào giỏ</>
                }
              </button>

              {/* Wishlist */}
              <button
                className="btn btn-icon"
                onClick={() => { setWishlisted(w => !w); toast.info(wishlisted ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích ❤️') }}
                style={{ border: '2px solid var(--color-border)', color: wishlisted ? 'var(--color-error)' : 'var(--color-text-muted)', background: wishlisted ? '#fff0f0' : '#fff', transition: 'all var(--transition)' }}
                aria-label="Yêu thích"
              >
                <Heart size={20} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Buy now */}
            <button
              className="btn btn-dark btn-lg"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              style={{ width: '100%', marginBottom: '1.5rem' }}
            >
              ⚡ Mua ngay
            </button>

            {/* Perks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.625rem' }}>
              {PERKS.map(p => (
                <div key={p.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '.4rem', fontSize: '.8rem', color: 'var(--color-text-muted)', padding: '.5rem', background: 'var(--color-bg-subtle)', borderRadius: 'var(--r-md)' }}>
                  <span style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '.1rem' }}>{p.icon}</span>
                  {p.label}
                </div>
              ))}
            </div>

            {/* Occasions */}
            {product.occasion?.length > 0 && (
              <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--color-primary-bg)', borderRadius: 'var(--r-lg)' }}>
                <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '.5rem' }}>
                  Phù hợp cho:
                </div>
                <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                  {product.occasion.map(occ => (
                    <span key={occ} className="badge badge-primary">{occ}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── TABS: Mô tả / Hướng dẫn / Đánh giá ── */}
        <div style={{ marginBottom: '4rem' }}>
          <div className="tabs" style={{ marginBottom: '1.5rem' }}>
            {[
              { k: 'desc',   label: 'Mô tả sản phẩm' },
              { k: 'care',   label: 'Cách chăm sóc hoa' },
              { k: 'review', label: `Đánh giá (${product.reviewCount || 0})` },
            ].map(t => (
              <button key={t.k} className={`tab-btn${activeTab === t.k ? ' active' : ''}`} onClick={() => setActiveTab(t.k)}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="card" style={{ padding: '1.75rem' }}>
            {activeTab === 'desc' && (
              <div style={{ lineHeight: 1.85, color: 'var(--color-text-muted)' }}>
                {product.description
                  ? <p>{product.description}</p>
                  : (
                    <>
                      <p>Bộ sưu tập hoa tươi được tuyển chọn kỹ lưỡng, đảm bảo độ tươi và vẻ đẹp tự nhiên. Mỗi mẫu hoa đều được thiết kế tỉ mỉ bởi các florist có kinh nghiệm.</p>
                      <ul style={{ marginTop: '.875rem', paddingLeft: '1.25rem', listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                        <li>Hoa tươi nhập khẩu và nội địa chọn lọc</li>
                        <li>Thiết kế theo xu hướng hiện đại, thanh lịch</li>
                        <li>Bảo quản lạnh đến tận khi giao hàng</li>
                        <li>Gói hộp/giấy kraft cao cấp, có dải lụa</li>
                        <li>Kèm thiệp viết tay theo yêu cầu</li>
                      </ul>
                    </>
                  )
                }
              </div>
            )}

            {activeTab === 'care' && (
              <div style={{ lineHeight: 1.85, color: 'var(--color-text-muted)' }}>
                <h4 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-heading)', marginBottom: '1rem' }}>
                  🌸 Hướng dẫn chăm sóc hoa tươi
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[
                    { emoji: '💧', title: 'Thay nước mỗi ngày', desc: 'Dùng nước sạch, thêm 1–2 thìa đường để hoa tươi lâu hơn' },
                    { emoji: '✂️', title: 'Cắt cuống chéo 45°', desc: 'Cắt chéo 2–3cm mỗi 2 ngày để hoa hút nước tốt hơn' },
                    { emoji: '❄️', title: 'Tránh nhiệt độ cao', desc: 'Không để gần quạt, điều hòa hoặc ánh nắng trực tiếp' },
                    { emoji: '🌡️', title: 'Nhiệt độ lý tưởng', desc: 'Bảo quản ở 15–20°C, tránh nơi có gió mạnh' },
                  ].map(tip => (
                    <div key={tip.title} style={{ padding: '1rem', background: 'var(--color-bg-subtle)', borderRadius: 'var(--r-lg)' }}>
                      <div style={{ fontSize: '1.5rem', marginBottom: '.4rem' }}>{tip.emoji}</div>
                      <div style={{ fontWeight: 700, color: 'var(--color-heading)', marginBottom: '.2rem', fontSize: '.9rem' }}>{tip.title}</div>
                      <div style={{ fontSize: '.82rem' }}>{tip.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'review' && (
              <div>
                {avgRating > 0 ? (
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: '3.5rem', fontWeight: 700, color: 'var(--color-heading)' }}>{avgRating.toFixed(1)}</div>
                      <div style={{ color: '#f59e0b', fontSize: '1.3rem', marginBottom: '.25rem' }}>{renderStars(avgRating)}</div>
                      <div style={{ fontSize: '.82rem', color: 'var(--color-text-muted)' }}>{product.reviewCount || 0} đánh giá</div>
                    </div>
                  </div>
                ) : null}
                <div className="empty-state" style={{ padding: '2rem 0' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>💬</div>
                  <div style={{ fontWeight: 600, color: 'var(--color-heading)', marginBottom: '.5rem' }}>Chưa có đánh giá</div>
                  <div style={{ fontSize: '.875rem', color: 'var(--color-text-muted)' }}>Hãy là người đầu tiên đánh giá sản phẩm này.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {related.length > 0 && (
          <div>
            <div className="section-header" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <div className="eyebrow">Gợi ý cho bạn</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem' }}>Sản phẩm tương tự</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px,1fr))', gap: '1.25rem' }}>
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Mobile sticky CTA */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, padding: '.875rem 1.25rem',
        background: 'rgba(255,255,255,.97)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--color-border)', display: 'none',
        gap: '.75rem', zIndex: 400,
      }} id="mobile-cta">
        <button className="btn btn-outline btn-lg" style={{ flex: 1 }} onClick={handleAddCart} disabled={isOutOfStock}>
          <ShoppingCart size={18} />
        </button>
        <button className="btn btn-primary btn-lg" style={{ flex: 3 }} onClick={handleBuyNow} disabled={isOutOfStock}>
          Mua ngay — {formatVND(price)}
        </button>
      </div>
    </div>
  )
}
