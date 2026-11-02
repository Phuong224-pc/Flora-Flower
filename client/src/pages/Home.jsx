import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Truck, Star, Clock, Shield, Heart,
  ChevronLeft, ChevronRight, Sparkles, Phone, MapPin, Gift,
} from 'lucide-react'
import api from '../services/api'
import ProductCard from '../components/ui/ProductCard'
import { formatVND } from '../utils/helpers'

/* ── Data ────────────────────────────────────────────────────── */
const occasions = [
  { key: 'sinh-nhat',  label: 'Sinh nhật',  emoji: '🎂', bg: '#fef3c7', hover: '#fde68a' },
  { key: 'tinh-yeu',  label: 'Tình yêu',   emoji: '💕', bg: '#ffe4e6', hover: '#fecdd3' },
  { key: 'khai-truong',label:'Khai trương', emoji: '🏮', bg: '#dcfce7', hover: '#bbf7d0' },
  { key: 'cuoi',      label: 'Cưới hỏi',   emoji: '💒', bg: '#f3e8ff', hover: '#e9d5ff' },
  { key: 'chuc-mung', label: 'Chúc mừng',  emoji: '🎉', bg: '#dbeafe', hover: '#bfdbfe' },
  { key: 'chia-buon', label: 'Chia buồn',  emoji: '🕊️', bg: '#f1f5f9', hover: '#e2e8f0' },
  { key: 'cam-on',    label: 'Cảm ơn',     emoji: '🙏', bg: '#fef9c3', hover: '#fef08a' },
  { key: 'tot-nghiep',label: 'Tốt nghiệp', emoji: '🎓', bg: '#f0fdf4', hover: '#dcfce7' },
]

const features = [
  { icon: Truck,  title: 'Giao hoa tận nơi',   desc: 'Giao nhanh 2–4 giờ trong ngày, toàn TP. HCM', color: '#ffe4e6', ic: '#e8627a' },
  { icon: Star,   title: 'Hoa tươi cao cấp',   desc: 'Hoa nhập khẩu, chọn lọc kỹ, đảm bảo độ tươi', color: '#fef9c3', ic: '#ca8a04' },
  { icon: Clock,  title: 'Chọn giờ giao linh hoạt', desc: 'Đặt trước, chọn khung giờ thuận tiện', color: '#dcfce7', ic: '#16a34a' },
  { icon: Shield, title: 'Cam kết chất lượng', desc: 'Hoàn tiền 100% nếu hoa không đúng yêu cầu',  color: '#dbeafe', ic: '#2563eb' },
]

const testimonials = [
  { name: 'Nguyễn Thị Lan', role: 'Khách hàng thường xuyên', avatar: '👩', stars: 5, text: 'Hoa rất tươi và đẹp, giao hàng đúng giờ. Người nhận rất thích! Sẽ tiếp tục ủng hộ Flora Flower.' },
  { name: 'Trần Văn Minh',  role: 'Đặt hoa cưới', avatar: '👨', stars: 5, text: 'Đặt hoa cưới tại Flora Flower — cực kỳ chuyên nghiệp. Trang trí hội trường đẹp hơn mong đợi rất nhiều.' },
  { name: 'Lê Thu Hà',      role: 'Khách hàng', avatar: '👩‍💼', stars: 5, text: 'Mỗi lần tặng hoa cho mẹ đều chọn Flora. Hoa đẹp, giá hợp lý, nhân viên tư vấn nhiệt tình.' },
  { name: 'Phạm Đức Hùng',  role: 'Chủ doanh nghiệp', avatar: '👨‍💼', stars: 5, text: 'Đặt hoa khai trương, giao đúng giờ, setup chuyên nghiệp. Bạn bè đều khen. Recommend ngay!' },
]

const stats = [
  { value: '5,000+', label: 'Đơn hàng mỗi tháng' },
  { value: '98%',    label: 'Khách hàng hài lòng' },
  { value: '200+',   label: 'Mẫu hoa đa dạng' },
  { value: '2–4h',   label: 'Giao hàng trong ngày' },
]

const heroImages = [
  'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=700&h=875&fit=crop&q=80',
  'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=700&h=875&fit=crop&q=80',
  'https://images.unsplash.com/photo-1532246420286-127bcd803104?w=700&h=875&fit=crop&q=80',
]

/* ── Sub-components ──────────────────────────────────────────── */
function HeroSection() {
  const [slide, setSlide] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % heroImages.length), 4000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="hero" style={{ minHeight: 'calc(100vh - var(--header-h))', display: 'flex', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
      {/* Animated bg blobs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(232,98,122,.12) 0%, transparent 70%)', top: '-10%', left: '-5%', animation: 'float 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(125,19,53,.08) 0%, transparent 70%)', bottom: '-5%', right: '5%', animation: 'float 10s ease-in-out infinite reverse' }} />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '4rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>

          {/* Left — text */}
          <div className="anim-fade-up">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--color-primary-bg)', border: '1px solid var(--color-primary-light)', borderRadius: 'var(--r-full)', padding: '.35rem 1rem', fontSize: '.78rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1.5rem', letterSpacing: '.04em' }}>
              <Sparkles size={13} /> Cửa hàng hoa cao cấp #1 TP.HCM
            </div>

            <h1 className="hero-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.25rem' }}>
              Tặng hoa,<br />
              trao gửi{' '}
              <span style={{ position: 'relative', display: 'inline-block' }}>
                yêu thương
                <svg style={{ position: 'absolute', bottom: '-4px', left: 0, width: '100%' }} viewBox="0 0 200 12" fill="none">
                  <path d="M0 8 Q50 0 100 6 Q150 12 200 4" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".6"/>
                </svg>
              </span>
            </h1>

            <p className="hero-subtitle" style={{ fontSize: '1.05rem', maxWidth: '480px', lineHeight: 1.8, marginBottom: '2rem' }}>
              Khám phá bộ sưu tập hoa tươi cao cấp, thiết kế tinh tế dành riêng cho những khoảnh khắc đặc biệt nhất của bạn.
            </p>

            {/* CTA */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              <Link to="/shop">
                <button className="btn btn-primary btn-xl" style={{ gap: '.625rem' }}>
                  Khám phá mẫu hoa <ArrowRight size={18} />
                </button>
              </Link>
              <Link to="/contact">
                <button className="btn btn-outline btn-xl">📞 Tư vấn miễn phí</button>
              </Link>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[
                { icon: '✅', text: 'Giao hoa tận nơi' },
                { icon: '🌸', text: 'Hoa tươi mỗi ngày' },
                { icon: '⭐', text: '4.9/5 đánh giá' },
              ].map(b => (
                <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: '.375rem', fontSize: '.82rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                  <span>{b.icon}</span> {b.text}
                </div>
              ))}
            </div>
          </div>

          {/* Right — slideshow + floating cards */}
          <div style={{ position: 'relative' }}>
            {/* Main image */}
            <div style={{ borderRadius: '2rem 2rem 6rem 2rem', overflow: 'hidden', aspectRatio: '4/5', boxShadow: '0 32px 64px -12px rgba(232,98,122,.3)', position: 'relative' }}>
              {heroImages.map((src, i) => (
                <img key={i} src={src} alt=""
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: slide === i ? 1 : 0, transition: 'opacity 1s ease', transform: slide === i ? 'scale(1)' : 'scale(1.04)' }} />
              ))}
            </div>

            {/* Slide dots */}
            <div style={{ position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '.4rem' }}>
              {heroImages.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)}
                  style={{ width: slide === i ? '1.5rem' : '.5rem', height: '.5rem', borderRadius: '4px', background: slide === i ? '#fff' : 'rgba(255,255,255,.5)', border: 'none', cursor: 'pointer', transition: 'all .3s', padding: 0 }} />
              ))}
            </div>

            {/* Floating stat card */}
            <div style={{ position: 'absolute', top: '1.5rem', left: '-2rem', background: '#fff', borderRadius: 'var(--r-xl)', padding: '1rem 1.25rem', boxShadow: 'var(--sh-xl)', display: 'flex', alignItems: 'center', gap: '.75rem', minWidth: '160px', animation: 'float 6s ease-in-out infinite' }}>
              <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Star size={16} fill="var(--color-primary)" color="var(--color-primary)" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-heading)' }}>4.9/5</div>
                <div style={{ fontSize: '.72rem', color: 'var(--color-text-muted)' }}>5,000+ đánh giá</div>
              </div>
            </div>

            {/* Floating order card */}
            <div style={{ position: 'absolute', bottom: '4rem', right: '-1.5rem', background: '#fff', borderRadius: 'var(--r-xl)', padding: '1rem 1.25rem', boxShadow: 'var(--sh-xl)', animation: 'float 7s ease-in-out infinite reverse', minWidth: '180px' }}>
              <div style={{ fontSize: '.72rem', color: 'var(--color-text-muted)', marginBottom: '.25rem' }}>Đơn mới nhất</div>
              <div style={{ fontWeight: 600, fontSize: '.875rem', color: 'var(--color-heading)', marginBottom: '.2rem' }}>🌹 Bó hoa hồng sáp</div>
              <div style={{ fontSize: '.75rem', color: 'var(--color-success)' }}>✅ Đã giao thành công</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatsBar() {
  return (
    <div style={{ background: 'linear-gradient(135deg, var(--color-rose), var(--color-rose-light))', padding: '2.25rem 0' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {stats.map(s => (
            <div key={s.label} style={{ textAlign: 'center', color: '#fff' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.1, marginBottom: '.25rem' }}>{s.value}</div>
              <div style={{ fontSize: '.82rem', opacity: .85, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function OccasionsSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div className="eyebrow">Mua hoa theo dịp</div>
          <h2>Chọn hoa phù hợp từng khoảnh khắc</h2>
          <p>Dù là sinh nhật, cưới hỏi hay khai trương — chúng tôi luôn có mẫu hoa hoàn hảo</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
          {occasions.map(occ => (
            <Link key={occ.key} to={`/shop/${occ.key}`} style={{ textDecoration: 'none' }}>
              <div
                style={{ background: occ.bg, borderRadius: 'var(--r-2xl)', textAlign: 'center', padding: '2rem 1rem', cursor: 'pointer', transition: 'all var(--dur-slow) var(--ease)', border: '2px solid transparent' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = occ.hover
                  e.currentTarget.style.transform = 'translateY(-6px)'
                  e.currentTarget.style.boxShadow = 'var(--sh-lg)'
                  e.currentTarget.style.borderColor = 'rgba(232,98,122,.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = occ.bg
                  e.currentTarget.style.transform = ''
                  e.currentTarget.style.boxShadow = ''
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              >
                <div style={{ fontSize: '2.75rem', marginBottom: '1rem', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.1))' }}>{occ.emoji}</div>
                <div style={{ fontWeight: 700, color: 'var(--color-heading)', fontFamily: 'var(--font-serif)', fontSize: '1rem' }}>{occ.label}</div>
                <div style={{ fontSize: '.78rem', color: 'var(--color-primary)', marginTop: '.375rem', fontWeight: 600, opacity: 0, transition: 'opacity .2s' }}
                  onMouseEnter={e => { e.target.style.opacity = 1 }}>
                  Xem mẫu →
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function ProductsSection({ products, bestSellers, newProducts, loading }) {
  const [tab, setTab] = useState('featured')
  const displayed = tab === 'featured' ? products.slice(0, 8)
    : tab === 'bestseller' ? bestSellers
    : newProducts

  return (
    <section className="section" style={{ background: 'var(--color-bg-subtle)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--color-primary)', marginBottom: '.5rem' }}>Bộ sưu tập</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: 'var(--color-heading)' }}>Mẫu hoa đặc sắc</h2>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: '#fff', border: '1.5px solid var(--color-border)', borderRadius: 'var(--r-xl)', padding: '.25rem', gap: '.25rem' }}>
            {[
              { key: 'featured',   label: '⭐ Nổi bật' },
              { key: 'bestseller', label: '🔥 Bán chạy' },
              { key: 'newest',     label: '✨ Mới nhất' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{
                  padding: '.45rem 1.1rem', borderRadius: 'var(--r-lg)', border: 'none', cursor: 'pointer', fontSize: '.82rem', fontWeight: 600, transition: 'all .2s',
                  background: tab === t.key ? 'var(--color-primary)' : 'transparent',
                  color: tab === t.key ? '#fff' : 'var(--color-text-muted)',
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem' }}>
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: '340px', borderRadius: 'var(--r-xl)' }} />)}
          </div>
        ) : displayed.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem' }}>
            {displayed.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌸</div>
            <div>Chưa có sản phẩm trong danh mục này</div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link to="/shop">
            <button className="btn btn-outline btn-lg">
              Xem toàn bộ mẫu hoa <ArrowRight size={18} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}

function FeaturesSection() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-header">
          <div className="eyebrow">Vì sao chọn chúng tôi</div>
          <h2>Tại sao chọn Flora Flower?</h2>
          <p>Chúng tôi không chỉ bán hoa — chúng tôi gửi trao cảm xúc qua từng cánh hoa</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {features.map(({ icon: Icon, title, desc, color, ic }) => (
            <div key={title} className="card"
              style={{ textAlign: 'center', padding: '2.25rem 1.5rem', transition: 'all var(--dur-slow) var(--ease)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'var(--color-primary-light)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '' }}
            >
              <div style={{ width: '3.75rem', height: '3.75rem', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Icon size={24} color={ic} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', marginBottom: '.625rem', color: 'var(--color-heading)' }}>{title}</h3>
              <p style={{ fontSize: '.85rem', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TestimonialsSection() {
  const [idx, setIdx] = useState(0)
  const visible = 2

  return (
    <section className="section" style={{ background: 'linear-gradient(135deg, #fff0f3 0%, #fdf0f2 50%, #fff8f9 100%)' }}>
      <div className="container">
        <div className="section-header">
          <div className="eyebrow">Khách hàng nói gì</div>
          <h2>Đánh giá từ khách hàng thật</h2>
          <p>Hơn 5,000 đơn hàng mỗi tháng — sự tin tưởng là tài sản lớn nhất của chúng tôi</p>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', overflow: 'hidden' }}>
            {testimonials.slice(idx, idx + visible).map((t, i) => (
              <div key={i} className="card" style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}>
                {/* Decorative quote */}
                <div style={{ position: 'absolute', top: '1rem', right: '1.25rem', fontSize: '5rem', color: 'var(--color-primary-light)', fontFamily: 'serif', lineHeight: 1, opacity: .4 }}>"</div>
                {/* Stars */}
                <div style={{ color: '#f59e0b', fontSize: '1.1rem', marginBottom: '1rem' }}>
                  {'★'.repeat(t.stars)}
                </div>
                <p style={{ fontSize: '.9rem', lineHeight: 1.8, color: 'var(--color-text)', marginBottom: '1.25rem', fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.875rem' }}>
                  <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '50%', background: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--color-heading)' }}>{t.name}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--color-text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.75rem' }}>
            <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0}
              className="btn btn-outline btn-icon" style={{ borderRadius: '50%', width: '2.5rem', height: '2.5rem' }}>
              <ChevronLeft size={18} />
            </button>
            <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center' }}>
              {Array.from({ length: testimonials.length - visible + 1 }).map((_, i) => (
                <button key={i} onClick={() => setIdx(i)}
                  style={{ width: i === idx ? '1.5rem' : '.5rem', height: '.5rem', borderRadius: '4px', border: 'none', cursor: 'pointer', transition: 'all .3s', padding: 0, background: i === idx ? 'var(--color-primary)' : 'var(--color-border-strong)' }} />
              ))}
            </div>
            <button onClick={() => setIdx(i => Math.min(testimonials.length - visible, i + 1))} disabled={idx >= testimonials.length - visible}
              className="btn btn-outline btn-icon" style={{ borderRadius: '50%', width: '2.5rem', height: '2.5rem' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function PromoSection() {
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('FLORA10')
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {}
  }

  return (
    <section style={{ padding: '4rem 0' }}>
      <div className="container">
        <div style={{
          background: 'linear-gradient(135deg, #881337 0%, #be123c 50%, #e11d48 100%)',
          borderRadius: 'var(--r-2xl)', padding: '3.5rem 4rem',
          display: 'grid', gridTemplateColumns: '1fr auto',
          gap: '3rem', alignItems: 'center', position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', width: '280px', height: '280px', borderRadius: '50%', border: '40px solid rgba(255,255,255,.06)', top: '-80px', right: '200px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: '180px', height: '180px', borderRadius: '50%', border: '30px solid rgba(255,255,255,.06)', bottom: '-50px', right: '100px', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.7)', marginBottom: '.75rem', textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '.4rem' }}>
              <Gift size={14} /> Ưu đãi dành riêng cho bạn
            </div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: '#fff', marginBottom: '.75rem', lineHeight: 1.2 }}>
              Giảm <span style={{ color: '#fda4af' }}>10%</span> cho đơn hàng đầu tiên
            </h2>
            <p style={{ color: 'rgba(255,255,255,.8)', marginBottom: '1.75rem', fontSize: '.95rem', lineHeight: 1.7 }}>
              Áp dụng cho tất cả sản phẩm tại cửa hàng. Không giới hạn giá trị đơn hàng.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Coupon code */}
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(10px)', borderRadius: 'var(--r-xl)', padding: '.5rem .625rem .5rem 1.25rem', border: '1.5px dashed rgba(255,255,255,.35)' }}>
                <span style={{ color: '#fda4af', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '.1em', fontSize: '1.1rem' }}>FLORA10</span>
                <button onClick={handleCopy}
                  style={{ marginLeft: '.875rem', background: 'rgba(255,255,255,.2)', border: 'none', borderRadius: 'var(--r-md)', padding: '.375rem .75rem', color: '#fff', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer', transition: 'all .2s', flexShrink: 0 }}>
                  {copied ? '✅ Đã sao chép!' : '📋 Sao chép'}
                </button>
              </div>
              <Link to="/shop">
                <button className="btn btn-lg" style={{ background: '#fff', color: 'var(--color-rose)', fontWeight: 800 }}>
                  Mua ngay <ArrowRight size={18} />
                </button>
              </Link>
            </div>
          </div>

          {/* Right floral decoration */}
          <div style={{ fontSize: '9rem', opacity: .25, position: 'relative', zIndex: 1, animation: 'float 6s ease-in-out infinite' }}>
            🌸
          </div>
        </div>
      </div>
    </section>
  )
}

function QuickContactBar() {
  return (
    <div style={{ background: 'var(--color-bg-subtle)', borderTop: '1px solid var(--color-border)', padding: '1.75rem 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: 'var(--color-heading)', fontWeight: 600 }}>
            Cần tư vấn mẫu hoa? Liên hệ ngay với chúng tôi!
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="tel:0909123456">
              <button className="btn btn-primary" style={{ gap: '.5rem' }}>
                <Phone size={16} /> 0909 123 456
              </button>
            </a>
            <Link to="/track-order">
              <button className="btn btn-outline" style={{ gap: '.5rem' }}>
                📦 Tra cứu đơn hàng
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Main export ─────────────────────────────────────────────── */
export default function Home() {
  const [products,     setProducts]     = useState([])
  const [newProducts,  setNewProducts]  = useState([])
  const [bestSellers,  setBestSellers]  = useState([])
  const [loading,      setLoading]      = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/products?featured=true&limit=8'),
      api.get('/products?sort=newest&limit=8'),
      api.get('/products?sort=bestseller&limit=8'),
    ]).then(([f, n, b]) => {
      setProducts(f.data.data || f.data)
      setNewProducts(n.data.data || n.data)
      setBestSellers(b.data.data || b.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <HeroSection />
      <StatsBar />
      <OccasionsSection />
      <ProductsSection products={products} bestSellers={bestSellers} newProducts={newProducts} loading={loading} />
      <FeaturesSection />
      <TestimonialsSection />
      <PromoSection />
      <QuickContactBar />
    </div>
  )
}
