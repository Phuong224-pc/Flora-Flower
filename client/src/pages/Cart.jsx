import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, Tag } from 'lucide-react'
import { useState } from 'react'
import useCartStore from '../store/useCartStore'
import useAuthStore from '../store/useAuthStore'
import useToastStore from '../store/useToastStore'
import api from '../services/api'
import { formatVND } from '../utils/helpers'

export default function Cart() {
  const { items, updateQuantity, removeFromCart, getTotal, clearCart } = useCartStore()
  const toast = useToastStore()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const SHIPPING_FEE = 30000

  // Admin không được sử dụng giỏ hàng
  if (user?.role === 'admin') return (
    <div className="empty-state" style={{ padding: '5rem 0', minHeight: '60vh' }}>
      <div className="empty-state__icon">🔒</div>
      <div className="empty-state__title">Tài khoản quản trị không thể mua hàng</div>
      <div className="empty-state__desc">Vui lòng sử dụng tài khoản khách hàng để mua hoa.</div>
      <Link to="/admin">
        <button className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          ⚙️ Về trang quản trị
        </button>
      </Link>
    </div>
  )

  const subtotal = getTotal()
  const discount = coupon ? (coupon.type === 'percent' ? Math.round(subtotal * coupon.value / 100) : coupon.value) : 0
  const total = Math.max(0, subtotal + SHIPPING_FEE - discount)

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setApplyingCoupon(true)
    try {
      const res = await api.post('/coupons/check', { code: couponCode, orderTotal: subtotal })
      setCoupon(res.data)
      toast.success(`Áp dụng mã giảm giá thành công! Giảm ${formatVND(res.data.discountAmount)}`)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Mã giảm giá không hợp lệ')
    } finally {
      setApplyingCoupon(false)
    }
  }

  if (items.length === 0) return (
    <div className="empty-state" style={{ padding: '5rem 0', minHeight: '60vh' }}>
      <div className="empty-state__icon">🛒</div>
      <div className="empty-state__title">Giỏ hàng của bạn đang trống</div>
      <div className="empty-state__desc">Hãy chọn những bó hoa yêu thích nhé!</div>
      <Link to="/shop">
        <button className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          <ShoppingBag size={18} /> Khám phá mẫu hoa
        </button>
      </Link>
    </div>
  )

  return (
    <div style={{ padding: '2rem 0', background: 'var(--color-bg)' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-heading)', marginBottom: '2rem' }}>
          Giỏ hàng của bạn ({items.length} sản phẩm)
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem' }}>
          {/* Items */}
          <div>
            {items.map(item => (
              <div key={item.key} className="card" style={{ marginBottom: '1rem', padding: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Link to={`/product/${item.slug}`}>
                    <div style={{ width: '6rem', height: '6rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden', flexShrink: 0 }}>
                      <img src={item.image || `https://picsum.photos/seed/${item.productId}/80/80`} alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1487530811015-780b21f4f0e5?w=80&h=80&fit=crop&auto=format' }} />
                    </div>
                  </Link>
                  <div style={{ flex: 1 }}>
                    <Link to={`/product/${item.slug}`}>
                      <div style={{ fontWeight: 600, color: 'var(--color-heading)', marginBottom: '.25rem', fontFamily: 'var(--font-serif)' }}>
                        {item.name}
                      </div>
                    </Link>
                    <div style={{ fontSize: '.85rem', color: 'var(--color-text-muted)', marginBottom: '.5rem' }}>
                      Kích thước: {item.variant.size} · SKU: {item.variant.sku}
                    </div>
                    {item.cardMessage && (
                      <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', background: 'var(--color-accent)', padding: '.375rem .625rem', borderRadius: 'var(--radius-md)', marginBottom: '.5rem' }}>
                        💌 "{item.cardMessage}"
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div className="qty-selector">
                        <button className="qty-btn" onClick={() => updateQuantity(item.key, item.quantity - 1)}><Minus size={14} /></button>
                        <input className="qty-input" type="number" value={item.quantity} min={1}
                          onChange={e => updateQuantity(item.key, Math.max(1, parseInt(e.target.value) || 1))} />
                        <button className="qty-btn" onClick={() => updateQuantity(item.key, item.quantity + 1)}><Plus size={14} /></button>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '1.1rem' }}>
                        {formatVND(item.variant.price * item.quantity)}
                      </div>
                      <button
                        className="btn btn-ghost btn-icon"
                        onClick={() => { removeFromCart(item.key); toast.success('Đã xóa khỏi giỏ hàng') }}
                        style={{ color: 'var(--color-error)' }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', color: 'var(--color-heading)', marginBottom: '1.25rem' }}>
                Tóm tắt đơn hàng
              </h3>

              {/* Coupon */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <input
                    className="form-input"
                    placeholder="Nhập mã giảm giá"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    disabled={!!coupon}
                  />
                  {coupon ? (
                    <button className="btn btn-outline btn-sm" onClick={() => { setCoupon(null); setCouponCode('') }}>
                      Hủy
                    </button>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={applyCoupon} disabled={applyingCoupon}>
                      <Tag size={16} /> Áp dụng
                    </button>
                  )}
                </div>
                {coupon && (
                  <div className="alert alert-success" style={{ marginTop: '.5rem', padding: '.5rem .75rem' }}>
                    ✓ Giảm {formatVND(discount)}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.9rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Tiền hoa ({items.length} mẫu)</span>
                  <span>{formatVND(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.9rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Phí giao hàng</span>
                  <span>{formatVND(SHIPPING_FEE)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.9rem', color: 'var(--color-green)' }}>
                    <span>Giảm giá ({couponCode})</span>
                    <span>−{formatVND(discount)}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.15rem' }}>
                  <span style={{ color: 'var(--color-heading)' }}>Tổng cộng</span>
                  <span style={{ color: 'var(--color-primary)' }}>{formatVND(total)}</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={() => navigate('/checkout', { state: { coupon, total } })}
              >
                Tiến hành thanh toán →
              </button>

              <Link to="/shop" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', color: 'var(--color-text-muted)', fontSize: '.875rem' }}>
                ← Tiếp tục mua hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
