import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingCart, Heart, User, Search, Menu, X, LogOut,
  Package, ChevronDown, Settings, LayoutDashboard
} from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import useCartStore from '../../store/useCartStore'
import useAuthStore from '../../store/useAuthStore'
import api from '../../services/api'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileOccasionOpen, setMobileOccasionOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [occasions, setOccasions] = useState([])
  const count = useCartStore((s) => s.getCount())
  const { user, logout } = useAuthStore()
  const userMenuRef = useRef(null)

  // Fetch occasions từ API (chỉ những dịp showInMenu=true, status=published)
  useEffect(() => {
    api.get('/occasions?menuOnly=true')
      .then(res => setOccasions(res.data || []))
      .catch(() => {}) // fail silently
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on navigation
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    const q = search.trim()
    if (q) {
      navigate(`/shop?q=${encodeURIComponent(q)}`)
      setSearch('')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  return (
    <>
      <header className="header">
        <div className="header-inner">
          {/* Logo */}
          <Link
            to="/"
            className="header-logo"
            aria-label="Flora Flower - Trang chủ"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            🌸 FLORA <span className="logo-dot">FLOWER</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="header-nav" aria-label="Điều hướng chính">
            <div className="nav-item">
              <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Trang chủ
              </NavLink>
            </div>

            <div className="nav-item">
              <NavLink to="/shop" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Tất cả hoa
              </NavLink>
            </div>

            {/* Dropdown: Dịp tặng hoa */}
            <div className="nav-item" role="none">
              <button
                className="nav-link"
                aria-haspopup="true"
                aria-expanded="false"
                type="button"
              >
                Dịp tặng hoa
                <ChevronDown size={15} className="nav-chevron" />
              </button>
              <div className="nav-dropdown" role="menu" aria-label="Dịp tặng hoa">
                <div className="dropdown-grid">
                  {occasions.map(occ => (
                    <Link
                      key={occ.slug}
                      to={`/dip/${occ.slug}`}
                      className="dropdown-item"
                      role="menuitem"
                    >
                      <span className="dropdown-item__icon">{occ.icon || '🌸'}</span>
                      {occ.label}
                    </Link>
                  ))}
                </div>
                <div className="dropdown-footer">
                  <Link to="/shop?occasion=all">Xem tất cả dịp →</Link>
                </div>
              </div>
            </div>

            <div className="nav-item">
              <NavLink to="/about" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Giới thiệu
              </NavLink>
            </div>

            <div className="nav-item">
              <NavLink to="/contact" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                Liên hệ
              </NavLink>
            </div>
          </nav>

          {/* Search */}
          <form className="header-search" onSubmit={handleSearch} role="search" aria-label="Tìm kiếm sản phẩm">
            <Search size={15} color="var(--color-text-light)" aria-hidden="true" />
            <input
              type="search"
              placeholder="Tìm mẫu hoa, dịp tặng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              aria-label="Từ khóa tìm kiếm"
            />
          </form>

          {/* Actions */}
          <div className="header-actions">
            <Link to="/wishlist" className="header-icon-btn" title="Danh sách yêu thích" aria-label="Yêu thích">
              <Heart size={20} />
            </Link>

            <Link to="/cart" className="header-icon-btn" title="Giỏ hàng" aria-label={`Giỏ hàng (${count} sản phẩm)`}>
              <ShoppingCart size={20} />
              {count > 0 && <span className="badge-count" aria-hidden="true">{count}</span>}
            </Link>

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  className="header-icon-btn"
                  onClick={() => setUserMenuOpen(v => !v)}
                  title={user.name}
                  aria-label="Menu tài khoản"
                  aria-expanded={userMenuOpen}
                >
                  <User size={20} />
                </button>
                {userMenuOpen && (
                  <div className="user-dropdown" role="menu">
                    <div className="user-dropdown-header">
                      <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--color-heading)' }}>{user.name}</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--color-text-muted)', marginTop: '.1rem' }}>{user.email}</div>
                    </div>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)} role="menuitem">
                        <LayoutDashboard size={16} /> Quản trị
                      </Link>
                    )}
                    <Link to="/profile" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)} role="menuitem">
                      <User size={16} /> Tài khoản
                    </Link>
                    <Link to="/orders" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)} role="menuitem">
                      <Package size={16} /> Đơn hàng của tôi
                    </Link>
                    <div style={{ borderTop: '1px solid var(--color-border)', margin: '.25rem 0' }} />
                    <button onClick={handleLogout} className="user-dropdown-item danger" role="menuitem">
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <button className="btn btn-primary btn-sm">Đăng nhập</button>
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              className="header-hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Mở menu"
              aria-expanded={mobileOpen}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div
            className="mobile-drawer-overlay"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <nav className="mobile-drawer" aria-label="Menu điều hướng mobile" role="dialog" aria-modal="true">
            <div className="drawer-header">
              <Link
                to="/"
                onClick={() => { setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                style={{ textDecoration: 'none' }}
              >
                <span className="drawer-logo">🌸 Flora <span style={{ color: 'var(--color-primary)' }}>Flower</span></span>
              </Link>
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Đóng menu"
              >
                <X size={22} />
              </button>
            </div>

            <div className="drawer-body">
              <Link to="/" className="drawer-nav-link">Trang chủ</Link>
              <Link to="/shop" className="drawer-nav-link">Tất cả hoa</Link>

              {/* Dịp toggle */}
              <button
                className="drawer-nav-link"
                onClick={() => setMobileOccasionOpen(v => !v)}
                style={{ justifyContent: 'space-between' }}
                aria-expanded={mobileOccasionOpen}
              >
                <span>Dịp tặng hoa</span>
                <ChevronDown
                  size={18}
                  style={{ transition: 'transform .2s', transform: mobileOccasionOpen ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
                />
              </button>

              {mobileOccasionOpen && (
                <div className="drawer-sub-menu">
                  {occasions.map(occ => (
                    <Link key={occ.slug} to={`/dip/${occ.slug}`} className="drawer-sub-link">
                      <span>{occ.icon || '🌸'}</span> {occ.label}
                    </Link>
                  ))}
                  <Link to="/shop" className="drawer-sub-link" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                    → Xem tất cả hoa
                  </Link>
                </div>
              )}

              <Link to="/about" className="drawer-nav-link">Giới thiệu</Link>
              <Link to="/contact" className="drawer-nav-link">Liên hệ</Link>
              <Link to="/policy" className="drawer-nav-link">Chính sách</Link>

              <div style={{ borderTop: '1px solid var(--color-border)', margin: '1rem 0' }} />

              {user ? (
                <>
                  <div style={{ padding: '.5rem .875rem', fontSize: '.85rem', color: 'var(--color-text-muted)', marginBottom: '.25rem' }}>
                    Xin chào, <strong style={{ color: 'var(--color-heading)' }}>{user.name}</strong>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="drawer-nav-link">🛠 Quản trị</Link>
                  )}
                  <Link to="/profile" className="drawer-nav-link">Tài khoản</Link>
                  <Link to="/orders" className="drawer-nav-link">Đơn hàng</Link>
                  <button
                    className="drawer-nav-link"
                    onClick={handleLogout}
                    style={{ color: 'var(--color-error)', width: '100%', textAlign: 'left' }}
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', gap: '.75rem', padding: '.5rem .875rem' }}>
                  <Link to="/login" style={{ flex: 1 }}>
                    <button className="btn btn-primary" style={{ width: '100%' }}>Đăng nhập</button>
                  </Link>
                  <Link to="/register" style={{ flex: 1 }}>
                    <button className="btn btn-outline" style={{ width: '100%' }}>Đăng ký</button>
                  </Link>
                </div>
              )}
            </div>

            {/* Quick search in drawer */}
            <div className="drawer-footer">
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '.5rem' }}>
                <input
                  className="form-input"
                  placeholder="Tìm mẫu hoa..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-primary btn-icon">
                  <Search size={18} />
                </button>
              </form>
            </div>
          </nav>
        </>
      )}
    </>
  )
}
