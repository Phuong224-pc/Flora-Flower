# -*- coding: utf-8 -*-
"""
Script tạo file PowerPoint báo cáo đồ án Website Bán Hoa - Flora Flower
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu, Cm
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt
import copy
from lxml import etree

# ── Màu sắc chủ đề ──────────────────────────────────────────────────────────
C_PRIMARY   = RGBColor(0xC9, 0x18, 0x4A)   # #C9184A deep rose
C_ACCENT    = RGBColor(0xFF, 0x4D, 0x6D)   # #FF4D6D
C_LIGHT     = RGBColor(0xFF, 0xCC, 0xD5)   # #FFCCD5
C_BG        = RGBColor(0xFF, 0xF0, 0xF3)   # #FFF0F3
C_DARK      = RGBColor(0x1A, 0x1A, 0x2E)   # #1A1A2E
C_WHITE     = RGBColor(0xFF, 0xFF, 0xFF)
C_GRAY      = RGBColor(0x55, 0x55, 0x55)
C_LIGHTGRAY = RGBColor(0xF5, 0xF5, 0xF5)
C_GOLD      = RGBColor(0xFF, 0xD7, 0x00)

# ── Slide size 16:9 ─────────────────────────────────────────────────────────
SLIDE_W = Cm(33.867)
SLIDE_H = Cm(19.05)

prs = Presentation()
prs.slide_width  = SLIDE_W
prs.slide_height = SLIDE_H

blank_layout = prs.slide_layouts[6]  # completely blank

# ── Helpers ─────────────────────────────────────────────────────────────────

def add_rect(slide, x, y, w, h, fill_color=None, line_color=None, line_width=Pt(0)):
    shape = slide.shapes.add_shape(1, x, y, w, h)  # MSO_SHAPE_TYPE.RECTANGLE
    shape.line.width = line_width
    if fill_color:
        shape.fill.solid()
        shape.fill.fore_color.rgb = fill_color
    else:
        shape.fill.background()
    if line_color:
        shape.line.color.rgb = line_color
    else:
        shape.line.fill.background()
    return shape

def add_textbox(slide, text, x, y, w, h,
                font_name="Calibri", font_size=Pt(18),
                bold=False, italic=False, color=C_DARK,
                align=PP_ALIGN.LEFT, wrap=True, word_wrap=True):
    txb = slide.shapes.add_textbox(x, y, w, h)
    tf  = txb.text_frame
    tf.word_wrap = word_wrap
    tf.auto_size = None
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.name = font_name
    run.font.size = font_size
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = color
    return txb

def add_para(tf, text, font_name="Calibri", font_size=Pt(16),
             bold=False, color=C_DARK, align=PP_ALIGN.LEFT,
             space_before=Pt(4), indent_level=0):
    p = tf.add_paragraph()
    p.alignment = align
    p.space_before = space_before
    p.level = indent_level
    run = p.add_run()
    run.text = text
    run.font.name = font_name
    run.font.size = font_size
    run.font.bold = bold
    run.font.color.rgb = color
    return p

def header_bar(slide, title_text):
    """Thanh header đỏ trên mỗi slide nội dung"""
    bar = add_rect(slide, Cm(0), Cm(0), SLIDE_W, Cm(2.2), fill_color=C_PRIMARY)
    add_textbox(slide, title_text,
                Cm(0.6), Cm(0.2), SLIDE_W - Cm(1.2), Cm(1.9),
                font_size=Pt(26), bold=True, color=C_WHITE,
                align=PP_ALIGN.LEFT)
    # Accent strip
    add_rect(slide, Cm(0), Cm(2.2), SLIDE_W, Cm(0.15), fill_color=C_ACCENT)

def slide_bg(slide, color=C_BG):
    add_rect(slide, Cm(0), Cm(0), SLIDE_W, SLIDE_H, fill_color=color)

def footer(slide, slide_num, total=13):
    add_rect(slide, Cm(0), SLIDE_H - Cm(0.7), SLIDE_W, Cm(0.7), fill_color=C_LIGHT)
    add_textbox(slide, f"Flora Flower  |  Lập Trình Web Nâng Cao  |  {slide_num}/{total}",
                Cm(0.5), SLIDE_H - Cm(0.7), SLIDE_W - Cm(1), Cm(0.65),
                font_size=Pt(9), color=C_PRIMARY, align=PP_ALIGN.CENTER)

def add_hyperlink(shape, url):
    """Thêm hyperlink vào shape"""
    click = shape.click_action
    click.hyperlink.address = url

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 1 – TRANG BÌA
# ════════════════════════════════════════════════════════════════════════════
s1 = prs.slides.add_slide(blank_layout)
slide_bg(s1, C_DARK)

# Gradient-like top banner
add_rect(s1, Cm(0), Cm(0), SLIDE_W, Cm(5.5), fill_color=C_PRIMARY)
add_rect(s1, Cm(0), Cm(5.5), SLIDE_W, Cm(0.3), fill_color=C_ACCENT)

# Decorative circles
add_rect(s1, SLIDE_W - Cm(6), Cm(-1.5), Cm(7), Cm(7),
         fill_color=RGBColor(0xFF, 0x4D, 0x6D))  # rough circle via rect (shape=9 oval)

# Oval decorative
ov = s1.shapes.add_shape(9, SLIDE_W - Cm(5.5), Cm(-1), Cm(6), Cm(6))
ov.fill.solid(); ov.fill.fore_color.rgb = RGBColor(0xFF, 0x85, 0x9A)
ov.line.fill.background()

ov2 = s1.shapes.add_shape(9, Cm(-1.5), SLIDE_H - Cm(4.5), Cm(5), Cm(5))
ov2.fill.solid(); ov2.fill.fore_color.rgb = RGBColor(0x9B, 0x09, 0x33)
ov2.line.fill.background()

# Title
add_textbox(s1, "BÁO CÁO ĐỒ ÁN MÔN HỌC",
            Cm(1), Cm(0.5), SLIDE_W - Cm(8), Cm(1.8),
            font_size=Pt(24), bold=True, color=C_WHITE)

add_textbox(s1, "🌸 WEBSITE BÁN HOA",
            Cm(1), Cm(2.0), SLIDE_W - Cm(8), Cm(2),
            font_size=Pt(38), bold=True, color=C_GOLD)

add_textbox(s1, "FLORA FLOWER",
            Cm(1), Cm(3.8), SLIDE_W - Cm(8), Cm(1.5),
            font_size=Pt(28), bold=True, color=C_LIGHT)

# Subject
add_rect(s1, Cm(1), Cm(6.2), Cm(18), Cm(0.9), fill_color=C_ACCENT)
add_textbox(s1, "Môn học: Lập Trình Web Nâng Cao",
            Cm(1.3), Cm(6.25), Cm(17.5), Cm(0.8),
            font_size=Pt(16), bold=True, color=C_WHITE)

# Members box
add_rect(s1, Cm(1), Cm(7.5), Cm(21), Cm(5.5),
         fill_color=RGBColor(0x2A, 0x2A, 0x3E), line_color=C_ACCENT, line_width=Pt(1.5))

add_textbox(s1, "THÀNH VIÊN NHÓM:",
            Cm(1.5), Cm(7.8), Cm(20), Cm(0.9),
            font_size=Pt(14), bold=True, color=C_LIGHT)

members = [
    ("2474802010414", "VÕ THÀNH TRUNG"),
    ("2474802010458", "TRƯƠNG TRẦN THANH PHƯƠNG"),
    ("2474802010071", "VÕ NGỌC DUY"),
]
for i, (mssv, name) in enumerate(members):
    yy = Cm(8.6) + i * Cm(1.3)
    add_textbox(s1, f"• {mssv} – {name}",
                Cm(1.8), yy, Cm(20), Cm(1.1),
                font_size=Pt(16), bold=(i == 0), color=C_WHITE)

# GVHD
add_textbox(s1, "GVHD: ThS. ĐẶNG ĐÌNH HÒA",
            Cm(1), Cm(13.0), Cm(21), Cm(1.0),
            font_size=Pt(16), bold=True, color=C_GOLD)

# Year
add_textbox(s1, "Năm học: 2024 – 2025",
            Cm(1), Cm(14.0), Cm(21), Cm(0.9),
            font_size=Pt(14), color=C_LIGHT)

# Right logo text
add_textbox(s1, "🌺", SLIDE_W - Cm(7), Cm(6), Cm(6), Cm(6),
            font_size=Pt(80), color=C_WHITE, align=PP_ALIGN.CENTER)

footer(s1, 1)

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 2 – NỘI DUNG THUYẾT TRÌNH
# ════════════════════════════════════════════════════════════════════════════
s2 = prs.slides.add_slide(blank_layout)
slide_bg(s2)
header_bar(s2, "NỘI DUNG THUYẾT TRÌNH")

items = [
    ("01", "Giới thiệu đề tài",         "Website bán hoa là gì? Mục tiêu xây dựng."),
    ("02", "Lý do chọn đề tài",          "Nhu cầu thực tế & ý nghĩa học thuật."),
    ("03", "Công cụ & Ngôn ngữ thiết kế","React, Node.js, MongoDB, Vite..."),
    ("04", "Phân chia công việc",         "Bảng phân công từng thành viên."),
    ("05", "Demo website",               "Truy cập trực tiếp Flora Flower."),
    ("06", "Tổng kết",                   "Kết quả, hạn chế & hướng phát triển."),
    ("07", "Tài liệu tham khảo",         "Nguồn tài liệu sử dụng trong dự án."),
]

col_x  = [Cm(0.8), Cm(16.8)]
col_w  = Cm(15.5)

for i, (num, title, desc) in enumerate(items):
    row = i % 4
    col = i // 4
    yy  = Cm(2.7) + row * Cm(3.9)
    xx  = col_x[col]

    # Number badge
    badge = s2.shapes.add_shape(9, xx, yy + Cm(0.3), Cm(1.4), Cm(1.4))
    badge.fill.solid(); badge.fill.fore_color.rgb = C_PRIMARY
    badge.line.fill.background()
    add_textbox(s2, num, xx, yy + Cm(0.3), Cm(1.4), Cm(1.4),
                font_size=Pt(16), bold=True, color=C_WHITE, align=PP_ALIGN.CENTER)

    add_textbox(s2, title, xx + Cm(1.7), yy + Cm(0.25), col_w - Cm(1.7), Cm(0.85),
                font_size=Pt(17), bold=True, color=C_PRIMARY)
    add_textbox(s2, desc, xx + Cm(1.7), yy + Cm(1.0), col_w - Cm(1.7), Cm(0.75),
                font_size=Pt(12), color=C_GRAY)
    # Separator line
    add_rect(s2, xx, yy + Cm(1.9), col_w, Cm(0.05), fill_color=C_LIGHT)

footer(s2, 2)

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 3 – GIỚI THIỆU ĐỀ TÀI
# ════════════════════════════════════════════════════════════════════════════
s3 = prs.slides.add_slide(blank_layout)
slide_bg(s3)
header_bar(s3, "01 | GIỚI THIỆU ĐỀ TÀI")

# Left column
add_rect(s3, Cm(0.6), Cm(2.6), Cm(15.5), Cm(13.8),
         fill_color=C_WHITE, line_color=C_LIGHT, line_width=Pt(1))

items3 = [
    ("🌸 Flora Flower là gì?",
     "Website thương mại điện tử chuyên bán hoa tươi,\ncho phép khách hàng duyệt, chọn kích cỡ, đặt hàng\nvà thanh toán trực tuyến."),
    ("🎯 Mục tiêu xây dựng",
     "• Chuẩn hóa quy trình đặt hoa online\n• Hỗ trợ chọn size (S/M/L) & hẹn khung giờ giao\n• Gửi thiệp chúc mừng kèm đơn hàng\n• Quản trị shop toàn diện"),
    ("👥 Đối tượng sử dụng",
     "• Khách vãng lai – duyệt & tra cứu đơn hàng\n• Khách hàng thành viên – đặt hàng & theo dõi\n• Quản trị viên – quản lý toàn bộ hệ thống"),
    ("📋 Tổng quan chức năng",
     "Hệ thống đầy đủ: Duyệt SP → Giỏ hàng\n→ Thanh toán → Quản lý đơn → Admin Dashboard"),
]

for i, (title, desc) in enumerate(items3):
    yy = Cm(3.0) + i * Cm(3.2)
    add_textbox(s3, title, Cm(0.9), yy, Cm(14.8), Cm(0.85),
                font_size=Pt(15), bold=True, color=C_PRIMARY)
    add_textbox(s3, desc, Cm(0.9), yy + Cm(0.85), Cm(14.8), Cm(2.2),
                font_size=Pt(13), color=C_DARK)
    if i < 3:
        add_rect(s3, Cm(0.9), yy + Cm(3.0), Cm(14.8), Cm(0.04), fill_color=C_LIGHT)

# Right panel
add_rect(s3, Cm(16.8), Cm(2.6), Cm(16.5), Cm(13.8), fill_color=C_PRIMARY)
add_textbox(s3, "🌺", Cm(16.8), Cm(3.5), Cm(16.5), Cm(5),
            font_size=Pt(80), color=C_WHITE, align=PP_ALIGN.CENTER)
add_textbox(s3, "FLORA\nFLOWER",
            Cm(17.5), Cm(8.5), Cm(15), Cm(3),
            font_size=Pt(32), bold=True, color=C_WHITE, align=PP_ALIGN.CENTER)

stats = [("11", "Chức năng\nUser"), ("8", "Chức năng\nAdmin"), ("2", "Chế độ\nDatabase")]
for i, (num, label) in enumerate(stats):
    xx = Cm(17.5) + i * Cm(5)
    add_rect(s3, xx, Cm(11.8), Cm(4.5), Cm(3.5),
             fill_color=RGBColor(0x9B, 0x09, 0x33))
    add_textbox(s3, num, xx, Cm(12.0), Cm(4.5), Cm(1.5),
                font_size=Pt(26), bold=True, color=C_GOLD, align=PP_ALIGN.CENTER)
    add_textbox(s3, label, xx, Cm(13.3), Cm(4.5), Cm(1.5),
                font_size=Pt(11), color=C_LIGHT, align=PP_ALIGN.CENTER)

footer(s3, 3)

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 4 – LÝ DO CHỌN ĐỀ TÀI
# ════════════════════════════════════════════════════════════════════════════
s4 = prs.slides.add_slide(blank_layout)
slide_bg(s4)
header_bar(s4, "02 | LÝ DO CHỌN ĐỀ TÀI")

reasons = [
    ("📈", "Nhu cầu mua hoa online tăng cao",
     "Thị trường hoa tươi ngày càng dịch chuyển sang kênh trực tuyến,\nđặc biệt vào các dịp lễ, Tết, sinh nhật, kỷ niệm."),
    ("⏰", "Hoa là mặt hàng có tính thời điểm",
     "Khách cần đặt trước, chọn khung giờ giao chính xác –\nyêu cầu hệ thống đặt hàng linh hoạt và thông minh."),
    ("💻", "Áp dụng công nghệ học được vào thực tế",
     "Dự án là cơ hội tích hợp React, Node.js, MongoDB,\nJWT, REST API trong một hệ thống fullstack hoàn chỉnh."),
    ("🎓", "Xây dựng portfolio thực tế",
     "Hệ thống có deploy lên cloud (Render), source code\ntrên GitHub – sẵn sàng để trình bày và phát triển thêm."),
]

for i, (icon, title, desc) in enumerate(reasons):
    col = i % 2
    row = i // 2
    xx  = Cm(0.8) + col * Cm(16.5)
    yy  = Cm(2.9) + row * Cm(7.5)

    add_rect(s4, xx, yy, Cm(15.8), Cm(7),
             fill_color=C_WHITE, line_color=C_PRIMARY, line_width=Pt(1.5))
    add_rect(s4, xx, yy, Cm(15.8), Cm(1.1), fill_color=C_PRIMARY)

    add_textbox(s4, f"{icon}  {title}", xx + Cm(0.3), yy + Cm(0.1),
                Cm(15), Cm(1.0), font_size=Pt(15), bold=True, color=C_WHITE)
    add_textbox(s4, desc, xx + Cm(0.4), yy + Cm(1.4),
                Cm(15), Cm(5.3), font_size=Pt(14), color=C_DARK)

footer(s4, 4)

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 5 – CÔNG CỤ VÀ NGÔN NGỮ THIẾT KẾ
# ════════════════════════════════════════════════════════════════════════════
s5 = prs.slides.add_slide(blank_layout)
slide_bg(s5)
header_bar(s5, "03 | CÔNG CỤ & NGÔN NGỮ THIẾT KẾ")

tech_groups = [
    ("⚛️ Frontend", C_PRIMARY, [
        "React 18.3.1 + Vite 5.4.0",
        "React Router DOM v6",
        "Zustand 4.5.0 (State management)",
        "Tailwind CSS (Styling)",
        "Recharts 2.12.0 (Biểu đồ)",
        "Axios 1.7.0 (HTTP Client)",
        "React Hook Form 7.53.0",
        "Lucide React (Icons)",
    ]),
    ("🖥️ Backend", RGBColor(0x14, 0x63, 0x96), [
        "Node.js + Express 4.19.2",
        "JWT (jsonwebtoken 9.0.2)",
        "bcrypt 5.1.1 (Mã hóa mật khẩu)",
        "Multer 1.4.5 (Upload ảnh)",
        "UUID 9.0.1",
        "CORS, dotenv",
        "Mongoose 8.3.4 (MongoDB ODM)",
    ]),
    ("🗄️ Database", RGBColor(0x2E, 0x7D, 0x32), [
        "MongoDB Atlas (cloud)",
        "Local JSON File (dev mode)",
        "Dual-mode DB Adapter Pattern",
        "(env: DB_MODE=local|mongo)",
    ]),
    ("🛠️ Công cụ & API", RGBColor(0x6A, 0x1B, 0x9A), [
        "Git + GitHub (Version control)",
        "Render (Cloud deployment)",
        "VS Code (IDE)",
        "img.vietqr.io (QR thanh toán)",
        "npm (Package manager)",
    ]),
]

positions = [
    (Cm(0.5),  Cm(2.5)),
    (Cm(8.6),  Cm(2.5)),
    (Cm(16.7), Cm(2.5)),
    (Cm(24.5), Cm(2.5)),
]

for idx, ((title, color, items), (xx, yy)) in enumerate(zip(tech_groups, positions)):
    card_w = Cm(7.8)
    card_h = Cm(16.0)
    add_rect(s5, xx, yy, card_w, card_h,
             fill_color=C_WHITE, line_color=color, line_width=Pt(2))
    # Header
    add_rect(s5, xx, yy, card_w, Cm(1.2), fill_color=color)
    add_textbox(s5, title, xx + Cm(0.2), yy + Cm(0.1), card_w - Cm(0.4), Cm(1.1),
                font_size=Pt(13), bold=True, color=C_WHITE)
    for j, item in enumerate(items):
        iy = yy + Cm(1.5) + j * Cm(1.65)
        # bullet
        add_rect(s5, xx + Cm(0.3), iy + Cm(0.35), Cm(0.25), Cm(0.25), fill_color=color)
        add_textbox(s5, item, xx + Cm(0.75), iy, card_w - Cm(1.0), Cm(1.5),
                    font_size=Pt(12), color=C_DARK)

footer(s5, 5)

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 6 – KIẾN TRÚC VÀ QUY TRÌNH HOẠT ĐỘNG
# ════════════════════════════════════════════════════════════════════════════
s6 = prs.slides.add_slide(blank_layout)
slide_bg(s6)
header_bar(s6, "03 | KIẾN TRÚC & QUY TRÌNH HOẠT ĐỘNG")

# Architecture diagram using shapes
def arch_box(slide, label, sublabel, x, y, w=Cm(5), h=Cm(2.2), color=C_PRIMARY):
    add_rect(slide, x, y, w, h, fill_color=color,
             line_color=RGBColor(0xFF,0xFF,0xFF), line_width=Pt(1))
    add_textbox(slide, label, x, y + Cm(0.2), w, Cm(1.0),
                font_size=Pt(13), bold=True, color=C_WHITE, align=PP_ALIGN.CENTER)
    if sublabel:
        add_textbox(slide, sublabel, x, y + Cm(1.1), w, Cm(1.0),
                    font_size=Pt(10), color=C_LIGHT, align=PP_ALIGN.CENTER)

def arrow(slide, x1, y, x2, label=""):
    add_rect(slide, x1, y + Cm(0.9), x2 - x1, Cm(0.1), fill_color=C_ACCENT)
    if label:
        add_textbox(slide, label, x1, y + Cm(0.0), x2-x1, Cm(0.75),
                    font_size=Pt(9), color=C_GRAY, align=PP_ALIGN.CENTER)

# Row 1: Main flow
y1 = Cm(2.8)
arch_box(s6, "🌐 BROWSER", "Người dùng", Cm(0.5), y1, color=C_DARK)
arrow(s6, Cm(5.6), y1, Cm(7.0), "HTTPS")
arch_box(s6, "⚛️ React SPA", "Vite Build", Cm(7.0), y1, color=C_PRIMARY)
arrow(s6, Cm(12.1), y1, Cm(13.5), "Axios")
arch_box(s6, "🖥️ Express API", "Node.js", Cm(13.5), y1, color=RGBColor(0x14,0x63,0x96))
arrow(s6, Cm(18.6), y1, Cm(20.0), "DB Call")
arch_box(s6, "🗄️ DB Adapter", "local/mongo", Cm(20.0), y1, color=RGBColor(0x2E,0x7D,0x32))
arrow(s6, Cm(25.1), y1, Cm(26.5), "")
arch_box(s6, "📂 JSON / 🍃 MongoDB", "", Cm(26.5), y1, Cm(6.8), color=RGBColor(0x2E,0x7D,0x32))

# Auth flow
add_rect(s6, Cm(0.5), Cm(6.0), SLIDE_W - Cm(1), Cm(0.08), fill_color=C_LIGHT)
add_textbox(s6, "🔐 Luồng Xác thực (JWT)",
            Cm(0.5), Cm(6.2), Cm(10), Cm(0.7),
            font_size=Pt(14), bold=True, color=C_PRIMARY)

auth_steps = [
    ("Đăng nhập", "POST /api/auth/login"),
    ("Xác thực", "bcrypt compare"),
    ("Cấp JWT", "jsonwebtoken.sign()"),
    ("Lưu token", "localStorage"),
    ("Gửi request", "Bearer Token header"),
    ("Middleware", "requireAdmin / requireCustomer"),
]
for i, (step, detail) in enumerate(auth_steps):
    xx = Cm(0.5) + i * Cm(5.5)
    add_rect(s6, xx, Cm(7.0), Cm(5.2), Cm(1.9),
             fill_color=C_WHITE, line_color=C_PRIMARY, line_width=Pt(1))
    add_textbox(s6, step, xx + Cm(0.1), Cm(7.1), Cm(5.0), Cm(0.8),
                font_size=Pt(12), bold=True, color=C_PRIMARY)
    add_textbox(s6, detail, xx + Cm(0.1), Cm(7.8), Cm(5.0), Cm(0.9),
                font_size=Pt(10), color=C_GRAY)
    if i < 5:
        add_textbox(s6, "→", xx + Cm(5.2), Cm(7.3), Cm(0.5), Cm(0.9),
                    font_size=Pt(16), bold=True, color=C_PRIMARY)

# File upload flow
add_textbox(s6, "📁 Upload ảnh: Multer → server/uploads/products/  |  📦 Static files: client/dist → Express serve SPA",
            Cm(0.5), Cm(9.2), SLIDE_W - Cm(1), Cm(0.9),
            font_size=Pt(13), color=C_DARK)

# Order flow
add_textbox(s6, "🛒 Luồng Đặt hàng:",
            Cm(0.5), Cm(10.3), Cm(6), Cm(0.7),
            font_size=Pt(14), bold=True, color=C_PRIMARY)

order_steps = ["Chọn SP & Size", "Thêm giỏ hàng\n(Zustand)", "Nhập địa chỉ\n& Hẹn giờ", "Chọn thanh toán\n(COD/QR/Demo)", "Tạo đơn hàng\nPOST /api/orders", "Admin cập nhật\ntrạng thái"]
colors_o = [C_PRIMARY, C_ACCENT, RGBColor(0xFF,0x85,0x9A), C_PRIMARY, C_ACCENT, RGBColor(0xFF,0x85,0x9A)]
for i, (step, col) in enumerate(zip(order_steps, colors_o)):
    xx = Cm(0.5) + i * Cm(5.5)
    add_rect(s6, xx, Cm(11.1), Cm(5.2), Cm(2.6), fill_color=col)
    add_textbox(s6, step, xx + Cm(0.1), Cm(11.3), Cm(5.0), Cm(2.2),
                font_size=Pt(12), bold=True, color=C_WHITE, align=PP_ALIGN.CENTER)
    if i < 5:
        add_textbox(s6, "→", xx + Cm(5.2), Cm(11.9), Cm(0.5), Cm(0.9),
                    font_size=Pt(16), bold=True, color=C_PRIMARY)

footer(s6, 6)

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 7 – CHỨC NĂNG USER
# ════════════════════════════════════════════════════════════════════════════
s7 = prs.slides.add_slide(blank_layout)
slide_bg(s7)
header_bar(s7, "04 | CÁC CHỨC NĂNG CHÍNH – NGƯỜI DÙNG (USER)")

user_features = [
    ("🔍", "Duyệt & Tìm kiếm sản phẩm",   "Lọc theo dịp, loại, giá, tình trạng; sắp xếp nhiều tiêu chí"),
    ("🌸", "Chọn biến thể kích cỡ",         "S / M / L — giá tự động cập nhật theo size"),
    ("🛒", "Giỏ hàng (Zustand persist)",    "Thêm, sửa số lượng, xóa sản phẩm; lưu localStorage"),
    ("❤️", "Danh sách yêu thích",           "Lưu sản phẩm yêu thích, persist localStorage"),
    ("🕐", "Sản phẩm vừa xem",              "Tối đa 12 sản phẩm gần nhất (localStorage)"),
    ("👤", "Đăng ký / Đăng nhập",           "JWT authentication, cập nhật hồ sơ cá nhân"),
    ("📝", "Đặt hàng 2 bước",               "Thông tin giao nhận + hẹn khung giờ + thiệp chúc"),
    ("💳", "Thanh toán đa hình thức",       "COD / QR VietQR (img.vietqr.io) / Demo online"),
    ("🎟️", "Mã giảm giá (Coupon)",         "Kiểm tra minOrder, hạn dùng, số lần tối đa"),
    ("📦", "Lịch sử & Hủy đơn hàng",       "Xem trạng thái, hủy đơn Pending/Confirmed"),
    ("🔎", "Tra cứu đơn không đăng nhập",  "Nhập mã đơn + SĐT để tra cứu công khai"),
]

cols = [user_features[:6], user_features[6:]]
col_xs = [Cm(0.5), Cm(17.0)]

for ci, (col_items, cx) in enumerate(zip(cols, col_xs)):
    for i, (icon, title, desc) in enumerate(col_items):
        yy = Cm(2.6) + i * Cm(2.65)
        add_rect(s7, cx, yy, Cm(16.0), Cm(2.5),
                 fill_color=C_WHITE, line_color=C_LIGHT, line_width=Pt(0.5))
        add_rect(s7, cx, yy, Cm(0.4), Cm(2.5), fill_color=C_PRIMARY)
        add_textbox(s7, icon, cx + Cm(0.6), yy + Cm(0.1), Cm(1.5), Cm(1.2),
                    font_size=Pt(18), color=C_PRIMARY)
        add_textbox(s7, title, cx + Cm(2.0), yy + Cm(0.15), Cm(13.5), Cm(0.85),
                    font_size=Pt(14), bold=True, color=C_DARK)
        add_textbox(s7, desc, cx + Cm(2.0), yy + Cm(0.9), Cm(13.5), Cm(1.3),
                    font_size=Pt(12), color=C_GRAY)

footer(s7, 7)

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 8 – CHỨC NĂNG ADMIN
# ════════════════════════════════════════════════════════════════════════════
s8 = prs.slides.add_slide(blank_layout)
slide_bg(s8)
header_bar(s8, "04 | CÁC CHỨC NĂNG CHÍNH – QUẢN TRỊ VIÊN (ADMIN)")

admin_features = [
    ("📊", "Dashboard thống kê",         "Đếm đơn 7 trạng thái, doanh thu, top SP;\nBiểu đồ Recharts (line, bar, pie)"),
    ("📋", "Quản lý đơn hàng",           "Xem tất cả đơn, lọc trạng thái;\ncập nhật 7 trạng thái + trạng thái thanh toán"),
    ("🌺", "Quản lý sản phẩm",           "CRUD đầy đủ, biến thể size/giá/kho;\nUpload tối đa 10 ảnh (Multer), auto slug"),
    ("🎪", "Quản lý dịp tặng hoa",       "CRUD danh mục theo dịp, icon, banner,\nslug, thứ tự hiển thị"),
    ("👥", "Quản lý khách hàng",         "Danh sách KH với số đơn,\nhồ sơ chi tiết + lịch sử mua sắm"),
    ("🎟️", "Quản lý mã giảm giá",       "Tạo / xóa mã; hỗ trợ % hoặc tiền;\nminOrder, maxUses, hạn sử dụng"),
    ("⚙️", "Cài đặt hệ thống",          "Thông tin shop, phí ship,\ntài khoản VietQR cho QR thanh toán"),
]

for i, (icon, title, desc) in enumerate(admin_features):
    col = i % 2
    row = i // 2
    xx  = Cm(0.5) + col * Cm(16.5)
    yy  = Cm(2.6) + row * Cm(4.0)

    if i == 6:  # last item centered
        xx = Cm(8.5)

    add_rect(s8, xx, yy, Cm(16.0), Cm(3.7),
             fill_color=C_WHITE, line_color=C_PRIMARY, line_width=Pt(1.2))
    add_rect(s8, xx, yy, Cm(16.0), Cm(1.1), fill_color=C_PRIMARY)
    add_textbox(s8, f"{icon}  {title}",
                xx + Cm(0.3), yy + Cm(0.1), Cm(15.5), Cm(1.0),
                font_size=Pt(14), bold=True, color=C_WHITE)
    add_textbox(s8, desc, xx + Cm(0.4), yy + Cm(1.3), Cm(15.2), Cm(2.2),
                font_size=Pt(13), color=C_DARK)

footer(s8, 8)

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 9 – PHÂN CHIA CÔNG VIỆC
# ════════════════════════════════════════════════════════════════════════════
s9 = prs.slides.add_slide(blank_layout)
slide_bg(s9)
header_bar(s9, "04 | PHÂN CHIA CÔNG VIỆC")

# Table
headers = ["STT", "MSSV", "Họ và tên", "Phân công công việc"]
col_ws  = [Cm(1.8), Cm(5.5), Cm(8.5), Cm(17.5)]
col_xs9 = [Cm(0.6)]
for cw in col_ws[:-1]:
    col_xs9.append(col_xs9[-1] + cw)

rows_data = [
    ("01", "2474802010414", "Võ Thành Trung",          "[Điền thông tin]"),
    ("02", "2474802010458", "Trương Trần Thanh Phương", "[Điền thông tin]"),
    ("03", "2474802010071", "Võ Ngọc Duy",              "[Điền thông tin]"),
]

# Header row
header_y = Cm(3.0)
for ci, (hdr, cw, cx) in enumerate(zip(headers, col_ws, col_xs9)):
    add_rect(s9, cx, header_y, cw - Cm(0.05), Cm(1.1), fill_color=C_PRIMARY)
    add_textbox(s9, hdr, cx + Cm(0.1), header_y + Cm(0.05), cw - Cm(0.2), Cm(1.0),
                font_size=Pt(14), bold=True, color=C_WHITE, align=PP_ALIGN.CENTER)

for ri, (stt, mssv, name, work) in enumerate(rows_data):
    ry = header_y + Cm(1.15) + ri * Cm(4.4)
    row_data = [stt, mssv, name, work]
    bg = C_WHITE if ri % 2 == 0 else C_LIGHTGRAY
    for ci, (cell, cw, cx) in enumerate(zip(row_data, col_ws, col_xs9)):
        add_rect(s9, cx, ry, cw - Cm(0.05), Cm(4.3),
                 fill_color=bg, line_color=C_LIGHT, line_width=Pt(0.5))
        font_sz = Pt(13) if ci < 3 else Pt(12)
        col_val = C_PRIMARY if ci == 2 else (RGBColor(0xAA,0xAA,0xAA) if ci == 3 else C_DARK)
        add_textbox(s9, cell, cx + Cm(0.15), ry + Cm(0.2), cw - Cm(0.3), Cm(3.9),
                    font_size=font_sz, color=col_val, bold=(ci == 2),
                    align=PP_ALIGN.CENTER if ci < 2 else PP_ALIGN.LEFT)

add_textbox(s9, "* Sinh viên tự điền phân công công việc thực tế của từng thành viên.",
            Cm(0.6), Cm(17.0), SLIDE_W - Cm(1.2), Cm(0.9),
            font_size=Pt(11), italic=True, color=C_GRAY)

footer(s9, 9)

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 10 – DEMO WEBSITE (1 SLIDE ONLY)
# ════════════════════════════════════════════════════════════════════════════
s10 = prs.slides.add_slide(blank_layout)
slide_bg(s10, C_DARK)

# Background decorative
add_rect(s10, Cm(0), Cm(0), SLIDE_W, Cm(3.0), fill_color=C_PRIMARY)
add_rect(s10, Cm(0), Cm(3.0), SLIDE_W, Cm(0.2), fill_color=C_ACCENT)

ov10a = s10.shapes.add_shape(9, SLIDE_W - Cm(8), Cm(-2), Cm(9), Cm(9))
ov10a.fill.solid(); ov10a.fill.fore_color.rgb = RGBColor(0x9B, 0x09, 0x33)
ov10a.line.fill.background()

# Title
add_textbox(s10, "🌸 DEMO WEBSITE BÁN HOA",
            Cm(0.8), Cm(0.3), SLIDE_W - Cm(9), Cm(1.5),
            font_size=Pt(28), bold=True, color=C_WHITE, align=PP_ALIGN.LEFT)
add_textbox(s10, "FLORA FLOWER",
            Cm(0.8), Cm(1.7), SLIDE_W - Cm(9), Cm(1.1),
            font_size=Pt(20), bold=True, color=C_GOLD, align=PP_ALIGN.LEFT)

# URL display
add_textbox(s10, "🌐  https://flora-flower.onrender.com",
            Cm(1), Cm(3.5), SLIDE_W - Cm(2), Cm(1.2),
            font_size=Pt(20), bold=True, color=C_LIGHT, align=PP_ALIGN.CENTER)

# BIG BUTTON
btn_shape = s10.shapes.add_shape(1, Cm(5), Cm(5.2), Cm(24), Cm(3.5))
btn_shape.fill.solid()
btn_shape.fill.fore_color.rgb = C_PRIMARY
btn_shape.line.color.rgb = C_GOLD
btn_shape.line.width = Pt(2.5)

tf_btn = btn_shape.text_frame
tf_btn.word_wrap = False
p_btn = tf_btn.paragraphs[0]
p_btn.alignment = PP_ALIGN.CENTER
run_btn = p_btn.add_run()
run_btn.text = "🚀  TRUY CẬP WEBSITE – LIVE DEMO"
run_btn.font.name = "Calibri"
run_btn.font.size = Pt(24)
run_btn.font.bold = True
run_btn.font.color.rgb = C_WHITE

# Add hyperlink to button
click_action = btn_shape.click_action
click_action.hyperlink.address = "https://flora-flower.onrender.com"

# 4 demo items
demo_items = [
    ("👤 Giao diện Khách hàng",  "Trang chủ, Cửa hàng, Lọc sản phẩm,\nChi tiết sản phẩm, Chọn size"),
    ("🛒 Quy trình Mua hàng",    "Giỏ hàng → Checkout 2 bước\n→ QR VietQR → Xác nhận đơn"),
    ("🔐 Giao diện Quản trị",    "Dashboard biểu đồ, Quản lý đơn hàng,\nSản phẩm, Khách hàng, Coupon"),
    ("⭐ Tính năng Nổi bật",     "Coupon, Tra cứu đơn, Hẹn khung giờ,\nDual-mode Database"),
]

for i, (title, desc) in enumerate(demo_items):
    xx = Cm(0.5) + i * Cm(8.4)
    yy = Cm(9.2)
    add_rect(s10, xx, yy, Cm(8.0), Cm(5.5),
             fill_color=RGBColor(0x2A, 0x2A, 0x3E),
             line_color=C_ACCENT, line_width=Pt(1))
    add_rect(s10, xx, yy, Cm(8.0), Cm(0.9), fill_color=C_ACCENT)
    add_textbox(s10, title, xx + Cm(0.2), yy + Cm(0.0), Cm(7.6), Cm(0.9),
                font_size=Pt(13), bold=True, color=C_WHITE)
    add_textbox(s10, desc, xx + Cm(0.3), yy + Cm(1.1), Cm(7.4), Cm(4.2),
                font_size=Pt(12), color=C_LIGHT)

footer(s10, 10)

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 11 – TỔNG KẾT
# ════════════════════════════════════════════════════════════════════════════
s11 = prs.slides.add_slide(blank_layout)
slide_bg(s11)
header_bar(s11, "06 | TỔNG KẾT")

# Kết quả đạt được
add_rect(s11, Cm(0.5), Cm(2.5), Cm(16.0), Cm(14.5),
         fill_color=C_WHITE, line_color=C_PRIMARY, line_width=Pt(1.5))
add_rect(s11, Cm(0.5), Cm(2.5), Cm(16.0), Cm(1.0), fill_color=RGBColor(0x2E,0x7D,0x32))
add_textbox(s11, "✅ KẾT QUẢ ĐẠT ĐƯỢC",
            Cm(0.7), Cm(2.55), Cm(15.5), Cm(0.9),
            font_size=Pt(14), bold=True, color=C_WHITE)

achieved = [
    "🌐 Fullstack SPA: React (Vite) + Express REST API",
    "🗄️ Dual-mode Database Adapter (Local JSON / MongoDB)",
    "🔐 JWT Authentication + RBAC phân quyền User/Admin",
    "🛒 Quy trình đặt hàng hoàn chỉnh 2 bước",
    "💳 VietQR payment (img.vietqr.io), COD, Demo Online",
    "📊 Admin Dashboard với Recharts (line, bar, pie charts)",
    "📁 Upload ảnh Multer, 10 ảnh/sản phẩm",
    "🎟️ Hệ thống Coupon kiểm tra điều kiện đầy đủ",
    "🔎 Tra cứu đơn hàng không cần đăng nhập",
    "☁️ Deploy thành công lên Render: flora-flower.onrender.com",
]
for i, item in enumerate(achieved):
    add_textbox(s11, item, Cm(0.8), Cm(3.65) + i * Cm(1.3), Cm(15.5), Cm(1.2),
                font_size=Pt(12), color=C_DARK)

# Hạn chế
add_rect(s11, Cm(17.0), Cm(2.5), Cm(16.3), Cm(7.0),
         fill_color=C_WHITE, line_color=C_ACCENT, line_width=Pt(1.5))
add_rect(s11, Cm(17.0), Cm(2.5), Cm(16.3), Cm(1.0), fill_color=C_PRIMARY)
add_textbox(s11, "⚠️ HẠN CHẾ",
            Cm(17.2), Cm(2.55), Cm(16), Cm(0.9),
            font_size=Pt(14), bold=True, color=C_WHITE)

limits = [
    "Review sản phẩm: UI có nhưng backend chưa\ntriển khai (không có bảng Reviews trong DB)",
    "VietQR thủ công: chưa có webhook xác nhận\nthanh toán tự động",
    "Local JSON DB: có thể xung đột khi nhiều\nrequest đồng thời (race condition)",
    "Chưa có email thông báo đơn hàng",
]
for i, item in enumerate(limits):
    add_textbox(s11, f"• {item}", Cm(17.2), Cm(3.65) + i * Cm(1.55), Cm(16.0), Cm(1.5),
                font_size=Pt(12), color=C_DARK)

# Hướng phát triển
add_rect(s11, Cm(17.0), Cm(9.8), Cm(16.3), Cm(7.2),
         fill_color=C_WHITE, line_color=RGBColor(0x14,0x63,0x96), line_width=Pt(1.5))
add_rect(s11, Cm(17.0), Cm(9.8), Cm(16.3), Cm(1.0), fill_color=RGBColor(0x14,0x63,0x96))
add_textbox(s11, "🚀 HƯỚNG PHÁT TRIỂN",
            Cm(17.2), Cm(9.85), Cm(16.0), Cm(0.9),
            font_size=Pt(14), bold=True, color=C_WHITE)

futures = [
    "💳 Tích hợp webhook thanh toán tự động\n(SePAY / VNPay / MoMo)",
    "⭐ Hệ thống đánh giá & review sản phẩm",
    "📱 Thông báo Telegram/Email khi có đơn mới",
    "🔄 Chuyển hoàn toàn sang MongoDB Atlas",
    "📲 Responsive mobile / PWA",
]
for i, item in enumerate(futures):
    add_textbox(s11, f"• {item}", Cm(17.2), Cm(10.95) + i * Cm(1.2), Cm(16.0), Cm(1.15),
                font_size=Pt(12), color=C_DARK)

footer(s11, 11)

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 12 – TÀI LIỆU THAM KHẢO
# ════════════════════════════════════════════════════════════════════════════
s12 = prs.slides.add_slide(blank_layout)
slide_bg(s12)
header_bar(s12, "07 | TÀI LIỆU THAM KHẢO")

refs = [
    ("⚛️ React.js Documentation",  "https://react.dev"),
    ("⚡ Vite Build Tool",          "https://vitejs.dev"),
    ("🐻 Zustand State Management", "https://zustand-demo.pmnd.rs"),
    ("🖥️ Express.js Framework",    "https://expressjs.com"),
    ("🍃 MongoDB Documentation",    "https://www.mongodb.com/docs"),
    ("📊 Recharts Library",         "https://recharts.org"),
    ("💳 VietQR API",              "https://vietqr.io"),
    ("🔐 JSON Web Token (JWT)",     "https://jwt.io"),
    ("☁️ Render Deployment",       "https://render.com/docs"),
    ("🐙 GitHub Repository",        "https://github.com/Phuong224-pc/Flora-Flower"),
]

for i, (title, url) in enumerate(refs):
    col = i % 2
    row = i // 2
    xx = Cm(0.5) + col * Cm(16.5)
    yy = Cm(2.6) + row * Cm(2.9)

    add_rect(s12, xx, yy, Cm(16.0), Cm(2.7),
             fill_color=C_WHITE, line_color=C_LIGHT, line_width=Pt(0.5))
    add_rect(s12, xx, yy, Cm(0.5), Cm(2.7), fill_color=C_PRIMARY)
    add_textbox(s12, title, xx + Cm(0.8), yy + Cm(0.2), Cm(14.8), Cm(0.9),
                font_size=Pt(14), bold=True, color=C_PRIMARY)
    add_textbox(s12, url, xx + Cm(0.8), yy + Cm(1.0), Cm(14.8), Cm(0.9),
                font_size=Pt(13), color=C_GRAY)

footer(s12, 12)

# ════════════════════════════════════════════════════════════════════════════
# SLIDE 13 – CẢM ƠN / Q&A
# ════════════════════════════════════════════════════════════════════════════
s13 = prs.slides.add_slide(blank_layout)
slide_bg(s13, C_DARK)

add_rect(s13, Cm(0), Cm(0), SLIDE_W, Cm(4.5), fill_color=C_PRIMARY)
add_rect(s13, Cm(0), Cm(4.5), SLIDE_W, Cm(0.3), fill_color=C_ACCENT)

ov13 = s13.shapes.add_shape(9, Cm(-2), Cm(-2), Cm(8), Cm(8))
ov13.fill.solid(); ov13.fill.fore_color.rgb = RGBColor(0x9B, 0x09, 0x33)
ov13.line.fill.background()

ov13b = s13.shapes.add_shape(9, SLIDE_W - Cm(6), SLIDE_H - Cm(6), Cm(8), Cm(8))
ov13b.fill.solid(); ov13b.fill.fore_color.rgb = RGBColor(0x9B, 0x09, 0x33)
ov13b.line.fill.background()

add_textbox(s13, "🌸 CẢM ƠN THẦY VÀ CÁC BẠN",
            Cm(1), Cm(0.5), SLIDE_W - Cm(2), Cm(2.0),
            font_size=Pt(36), bold=True, color=C_WHITE, align=PP_ALIGN.CENTER)
add_textbox(s13, "ĐÃ LẮNG NGHE!",
            Cm(1), Cm(2.3), SLIDE_W - Cm(2), Cm(1.6),
            font_size=Pt(28), bold=True, color=C_GOLD, align=PP_ALIGN.CENTER)

# Q&A Box
add_rect(s13, Cm(4), Cm(5.2), Cm(26), Cm(5.5),
         fill_color=RGBColor(0x2A, 0x2A, 0x3E),
         line_color=C_ACCENT, line_width=Pt(2))
add_textbox(s13, "❓  Q & A",
            Cm(4), Cm(5.5), Cm(26), Cm(2.0),
            font_size=Pt(40), bold=True, color=C_WHITE, align=PP_ALIGN.CENTER)
add_textbox(s13, "Câu hỏi và Giải đáp",
            Cm(4), Cm(7.3), Cm(26), Cm(1.5),
            font_size=Pt(20), color=C_LIGHT, align=PP_ALIGN.CENTER)

# Team
add_textbox(s13, "NHÓM THỰC HIỆN:",
            Cm(1), Cm(11.5), Cm(32), Cm(0.9),
            font_size=Pt(14), bold=True, color=C_LIGHT, align=PP_ALIGN.CENTER)

team_text = "VÕ THÀNH TRUNG  •  TRƯƠNG TRẦN THANH PHƯƠNG  •  VÕ NGỌC DUY"
add_textbox(s13, team_text,
            Cm(1), Cm(12.3), SLIDE_W - Cm(2), Cm(1.0),
            font_size=Pt(16), bold=True, color=C_WHITE, align=PP_ALIGN.CENTER)

add_textbox(s13, "Website: https://flora-flower.onrender.com",
            Cm(1), Cm(13.5), SLIDE_W - Cm(2), Cm(0.9),
            font_size=Pt(14), color=C_GOLD, align=PP_ALIGN.CENTER)

add_textbox(s13, "GitHub: https://github.com/Phuong224-pc/Flora-Flower",
            Cm(1), Cm(14.3), SLIDE_W - Cm(2), Cm(0.9),
            font_size=Pt(13), color=C_LIGHT, align=PP_ALIGN.CENTER)

footer(s13, 13)

# ════════════════════════════════════════════════════════════════════════════
# LƯU FILE
# ════════════════════════════════════════════════════════════════════════════
output_path = r"d:\shophoa\Bao_Cao_Do_An_Website_Ban_Hoa.pptx"
prs.save(output_path)
print(f"✅ Đã tạo file: {output_path}")
print(f"📊 Tổng số slide: {len(prs.slides)}")

