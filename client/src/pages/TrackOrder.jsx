import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Package, Check, Truck, CheckCircle, Clock, QrCode, Copy } from 'lucide-react'
import api from '../services/api'
import { formatVND, formatDateTime, getStatusLabel } from '../utils/helpers'

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'delivering', 'completed']

const STATUS_INFO = {
  pending:    { label: 'Chờ xác nhận', icon: '⏳', color: '#854d0e', bg: '#fef9c3' },
  confirmed:  { label: 'Đã xác nhận',  icon: '✅', color: '#1e40af', bg: '#dbeafe' },
  preparing:  { label: 'Đang chuẩn bị hoa', icon: '🌸', color: '#6b21a8', bg: '#f3e8ff' },
  ready:      { label: 'Sẵn sàng giao', icon: '📦', color: '#166534', bg: '#dcfce7' },
  delivering: { label: 'Đang giao',    icon: '🚚', color: '#9a3412', bg: '#ffedd5' },
  completed:  { label: 'Đã giao thành công', icon: '🎉', color: '#166534', bg: '#dcfce7' },
  cancelled:  { label: 'Đã hủy',       icon: '❌', color: '#991b1b', bg: '#fee2e2' },
}

function TrackStep({ label, icon, done, active, isLast }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }}>
      {!isLast && (
        <div style={{ position: 'absolute', top: '1.1rem', left: '50%', width: '100%', height: '3px', background: done ? 'var(--color-success)' : 'var(--color-border)', zIndex: 0 }} />
      )}
      <div style={{
        width: '2.25rem', height: '2.25rem', borderRadius: '50%', zIndex: 1,
        background: done ? 'var(--color-success)' : active ? 'var(--color-primary-bg)' : '#fff',
        border: `2.5px solid ${done ? 'var(--color-success)' : active ? 'var(--color-primary)' : 'var(--color-border)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '.5rem', fontSize: '.9rem', transition: 'all .3s',
      }}>
        {done ? <Check size={14} color="#fff" /> : icon}
      </div>
      <div style={{ fontSize: '.7rem', textAlign: 'center', fontWeight: done ? 700 : 400, color: done ? 'var(--color-success)' : active ? 'var(--color-primary)' : 'var(--color-text-light)', lineHeight: 1.3, maxWidth: '5rem' }}>
        {label}
      </div>
    </div>
  )
}

export default function TrackOrder() {
  const [query, setQuery] = useState('')
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      // Try by order code/id
      const res = await api.get(`/orders/track?code=${encodeURIComponent(query.trim())}&phone=${encodeURIComponent(phone.trim())}`)
      setOrder(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Không tìm thấy đơn hàng. Kiểm tra lại mã đơn và số điện thoại.')
    } finally {
      setLoading(false)
    }
  }

  const doCopy = async (text) => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch {}
  }

  const statusInfo = order ? (STATUS_INFO[order.status] || STATUS_INFO.pending) : null
  const stepIdx = order ? STATUS_STEPS.indexOf(order.status) : -1

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '80vh', padding: '3rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '680px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', color: 'var(--color-heading)', marginBottom: '.75rem' }}>
            Tra cứu đơn hàng
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '.95rem', lineHeight: 1.7 }}>
            Nhập mã đơn hàng và số điện thoại người nhận để kiểm tra trạng thái giao hoa.
          </p>
        </div>

        {/* Search form */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <form onSubmit={handleSearch}>
            <div className="form-group">
              <label className="form-label">Mã đơn hàng *</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  value={query}
                  onChange={e => setQuery(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: AB12CD34"
                  style={{ paddingLeft: '2.5rem', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase' }}
                />
                <Search size={16} style={{ position: 'absolute', left: '.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
              </div>
              <div className="form-hint">Mã đơn có trong email xác nhận hoặc trang "Đơn hàng của tôi"</div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Số điện thoại người nhận</label>
              <input
                className="form-input"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0901234567"
                type="tel"
              />
              <div className="form-hint">Không bắt buộc, nhưng giúp xác nhận chính xác hơn</div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading || !query.trim()}>
              {loading ? <><div className="spinner spinner-sm" /> Đang tìm...</> : <><Search size={18} /> Tra cứu ngay</>}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            ❌ {error}
          </div>
        )}

        {/* Result */}
        {order && (
          <div className="anim-fade-up">

            {/* Status highlight */}
            <div style={{
              textAlign: 'center', padding: '2rem', marginBottom: '1.5rem',
              background: statusInfo.bg, borderRadius: 'var(--r-2xl)', border: `2px solid ${statusInfo.color}22`,
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '.75rem' }}>{statusInfo.icon}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: statusInfo.color, fontWeight: 700, marginBottom: '.4rem' }}>
                {statusInfo.label}
              </div>
              <div style={{ fontSize: '.875rem', color: 'var(--color-text-muted)' }}>
                Cập nhật lúc {formatDateTime(order.updatedAt || order.createdAt)}
              </div>
            </div>

            {/* Tracker */}
            {order.status !== 'cancelled' && (
              <div className="card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--color-heading)', marginBottom: '1.5rem' }}>
                  Hành trình đơn hàng
                </h3>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  {[
                    { key: 'pending',    label: 'Đặt hàng',    icon: '📝' },
                    { key: 'confirmed',  label: 'Xác nhận',    icon: '✅' },
                    { key: 'preparing', label: 'Chuẩn bị hoa', icon: '🌸' },
                    { key: 'delivering', label: 'Giao hoa',    icon: '🚚' },
                    { key: 'completed', label: 'Hoàn tất',     icon: '🎉' },
                  ].map((step, i, arr) => (
                    <TrackStep
                      key={step.key}
                      label={step.label}
                      icon={step.icon}
                      done={stepIdx > i}
                      active={STATUS_STEPS[stepIdx] === step.key}
                      isLast={i === arr.length - 1}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Order info */}
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '.4rem' }}>Mã đơn hàng</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
                      #{(order.orderCode || order.id?.slice(-8))?.toUpperCase()}
                    </span>
                    <button onClick={() => doCopy((order.orderCode || order.id?.slice(-8))?.toUpperCase())}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}>
                      {copied ? <Check size={13} color="var(--color-success)" /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '.4rem' }}>Thời gian đặt</div>
                  <div style={{ fontWeight: 600 }}>{formatDateTime(order.createdAt)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '.4rem' }}>Người nhận</div>
                  <div style={{ fontWeight: 600 }}>{order.recipient?.name}</div>
                  <div style={{ fontSize: '.85rem', color: 'var(--color-text-muted)' }}>{order.recipient?.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '.4rem' }}>Giao hoa lúc</div>
                  <div style={{ fontWeight: 600 }}>{order.deliveryDate}</div>
                  <div style={{ fontSize: '.85rem', color: 'var(--color-text-muted)' }}>{order.deliverySlot}</div>
                </div>
              </div>

              {/* Items summary */}
              <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '1.25rem', paddingTop: '1.25rem' }}>
                {(order.items || []).slice(0, 3).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem', marginBottom: '.375rem' }}>
                    <span>🌸 {item.name} <span style={{ color: 'var(--color-text-muted)' }}>× {item.quantity}</span></span>
                    <span style={{ fontWeight: 600 }}>{formatVND(item.price * item.quantity)}</span>
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)' }}>... và {order.items.length - 3} sản phẩm khác</div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem', borderTop: '1px solid var(--color-border)', paddingTop: '.625rem', marginTop: '.625rem' }}>
                  <span>Tổng cộng</span>
                  <span style={{ color: 'var(--color-primary)' }}>{formatVND(order.total)}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/shop">
                <button className="btn btn-outline btn-lg">🌸 Đặt thêm hoa</button>
              </Link>
              <Link to="/contact">
                <button className="btn btn-primary btn-lg">📞 Liên hệ hỗ trợ</button>
              </Link>
            </div>
          </div>
        )}

        {/* Help note */}
        {!order && !error && (
          <div style={{ textAlign: 'center', padding: '1.5rem', background: 'var(--color-primary-bg)', borderRadius: 'var(--r-xl)', fontSize: '.875rem', color: 'var(--color-text-muted)' }}>
            <strong style={{ color: 'var(--color-heading)' }}>💡 Không tìm thấy mã đơn?</strong><br />
            Kiểm tra email xác nhận hoặc{' '}
            <Link to="/orders" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>đăng nhập để xem đơn hàng</Link>.
          </div>
        )}
      </div>
    </div>
  )
}
