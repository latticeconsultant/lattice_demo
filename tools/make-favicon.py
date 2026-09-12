#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sinh favicon: dấu hiệu trắng trên nền đỏ thương hiệu.

    python3 tools/make-favicon.py

Ghi : brand/logo/favicon/favicon-16.png   favicon màn hình thường
      brand/logo/favicon/favicon-32.png   favicon trình duyệt
      brand/logo/favicon/favicon-180.png  apple-touch-icon
      brand/logo/favicon/favicon-192.png  PWA / Android

Vì sao nền đỏ: bản cũ là dấu hiệu mực trên nền giấy #F3F2F2. Ở 16–32px trên thanh
tab, nét mảnh màu xám trên nền sáng gần như biến mất. Nền đỏ đặc đọc được ngay cả
ở cỡ nhỏ nhất, và đỏ là màu nhận diện nên nhìn tab là ra LATTICE.

Vì sao vẽ lại hình học thay vì thu nhỏ file PNG có sẵn: trong bản gốc, khung hình
thoi để opacity .35 — đúng cho cỡ lớn, nhưng thu xuống 16px thì khung biến mất,
chỉ còn mấy chấm trắng rời rạc. Ở đây khung để đậm hơn (NET_KHUNG) để cấu trúc
lưới vẫn đọc được. Đây chính là việc "bù nét cho cỡ nhỏ" mà brand/README nhắc tới.

Hình học lấy đúng từ dấu hiệu trong index.html (khung toạ độ 100x100):
bốn đỉnh hình thoi (50,8) (92,50) (50,92) (8,50), hai đường trục cắt nhau ở tâm,
bốn nút rỗng ở đỉnh, một nút đặc ở tâm — nút tâm là con người.
"""

import os
import sys

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'brand', 'logo', 'favicon')

DO = (236, 48, 19)          # #EC3013 — đỏ tín hiệu
TRANG = (255, 255, 255)
NET_KHUNG = 150             # độ đậm khung và trục (0–255); bản gốc là 89 (~.35)
TY_LE = 0.80                # dấu hiệu chiếm 80% khung, chừa lề cho iOS bo góc
VE = 2048                   # vẽ lớn rồi thu nhỏ một lần cho mượt
CO = [16, 32, 180, 192]


def ve_dau_hieu():
    """Bản đầy đủ: khung hình thoi, hai trục, bốn nút rỗng, nút tâm đặc."""
    anh = Image.new('RGB', (VE, VE), DO)
    lop = Image.new('RGBA', (VE, VE), (0, 0, 0, 0))
    d = ImageDraw.Draw(lop)

    k = VE * TY_LE / 100.0
    le = VE * (1 - TY_LE) / 2.0
    P = lambda x, y: (le + x * k, le + y * k)
    net = 5 * k                      # stroke-width 5 trong khung 100

    mo = TRANG + (NET_KHUNG,)
    dinh = [P(50, 8), P(92, 50), P(50, 92), P(8, 50)]
    d.line(dinh + [dinh[0]], fill=mo, width=int(round(net)), joint='curve')
    d.line([P(50, 8), P(50, 92)], fill=mo, width=int(round(net)))
    d.line([P(8, 50), P(92, 50)], fill=mo, width=int(round(net)))

    # Bốn nút rỗng: vẽ vòng trắng đặc rồi khoét lõi bằng màu nền, để lỗ thật sự
    # rỗng chứ không phải trắng chồng lên nét mờ bên dưới.
    for x, y in [(50, 8), (92, 50), (50, 92), (8, 50)]:
        cx, cy = P(x, y)
        ngoai = (6 * k) + net / 2
        trong = (6 * k) - net / 2
        d.ellipse([cx - ngoai, cy - ngoai, cx + ngoai, cy + ngoai], fill=TRANG + (255,))
        d.ellipse([cx - trong, cy - trong, cx + trong, cy + trong], fill=DO + (255,))

    cx, cy = P(50, 50)
    r = 10 * k
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=TRANG + (255,))

    anh.paste(Image.alpha_composite(Image.new('RGBA', (VE, VE), DO + (255,)), lop).convert('RGB'))
    return anh


def ve_rut_gon():
    """Bản cho 16px: hình thoi trắng đặc, nút tâm đỏ.

    Ở 16px, khung mảnh và bốn nút rỗng nhoè thành một vệt không đọc được — thử
    rồi mới thấy. Rút về khối đặc thì hình vẫn sắc ở mọi cỡ, và nút tâm trở lại
    màu đỏ, đúng quy tắc "nút tâm luôn đỏ — đó là con người" trong brand/README.
    """
    anh = Image.new('RGB', (VE, VE), DO)
    d = ImageDraw.Draw(anh)
    ty_le = 0.94
    k = VE * ty_le / 100.0
    le = VE * (1 - ty_le) / 2.0
    P = lambda x, y: (le + x * k, le + y * k)
    d.polygon([P(50, 4), P(96, 50), P(50, 96), P(4, 50)], fill=TRANG)
    cx, cy = P(50, 50)
    r = 17 * k
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=DO)
    return anh


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    goc = ve_dau_hieu()
    nho = ve_rut_gon()
    for n in CO:
        duong = os.path.join(OUT_DIR, 'favicon-%d.png' % n)
        (nho if n <= 16 else goc).resize((n, n), Image.LANCZOS).save(duong, 'PNG', optimize=True)
        print('%-18s %dx%d · %d byte' % (os.path.basename(duong), n, n, os.path.getsize(duong)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
