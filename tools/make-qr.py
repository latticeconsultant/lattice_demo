#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sinh mã QR trỏ về trang đăng ký chẩn đoán.

    python3 tools/make-qr.py

Ghi ra assets/img/qr-dang-ky.svg (bản Việt) và assets/img/qr-register.svg (bản Anh).

Sinh sẵn thành file thay vì vẽ bằng JS trên trình duyệt: trang phải in ra PDF
được (nút IN / PDF trên thanh xem thử) và phải hiện đúng cả khi mất mạng. Dùng
SVG để in khổ lớn không vỡ nét.

Mức sửa lỗi Q (phục hồi được 25%) cho chắc khi quét từ màn hình hoặc bản in mờ.
"""

import os
import re
import sys

import qrcode
from qrcode.image.svg import SvgPathImage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'assets', 'img')

MUC = [
    ('qr-dang-ky.svg', 'https://lattice.business/dang-ky/'),
    ('qr-register.svg', 'https://lattice.business/register/'),
]

MUC_IN = '#201E1D'   # màu mực thương hiệu


def sinh(ten, url):
    qr = qrcode.QRCode(
        error_correction=qrcode.constants.ERROR_CORRECT_Q,
        box_size=10,
        border=2,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(image_factory=SvgPathImage)

    from io import BytesIO
    buf = BytesIO()
    img.save(buf)
    svg = buf.getvalue().decode('utf-8')

    # Bỏ khai báo XML để nhúng thẳng vào HTML được, và đặt màu theo thương hiệu.
    # Phải THAY fill có sẵn chứ không chèn thêm: hai thuộc tính fill trên cùng một
    # thẻ là XML không hợp lệ, trình duyệt bỏ luôn ảnh mà không báo lỗi gì.
    svg = re.sub(r'<\?xml[^>]*\?>\s*', '', svg)
    svg, n = re.subn(r'fill="#0{6}"', 'fill="%s"' % MUC_IN, svg)
    if n != 1:
        raise SystemExit('Không tìm thấy đúng một thuộc tính fill để đổi màu (thấy %d)' % n)
    svg = svg.replace('<svg ', '<svg role="img" aria-label="Ma QR trang dang ky" ', 1)

    # Kiểm tra XML hợp lệ trước khi ghi — ảnh hỏng thì trên trang chỉ là ô trống.
    import xml.etree.ElementTree as ET
    ET.fromstring(svg)

    duong = os.path.join(OUT_DIR, ten)
    with open(duong, 'w', encoding='utf-8') as f:
        f.write(svg)
    print('%-18s %-42s %d byte · version %d' % (ten, url, len(svg), qr.version))


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    for ten, url in MUC:
        sinh(ten, url)
    return 0


if __name__ == '__main__':
    sys.exit(main())
