import { Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react'
import useWishlistStore from '../store/useWishlistStore'
import useCartStore from '../store/useCartStore'
import useToastStore from '../store/useToastStore'
import { formatVND } from '../utils/helpers'

const FALLBACK = 'https://images.unsplash.com/photo-1548460848-d7b0da0e01e0?w=300&h=225&fit=crop'

export default function Wishlist() {
  const { items, toggle, clear } = useWishlistStore()
  const { addToCart } = useCartStore()
  const toast = useToastStore()

  const handleRemove = (product) => {
    toggle(product)
    toast.info(`Đã xóa "${product.name}" khỏi yêu thích`)
  }

  const handleAddCart = (product) => {
    const variant = product.variants?.[0] || { size: 'Tiêu chuẩn', price: product.price || 0 }
    addToCart(product, variant, 1)
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng 🛒`)
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '70vh', padding: '2.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-heading)', marginBottom: '.25rem' }}>
              <Heart size={28} style={{ verticalAlign: 'middle', marginRight: '.5rem', color: 'var(--color-primary)' }} />
              Yêu thích của tôi
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '.875rem' }}>
              {items.length > 0 ? `${items.length} sản phẩm đã lưu` : 'Chưa có sản phẩm yêu thích'}
            </p>
          </div>
          {items.length > 0 && (
            <button className="btn btn-ghost btn-sm"
              style={{ color: 'var(--color-error)' }}
              onClick={() => { clear(); toast.info('Đã xóa tất cả yêu thích') }}>
              <Trash2 size={15} /> Xóa tất cả
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--color-primary-bg)', borderRadius: 'var(--r-2xl)' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💔</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-heading)', marginBottom: '.75rem' }}>
              Chưa có hoa nào được lưu
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Bấm ❤️ vào sản phẩm để lưu vào danh sách yêu thích của bạn.
            </p>
            <Link to="/shop">
              <button className="btn btn-primary btn-lg">
                Khám phá mẫu hoa <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              {items.map(product => {
                const price = product.variants?.[0]?.price || product.price || 0
                const imgSrc = product.image || product.images?.[0] || FALLBACK

                return (
                  <div key={product.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    {/* Image */}
                    <Link to={`/product/${product.slug || product.id}`} style={{ display: 'block', position: 'relative' }}>
                      <div style={{ aspectRatio: '4/3', overflow: 'hidden', background: 'var(--color-primary-bg)' }}>
                        <img src={imgSrc} alt={product.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }}
                          onError={e => { e.target.src = FALLBACK }}
                          onMouseEnter={e => { e.target.style.transform = 'scale(1.05)' }}
                          onMouseLeave={e => { e.target.style.transform = 'scale(1)' }}
                        />
                      </div>
                      {/* Remove btn */}
                      <button
                        onClick={e => { e.preventDefault(); e.stopPropagation(); handleRemove(product) }}
                        style={{
                          position: 'absolute', top: '.75rem', right: '.75rem',
                          background: 'rgba(255,255,255,.95)', border: 'none',
                          borderRadius: '50%', width: '2rem', height: '2rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', boxShadow: 'var(--sh-sm)',
                          color: 'var(--color-error)', transition: 'all var(--transition)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)' }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
                      >
                        <Heart size={14} fill="currentColor" />
                      </button>
                    </Link>

                    {/* Body */}
                    <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                      {product.type && (
                        <div style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                          {product.type}
                        </div>
                      )}
                      <Link to={`/product/${product.slug || product.id}`}>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '.95rem', color: 'var(--color-heading)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {product.name}
                        </h3>
                      </Link>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.05rem', marginTop: 'auto' }}>
                        {formatVND(price)}
                      </div>
                      <button className="btn btn-primary" style={{ width: '100%', marginTop: '.375rem' }} onClick={() => handleAddCart(product)}>
                        <ShoppingCart size={15} /> Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ textAlign: 'center' }}>
              <Link to="/shop">
                <button className="btn btn-outline btn-lg">
                  Tiếp tục mua sắm <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
