import { Link } from 'react-router-dom'
import { Heart, ShoppingCart } from 'lucide-react'
import useCartStore from '../../store/useCartStore'
import useToastStore from '../../store/useToastStore'
import { formatVND } from '../../utils/helpers'

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1548460848-d7b0da0e01e0?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1485637701894-09ad422f6de6?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1490750967868-88df5691cc56?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
]

export default function ProductCard({ product }) {
  const { addToCart } = useCartStore()
  const toast = useToastStore()

  const defaultVariant = product.variants?.[0]
  const price = defaultVariant?.price || product.basePrice || product.price || 0
  const originalPrice = product.originalPrice
  const hasDiscount = originalPrice && originalPrice > price
  const discountPct = hasDiscount ? Math.round((1 - price / originalPrice) * 100) : 0
  const isOutOfStock = defaultVariant ? defaultVariant.stock === 0 : false

  // Fallback image deterministic per product
  const imgSeed = product.id ? product.id.charCodeAt(0) % FALLBACK_IMAGES.length : 0
  const fallbackImg = FALLBACK_IMAGES[imgSeed]
  const imgSrc = product.images?.[0] || fallbackImg

  const handleAddCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) { toast.warning('Sản phẩm tạm hết hàng'); return }
    addToCart(product, defaultVariant || { size: 'Tiêu chuẩn', price }, 1)
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng 🌸`)
  }

  const handleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toast.info('Tính năng yêu thích sắp ra mắt!')
  }

  return (
    <Link to={`/product/${product.slug || product.id}`} className="product-card" style={{ textDecoration: 'none' }}>
      {/* Image */}
      <div className="product-card__image">
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          onError={e => { e.target.src = fallbackImg }}
        />

        {/* Badges */}
        {hasDiscount && (
          <span className="product-card__badge product-card__badge--sale">-{discountPct}%</span>
        )}
        {!hasDiscount && product.isFeatured && (
          <span className="product-card__badge">Nổi bật</span>
        )}
        {isOutOfStock && (
          <span className="product-card__badge" style={{ background: '#94a3b8' }}>Hết hàng</span>
        )}

        {/* Hover actions */}
        <div className="product-card__actions">
          <button
            className="product-card__action-btn"
            onClick={handleWishlist}
            title="Yêu thích"
            aria-label="Thêm vào yêu thích"
          >
            <Heart size={14} />
          </button>
          <button
            className="product-card__action-btn"
            onClick={handleAddCart}
            title="Thêm vào giỏ"
            aria-label="Thêm vào giỏ hàng"
            disabled={isOutOfStock}
            style={isOutOfStock ? { opacity: .4 } : {}}
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="product-card__body">
        {/* Type / occasion tag */}
        <div className="product-card__type">
          {product.type || product.presentation || (product.occasion?.[0] ?? '')}
        </div>

        <h3 className="product-card__name">{product.name}</h3>

        {/* Rating — luôn chiếm chỗ dù không có để footer thẳng hàng */}
        <div className="product-card__rating" style={{ marginBottom: '.25rem', fontSize: '.78rem', minHeight: '1.4em' }}>
          {(product.averageRating || product.rating) > 0 ? (
            <>
              {'★'.repeat(Math.min(5, Math.round(product.averageRating || product.rating)))}
              {'☆'.repeat(Math.max(0, 5 - Math.round(product.averageRating || product.rating)))}
              <span style={{ color: 'var(--color-text-light)', marginLeft: '.3rem' }}>
                ({product.reviewCount || 0})
              </span>
            </>
          ) : null}
        </div>


        {/* Price + CTA — xếp dọc cho cân đối */}
        <div className="product-card__footer">
          <div>
            <span className="product-card__price">{formatVND(price)}</span>
            {hasDiscount && (
              <span className="product-card__price-old" style={{ display: 'block' }}>
                {formatVND(originalPrice)}
              </span>
            )}
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleAddCart}
            disabled={isOutOfStock}
            style={{ width: '100%' }}
          >
            {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
          </button>
        </div>
      </div>
    </Link>
  )
}
