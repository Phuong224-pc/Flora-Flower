import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🌸</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '6rem', color: 'var(--color-border-strong)', lineHeight: 1, marginBottom: '1rem' }}>404</h1>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', color: 'var(--color-heading)', marginBottom: '1rem' }}>Trang không tồn tại</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Trang bạn tìm kiếm đã bị xóa hoặc không tồn tại.</p>
        <Link to="/">
          <button className="btn btn-primary btn-lg">← Về trang chủ</button>
        </Link>
      </div>
    </div>
  )
}
