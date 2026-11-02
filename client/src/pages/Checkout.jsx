import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  MapPin, CreditCard, CheckCircle, Copy, Check,
  QrCode, Clock, Truck, Store, MessageSquare
} from 'lucide-react'
import useCartStore from '../store/useCartStore'
import useAuthStore from '../store/useAuthStore'
import useToastStore from '../store/useToastStore'
import api from '../services/api'
import { formatVND, formatDate } from '../utils/helpers'

const TIME_SLOTS = [
  '08:00 – 10:00', '10:00 – 12:00', '13:00 – 15:00',
  '15:00 – 17:00', '17:00 – 19:00', '19:00 – 21:00',
]

// VietQR free image API
const vietQRUrl = ({ bankCode, accountNumber, accountName, amount, note }) =>
  `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png` +
  `?amount=${amount}&addInfo=${encodeURIComponent(note)}&accountName=${encodeURIComponent(accountName)}`

// Copy to clipboard helper
function useCopy() {
  const [copied, setCopied] = useState({})
  const copy = useCallback(async (key, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(p => ({ ...p, [key]: true }))
      setTimeout(() => setCopied(p => ({ ...p, [key]: false })), 2000)
    } catch {}
  }, [])
  return { copied, copy }
}

// ── QR Panel component ──────────────────────────────────────────────────
function QRPaymentPanel({ orderId, amount, bankSettings }) {
  const { copied, copy } = useCopy()
  const transferNote = (bankSettings.transferNote || 'FLORA {ORDER_ID}')
    .replace('{ORDER_ID}', orderId?.slice(-8)?.toUpperCase() || 'ORDER')

  const qrUrl = vietQRUrl({
    bankCode: bankSettings.bankCode || 'VCB',
    accountNumber: bankSettings.accountNumber || '0',
    accountName: bankSettings.accountName || 'FLORA FLOWER',
    amount,
    note: transferNote,
  })

  const bankRows = [
    { label: 'Ngân hàng',  value: bankSettings.bankName, key: 'bank' },
    { label: 'Số TK',     value: bankSettings.accountNumber, key: 'acct' },
    { label: 'Tên TK',    value: bankSettings.accountName,   key: 'name' },
    { label: 'Số tiền',   value: formatVND(amount),          key: 'amt'  },
    { label: 'Nội dung',  value: transferNote,               key: 'note' },
  ]

  return (
    <div>
      <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
        <QrCode size={18} style={{ flexShrink: 0 }} />
        <span>Quét mã QR bằng ứng dụng ngân hàng hoặc chuyển khoản thủ công. Đơn hàng xác nhận sau khi cửa hàng nhận được tiền.</span>
      </div>

      <div className="qr-box" style={{ marginBottom: '1.25rem' }}>
        <img
          src={qrUrl}
          alt="QR chuyển khoản"
          style={{ maxWidth: '220px', margin: '0 auto', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-md)' }}
          onError={e => { e.target.style.display = 'none' }}
        />
        <p style={{ fontSize: '.78rem', color: 'var(--color-text-muted)', marginTop: '.875rem' }}>
          Mở app ngân hàng → <strong>QR</strong> → quét mã
        </p>
      </div>

      <div style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        {bankRows.map(row => (
          <div key={row.key} className="bank-info-row" style={{ padding: '.625rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--color-border)' }}>
            <span className="bank-info-label" style={{ fontSize: '.8rem', color: 'var(--color-text-muted)', minWidth: '80px' }}>{row.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              <span className="bank-info-val" style={{ fontWeight: 600, fontSize: '.875rem' }}>{row.value}</span>
              {['acct', 'name', 'note', 'amt'].includes(row.key) && (
                <button
                  className="copy-btn"
                  onClick={() => copy(row.key, String(row.value).replace(/[^\d]/g, '') || row.value)}
                  title="Sao chép"
                  style={{ flexShrink: 0 }}
                >
                  {copied[row.key] ? <Check size={13} color="var(--color-success)" /> : <Copy size={13} />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '1rem', padding: '.875rem', background: 'var(--color-warning-bg)', borderRadius: 'var(--r-lg)', fontSize: '.82rem', color: '#78350f', display: 'flex', gap: '.5rem' }}>
        <Clock size={15} style={{ flexShrink: 0, marginTop: '.1rem' }} />
        <span>Vui lòng chuyển khoản trong <strong>60 phút</strong> để giữ đơn hàng. Sau đó nhấn <strong>"Xác nhận đặt hàng"</strong>.</span>
      </div>
    </div>
  )
}

// ── Main Checkout ────────────────────────────────────────────────────────
export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { items, getTotal, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const toast = useToastStore()
  const { coupon } = location.state || {}

  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [deliveryType, setDeliveryType] = useState('delivery')
  const [submitting, setSubmitting] = useState(false)
  const [orderData, setOrderData] = useState(null)
  const [bankSettings, setBankSettings] = useState(null)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      recipientName: user?.name || '',
      recipientPhone: user?.phone || '',
      recipientAddress: '',
      deliveryDate: '',
      deliverySlot: TIME_SLOTS[0],
      cardMessage: '',
      shopNote: '',
    }
  })

  // Load bank config once
  useEffect(() => {
    api.get('/settings/public')
      .then(r => setBankSettings(r.data.bank))
      .catch(() => setBankSettings({
        bankCode: 'VCB', bankName: 'Vietcombank',
        accountNumber: '1234567890', accountName: 'FLORA FLOWER',
        transferNote: 'FLORA {ORDER_ID}',
      }))
  }, [])

  if (!user) return (
    <div className="empty-state" style={{ padding: '5rem 0' }}>
      <div className="empty-state__icon">🔒</div>
      <div className="empty-state__title">Vui lòng đăng nhập để đặt hàng</div>
      <Link to="/login"><button className="btn btn-primary" style={{ marginTop: '1rem' }}>Đăng nhập</button></Link>
    </div>
  )

  if (user.role === 'admin') return (
    <div className="empty-state" style={{ padding: '5rem 0' }}>
      <div className="empty-state__icon">🔒</div>
      <div className="empty-state__title">Tài khoản quản trị không thể mua hàng</div>
      <div className="empty-state__desc">
        Tài khoản quản trị chỉ dùng để quản lý. Vui lòng sử dụng tài khoản khách hàng để mua hoa.
      </div>
      <Link to="/admin"><button className="btn btn-primary" style={{ marginTop: '1rem' }}>⚙️ Về trang quản trị</button></Link>
    </div>
  )

  if (items.length === 0) return (
    <div className="empty-state" style={{ padding: '5rem 0' }}>
      <div className="empty-state__icon">🛒</div>
      <div className="empty-state__title">Giỏ hàng trống</div>
      <Link to="/shop"><button className="btn btn-primary" style={{ marginTop: '1rem' }}>Mua hàng</button></Link>
    </div>
  )


  const subtotal = getTotal()
  const SHIPPING_FEE = deliveryType === 'delivery' ? 30000 : 0
  const discount = coupon
    ? coupon.type === 'percent'
      ? Math.round(subtotal * coupon.value / 100)
      : coupon.value
    : 0
  const total = Math.max(0, subtotal + SHIPPING_FEE - discount)
  const todayStr = new Date().toISOString().split('T')[0]

  const onSubmitInfo = (data) => { setOrderData(data); setStep(2) }

  const onConfirmOrder = async () => {
    if (!orderData) return
    setSubmitting(true)
    try {
      const payload = {
        items: items.map(i => ({
          productId: i.productId,
          name: i.name,
          image: i.image,
          variantSize: i.variant?.size,
          variantSKU: i.variant?.sku,
          price: i.variant?.price || 0,
          quantity: i.quantity,
          cardMessage: i.cardMessage,
        })),
        recipient: {
          name: orderData.recipientName,
          phone: orderData.recipientPhone,
          address: deliveryType === 'delivery' ? orderData.recipientAddress : 'Nhận tại cửa hàng',
        },
        deliveryType,
        deliveryDate: orderData.deliveryDate,
        deliverySlot: orderData.deliverySlot,
        cardMessage: orderData.cardMessage,
        shopNote: orderData.shopNote,
        paymentMethod,
        couponCode: coupon?.code,
        subtotal,
        shippingFee: SHIPPING_FEE,
        discount,
        total,
      }
      const res = await api.post('/orders', payload)
      clearCart()
      const newId = res.data.id || res.data._id || res.data.orderId
      navigate(`/order-success/${newId}`)
    } catch (e) {
      toast.error(e.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const PAYMENT_OPTIONS = [
    {
      value: 'cod',
      label: '💵 Thanh toán khi nhận hàng (COD)',
      desc: 'Bạn trả tiền mặt khi nhận hoa. Không cần cọc trước.',
    },
    {
      value: 'bank_transfer',
      label: '📱 Chuyển khoản / QR Code',
      desc: 'Quét mã QR VietQR hoặc chuyển khoản. Đơn xác nhận sau khi nhận tiền.',
    },
    {
      value: 'demo_online',
      label: '💳 Thanh toán online (Demo)',
      desc: '[Demo] Mô phỏng thanh toán — không thu tiền thật.',
    },
  ]

  return (
    <div style={{ padding: '2.5rem 0 4rem', background: 'var(--color-bg)' }}>
      <div className="container" style={{ maxWidth: '960px' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <nav className="breadcrumb" style={{ marginBottom: '.75rem' }}>
            <Link to="/">Trang chủ</Link>
            <span className="breadcrumb-sep">/</span>
            <Link to="/cart">Giỏ hàng</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">Đặt hoa</span>
          </nav>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-heading)' }}>
            Đặt hoa 🌸
          </h1>
        </div>

        {/* Step indicator */}
        <div className="checkout-steps" style={{ marginBottom: '2.5rem' }}>
          {[
            { n: 1, label: 'Thông tin giao' },
            { n: 2, label: 'Thanh toán' },
            { n: 3, label: 'Xác nhận' },
          ].map(({ n, label }, i) => (
            <div key={n} className={`checkout-step${step === n ? ' active' : step > n ? ' done' : ''}`}>
              <div className="checkout-step__number">{step > n ? '✓' : n}</div>
              <div className="checkout-step__label">{label}</div>
              {i < 2 && <div className="checkout-step__line" />}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
          {/* ── MAIN COLUMN ── */}
          <div>

            {/* ── STEP 1: Delivery info ── */}
            {step === 1 && (
              <form onSubmit={handleSubmit(onSubmitInfo)}>
                <div className="card" style={{ padding: '1.75rem', marginBottom: '1rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-heading)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <MapPin size={20} color="var(--color-primary)" /> Thông tin giao hoa
                  </h3>

                  {/* Delivery type */}
                  <div className="form-group">
                    <label className="form-label">Hình thức nhận hàng</label>
                    <div style={{ display: 'flex', gap: '.875rem', flexWrap: 'wrap' }}>
                      {[
                        { v: 'delivery', label: 'Giao tận nơi', icon: <Truck size={16} /> },
                        { v: 'pickup',   label: 'Nhận tại shop', icon: <Store size={16} /> },
                      ].map(opt => (
                        <label key={opt.v} style={{
                          display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer',
                          padding: '.75rem 1.25rem', border: `2px solid ${deliveryType === opt.v ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          borderRadius: 'var(--r-lg)', background: deliveryType === opt.v ? 'var(--color-primary-bg)' : '#fff',
                          transition: 'all var(--transition)', flex: '1 0 140px',
                        }}>
                          <input type="radio" name="deliveryType" value={opt.v}
                            checked={deliveryType === opt.v}
                            onChange={() => setDeliveryType(opt.v)}
                            style={{ accentColor: 'var(--color-primary)' }}
                          />
                          {opt.icon} {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Tên người nhận *</label>
                      <input className={`form-input${errors.recipientName ? ' error' : ''}`}
                        {...register('recipientName', { required: 'Vui lòng nhập tên' })}
                        placeholder="Nguyễn Văn A" />
                      {errors.recipientName && <div className="form-error">{errors.recipientName.message}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Số điện thoại *</label>
                      <input className={`form-input${errors.recipientPhone ? ' error' : ''}`}
                        {...register('recipientPhone', {
                          required: 'Vui lòng nhập số điện thoại',
                          pattern: { value: /^[0-9]{9,11}$/, message: 'Số điện thoại không hợp lệ' }
                        })}
                        placeholder="0901234567" type="tel" />
                      {errors.recipientPhone && <div className="form-error">{errors.recipientPhone.message}</div>}
                    </div>
                  </div>

                  {deliveryType === 'delivery' && (
                    <div className="form-group">
                      <label className="form-label">Địa chỉ giao hoa *</label>
                      <input className={`form-input${errors.recipientAddress ? ' error' : ''}`}
                        {...register('recipientAddress', {
                          required: deliveryType === 'delivery' ? 'Vui lòng nhập địa chỉ' : false
                        })}
                        placeholder="Số nhà, tên đường, phường/xã, quận/huyện, TP.HCM" />
                      {errors.recipientAddress && <div className="form-error">{errors.recipientAddress.message}</div>}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Ngày giao / nhận *</label>
                      <input type="date" className={`form-input${errors.deliveryDate ? ' error' : ''}`}
                        {...register('deliveryDate', { required: 'Vui lòng chọn ngày' })}
                        min={todayStr} />
                      {errors.deliveryDate && <div className="form-error">{errors.deliveryDate.message}</div>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Khung giờ *</label>
                      <select className="form-select" {...register('deliverySlot')}>
                        {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <MessageSquare size={14} style={{ verticalAlign: 'middle', marginRight: '.3rem' }} />
                      Lời nhắn trên thiệp
                    </label>
                    <textarea className="form-textarea" rows={3}
                      {...register('cardMessage')}
                      placeholder="Ví dụ: Chúc mừng sinh nhật! Chúc bạn thật nhiều sức khỏe và hạnh phúc ❤️"
                      maxLength={300}
                    />
                    <div className="form-hint">Ghi thêm lời nhắn, cửa hàng sẽ viết lên thiệp kèm hoa.</div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Yêu cầu đặc biệt</label>
                    <textarea className="form-textarea" rows={2}
                      {...register('shopNote')}
                      placeholder="Màu hoa ưa thích, dị ứng, ghi chú đặc biệt cho cửa hàng..."
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Tiếp theo: Chọn thanh toán →
                </button>
              </form>
            )}

            {/* ── STEP 2: Payment ── */}
            {step === 2 && (
              <div>
                <div className="card" style={{ padding: '1.75rem', marginBottom: '1rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-heading)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <CreditCard size={20} color="var(--color-primary)" /> Phương thức thanh toán
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '1.5rem' }}>
                    {PAYMENT_OPTIONS.map(opt => (
                      <label key={opt.value} style={{
                        display: 'flex', gap: '1rem', padding: '1rem 1.25rem',
                        border: `2px solid ${paymentMethod === opt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        borderRadius: 'var(--r-xl)', cursor: 'pointer',
                        background: paymentMethod === opt.value ? 'var(--color-primary-bg)' : '#fff',
                        transition: 'all var(--transition)',
                      }}>
                        <input type="radio" value={opt.value} checked={paymentMethod === opt.value}
                          onChange={() => setPaymentMethod(opt.value)}
                          style={{ marginTop: '.25rem', accentColor: 'var(--color-primary)', flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600, marginBottom: '.2rem' }}>{opt.label}</div>
                          <div style={{ fontSize: '.82rem', color: 'var(--color-text-muted)' }}>{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* QR preview for bank_transfer */}
                  {paymentMethod === 'bank_transfer' && bankSettings && (
                    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--color-heading)', marginBottom: '1rem' }}>
                        📱 Thông tin chuyển khoản
                      </div>
                      <QRPaymentPanel
                        orderId="PREVIEW"
                        amount={total}
                        bankSettings={bankSettings}
                      />
                    </div>
                  )}

                  {paymentMethod === 'demo_online' && (
                    <div className="alert alert-warning">
                      ⚠️ Đây là <strong>thanh toán mô phỏng</strong> dành cho demo/đồ án. Không có thông tin thẻ nào được lưu.
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-outline btn-lg" onClick={() => setStep(1)} style={{ flex: 1 }}>← Quay lại</button>
                  <button className="btn btn-primary btn-lg" onClick={() => setStep(3)} style={{ flex: 2 }}>
                    Xem lại đơn hàng →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Confirm ── */}
            {step === 3 && (
              <div>
                <div className="card" style={{ padding: '1.75rem', marginBottom: '1rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-heading)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <CheckCircle size={20} color="var(--color-success)" /> Xác nhận thông tin đặt hàng
                  </h3>

                  {/* Delivery + Payment summary */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'var(--color-primary-bg)', borderRadius: 'var(--r-lg)', padding: '1rem' }}>
                      <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--color-primary)', marginBottom: '.625rem' }}>
                        Người nhận
                      </div>
                      <div style={{ fontWeight: 700 }}>{orderData?.recipientName}</div>
                      <div style={{ fontSize: '.875rem', color: 'var(--color-text-muted)', marginTop: '.2rem' }}>{orderData?.recipientPhone}</div>
                      <div style={{ fontSize: '.85rem', color: 'var(--color-text-muted)', marginTop: '.15rem' }}>
                        {deliveryType === 'delivery' ? orderData?.recipientAddress : '🏪 Nhận tại cửa hàng'}
                      </div>
                    </div>
                    <div style={{ background: 'var(--color-primary-bg)', borderRadius: 'var(--r-lg)', padding: '1rem' }}>
                      <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--color-primary)', marginBottom: '.625rem' }}>
                        Thời gian & Thanh toán
                      </div>
                      <div style={{ fontWeight: 700 }}>{orderData?.deliveryDate}</div>
                      <div style={{ fontSize: '.875rem', color: 'var(--color-text-muted)', marginTop: '.2rem' }}>{orderData?.deliverySlot}</div>
                      <div style={{ fontSize: '.875rem', marginTop: '.15rem', color: 'var(--color-heading)', fontWeight: 500 }}>
                        {paymentMethod === 'cod' ? '💵 COD' : paymentMethod === 'bank_transfer' ? '📱 Chuyển khoản QR' : '💳 Online (Demo)'}
                      </div>
                    </div>
                  </div>

                  {/* Card message */}
                  {orderData?.cardMessage && (
                    <div style={{ background: 'var(--color-primary-bg)', border: '1px dashed var(--color-primary-light)', padding: '1rem', borderRadius: 'var(--r-lg)', marginBottom: '1rem', fontStyle: 'italic', color: 'var(--color-heading)' }}>
                      💌 "<em>{orderData.cardMessage}</em>"
                    </div>
                  )}

                  <div className="alert alert-info">
                    ℹ️ Khi nhấn "Đặt hàng", bạn xác nhận thông tin trên là chính xác và đồng ý với điều khoản của cửa hàng.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-outline btn-lg" onClick={() => setStep(2)} style={{ flex: 1 }}>← Quay lại</button>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={onConfirmOrder}
                    disabled={submitting}
                    style={{ flex: 2 }}
                  >
                    {submitting
                      ? <><div className="spinner spinner-sm" /> Đang đặt hàng...</>
                      : '✓ Xác nhận đặt hàng'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── ORDER SUMMARY SIDEBAR ── */}
          <div>
            <div className="card" style={{ padding: '1.25rem', position: 'sticky', top: 'calc(var(--header-h) + 1.5rem)' }}>
              <h4 style={{ fontWeight: 700, color: 'var(--color-heading)', marginBottom: '1rem', fontSize: '.95rem' }}>
                Đơn hàng ({items.length} mặt hàng)
              </h4>

              <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '1rem' }}>
                {items.map(item => (
                  <div key={item.key} style={{ display: 'flex', gap: '.75rem', marginBottom: '.75rem', paddingBottom: '.75rem', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--r-md)', overflow: 'hidden', flexShrink: 0, background: 'var(--color-primary-bg)' }}>
                      <img
                        src={item.image || `https://images.unsplash.com/photo-1548460848-d7b0da0e01e0?w=60&h=60&fit=crop`}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1548460848-d7b0da0e01e0?w=60&h=60&fit=crop' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--color-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--color-text-muted)' }}>{item.variant?.size} × {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '.875rem', flexShrink: 0 }}>
                      {formatVND((item.variant?.price || 0) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              {coupon && (
                <div style={{ background: 'var(--color-green-bg)', border: '1px dashed var(--color-green)', borderRadius: 'var(--r-md)', padding: '.5rem .75rem', marginBottom: '.875rem', fontSize: '.82rem', color: 'var(--color-green)', fontWeight: 600 }}>
                  🎫 {coupon.code} — giảm {coupon.type === 'percent' ? `${coupon.value}%` : formatVND(coupon.value)}
                </div>
              )}

              {/* Totals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', fontSize: '.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Tiền hoa</span>
                  <span>{formatVND(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Phí giao</span>
                  <span>{deliveryType === 'pickup' ? <span style={{ color: 'var(--color-success)' }}>Miễn phí</span> : formatVND(SHIPPING_FEE)}</span>
                </div>
                {discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                    <span>Giảm giá</span>
                    <span>−{formatVND(discount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', borderTop: '2px solid var(--color-border)', paddingTop: '.625rem', marginTop: '.25rem' }}>
                  <span style={{ color: 'var(--color-heading)' }}>Tổng cộng</span>
                  <span style={{ color: 'var(--color-primary)' }}>{formatVND(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
