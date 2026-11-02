import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight, Copy, Check, QrCode, Clock, Truck } from 'lucide-react'
import api from '../services/api'
import { formatVND, formatDateTime, getStatusLabel, getPaymentMethodLabel } from '../utils/helpers'

const vietQRUrl = ({ bankCode, accountNumber, accountName, amount, note }) =>
  `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png` +
  `?amount=${amount}&addInfo=${encodeURIComponent(note)}&accountName=${encodeURIComponent(accountName)}`

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const doCopy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }
  return (
    <button onClick={doCopy} title="Sao chép"
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: '.15rem .35rem', borderRadius: '4px' }}>
      {copied ? <Check size={13} color="var(--color-success)" /> : <Copy size={13} />}
    </button>
  )
}

export default function OrderSuccess() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bankSettings, setBankSettings] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [oRes, sRes] = await Promise.all([
          api.get(`/orders/${orderId}`),
          api.get('/settings/public').catch(() => ({ data: { bank: null } })),
        ])
        setOrder(oRes.data)
        setBankSettings(sRes.data.bank)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [orderId])

  if (loading) return (
    <div className="loading-page"><div className="spinner spinner-lg" /></div>
  )

  if (!order) return (
    <div className="empty-state" style={{ padding: '5rem 0' }}>
      <div className="empty-state__icon">❌</div>
      <div className="empty-state__title">Không tìm thấy đơn hàng</div>
      <Link to="/"><button className="btn btn-primary" style={{ marginTop: '1rem' }}>Về trang chủ</button></Link>
    </div>
  )

  const isBankTransfer = order.paymentMethod === 'bank_transfer'
  const isUnpaid = order.paymentStatus !== 'paid'
  const showQR = isBankTransfer && isUnpaid && bankSettings

  const transferNote = bankSettings
    ? (bankSettings.transferNote || 'FLORA {ORDER_ID}').replace('{ORDER_ID}', orderId.slice(-8).toUpperCase())
    : ''

  const qrUrl = showQR ? vietQRUrl({
    bankCode: bankSettings.bankCode,
    accountNumber: bankSettings.accountNumber,
    accountName: bankSettings.accountName,
    amount: order.total,
    note: transferNote,
  }) : null

  const steps = [
    { key: 'pending',    label: 'Đặt hàng', done: true },
    { key: 'confirmed',  label: 'Xác nhận',  done: ['confirmed','preparing','ready','delivering','completed'].includes(order.status) },
    { key: 'preparing',  label: 'Chuẩn bị', done: ['preparing','ready','delivering','completed'].includes(order.status) },
    { key: 'delivering', label: 'Giao hoa',  done: ['delivering','completed'].includes(order.status) },
    { key: 'completed',  label: 'Hoàn tất',  done: order.status === 'completed' },
  ]

  return (
    <div style={{ background: 'var(--color-bg)', padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '720px' }}>

        {/* Success header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '5rem', height: '5rem', borderRadius: '50%', background: 'var(--color-green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <CheckCircle size={40} color="var(--color-success)" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.1rem', color: 'var(--color-heading)', marginBottom: '.5rem' }}>
            Đặt hàng thành công! 🌸
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
            Mã đơn hàng: <strong style={{ color: 'var(--color-primary)', fontFamily: 'monospace' }}>#{orderId.slice(-8).toUpperCase()}</strong>
          </p>
        </div>

        {/* QR Payment Section (if bank transfer & unpaid) */}
        {showQR && (
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem', border: '2px solid var(--color-primary-light)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--color-heading)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
              <QrCode size={20} color="var(--color-primary)" /> Thanh toán chuyển khoản
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
              {/* QR Code */}
              <div style={{ textAlign: 'center' }}>
                <div className="qr-box">
                  <img
                    src={qrUrl}
                    alt="QR chuyển khoản"
                    style={{ maxWidth: '200px', margin: '0 auto', borderRadius: 'var(--r-lg)', boxShadow: 'var(--sh-md)' }}
                    onError={e => { e.target.parentNode.innerHTML = '<p style="color:var(--color-text-muted);padding:1rem">Không tải được QR. Vui lòng chuyển khoản thủ công.</p>' }}
                  />
                </div>
                <p style={{ fontSize: '.78rem', color: 'var(--color-text-muted)', marginTop: '.75rem' }}>
                  Mở app ngân hàng → <strong>QR/Scan</strong>
                </p>
              </div>

              {/* Bank info */}
              <div>
                {[
                  { label: 'Ngân hàng', value: bankSettings.bankName },
                  { label: 'Số tài khoản', value: bankSettings.accountNumber },
                  { label: 'Tên tài khoản', value: bankSettings.accountName },
                  { label: 'Số tiền', value: formatVND(order.total) },
                  { label: 'Nội dung CK', value: transferNote, highlight: true },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.5rem 0', borderBottom: '1px dashed var(--color-border)', gap: '.5rem' }}>
                    <span style={{ fontSize: '.8rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>{row.label}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                      <span style={{ fontWeight: row.highlight ? 700 : 600, fontSize: '.85rem', color: row.highlight ? 'var(--color-primary)' : 'var(--color-heading)', wordBreak: 'break-all', textAlign: 'right' }}>
                        {row.value}
                      </span>
                      <CopyBtn text={row.value} />
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: '.875rem', padding: '.75rem', background: 'var(--color-warning-bg)', borderRadius: 'var(--r-md)', fontSize: '.8rem', color: '#78350f', display: 'flex', gap: '.4rem', alignItems: 'flex-start' }}>
                  <Clock size={14} style={{ flexShrink: 0, marginTop: '.1rem' }} />
                  Chuyển khoản trong <strong>60 phút</strong> để giữ đơn hàng. Cửa hàng sẽ liên hệ xác nhận.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order tracking steps */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-heading)', marginBottom: '1.25rem' }}>
            Trạng thái đơn hàng
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {/* Progress line */}
            <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '3px', background: 'var(--color-border)', zIndex: 0, transform: 'translateY(-50%)' }} />
            <div style={{
              position: 'absolute', top: '50%', left: '10%', height: '3px',
              background: 'var(--color-success)', zIndex: 1, transform: 'translateY(-50%)',
              width: `${Math.max(0, steps.filter(s => s.done).length - 1) / (steps.length - 1) * 80}%`,
              transition: 'width .5s ease',
            }} />
            {steps.map((s, i) => (
              <div key={s.key} style={{ textAlign: 'center', zIndex: 2, flex: '0 0 auto' }}>
                <div style={{
                  width: '2.25rem', height: '2.25rem', borderRadius: '50%',
                  background: s.done ? 'var(--color-success)' : '#fff',
                  border: `2.5px solid ${s.done ? 'var(--color-success)' : 'var(--color-border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto .5rem', fontSize: '.9rem',
                  transition: 'all .3s',
                }}>
                  {s.done ? <Check size={14} color="#fff" /> : <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--color-text-light)' }}>{i + 1}</span>}
                </div>
                <div style={{ fontSize: '.72rem', fontWeight: s.done ? 700 : 400, color: s.done ? 'var(--color-success)' : 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Order details */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', color: 'var(--color-heading)', marginBottom: '1.25rem' }}>
            Chi tiết đơn hàng
          </h3>

          {/* Items */}
          <div style={{ marginBottom: '1rem' }}>
            {(order.items || []).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '.875rem', paddingBottom: '.875rem', marginBottom: '.875rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--r-md)', overflow: 'hidden', flexShrink: 0, background: 'var(--color-primary-bg)' }}>
                  <img src={item.image || 'https://images.unsplash.com/photo-1548460848-d7b0da0e01e0?w=60&h=60&fit=crop'}
                    alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => { e.target.src = 'https://images.unsplash.com/photo-1548460848-d7b0da0e01e0?w=60&h=60&fit=crop' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)' }}>{item.variantSize} × {item.quantity}</div>
                  {item.cardMessage && <div style={{ fontSize: '.78rem', fontStyle: 'italic', color: 'var(--color-primary)', marginTop: '.2rem' }}>💌 {item.cardMessage}</div>}
                </div>
                <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatVND(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>

          {/* Recipient & delivery */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ background: 'var(--color-bg-subtle)', borderRadius: 'var(--r-md)', padding: '.875rem' }}>
              <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--color-text-muted)', marginBottom: '.5rem' }}>Người nhận</div>
              <div style={{ fontWeight: 600 }}>{order.recipient?.name}</div>
              <div style={{ fontSize: '.85rem', color: 'var(--color-text-muted)' }}>{order.recipient?.phone}</div>
              <div style={{ fontSize: '.85rem', color: 'var(--color-text-muted)', marginTop: '.15rem' }}>
                <Truck size={13} style={{ verticalAlign: 'middle' }} /> {order.recipient?.address}
              </div>
            </div>
            <div style={{ background: 'var(--color-bg-subtle)', borderRadius: 'var(--r-md)', padding: '.875rem' }}>
              <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--color-text-muted)', marginBottom: '.5rem' }}>Giao hàng</div>
              <div style={{ fontWeight: 600 }}>{order.deliveryDate}</div>
              <div style={{ fontSize: '.85rem', color: 'var(--color-text-muted)' }}>{order.deliverySlot}</div>
            </div>
          </div>

          {/* Totals */}
          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
            {[
              { label: 'Tiền hoa', value: formatVND(order.subtotal) },
              { label: 'Phí giao', value: formatVND(order.shippingFee || 0) },
              ...(order.discount > 0 ? [{ label: 'Giảm giá', value: `−${formatVND(order.discount)}`, green: true }] : []),
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem', marginBottom: '.375rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>{row.label}</span>
                <span style={row.green ? { color: 'var(--color-success)' } : {}}>{row.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.15rem', borderTop: '1px solid var(--color-border)', paddingTop: '.625rem', marginTop: '.375rem' }}>
              <span>Tổng cộng</span>
              <span style={{ color: 'var(--color-primary)' }}>{formatVND(order.total)}</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={`/orders/${orderId}`}>
            <button className="btn btn-outline btn-lg">
              <Package size={18} /> Xem đơn hàng
            </button>
          </Link>
          <Link to="/shop">
            <button className="btn btn-primary btn-lg">
              Tiếp tục mua hoa <ArrowRight size={18} />
            </button>
          </Link>
        </div>

        {order.cardMessage && (
          <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1.5rem', background: 'var(--color-primary-bg)', borderRadius: 'var(--r-2xl)', fontStyle: 'italic', color: 'var(--color-heading)' }}>
            💌 Lời nhắn: "<em>{order.cardMessage}</em>"
          </div>
        )}
      </div>
    </div>
  )
}
