import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Printer, Check, Copy, QrCode, Clock,
  Truck, Store, Package, CheckCircle, XCircle,
} from 'lucide-react'
import api from '../services/api'
import useToastStore from '../store/useToastStore'
import { formatVND, formatDateTime, getStatusLabel, getStatusClass, getPaymentLabel } from '../utils/helpers'

const vietQRUrl = ({ bankCode, accountNumber, accountName, amount, note }) =>
  `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png` +
  `?amount=${amount}&addInfo=${encodeURIComponent(note)}&accountName=${encodeURIComponent(accountName)}`

const ORDER_STEPS = [
  { key: 'pending',    label: 'Đặt hàng',    icon: Package },
  { key: 'confirmed',  label: 'Xác nhận',    icon: CheckCircle },
  { key: 'preparing',  label: 'Chuẩn bị hoa', icon: '🌸' },
  { key: 'delivering', label: 'Đang giao',    icon: Truck },
  { key: 'completed',  label: 'Hoàn tất',    icon: CheckCircle },
]

const STEP_ORDER = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed']

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={async () => {
        try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
      }}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '.1rem .3rem', color: 'var(--color-primary)' }}
    >
      {copied ? <Check size={13} color="var(--color-success)" /> : <Copy size={13} />}
    </button>
  )
}

export default function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const toast = useToastStore()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [bankSettings, setBankSettings] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get(`/orders/${orderId}`),
      api.get('/settings/public').catch(() => ({ data: { bank: null } })),
    ]).then(([oRes, sRes]) => {
      setOrder(oRes.data)
      setBankSettings(sRes.data.bank)
    }).catch(() => navigate('/orders'))
      .finally(() => setLoading(false))
  }, [orderId])

  const handleCancel = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return
    setCancelling(true)
    try {
      await api.patch(`/orders/${orderId}/cancel`)
      toast.success('Đã hủy đơn hàng')
      setOrder(o => ({ ...o, status: 'cancelled' }))
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không thể hủy đơn lúc này')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>
  if (!order) return null

  const canCancel = ['pending', 'confirmed'].includes(order.status)
  const isCancelled = order.status === 'cancelled'
  const currentStepIdx = isCancelled ? -1 : STEP_ORDER.indexOf(order.status)
  const showQR = order.paymentMethod === 'bank_transfer' &&
    order.paymentStatus !== 'paid' && bankSettings

  const transferNote = bankSettings
    ? (bankSettings.transferNote || 'FLORA {ORDER_ID}').replace('{ORDER_ID}', orderId.slice(-8).toUpperCase())
    : ''

  return (
    <div style={{ background: 'var(--color-bg)', padding: '2.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '780px' }}>

        {/* Back + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem', marginBottom: '2rem' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/orders')} style={{ border: '1.5px solid var(--color-border)', borderRadius: '50%' }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-heading)' }}>
              Chi tiết đơn hàng
            </h1>
            <div style={{ fontSize: '.82rem', color: 'var(--color-text-muted)', marginTop: '.1rem' }}>
              Đặt lúc {formatDateTime(order.createdAt)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            {canCancel && (
              <button className="btn btn-outline btn-sm" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                onClick={handleCancel} disabled={cancelling}>
                {cancelling ? <><div className="spinner spinner-sm" /> Đang hủy...</> : '✕ Hủy đơn'}
              </button>
            )}
            <button className="btn btn-outline btn-sm" onClick={() => window.print()}>
              <Printer size={15} /> In
            </button>
          </div>
        </div>

        {/* Order ID + Payment */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--color-text-muted)', marginBottom: '.625rem' }}>
              Mã đơn hàng
            </div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-primary)' }}>
              #{(order.orderCode || order.id?.slice(-8))?.toUpperCase()}
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--color-text-muted)', marginBottom: '.625rem' }}>
              Thanh toán
            </div>
            <div style={{ fontWeight: 600, marginBottom: '.3rem' }}>
              {order.paymentMethod === 'cod' ? '💵 COD' : order.paymentMethod === 'bank_transfer' ? '📱 Chuyển khoản' : '💳 Online (Demo)'}
            </div>
            <span style={{
              display: 'inline-block',
              background: order.paymentStatus === 'paid' ? '#dcfce7' : '#fef9c3',
              color: order.paymentStatus === 'paid' ? '#166534' : '#854d0e',
              padding: '.15rem .6rem', borderRadius: '9999px', fontSize: '.75rem', fontWeight: 700,
            }}>
              {getPaymentLabel(order.paymentStatus)}
            </span>
          </div>
        </div>

        {/* Status tracker */}
        {!isCancelled ? (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--color-heading)', marginBottom: '1.5rem' }}>
              Trạng thái đơn hàng
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
              {/* background line */}
              <div style={{ position: 'absolute', top: '1.1rem', left: '1.1rem', right: '1.1rem', height: '3px', background: 'var(--color-border)', zIndex: 0 }} />
              {/* progress line */}
              <div style={{
                position: 'absolute', top: '1.1rem', left: '1.1rem', height: '3px',
                background: 'var(--color-success)', zIndex: 1, transition: 'width .5s',
                width: currentStepIdx <= 0 ? '0%' : `${currentStepIdx / (ORDER_STEPS.length - 1) * (100 - 100 / ORDER_STEPS.length)}%`,
              }} />

              {ORDER_STEPS.map((step, i) => {
                const done = currentStepIdx >= i
                const active = currentStepIdx === i
                return (
                  <div key={step.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                    <div style={{
                      width: '2.25rem', height: '2.25rem', borderRadius: '50%',
                      background: done ? 'var(--color-success)' : active ? 'var(--color-primary-bg)' : '#fff',
                      border: `2.5px solid ${done ? 'var(--color-success)' : active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '.5rem', fontSize: '.9rem', transition: 'all .3s',
                    }}>
                      {done
                        ? <Check size={14} color="#fff" />
                        : typeof step.icon === 'string'
                          ? step.icon
                          : <step.icon size={14} color={active ? 'var(--color-primary)' : 'var(--color-text-light)'} />
                      }
                    </div>
                    <div style={{
                      fontSize: '.72rem', textAlign: 'center', fontWeight: done ? 700 : 400,
                      color: done ? 'var(--color-success)' : active ? 'var(--color-primary)' : 'var(--color-text-light)',
                      lineHeight: 1.3,
                    }}>
                      {step.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem', background: 'var(--color-error-bg)', borderColor: 'var(--color-error)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', color: 'var(--color-error)' }}>
              <XCircle size={24} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>Đơn hàng đã bị hủy</div>
                <div style={{ fontSize: '.85rem', color: 'var(--color-text-muted)', marginTop: '.2rem' }}>Nếu đã thanh toán, cửa hàng sẽ hoàn tiền trong 3-5 ngày làm việc.</div>
              </div>
            </div>
          </div>
        )}

        {/* QR Payment Panel */}
        {showQR && (
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem', border: '2px solid var(--color-primary-light)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--color-heading)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <QrCode size={18} color="var(--color-primary)" /> Hoàn tất thanh toán
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '1.5rem', alignItems: 'start' }}>
              <div style={{ textAlign: 'center' }}>
                <img
                  src={vietQRUrl({ bankCode: bankSettings.bankCode, accountNumber: bankSettings.accountNumber, accountName: bankSettings.accountName, amount: order.total, note: transferNote })}
                  alt="QR"
                  style={{ maxWidth: '160px', margin: '0 auto', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-md)' }}
                  onError={e => { e.target.style.display = 'none' }}
                />
                <p style={{ fontSize: '.72rem', color: 'var(--color-text-muted)', marginTop: '.5rem' }}>App ngân hàng → QR</p>
              </div>
              <div>
                {[
                  { l: 'Ngân hàng', v: bankSettings.bankName },
                  { l: 'Số TK', v: bankSettings.accountNumber },
                  { l: 'Tên TK', v: bankSettings.accountName },
                  { l: 'Số tiền', v: formatVND(order.total) },
                  { l: 'Nội dung CK', v: transferNote, hl: true },
                ].map(row => (
                  <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.4rem 0', borderBottom: '1px dashed var(--color-border)' }}>
                    <span style={{ fontSize: '.78rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>{row.l}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                      <span style={{ fontWeight: row.hl ? 700 : 600, fontSize: '.85rem', color: row.hl ? 'var(--color-primary)' : 'var(--color-heading)' }}>{row.v}</span>
                      <CopyBtn text={row.v} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: '.75rem', padding: '.625rem', background: 'var(--color-warning-bg)', borderRadius: 'var(--r-md)', fontSize: '.78rem', color: '#78350f', display: 'flex', gap: '.4rem' }}>
                  <Clock size={13} style={{ flexShrink: 0, marginTop: '.1rem' }} />
                  Chuyển khoản trong <strong>60 phút</strong>. Cửa hàng sẽ xác nhận và giao hoa đúng lịch.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delivery info */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--color-heading)', marginBottom: '1rem' }}>
            Thông tin giao hoa
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '.875rem' }}>
            <div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '.4rem' }}>Người nhận</div>
              <div style={{ fontWeight: 600 }}>{order.recipient?.name}</div>
              <div>{order.recipient?.phone}</div>
              <div style={{ color: 'var(--color-text-muted)', marginTop: '.2rem' }}>
                {order.deliveryType === 'pickup' ? <><Store size={13} style={{ verticalAlign: 'middle' }} /> Nhận tại cửa hàng</> : <><Truck size={13} style={{ verticalAlign: 'middle' }} /> {order.recipient?.address}</>}
              </div>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '.4rem' }}>Thời gian giao</div>
              <div style={{ fontWeight: 600 }}>{order.deliveryDate}</div>
              <div>{order.deliverySlot}</div>
            </div>
          </div>
          {order.cardMessage && (
            <div style={{ marginTop: '1rem', background: 'var(--color-primary-bg)', border: '1px dashed var(--color-primary-light)', padding: '.75rem 1rem', borderRadius: 'var(--r-lg)', fontStyle: 'italic', fontSize: '.875rem', color: 'var(--color-rose)' }}>
              💌 Lời nhắn: "<em>{order.cardMessage}</em>"
            </div>
          )}
        </div>

        {/* Items */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div style={{ padding: '1.25rem 1.25rem .625rem', fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1.05rem', color: 'var(--color-heading)' }}>
            Sản phẩm đặt
          </div>
          {(order.items || []).map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '1rem', padding: '.875rem 1.25rem', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--r-md)', overflow: 'hidden', flexShrink: 0, background: 'var(--color-primary-bg)' }}>
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1548460848-d7b0da0e01e0?w=60&h=60&fit=crop'}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1548460848-d7b0da0e01e0?w=60&h=60&fit=crop' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '.2rem' }}>{item.name}</div>
                <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)' }}>
                  {item.variantSize} · ×{item.quantity}
                </div>
                {item.cardMessage && (
                  <div style={{ fontSize: '.75rem', color: 'var(--color-primary)', fontStyle: 'italic', marginTop: '.2rem' }}>
                    💌 {item.cardMessage}
                  </div>
                )}
              </div>
              <div style={{ fontWeight: 700, color: 'var(--color-primary)', flexShrink: 0 }}>
                {formatVND(item.price * item.quantity)}
              </div>
            </div>
          ))}

          {/* Totals */}
          <div style={{ padding: '1rem 1.25rem', background: 'var(--color-bg-subtle)', borderTop: '1px solid var(--color-border)' }}>
            {[
              { l: 'Tiền hoa', v: formatVND(order.subtotal) },
              { l: 'Phí giao', v: formatVND(order.shippingFee || 0) },
              ...(order.discount > 0 ? [{ l: 'Giảm giá', v: `−${formatVND(order.discount)}`, green: true }] : []),
            ].map(row => (
              <div key={row.l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem', marginBottom: '.4rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{row.l}</span>
                <span style={row.green ? { color: 'var(--color-success)' } : {}}>{row.v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', borderTop: '1.5px solid var(--color-border)', paddingTop: '.625rem', marginTop: '.25rem' }}>
              <span>Tổng cộng</span>
              <span style={{ color: 'var(--color-primary)' }}>{formatVND(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Link to="/orders">
            <button className="btn btn-outline btn-lg">
              <ArrowLeft size={16} /> Đơn hàng của tôi
            </button>
          </Link>
          <Link to="/shop">
            <button className="btn btn-primary btn-lg">🌸 Đặt thêm hoa</button>
          </Link>
        </div>
      </div>
    </div>
  )
}
