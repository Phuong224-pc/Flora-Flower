import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft, Mail, Phone, Calendar, ShoppingBag,
  CheckCircle, XCircle, Clock, Package, DollarSign,
  Search, ChevronLeft, ChevronRight, ExternalLink,
} from 'lucide-react'
import api from '../../services/api'
import {
  formatVND, formatDate, formatDateTime,
  getStatusLabel, getPaymentLabel, getPaymentMethodLabel,
} from '../../utils/helpers'

/* ── Status badges ──────────────────────────────────────────── */
const STATUS_STYLE = {
  pending:    { bg: '#fef9c3', text: '#854d0e' },
  confirmed:  { bg: '#dbeafe', text: '#1e40af' },
  preparing:  { bg: '#f3e8ff', text: '#6b21a8' },
  ready:      { bg: '#dcfce7', text: '#166534' },
  delivering: { bg: '#ffedd5', text: '#9a3412' },
  completed:  { bg: '#dcfce7', text: '#166534' },
  cancelled:  { bg: '#fee2e2', text: '#991b1b' },
}
function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || { bg: '#f1f5f9', text: '#64748b' }
  return (
    <span style={{
      background: s.bg, color: s.text,
      padding: '.2rem .6rem', borderRadius: '9999px',
      fontSize: '.72rem', fontWeight: 700, whiteSpace: 'nowrap',
      display: 'inline-block',
    }}>
      {getStatusLabel(status)}
    </span>
  )
}

function PayBadge({ status }) {
  const map = {
    unpaid:   { bg: '#fef9c3', text: '#854d0e' },
    paid:     { bg: '#dcfce7', text: '#166534' },
    refunded: { bg: '#fee2e2', text: '#991b1b' },
  }
  const s = map[status] || { bg: '#f1f5f9', text: '#64748b' }
  return (
    <span style={{
      background: s.bg, color: s.text,
      padding: '.2rem .6rem', borderRadius: '9999px',
      fontSize: '.72rem', fontWeight: 700, whiteSpace: 'nowrap',
      display: 'inline-block',
    }}>
      {getPaymentLabel(status)}
    </span>
  )
}

/* ── Stat card — responsive, không tràn ──────────────────────── */
function StatCard({ icon: Icon, label, value, bg, ic, sub }) {
  const valStr = String(value)
  // Tự điều chỉnh cỡ chữ theo độ dài giá trị
  const valSize = valStr.length > 12 ? '1rem' : valStr.length > 8 ? '1.2rem' : '1.5rem'
  return (
    <div style={{
      background: '#fff',
      border: '1.5px solid var(--color-border)',
      borderRadius: 'var(--r-xl)',
      padding: '1rem 1.125rem',
      display: 'flex',
      alignItems: 'center',
      gap: '.75rem',
      minWidth: 0,       /* cho phép co lại */
      overflow: 'hidden',
    }}>
      {/* Icon circle - kích thước cố định */}
      <div style={{
        width: '2.75rem', height: '2.75rem',
        borderRadius: '50%', background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={17} color={ic} />
      </div>
      {/* Text area - co lại được */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontSize: valSize, fontWeight: 800,
          color: 'var(--color-heading)', lineHeight: 1.2,
          wordBreak: 'break-word', overflowWrap: 'anywhere',
        }}>
          {value}
        </div>
        <div style={{
          fontSize: '.72rem', color: 'var(--color-text-muted)',
          marginTop: '.15rem', lineHeight: 1.35,
        }}>
          {label}
        </div>
        {sub && (
          <div style={{
            fontSize: '.68rem', color: ic, fontWeight: 600,
            marginTop: '.15rem', lineHeight: 1.3,
          }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Helpers ─────────────────────────────────────────────────── */
const PROCESSING_STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'delivering']

function filterOrdersByTab(orders, tab) {
  if (tab === 'processing') return orders.filter(o => PROCESSING_STATUSES.includes(o.status))
  if (tab === 'completed')  return orders.filter(o => o.status === 'completed')
  if (tab === 'cancelled')  return orders.filter(o => o.status === 'cancelled')
  return orders // 'all'
}

const ORDER_PAGE = 8
const ITEM_PAGE  = 12

/* ── Main Page ──────────────────────────────────────────────── */
export default function AdminCustomerDetail() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const backUrl = searchParams.get('back')
    ? `/admin/customers${searchParams.get('back')}`
    : '/admin/customers'

  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [activeTab, setActiveTab] = useState('orders')

  // Orders tab state
  const [orderTab, setOrderTab]       = useState('all')
  const [orderSearch, setOrderSearch] = useState('')
  const [orderPage, setOrderPage]     = useState(1)

  // Products tab state
  const [productTab, setProductTab] = useState('all')
  const [productPage, setProductPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    api.get(`/admin/customers/${id}`)
      .then(r => {
        // Nếu server trả 403 isAdmin
        if (r.data?.isAdmin) {
          setError(r.data.message)
        } else {
          setData(r.data)
        }
      })
      .catch(e => setError(e.response?.data?.message || 'Không tải được dữ liệu'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (window.location.hash === '#orders') setActiveTab('orders')
  }, [])

  /* ── Loading / Error states ── */
  if (loading) return (
    <div className="admin-page">
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }} />
        <div style={{ color: 'var(--color-text-muted)' }}>Đang tải...</div>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="admin-page">
      <Link to={backUrl}>
        <button className="btn btn-outline btn-sm" style={{ marginBottom: '1.5rem', gap: '.4rem' }}>
          <ArrowLeft size={14} /> Quay lại
        </button>
      </Link>
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-error)' }}>
        <XCircle size={40} style={{ marginBottom: '1rem', opacity: .5 }} />
        <div style={{ maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
          {error || 'Không tìm thấy tài khoản'}
        </div>
      </div>
    </div>
  )

  const { customer: c, orders, stats } = data

  /* ── Compute filtered orders ── */
  const baseOrders = filterOrdersByTab(orders, orderTab)
  const searchedOrders = orderSearch
    ? baseOrders.filter(o =>
        (o.orderCode || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
        (o.items || []).some(i => i.name?.toLowerCase().includes(orderSearch.toLowerCase()))
      )
    : baseOrders
  const totalOrderPages = Math.ceil(searchedOrders.length / ORDER_PAGE)
  const pagedOrders     = searchedOrders.slice((orderPage - 1) * ORDER_PAGE, orderPage * ORDER_PAGE)

  /* ── Compute product item rows ── */
  const allItemRows = orders
    .filter(o => {
      if (productTab === 'processing') return PROCESSING_STATUSES.includes(o.status)
      if (productTab === 'completed')  return o.status === 'completed'
      if (productTab === 'cancelled')  return o.status === 'cancelled'
      return true
    })
    .flatMap(o => (o.items || []).map(item => ({ ...item, order: o })))
  const totalProductPages = Math.ceil(allItemRows.length / ITEM_PAGE)
  const pagedItems        = allItemRows.slice((productPage - 1) * ITEM_PAGE, productPage * ITEM_PAGE)

  return (
    <div className="admin-page">

      {/* Back */}
      <Link to={backUrl}>
        <button className="btn btn-outline btn-sm" style={{ marginBottom: '1.5rem', gap: '.4rem' }}>
          <ArrowLeft size={14} /> Quay lại danh sách
        </button>
      </Link>

      {/* ── Profile card ── */}
      <div style={{
        background: '#fff', border: '1.5px solid var(--color-border)',
        borderRadius: 'var(--r-2xl)', padding: '1.5rem',
        marginBottom: '1.25rem', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: '4rem', height: '4rem', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-rose-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 800, fontSize: '1.6rem',
          }}>
            {(c.name || 'K').charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Name + badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', flexWrap: 'wrap', marginBottom: '.625rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)', fontSize: '1.35rem',
                color: 'var(--color-heading)', margin: 0,
                wordBreak: 'break-word',
              }}>
                {c.name}
              </h2>
              <span className={`badge ${c.role === 'admin' ? 'badge-error' : 'badge-gray'}`}>
                {c.role === 'admin' ? '⚙️ Admin' : '👤 Khách hàng'}
              </span>
              <span style={{
                background: c.isActive === false ? '#fee2e2' : '#dcfce7',
                color: c.isActive === false ? '#991b1b' : '#166534',
                padding: '.15rem .6rem', borderRadius: '9999px',
                fontSize: '.72rem', fontWeight: 700,
              }}>
                {c.isActive === false ? 'Đã khóa' : 'Hoạt động'}
              </span>
            </div>

            {/* Meta info — word-break cho email dài */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '.5rem .75rem',
            }}>
              {[
                { Icon: Mail,     label: 'Email',        val: c.email },
                { Icon: Phone,    label: 'Điện thoại',   val: c.phone || '—' },
                { Icon: Calendar, label: 'Ngày đăng ký', val: formatDateTime(c.createdAt) },
                { Icon: Clock,    label: 'Đặt gần nhất', val: stats.lastOrderAt ? formatDateTime(stats.lastOrderAt) : 'Chưa có đơn' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '.4rem', fontSize: '.82rem', minWidth: 0 }}>
                  <row.Icon size={13} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '.2rem' }} />
                  <span style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>{row.label}:&nbsp;</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-heading)', wordBreak: 'break-all', overflowWrap: 'anywhere', minWidth: 0 }}>
                    {row.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats grid — responsive, không tràn ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))',
        gap: '.75rem',
        marginBottom: '1.5rem',
      }}>
        <StatCard icon={ShoppingBag} label="Tổng đơn đã đặt"    value={stats.totalOrders}         bg="#ffe4e6" ic="#e8627a" />
        <StatCard icon={Clock}       label="Đang xử lý"          value={stats.processingOrders}    bg="#fef9c3" ic="#ca8a04" />
        <StatCard icon={CheckCircle} label="Đã hoàn tất"         value={stats.completedOrders}     bg="#dcfce7" ic="#16a34a" />
        <StatCard icon={XCircle}     label="Đã hủy"              value={stats.cancelledOrders}     bg="#fee2e2" ic="#dc2626" />
        <StatCard icon={Package}     label="Sản phẩm đã nhận"    value={stats.totalItemsCompleted} bg="#f3e8ff" ic="#9333ea"
          sub="Tổng số lượng từ đơn hoàn tất" />
        <StatCard icon={DollarSign}  label="Thực thu"            value={formatVND(stats.totalRevenue)} bg="#dbeafe" ic="#2563eb"
          sub="Đơn hoàn tất + đã thanh toán" />
      </div>

      {/* ── Main Tabs ── */}
      <div style={{
        display: 'flex', gap: 0, background: '#fff',
        border: '1.5px solid var(--color-border)', borderRadius: 'var(--r-xl)',
        padding: '.25rem', marginBottom: '1.25rem', width: 'fit-content', flexWrap: 'wrap',
      }}>
        {[
          { key: 'orders',   label: `📦 Đơn hàng (${orders.length})` },
          { key: 'products', label: `🌸 Sản phẩm (${allItemRows.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              padding: '.4rem 1.1rem', borderRadius: 'var(--r-lg)',
              border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '.83rem',
              transition: 'all .2s',
              background: activeTab === t.key ? 'var(--color-primary)' : 'transparent',
              color: activeTab === t.key ? '#fff' : 'var(--color-text-muted)',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════ TAB: Đơn hàng ════════ */}
      {activeTab === 'orders' && (
        <div id="orders">
          {/* Sub-tabs + search */}
          <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.125rem' }}>
            <div style={{
              display: 'flex', gap: '.2rem', flexWrap: 'wrap',
              background: '#f8fafc', border: '1px solid var(--color-border)',
              borderRadius: 'var(--r-lg)', padding: '.2rem',
            }}>
              {[
                { key: 'all',        label: 'Tất cả' },
                { key: 'processing', label: '⏳ Đang xử lý' },
                { key: 'completed',  label: '✅ Hoàn tất' },
                { key: 'cancelled',  label: '❌ Đã hủy' },
              ].map(t => (
                <button key={t.key}
                  onClick={() => { setOrderTab(t.key); setOrderPage(1) }}
                  style={{
                    padding: '.3rem .75rem', borderRadius: 'var(--r-md)',
                    border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '.78rem',
                    transition: 'all .2s', whiteSpace: 'nowrap',
                    background: orderTab === t.key ? 'var(--color-primary)' : 'transparent',
                    color: orderTab === t.key ? '#fff' : 'var(--color-text-muted)',
                  }}>
                  {t.label} ({filterOrdersByTab(orders, t.key).length})
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', flex: '1', minWidth: '180px', maxWidth: '300px' }}>
              <Search size={13} style={{ position: 'absolute', left: '.7rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
              <input className="form-input"
                style={{ paddingLeft: '2rem', paddingTop: '.4rem', paddingBottom: '.4rem', fontSize: '.82rem' }}
                placeholder="Mã đơn, tên sản phẩm..."
                value={orderSearch}
                onChange={e => { setOrderSearch(e.target.value); setOrderPage(1) }} />
            </div>
          </div>

          {pagedOrders.length === 0 ? (
            <EmptyState icon="📦" text={orders.length === 0 ? 'Khách hàng chưa có đơn hàng nào' : 'Không có đơn phù hợp bộ lọc'} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.875rem' }}>
              {pagedOrders.map(o => <OrderCard key={o._id || o.id} order={o} />)}
            </div>
          )}

          <Pagination page={orderPage} total={totalOrderPages} onChange={setOrderPage} />
        </div>
      )}

      {/* ════════ TAB: Sản phẩm ════════ */}
      {activeTab === 'products' && (
        <div>
          {/* Filter */}
          <div style={{
            display: 'flex', gap: '.2rem', flexWrap: 'wrap',
            background: '#f8fafc', border: '1px solid var(--color-border)',
            borderRadius: 'var(--r-lg)', padding: '.2rem',
            marginBottom: '1.125rem', width: 'fit-content',
          }}>
            {[
              { key: 'all',        label: 'Tất cả' },
              { key: 'processing', label: '⏳ Đang xử lý' },
              { key: 'completed',  label: '✅ Hoàn tất' },
              { key: 'cancelled',  label: '❌ Đã hủy' },
            ].map(t => (
              <button key={t.key}
                onClick={() => { setProductTab(t.key); setProductPage(1) }}
                style={{
                  padding: '.3rem .75rem', borderRadius: 'var(--r-md)',
                  border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '.78rem',
                  transition: 'all .2s', whiteSpace: 'nowrap',
                  background: productTab === t.key ? 'var(--color-primary)' : 'transparent',
                  color: productTab === t.key ? '#fff' : 'var(--color-text-muted)',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {pagedItems.length === 0 ? (
            <EmptyState icon="🌸" text="Không có sản phẩm nào trong danh mục này" />
          ) : (
            <div className="table-wrapper" style={{ overflowX: 'auto' }}>
              <table className="table" style={{ minWidth: '700px' }}>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th style={{ textAlign: 'center' }}>Biến thể</th>
                    <th style={{ textAlign: 'center' }}>SL</th>
                    <th style={{ textAlign: 'right' }}>Đơn giá</th>
                    <th style={{ textAlign: 'right' }}>Thành tiền</th>
                    <th>Mã đơn</th>
                    <th>Ngày đặt</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedItems.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1548460848-d7b0da0e01e0?w=48&h=48&fit=crop'}
                            alt={item.name}
                            style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--r-md)', objectFit: 'cover', flexShrink: 0 }}
                            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1548460848-d7b0da0e01e0?w=48&h=48&fit=crop' }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: '.83rem', color: 'var(--color-heading)', wordBreak: 'break-word' }}>{item.name}</div>
                            {item.variantSKU && <div style={{ fontSize: '.7rem', color: 'var(--color-text-muted)' }}>SKU: {item.variantSKU}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-gray" style={{ fontSize: '.7rem' }}>{item.variantSize || '—'}</span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>×{item.quantity || 1}</td>
                      <td style={{ textAlign: 'right', fontSize: '.83rem', whiteSpace: 'nowrap' }}>{formatVND(item.price)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                        {formatVND((item.price || 0) * (item.quantity || 1))}
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '.78rem', color: 'var(--color-primary)', fontWeight: 700 }}>
                          #{(item.order?.orderCode || item.order?._id?.slice(-6) || '—').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontSize: '.78rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {formatDate(item.order?.createdAt)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem' }}>
                          <StatusBadge status={item.order?.status} />
                          <PayBadge    status={item.order?.paymentStatus} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination page={productPage} total={totalProductPages} onChange={setProductPage} />
        </div>
      )}
    </div>
  )
}

/* ── Order Card ─────────────────────────────────────────────── */
function OrderCard({ order: o }) {
  const [expanded, setExpanded] = useState(false)
  const PREVIEW = 2
  const items   = o.items || []
  const hasMore = items.length > PREVIEW

  return (
    <div
      style={{ background: '#fff', border: '1.5px solid var(--color-border)', borderRadius: 'var(--r-xl)', padding: '1.125rem', transition: 'box-shadow .2s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--sh-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>

      {/* Row 1: code + badges + button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '.5rem', marginBottom: '.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap', minWidth: 0 }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--color-primary)', fontSize: '.9rem', whiteSpace: 'nowrap' }}>
            #{(o.orderCode || o._id?.slice(-8) || '').toUpperCase()}
          </span>
          <StatusBadge status={o.status} />
          <PayBadge    status={o.paymentStatus} />
        </div>
        <Link to="/admin/orders" style={{ flexShrink: 0 }}>
          <button className="btn btn-outline btn-sm" style={{ gap: '.3rem', whiteSpace: 'nowrap' }}>
            <ExternalLink size={12} /> Xem đơn
          </button>
        </Link>
      </div>

      {/* Row 2: meta */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem .75rem', marginBottom: '.75rem', fontSize: '.78rem', color: 'var(--color-text-muted)' }}>
        <span>📅 {formatDateTime(o.createdAt)}</span>
        <span>🚗 Giao {o.deliveryDate}{o.deliverySlot ? ` · ${o.deliverySlot}` : ''}</span>
        <span>💳 {getPaymentMethodLabel(o.paymentMethod)}</span>
      </div>

      {/* Items */}
      <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '.625rem' }}>
        {(expanded ? items : items.slice(0, PREVIEW)).map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.625rem', padding: '.3rem 0' }}>
            <img
              src={item.image || 'https://images.unsplash.com/photo-1548460848-d7b0da0e01e0?w=40&h=40&fit=crop'}
              alt={item.name}
              style={{ width: '2.25rem', height: '2.25rem', borderRadius: 'var(--r-md)', objectFit: 'cover', flexShrink: 0 }}
              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1548460848-d7b0da0e01e0?w=40&h=40&fit=crop' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: '.83rem', color: 'var(--color-heading)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name}
              </div>
              <div style={{ fontSize: '.72rem', color: 'var(--color-text-muted)' }}>{item.variantSize} · ×{item.quantity || 1}</div>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '.83rem', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {formatVND((item.price || 0) * (item.quantity || 1))}
            </div>
          </div>
        ))}
        {hasMore && (
          <button onClick={() => setExpanded(x => !x)}
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', padding: '.2rem 0', marginTop: '.25rem' }}>
            {expanded ? '▲ Thu gọn' : `▼ Xem thêm ${items.length - PREVIEW} sản phẩm`}
          </button>
        )}
      </div>

      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '.75rem', paddingTop: '.625rem', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '.5rem' }}>
        <div style={{ fontSize: '.78rem', color: 'var(--color-text-muted)' }}>
          {items.reduce((s, i) => s + (i.quantity || 1), 0)} sản phẩm
          {o.discount > 0 && <span style={{ marginLeft: '.5rem', color: '#16a34a' }}>· Giảm {formatVND(o.discount)}</span>}
        </div>
        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
          Tổng: {formatVND(o.total)}
        </div>
      </div>
    </div>
  )
}

/* ── Shared helpers ─────────────────────────────────────────── */
function EmptyState({ icon, text }) {
  return (
    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>{icon}</div>
      <div style={{ fontSize: '.875rem' }}>{text}</div>
    </div>
  )
}

function Pagination({ page, total, onChange }) {
  if (total <= 1) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '.75rem', marginTop: '1.25rem' }}>
      <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft size={15} />
      </button>
      <span style={{ fontSize: '.83rem', color: 'var(--color-text-muted)' }}>Trang {page} / {total}</span>
      <button className="btn btn-outline btn-sm" disabled={page >= total} onClick={() => onChange(page + 1)}>
        <ChevronRight size={15} />
      </button>
    </div>
  )
}
