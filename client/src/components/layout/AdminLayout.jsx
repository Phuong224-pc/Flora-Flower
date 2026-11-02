import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import {
  LayoutDashboard, ShoppingBag, Package, Users,
  Tag, Settings, LogOut, Flower2, Link as LinkIcon
} from 'lucide-react'
import useAuthStore from '../../store/useAuthStore'

const navItems = [
  { section: 'Tổng quan', items: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  ]},
  { section: 'Kinh doanh', items: [
    { to: '/admin/orders',   label: 'Đơn hàng',    icon: Package },
    { to: '/admin/products', label: 'Mẫu hoa',     icon: ShoppingBag },
    { to: '/admin/customers',label: 'Khách hàng',  icon: Users },
    { to: '/admin/coupons',  label: 'Mã giảm giá', icon: Tag },
  ]},
  { section: 'Nội dung', items: [
    { to: '/admin/occasions',label: 'Dịp tặng hoa', icon: Flower2 },
    { to: '/admin/settings', label: 'Cài đặt',     icon: Settings },
  ]},
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/login')
  }, [user, navigate])

  if (!user || user.role !== 'admin') return null

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          🌸 FLORA <span className="logo-dot">ADMIN</span>
        </div>
        <nav className="admin-sidebar-nav">
          {navItems.map(({ section, items }) => (
            <div className="admin-nav-section" key={section}>
              <span className="admin-nav-section-title">{section}</span>
              {items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => `admin-nav-item${isActive ? ' active' : ''}`}
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,.1)', marginTop: 'auto' }}>
          <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.82rem', color: 'rgba(255,255,255,.55)', marginBottom: '.625rem', textDecoration: 'none' }}>
            <LinkIcon size={14} /> Xem website
          </NavLink>
          <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.55)', marginBottom: '.375rem' }}>
            {user.name}
          </div>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="admin-nav-item"
            style={{ width: '100%', color: 'rgba(255,255,255,.65)' }}
          >
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
