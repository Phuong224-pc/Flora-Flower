import { Link } from 'react-router-dom'
import { MapPin, Phone, Clock, Mail, Facebook, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div className="footer-logo">🌸 FLORA <span>FLOWER</span></div>
            <p className="footer-desc">
              Chúng tôi mang yêu thương gửi trao qua từng đóa hoa tươi tắn,
              thiết kế tinh tế dành riêng cho những dịp đặc biệt của bạn.
            </p>
            <div style={{ display: 'flex', gap: '.75rem' }}>
              <a href="#" style={{ color: 'rgba(255,255,255,0.7)', transition: 'var(--transition)' }}
                onMouseOver={e => e.target.style.color = '#fff'}
                onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.7)'}>
                <Facebook size={20} />
              </a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.7)', transition: 'var(--transition)' }}
                onMouseOver={e => e.target.style.color = '#fff'}
                onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.7)'}>
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <div className="footer-heading">Cửa hàng</div>
            <ul className="footer-links">
              <li><Link to="/shop">Tất cả mẫu hoa</Link></li>
              <li><Link to="/shop/sinh-nhat">Hoa sinh nhật</Link></li>
              <li><Link to="/shop/cuoi">Hoa cưới</Link></li>
              <li><Link to="/shop/khai-truong">Hoa khai trương</Link></li>
              <li><Link to="/shop/chia-buon">Hoa chia buồn</Link></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <div className="footer-heading">Hỗ trợ</div>
            <ul className="footer-links">
              <li><Link to="/about">Giới thiệu</Link></li>
              <li><Link to="/contact">Liên hệ</Link></li>
              <li><Link to="/faq">Câu hỏi thường gặp</Link></li>
              <li><Link to="/track-order">Tra cứu đơn hàng</Link></li>
              <li><Link to="/policy">Chính sách giao hàng</Link></li>
              <li><Link to="/policy#return">Chính sách đổi trả</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="footer-heading">Liên hệ</div>
            <div className="footer-contact-item">
              <MapPin size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>123 Đường Hoa Hồng, Quận 1, TP. Hồ Chí Minh</span>
            </div>
            <div className="footer-contact-item">
              <Phone size={16} style={{ flexShrink: 0 }} />
              <span>0909 123 456</span>
            </div>
            <div className="footer-contact-item">
              <Mail size={16} style={{ flexShrink: 0 }} />
              <span>hello@floraflower.vn</span>
            </div>
            <div className="footer-contact-item">
              <Clock size={16} style={{ flexShrink: 0 }} />
              <span>Thứ 2 – Chủ nhật: 7:00 – 21:00</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          © 2024 Flora Flower. Được thiết kế với 🌸 tại Việt Nam.
          <span style={{ margin: '0 .5rem' }}>·</span>
          <Link to="/policy" style={{ opacity: .8 }}>Chính sách bảo mật</Link>
        </div>
      </div>
    </footer>
  )
}
