import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Eye, Users, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../../services/api'
import { formatDate, formatDateTime } from '../../utils/helpers'

const PAGE_SIZE = 15

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  const search   = searchParams.get('q')   || ''
  const page     = parseInt(searchParams.get('page') || '1', 10)
  const roleFilter = searchParams.get('role') || 'all'

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams)
    if (val) next.set(key, val); else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  useEffect(() => {
    api.get('/admin/customers')
      .then(r => setCustomers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    const matchRole = roleFilter === 'all' || c.role === roleFilter
    return matchSearch && matchRole
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="admin-page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="admin-page-title">Quản lý khách hàng</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '.875rem' }}>{filtered.length} khách hàng</p>
        </div>

        {/* Summary chips */}
        <div style={{ display: 'flex', gap: '.625rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Tất cả',  value: 'all',     count: customers.length },
            { label: 'Khách hàng', value: 'user', count: customers.filter(c => c.role !== 'admin').length },
            { label: 'Admin',   value: 'admin',   count: customers.filter(c => c.role === 'admin').length },
          ].map(f => (
            <button key={f.value}
              onClick={() => setParam('role', f.value)}
              style={{
                padding: '.35rem .875rem', borderRadius: '9999px', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                background: roleFilter === f.value ? 'var(--color-primary)' : '#fff',
                borderColor: roleFilter === f.value ? 'var(--color-primary)' : 'var(--color-border)',
                color: roleFilter === f.value ? '#fff' : 'var(--color-text)',
                transition: 'all .2s',
              }}>
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '360px', marginBottom: '1.25rem' }}>
        <Search size={15} style={{ position: 'absolute', left: '.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
        <input className="form-input"
          style={{ paddingLeft: '2.25rem' }}
          placeholder="Tìm tên, email, SĐT..."
          value={search}
          onChange={e => setParam('q', e.target.value)} />
      </div>

      {/* Table */}
      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto' }} />
          </div>
        ) : paginated.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            <Users size={40} style={{ opacity: .3, marginBottom: '1rem' }} />
            <div>Không tìm thấy khách hàng nào</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>SĐT</th>
                <th style={{ textAlign: 'center' }}>Số đơn</th>
                <th>Ngày đăng ký</th>
                <th>Vai trò</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(c => (
                <CustomerRow key={c.id || c._id} customer={c} searchParams={searchParams} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '.75rem', marginTop: '1.5rem' }}>
          <button className="btn btn-outline btn-sm"
            disabled={page <= 1}
            onClick={() => setParam('page', String(page - 1))}>
            <ChevronLeft size={15} />
          </button>
          <span style={{ fontSize: '.875rem', color: 'var(--color-text-muted)' }}>
            Trang {page} / {totalPages}
          </span>
          <button className="btn btn-outline btn-sm"
            disabled={page >= totalPages}
            onClick={() => setParam('page', String(page + 1))}>
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}

function CustomerRow({ customer: c, searchParams }) {
  const [hovered, setHovered] = useState(false)
  const detailUrl = `/admin/customers/${c.id || c._id}?back=${encodeURIComponent('?' + searchParams.toString())}`

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? 'var(--color-primary-bg)' : '', transition: 'background .15s' }}>

      {/* Tên — có thể click */}
      <td>
        <Link to={detailUrl} style={{ textDecoration: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
            <div style={{
              width: '2rem', height: '2rem', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-rose-light))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '.8rem', flexShrink: 0,
            }}>
              {(c.name || 'K').charAt(0).toUpperCase()}
            </div>
            <span style={{ fontWeight: 600, color: hovered ? 'var(--color-primary)' : 'var(--color-heading)', transition: 'color .15s' }}>
              {c.name}
            </span>
          </div>
        </Link>
      </td>

      <td style={{ fontSize: '.875rem', color: 'var(--color-text-muted)' }}>{c.email}</td>
      <td style={{ fontSize: '.875rem' }}>{c.phone || '—'}</td>

      {/* Số đơn — click mở chi tiết tab đơn hàng */}
      <td style={{ textAlign: 'center' }}>
        <Link to={`${detailUrl}#orders`} style={{ textDecoration: 'none' }}>
          <span className="badge badge-primary"
            style={{ cursor: 'pointer', transition: 'transform .15s', display: 'inline-block',
              transform: hovered ? 'scale(1.1)' : 'scale(1)' }}>
            {c.orderCount || 0}
          </span>
        </Link>
      </td>

      <td style={{ fontSize: '.875rem', color: 'var(--color-text-muted)' }}>{formatDate(c.createdAt)}</td>

      <td>
        <span className={`badge ${c.role === 'admin' ? 'badge-error' : 'badge-gray'}`}>
          {c.role === 'admin' ? '⚙️ Admin' : '👤 Khách hàng'}
        </span>
      </td>

      <td style={{ textAlign: 'right' }}>
        <Link to={detailUrl}>
          <button className="btn btn-outline btn-sm" style={{ gap: '.3rem' }}>
            <Eye size={13} /> Xem chi tiết
          </button>
        </Link>
      </td>
    </tr>
  )
}
