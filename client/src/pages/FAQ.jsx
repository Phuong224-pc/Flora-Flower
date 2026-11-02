import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, MessageCircle, Phone, Mail, MapPin } from 'lucide-react'

const FAQS = [
  {
    category: 'Đặt hàng',
    icon: '🛒',
    questions: [
      {
        q: 'Tôi có thể đặt hoa trước bao lâu?',
        a: 'Bạn có thể đặt hoa trước tối đa 30 ngày. Đối với các dịp đặc biệt như cưới, khai trương, chúng tôi khuyến khích đặt trước ít nhất 3–7 ngày để đảm bảo chất lượng và phối màu theo yêu cầu.',
      },
      {
        q: 'Tôi có thể thay đổi hoặc hủy đơn hàng không?',
        a: 'Bạn có thể hủy hoặc thay đổi đơn hàng khi đơn đang ở trạng thái "Chờ xác nhận" hoặc "Đã xác nhận". Sau khi cửa hàng đã bắt đầu chuẩn bị hoa, chúng tôi không thể chỉnh sửa nội dung đơn hàng. Vui lòng gọi hotline nếu cần hỗ trợ khẩn cấp.',
      },
      {
        q: 'Tôi có thể đặt hoa ẩn danh không?',
        a: 'Có! Khi đặt hàng, bạn chỉ cần điền tên và địa chỉ người nhận. Tên người gửi và thông tin tài khoản của bạn sẽ hoàn toàn bảo mật. Lời nhắn trên thiệp cũng do bạn tự soạn.',
      },
      {
        q: 'Tôi có thể ghi lời nhắn lên thiệp không?',
        a: 'Hoàn toàn có thể! Khi đặt hàng, có ô "Lời nhắn thiệp" để bạn ghi nội dung muốn in lên thiệp kèm hoa. Chúng tôi hỗ trợ tối đa 200 ký tự trên thiệp.',
      },
    ],
  },
  {
    category: 'Giao hàng',
    icon: '🚚',
    questions: [
      {
        q: 'Cửa hàng giao hoa khu vực nào?',
        a: 'Chúng tôi giao hoa toàn bộ TP. Hồ Chí Minh với phí giao hàng 30.000đ/đơn. Miễn phí giao cho đơn từ 500.000đ. Các khu vực ngoại thành hoặc tỉnh thành khác vui lòng liên hệ để báo phí.',
      },
      {
        q: 'Khung giờ giao hoa là mấy giờ?',
        a: 'Chúng tôi có các khung giao: 8:00–10:00, 10:00–12:00, 13:00–15:00, 15:00–17:00, 17:00–19:00 và 19:00–21:00. Bạn chọn khung giờ khi đặt hàng. Nếu cần giao gấp ngoài giờ, vui lòng gọi hotline.',
      },
      {
        q: 'Tôi có thể nhận hoa trực tiếp tại cửa hàng không?',
        a: 'Có! Bạn chọn "Nhận tại cửa hàng" khi thanh toán để được miễn phí giao hàng. Cửa hàng mở cửa từ 08:00–21:00, 7 ngày/tuần.',
      },
      {
        q: 'Hoa có đảm bảo tươi khi giao không?',
        a: 'Chúng tôi cam kết giao hoa tươi 100%. Hoa được cắt và phối trong vòng 2–4 giờ trước khi giao. Nếu hoa không đúng chất lượng khi nhận, chúng tôi sẽ thay thế miễn phí trong vòng 24 giờ.',
      },
    ],
  },
  {
    category: 'Thanh toán',
    icon: '💳',
    questions: [
      {
        q: 'Cửa hàng chấp nhận thanh toán những hình thức nào?',
        a: 'Chúng tôi chấp nhận: (1) COD — trả tiền mặt khi nhận hoa, (2) Chuyển khoản ngân hàng qua mã QR VietQR — tương thích tất cả ngân hàng nội địa, (3) Thanh toán online demo (cho mục đích thử nghiệm).',
      },
      {
        q: 'Tôi chuyển khoản xong bao lâu thì đơn được xác nhận?',
        a: 'Sau khi chuyển khoản, cửa hàng sẽ kiểm tra và xác nhận đơn trong vòng 15–30 phút (giờ hành chính). Ngoài giờ làm việc, đơn sẽ được xác nhận vào sáng hôm sau. Vui lòng giữ ảnh chụp màn hình giao dịch để xác minh nếu cần.',
      },
      {
        q: 'Chính sách hoàn tiền khi tôi hủy đơn?',
        a: 'Nếu bạn hủy đơn trước khi cửa hàng chuẩn bị hoa: hoàn tiền 100%. Nếu hủy sau khi đã chuẩn bị: hoàn 50%. Không hoàn tiền nếu hủy sau khi hoa đã giao. Thời gian hoàn tiền: 3–5 ngày làm việc qua ngân hàng.',
      },
    ],
  },
  {
    category: 'Sản phẩm',
    icon: '🌸',
    questions: [
      {
        q: 'Hoa tươi có bảo quản được bao lâu?',
        a: 'Hoa tươi thông thường giữ được 5–7 ngày nếu bảo quản đúng cách: để nơi thoáng mát, tránh ánh nắng trực tiếp, thay nước bình hàng ngày và cắt bỏ phần cuống bị thối. Hoa hồng sáp và hoa khô có thể giữ vĩnh cửu.',
      },
      {
        q: 'Tôi muốn đặt hoa theo màu hoặc thiết kế riêng có được không?',
        a: 'Có! Chúng tôi nhận đặt theo yêu cầu riêng: màu sắc cụ thể, kết hợp nhiều loại hoa, kích cỡ bó hoa, phong cách bao bì (Hàn Quốc, cổ điển, vintage...). Vui lòng nhắn tin hoặc gọi hotline để được tư vấn và báo giá.',
      },
      {
        q: 'Giá hiển thị trên website đã bao gồm hộp/giấy gói chưa?',
        a: 'Có, giá đã bao gồm bao bì tương ứng với kiểu sản phẩm (bó hoa có giấy gói, hộp hoa có hộp, giỏ hoa có giỏ...). Nếu bạn muốn bao bì cao cấp hơn, có thể chọn thêm phụ kiện hoặc liên hệ để yêu cầu riêng.',
      },
    ],
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      borderRadius: 'var(--r-lg)', border: '1.5px solid',
      borderColor: open ? 'var(--color-primary-light)' : 'var(--color-border)',
      overflow: 'hidden', marginBottom: '.75rem', transition: 'border-color .2s',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          padding: '1.125rem 1.25rem', background: open ? 'var(--color-primary-bg)' : '#fff',
          border: 'none', cursor: 'pointer', textAlign: 'left', gap: '1rem', transition: 'background .2s',
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--color-heading)', fontSize: '.925rem', lineHeight: 1.5 }}>
          {q}
        </span>
        <span style={{ flexShrink: 0, color: 'var(--color-primary)', marginTop: '.1rem' }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {open && (
        <div style={{ padding: '1rem 1.25rem 1.25rem', background: '#fff', borderTop: '1px solid var(--color-border)', fontSize: '.875rem', color: 'var(--color-text)', lineHeight: 1.8, animation: 'fadeInDown .2s ease' }}>
          {a}
        </div>
      )}
    </div>
  )
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = activeCategory === 'all'
    ? FAQS
    : FAQS.filter(g => g.category === activeCategory)

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '80vh' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #fff0f3, #ffe4e6)', padding: '3rem 0 2.5rem', textAlign: 'center' }}>
        <div className="container">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❓</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--color-heading)', marginBottom: '.75rem' }}>
            Câu hỏi thường gặp
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7 }}>
            Tìm nhanh câu trả lời cho các thắc mắc về đặt hoa, giao hàng và thanh toán tại Flora Flower.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '3rem 1.5rem 5rem', maxWidth: '860px' }}>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2.5rem' }}>
          {[{ key: 'all', label: 'Tất cả', icon: '📋' }, ...FAQS.map(g => ({ key: g.category, label: g.category, icon: g.icon }))].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className="btn btn-sm"
              style={{
                background: activeCategory === tab.key ? 'var(--color-primary)' : '#fff',
                color: activeCategory === tab.key ? '#fff' : 'var(--color-text)',
                border: `1.5px solid ${activeCategory === tab.key ? 'var(--color-primary)' : 'var(--color-border)'}`,
                borderRadius: 'var(--r-full)', padding: '.4rem 1rem',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* FAQ groups */}
        {filtered.map(group => (
          <div key={group.category} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--color-heading)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.5rem', paddingBottom: '.75rem', borderBottom: '2px solid var(--color-border)' }}>
              <span style={{ fontSize: '1.5rem' }}>{group.icon}</span> {group.category}
            </h2>
            {group.questions.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} />
            ))}
          </div>
        ))}

        {/* Still need help? */}
        <div style={{ background: 'linear-gradient(135deg, var(--color-primary-bg), #ffe4e6)', borderRadius: 'var(--r-2xl)', padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🌸</div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--color-heading)', marginBottom: '.75rem' }}>
            Vẫn chưa tìm được câu trả lời?
          </h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.75rem', fontSize: '.925rem' }}>
            Đội ngũ Flora Flower luôn sẵn sàng hỗ trợ bạn từ 08:00–21:00, 7 ngày/tuần.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:0909123456">
              <button className="btn btn-primary btn-lg">
                <Phone size={18} /> Gọi ngay 0909 123 456
              </button>
            </a>
            <Link to="/contact">
              <button className="btn btn-outline btn-lg">
                <MessageCircle size={18} /> Nhắn tin hỗ trợ
              </button>
            </Link>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '.85rem', color: 'var(--color-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '.375rem' }}>
              <Mail size={14} /> hello@floraflower.vn
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '.375rem' }}>
              <MapPin size={14} /> 123 Đường Hoa Hồng, Q.1, TP.HCM
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
