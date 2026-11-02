import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import api from '../services/api'
import useAuthStore from '../store/useAuthStore'
import { formatVND, formatDate, getStatusLabel, getStatusClass } from '../utils/helpers'

export default function Orders() {
  const { user } = useAuthStore()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    api.get('/orders/my')
      .then(r => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return (
    <div className="empty-state" style={{ padding: '5rem 0' }}>
      <div className="empty-state__icon">🔒</div>
      <div className="empty-state__title">Vui lòng đăng nhập</div>
      <Link to="/login"><button className="btn btn-primary" style={{ marginTop: '1rem' }}>Đăng nhập</button></Link>
    </div>
  )

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>

  return (
    <div style={{ padding: '2rem 0', background: 'var(--color-bg)', minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--color-heading)', marginBottom: '2rem' }}>
          Đơn hàng của tôi
        </h1>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📦</div>
            <div className="empty-state__title">Bạn chưa có đơn hàng nào</div>
            <Link to="/shop"><button className="btn btn-primary" style={{ marginTop: '1rem' }}>Mua hàng ngay</button></Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map(order => (
              <Link key={order.id} to={`/orders/${order.id}`}>
                <div className="card" style={{ padding: '1.25rem', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--color-heading)', marginBottom: '.25rem' }}>
                        #{order.orderCode || order.id?.slice(-8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: '.8rem', color: 'var(--color-text-muted)' }}>
                        {formatDate(order.createdAt)} · {order.items?.length} sản phẩm
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '.5rem', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span className={`order-status ${getStatusClass(order.status)}`}>{getStatusLabel(order.status)}</span>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{formatVND(order.total)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '.75rem', overflowX: 'auto' }}>
                    {order.items?.slice(0, 3).map((item, i) => (
                      <div key={i} style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, background: 'var(--color-accent)' }}>
                        <img src={item.image || 'https://images.unsplash.com/photo-1487530811015-780b21f4f0e5?w=56&h=56&fit=crop&auto=format'} alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1487530811015-780b21f4f0e5?w=56&h=56&fit=crop&auto=format' }} />
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: 'var(--radius-md)', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
