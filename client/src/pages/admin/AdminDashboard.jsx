import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  ShoppingBag, Package, Users, DollarSign,
  Clock, CheckCircle, XCircle, Flower2,
  RefreshCw, Eye, ChevronRight, Printer, AlertCircle,
} from 'lucide-react'
import api from '../../services/api'
import { formatVND, formatDateTime, getStatusLabel, getStatusClass } from '../../utils/helpers'

const COLORS = ['#fb7185', '#f43f5e', '#e11d48', '#be123c', '#9f1239']

const STATUS_COLORS = {
  pending:    { bg: '#fef9c3', text: '#854d0e', label: 'Chờ xác nhận' },
  confirmed:  { bg: '#dbeafe', text: '#1e40af', label: 'Đã xác nhận' },
  preparing:  { bg: '#f3e8ff', text: '#6b21a8', label: 'Đang chuẩn bị' },
  ready:      { bg: '#dcfce7', text: '#166534', label: 'Sẵn sàng giao' },
  delivering: { bg: '#ffedd5', text: '#9a3412', label: 'Đang giao' },
  completed:  { bg: '#dcfce7', text: '#166534', label: 'Hoàn tất' },
  cancelled:  { bg: '#fee2e2', text: '#991b1b', label: 'Đã hủy' },
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#f1f5f9', text: '#64748b', label: status }
  return (
    <span style={{
      background: s.bg, color: s.text, padding: '.2rem .65rem',
      borderRadius: '9999px', fontSize: '.75rem', fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  )
}

// ── Mini order card for "Đơn hôm nay" ─────────────────────────────────────
function TodayOrderCard({ order }) {
  return (
    <div style={{
      display: 'flex', gap: '.875rem', padding: '.875rem',
      background: '#fff', borderRadius: 'var(--r-lg)', border: '1px solid var(--color-border)',
      alignItems: 'flex-start', transition: 'box-shadow var(--transition)',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--sh-md)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.3rem' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '.85rem', color: 'var(--color-primary)' }}>
            #{(order.orderCode || order.id?.slice(-6))?.toUpperCase()}
          </span>
          <StatusBadge status={order.status} />
          {order.paymentStatus === 'unpaid' && order.paymentMethod === 'bank_transfer' && (
            <span style={{ fontSize: '.7rem', background: '#fef9c3', color: '#854d0e', padding: '.15rem .4rem', borderRadius: '9999px', fontWeight: 700 }}>
              ⏳ Chờ CK
            </span>
          )}
        </div>
        <div style={{ fontWeight: 600, fontSize: '.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {order.recipient?.name} · {order.recipient?.phone}
        </div>
        <div style={{ fontSize: '.78rem', color: 'var(--color-text-muted)', marginTop: '.15rem' }}>
          🕐 {order.deliverySlot} · {order.items?.length} sản phẩm · {formatVND(order.total)}
        </div>
      </div>
      <Link to={`/admin/orders`} style={{ flexShrink: 0 }}>
        <button className="btn btn-outline btn-sm" style={{ padding: '.3rem .6rem' }}>
          <Eye size={13} />
        </button>
      </Link>
    </div>
  )
}

// ── Phiếu chuẩn bị hoa ──────────────────────────────────────────────────────
function FlowerTicket({ order }) {
  const handlePrint = () => {
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>Phiếu #${order.id?.slice(-6).toUpperCase()}</title>
      <style>
        body { font-family: sans-serif; padding: 1.5rem; max-width: 400px; margin: 0 auto; }
        h2 { text-align: center; margin-bottom: 1rem; }
        .row { display: flex; justify-content: space-between; padding: .4rem 0; border-bottom: 1px dashed #ccc; font-size: .9rem; }
        .items { margin: 1rem 0; }
        .item { padding: .5rem 0; border-bottom: 1px solid #eee; }
        .msg { background: #fdf2f8; padding: .75rem; border-radius: 8px; font-style: italic; margin-top: 1rem; }
        .note { background: #f0fdf4; padding: .75rem; border-radius: 8px; margin-top: .5rem; font-size: .85rem; }
        @media print { button { display: none; } }
      </style></head><body>
      <h2>🌸 PHIẾU CHUẨN BỊ HOA</h2>
      <div class="row"><span>Mã đơn</span><strong>#${order.orderCode || order.id?.slice(-8).toUpperCase()}</strong></div>
      <div class="row"><span>Người nhận</span><strong>${order.recipient?.name} — ${order.recipient?.phone}</strong></div>
      <div class="row"><span>Địa chỉ</span><span>${order.recipient?.address}</span></div>
      <div class="row"><span>Giao lúc</span><strong>${order.deliverySlot} — ${order.deliveryDate}</strong></div>
      <div class="items"><strong>Danh sách hoa:</strong>
        ${(order.items || []).map(it => `
          <div class="item">
            <div><strong>${it.name}</strong> — ${it.variantSize} × ${it.quantity}</div>
          </div>`).join('')}
      </div>
      ${order.cardMessage ? `<div class="msg">💌 Lời nhắn: "${order.cardMessage}"</div>` : ''}
      ${order.shopNote ? `<div class="note">📝 Ghi chú: ${order.shopNote}</div>` : ''}
      <button onclick="window.print()" style="margin-top:1rem;padding:.5rem 1rem;background:#e8627a;color:#fff;border:none;border-radius:6px;cursor:pointer;width:100%">🖨️ In phiếu</button>
      </body></html>
    `)
    win.document.close()
    setTimeout(() => win.print(), 500)
  }

  return (
    <div style={{
      background: '#fff', border: '1.5px solid var(--color-border)',
      borderRadius: 'var(--r-xl)', padding: '1rem',
      borderLeft: '4px solid var(--color-primary)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.625rem' }}>
        <div>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)', fontSize: '.85rem' }}>
            #{(order.orderCode || order.id?.slice(-6))?.toUpperCase()}
          </span>
          <StatusBadge status={order.status} />
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handlePrint} style={{ padding: '.25rem .5rem' }} title="In phiếu">
          <Printer size={14} />
        </button>
      </div>

      <div style={{ fontSize: '.85rem', fontWeight: 700, marginBottom: '.2rem' }}>
        {order.recipient?.name} · {order.recipient?.phone}
      </div>
      <div style={{ fontSize: '.78rem', color: 'var(--color-text-muted)', marginBottom: '.625rem' }}>
        📍 {order.recipient?.address}
      </div>
      <div style={{ fontSize: '.78rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '.5rem' }}>
        🕐 Giao: {order.deliverySlot} — {order.deliveryDate}
      </div>

      {/* Items */}
      <div style={{ borderTop: '1px dashed var(--color-border)', paddingTop: '.5rem', marginTop: '.5rem' }}>
        {(order.items || []).map((it, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', padding: '.2rem 0' }}>
            <span style={{ fontWeight: 600 }}>🌸 {it.name} ({it.variantSize})</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>×{it.quantity}</span>
          </div>
        ))}
      </div>

      {order.cardMessage && (
        <div style={{ marginTop: '.5rem', background: 'var(--color-primary-bg)', borderRadius: 'var(--r-md)', padding: '.5rem .75rem', fontSize: '.78rem', fontStyle: 'italic', color: 'var(--color-rose)' }}>
          💌 "{order.cardMessage}"
        </div>
      )}
      {order.shopNote && (
        <div style={{ marginTop: '.375rem', background: '#f0fdf4', borderRadius: 'var(--r-md)', padding: '.375rem .75rem', fontSize: '.78rem', color: '#166534' }}>
          📝 {order.shopNote}
        </div>
      )}
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats]           = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [todayOrders, setTodayOrders] = useState([])
  const [prepOrders, setPrepOrders]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [range, setRange]             = useState('30')
  const [activeTab, setActiveTab]     = useState('today') // 'today' | 'prep'

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const [dashRes, ordersRes] = await Promise.all([
        api.get(`/admin/dashboard?range=${range}`),
        api.get('/admin/orders'),          // ✅ dùng admin route đúng
      ])
      setStats(dashRes.data.stats)
      setRevenueData(dashRes.data.revenueChart || [])
      setTopProducts(dashRes.data.topProducts || [])

      const allOrders = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data?.data || [])
      const todayStr = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })

      // Đơn hôm nay: dựa theo ngày tạo đơn
      const today = allOrders.filter(o => {
        const d = new Date(o.createdAt).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
        return d === todayStr
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      setTodayOrders(today)

      // Phiếu chuẩn bị: đơn confirmed / preparing
      const prep = allOrders.filter(o => ['confirmed', 'preparing'].includes(o.status))
        .sort((a, b) => (a.deliveryDate + a.deliverySlot).localeCompare(b.deliveryDate + b.deliverySlot))
      setPrepOrders(prep)
    } catch (e) {
      console.error('Dashboard load error:', e)
    } finally {
      setLoading(false)
    }
  }, [range])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  const statCards = stats ? [
    { label: 'Tổng mẫu hoa',  value: stats.totalProducts,   icon: ShoppingBag, bg: '#ffe4e6', ic: '#fb7185' },
    { label: 'Tổng khách hàng', value: stats.totalCustomers,  icon: Users,       bg: '#dbeafe', ic: '#3b82f6' },
    { label: 'Chờ xác nhận',  value: stats.pendingOrders,   icon: Clock,       bg: '#fef9c3', ic: '#ca8a04' },
    { label: 'Đang chuẩn bị', value: stats.preparingOrders || 0, icon: Flower2,bg: '#f3e8ff', ic: '#9333ea' },
    { label: 'Đang giao',     value: stats.deliveringOrders || 0, icon: Package,bg: '#ffedd5', ic: '#ea580c' },
    { label: 'Hoàn tất',      value: stats.completedOrders,  icon: CheckCircle, bg: '#dcfce7', ic: '#16a34a' },
    { label: 'Đã hủy',        value: stats.cancelledOrders,  icon: XCircle,     bg: '#fee2e2', ic: '#ef4444' },
    { label: 'Doanh thu đã thu', value: formatVND(stats.paidRevenue), icon: DollarSign, bg: '#fff7ed', ic: '#ea580c' },
  ] : []

  return (
    <div className="admin-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '.875rem', marginTop: '.2rem' }}>
            Tổng quan hoạt động — {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
          <select className="form-select" style={{ width: 'auto' }} value={range} onChange={e => setRange(e.target.value)}>
            <option value="7">7 ngày qua</option>
            <option value="30">30 ngày qua</option>
            <option value="90">90 ngày qua</option>
          </select>
          <button className="btn btn-outline btn-sm" onClick={loadDashboard} title="Làm mới">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: '110px', borderRadius: 'var(--r-xl)' }} />)}
        </div>
      ) : (
        <>
          {/* ── Stat Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {statCards.map(({ label, value, icon: Icon, bg, ic }) => (
              <div key={label} className="stat-card">
                <div className="stat-card__icon" style={{ background: bg }}>
                  <Icon size={22} color={ic} />
                </div>
                <div className="stat-card__value">{value}</div>
                <div className="stat-card__label">{label}</div>
              </div>
            ))}
          </div>

          {/* ── Charts row ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Revenue line chart */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--color-heading)', marginBottom: '1.25rem' }}>
                Doanh thu theo ngày
              </h3>
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v / 1000) + 'K'} />
                    <Tooltip formatter={v => [formatVND(v), 'Doanh thu']} />
                    <Line type="monotone" dataKey="revenue" stroke="#fb7185" strokeWidth={2.5} dot={{ fill: '#fb7185', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{ padding: '2rem 0' }}>
                  <div style={{ fontSize: '2.5rem' }}>📊</div>
                  <div className="empty-state__desc">Chưa có dữ liệu doanh thu</div>
                </div>
              )}
            </div>

            {/* Top products */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--color-heading)', marginBottom: '1.25rem' }}>
                🏆 Mẫu hoa bán chạy
              </h3>
              {topProducts.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={topProducts} dataKey="sold" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={false}>
                        {topProducts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v + ' bó', n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem', marginTop: '.5rem' }}>
                    {topProducts.slice(0, 5).map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.8rem' }}>
                        <div style={{ width: '.65rem', height: '.65rem', borderRadius: '2px', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{p.sold}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="empty-state" style={{ padding: '1.5rem 0' }}>
                  <div style={{ fontSize: '2rem' }}>🏆</div>
                  <div className="empty-state__desc">Chưa có dữ liệu</div>
                </div>
              )}
            </div>
          </div>

          {/* ── Đơn hôm nay & Phiếu chuẩn bị hoa ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

            {/* Đơn hôm nay */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--color-heading)' }}>
                  📦 Đơn hôm nay
                  <span style={{ marginLeft: '.5rem', background: 'var(--color-primary)', color: '#fff', fontSize: '.72rem', padding: '.1rem .45rem', borderRadius: '9999px', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                    {todayOrders.length}
                  </span>
                </h3>
                <Link to="/admin/orders" style={{ fontSize: '.82rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '.2rem', fontWeight: 600 }}>
                  Xem tất cả <ChevronRight size={14} />
                </Link>
              </div>

              {todayOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', background: 'var(--color-primary-bg)', borderRadius: 'var(--r-xl)', color: 'var(--color-text-muted)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🌸</div>
                  <div style={{ fontSize: '.875rem' }}>Chưa có đơn hàng hôm nay</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem', maxHeight: '420px', overflowY: 'auto' }}>
                  {todayOrders.map(o => <TodayOrderCard key={o.id} order={o} />)}
                </div>
              )}
            </div>

            {/* Phiếu chuẩn bị hoa */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', color: 'var(--color-heading)' }}>
                  🌸 Phiếu chuẩn bị hoa
                  <span style={{ marginLeft: '.5rem', background: prepOrders.length > 0 ? '#f59e0b' : 'var(--color-success)', color: '#fff', fontSize: '.72rem', padding: '.1rem .45rem', borderRadius: '9999px', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                    {prepOrders.length}
                  </span>
                </h3>
                {prepOrders.length > 0 && (
                  <span style={{ fontSize: '.78rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                    <AlertCircle size={13} /> Cần chuẩn bị
                  </span>
                )}
              </div>

              {prepOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', background: '#f0fdf4', borderRadius: 'var(--r-xl)', color: '#166534' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>✅</div>
                  <div style={{ fontSize: '.875rem', fontWeight: 600 }}>Không có đơn cần chuẩn bị</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', maxHeight: '420px', overflowY: 'auto' }}>
                  {prepOrders.map(o => <FlowerTicket key={o.id} order={o} />)}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
