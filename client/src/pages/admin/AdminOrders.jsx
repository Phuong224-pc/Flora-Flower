import { useState, useEffect } from 'react'
import { Eye, ChevronDown } from 'lucide-react'
import api from '../../services/api'
import useToastStore from '../../store/useToastStore'
import { formatVND, formatDateTime, getStatusLabel, getStatusClass, getPaymentLabel } from '../../utils/helpers'

const STATUS_OPTIONS = ['pending','confirmed','preparing','ready','delivering','completed','cancelled']
const PAYMENT_OPTIONS = ['unpaid','paid','refunded']

export default function AdminOrders() {
  const toast = useToastStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => { loadOrders() }, [filterStatus])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.set('status', filterStatus)
      const res = await api.get(`/admin/orders?${params}`)
      setOrders(res.data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const updateStatus = async (orderId, status) => {
    try {
      await api.patch(`/admin/orders/${orderId}/status`, { status })
      setOrders(o => o.map(ord => ord.id === orderId ? { ...ord, status } : ord))
      if (selected?.id === orderId) setSelected(s => ({ ...s, status }))
      toast.success('Cập nhật trạng thái thành công')
    } catch (e) { toast.error('Cập nhật thất bại') }
  }

  const updatePayment = async (orderId, paymentStatus) => {
    try {
      await api.patch(`/admin/orders/${orderId}/payment`, { paymentStatus })
      setOrders(o => o.map(ord => ord.id === orderId ? { ...ord, paymentStatus } : ord))
      if (selected?.id === orderId) setSelected(s => ({ ...s, paymentStatus }))
      toast.success('Cập nhật thanh toán thành công')
    } catch (e) { toast.error('Cập nhật thất bại') }
  }

  const filtered = orders.filter(o => {
    if (!search) return true
    const s = search.toLowerCase()
    return (o.orderCode || o.id)?.toLowerCase().includes(s) || o.recipient?.name?.toLowerCase().includes(s) || o.recipient?.phone?.includes(s)
  })

  return (
    <div className="admin-page">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="admin-page-title">Quản lý đơn hàng</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '.875rem' }}>{orders.length} đơn hàng</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input className="form-input" style={{ flex: 1, minWidth: '220px' }}
          placeholder="Tìm theo mã đơn, tên, SĐT..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
        </select>
        <button className="btn btn-outline" onClick={loadOrders}>Làm mới</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 400px' : '1fr', gap: '1.5rem' }}>
        {/* Table */}
        <div className="table-wrapper">
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem' }}>
              <div className="empty-state__icon">📦</div>
              <div className="empty-state__title">Không tìm thấy đơn hàng</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Người nhận</th>
                  <th>Ngày giao</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thanh toán</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id} onClick={() => setSelected(order)} style={{ cursor: 'pointer', background: selected?.id === order.id ? 'var(--color-accent)' : '' }}>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '.85rem' }}>
                        #{order.orderCode || order.id?.slice(-8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '.75rem', color: 'var(--color-text-muted)' }}>{formatDateTime(order.createdAt)}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.recipient?.name}</div>
                      <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)' }}>{order.recipient?.phone}</div>
                    </td>
                    <td style={{ fontSize: '.875rem' }}>{order.deliveryDate}<br/><span style={{ color: 'var(--color-text-muted)', fontSize: '.75rem' }}>{order.deliverySlot}</span></td>
                    <td><span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatVND(order.total)}</span></td>
                    <td>
                      <select className="form-select" style={{ fontSize: '.8rem', padding: '.3rem .5rem' }}
                        value={order.status}
                        onChange={e => { e.stopPropagation(); updateStatus(order.id, e.target.value) }}
                        onClick={e => e.stopPropagation()}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="form-select" style={{ fontSize: '.8rem', padding: '.3rem .5rem' }}
                        value={order.paymentStatus || 'unpaid'}
                        onChange={e => { e.stopPropagation(); updatePayment(order.id, e.target.value) }}
                        onClick={e => e.stopPropagation()}>
                        {PAYMENT_OPTIONS.map(s => <option key={s} value={s}>{getPaymentLabel(s)}</option>)}
                      </select>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-icon" onClick={() => setSelected(order)}>
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="card" style={{ padding: '1.5rem', height: 'fit-content', position: 'sticky', top: '1rem', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 700, color: 'var(--color-heading)' }}>Chi tiết đơn hàng</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelected(null)}>×</button>
            </div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-heading)', marginBottom: '1rem' }}>
              #{selected.orderCode || selected.id?.slice(-8).toUpperCase()}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '1rem', fontSize: '.875rem' }}>
              <div><b>Người nhận:</b> {selected.recipient?.name}</div>
              <div><b>SĐT:</b> {selected.recipient?.phone}</div>
              <div><b>Địa chỉ:</b> {selected.recipient?.address}</div>
              <div><b>Ngày giao:</b> {selected.deliveryDate} ({selected.deliverySlot})</div>
              {selected.cardMessage && <div><b>Lời nhắn:</b> <i>"{selected.cardMessage}"</i></div>}
              {selected.shopNote && <div><b>Ghi chú:</b> {selected.shopNote}</div>}
              <div><b>Thanh toán:</b> {selected.paymentMethod === 'cod' ? 'COD' : selected.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 'Online'}</div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginBottom: '1rem' }}>
              {selected.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem', fontSize: '.875rem' }}>
                  <span>{item.name} ({item.variantSize}) × {item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>{formatVND(item.price * item.quantity)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: 'var(--color-primary)' }}>
                <span>Tổng cộng</span>
                <span>{formatVND(selected.total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
