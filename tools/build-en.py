#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sinh bản tiếng Anh en/index.html từ index.html.

    python3 tools/build-en.py

Nguồn:
  index.html                      bản tiếng Việt (nguồn sự thật duy nhất)
  tools/i18n/strings.vi.json      từ điển VI → EN cho từng chuỗi

Bản EN KHÔNG phải bản dịch nguyên văn. Nội dung riêng của Việt Nam — khung pháp
lý, thị trường sàn nội địa, hộ kinh doanh — được viết lại theo bối cảnh toàn cầu
ngay trong trường "en" của từng chuỗi.

NGUYÊN TẮC THAY CHUỖI — đọc trước khi sửa file này:
Chỉ thay khi chuỗi khớp TRỌN MỘT ĐƠN VỊ có dấu phân cách hai đầu:
    trong script : 'chuỗi'      khớp cả hai dấu nháy đơn
    trong markup : >chuỗi<      khớp cả hai dấu ngoặc thẻ
                   ="chuỗi"     khớp cả hai dấu nháy kép
Không bao giờ thay theo kiểu chuỗi con. Bài học từ bản đầu: thay chuỗi con làm
từ "và" bị đổi thành "and" ngay giữa những câu tiếng Việt khác, và regex \\s+
nuốt qua ranh giới mã, xoá mất nguyên một mảng dữ liệu.

Quy trình khi sửa tiếng Việt:
  1. sửa index.html
  2. python3 tools/extract-strings.py   chuỗi mới hiện ra với en rỗng
  3. dịch các chuỗi mới
  4. python3 tools/build-en.py          script báo chuỗi nào chưa dịch
"""

import io
import json
import os
import re
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'index.html')
I18N = os.path.join(ROOT, 'tools', 'i18n')
OUT_DIR = os.path.join(ROOT, 'en')
OUT = os.path.join(OUT_DIR, 'index.html')


def mau_linh_hoat(s):
    """Regex khớp chuỗi; mọi khoảng trắng khớp \\s+ vì bộ trích đã chuẩn hóa."""
    return r'\s+'.join(re.escape(w) for w in s.split())


def thay_trong_script(doan, tu_dien):
    """Chỉ thay khi chuỗi nằm trọn giữa hai dấu nháy đơn."""
    dem = 0
    for vi, en in tu_dien:
        ra = en.replace('\\', '\\\\').replace("'", "\\'")
        doan, n = re.subn("'" + mau_linh_hoat(vi) + "'",
                          lambda m, r=ra: "'" + r + "'", doan)
        dem += n
    return doan, dem


def thay_trong_markup(doan, tu_dien):
    """Chỉ thay khi chuỗi là trọn một nút văn bản hoặc trọn một giá trị thuộc tính."""
    dem = 0
    for vi, en in tu_dien:
        m = mau_linh_hoat(vi)
        # cho phép khoảng trắng hai đầu: <h1>Chuỗi <span>… có dấu cách trước thẻ
        doan, a = re.subn(r'>\s*' + m + r'\s*<', lambda x, e=en: '>' + e + '<', doan)
        doan, b = re.subn('="' + m + '"', lambda x, e=en: '="' + e + '"', doan)
        dem += a + b
    return doan, dem


def kiem_cu_phap(t):
    """Chạy node --check trên mọi script inline. Trả về danh sách lỗi."""
    loi = []
    for i, s in enumerate(re.findall(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', t, re.S)):
        if len(s.strip()) < 200:
            continue
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
            f.write(s)
            p = f.name
        r = subprocess.run(['node', '--check', p], capture_output=True, text=True)
        os.unlink(p)
        if r.returncode:
            dong = [x for x in r.stderr.split('\n') if 'Error' in x or '^' in x]
            loi.append('script #%d: %s' % (i, ' '.join(dong)[:200]))
    return loi


def main():
    t = io.open(SRC, encoding='utf-8').read()
    with io.open(os.path.join(I18N, 'strings.vi.json'), encoding='utf-8') as f:
        chuoi = json.load(f)

    # dài trước ngắn sau để chuỗi ngắn không cắt mất chuỗi dài
    # Bỏ mục có en == vi: đó là mảnh mã đánh dấu giữ nguyên. Thay chúng là có hại
    # vì bản lưu trong từ điển đã chuẩn hóa khoảng trắng — thay vào sẽ gộp dòng,
    # biến // thành comment nuốt hết phần còn lại của dòng và xoá mất mã.
    tu_dien = sorted([(x['vi'], x['en']) for x in chuoi
                      if x.get('en') and x['en'] != x['vi']],
                     key=lambda x: -len(x[0]))
    chua_dich = [x['vi'] for x in chuoi if not x.get('en')]

    phan = re.split(r'(<script[^>]*>.*?</script>)', t, flags=re.S)
    tong = 0
    for i, doan in enumerate(phan):
        if doan.startswith('<script'):
            phan[i], n = thay_trong_script(doan, tu_dien)
        else:
            phan[i], n = thay_trong_markup(doan, tu_dien)
        tong += n
    t = ''.join(phan)

    # đường dẫn tài nguyên lùi một cấp
    for thu_muc in ('assets/', 'brand/'):
        t = re.sub(r'(?<=["\'(])' + thu_muc, '../' + thu_muc, t)
    t = t.replace('"../../', '"../')

    # ngôn ngữ trang và nút chuyển ngữ
    t = t.replace('<html lang="vi">', '<html lang="en">', 1)
    t = t.replace(
        '<a class="lnx-lang" href="en/" hreflang="en" aria-label="English version">EN</a>',
        '<a class="lnx-lang" href="../" hreflang="vi" aria-label="Phien ban tieng Viet">VI</a>')
    t = t.replace(
        '<a class="lnx-lang lnx-lang-menu" href="en/" hreflang="en">EN &middot; ENGLISH VERSION</a>',
        '<a class="lnx-lang lnx-lang-menu" href="../" hreflang="vi">VI &middot; PHIEN BAN TIENG VIET</a>')

    loi = kiem_cu_phap(t)

    os.makedirs(OUT_DIR, exist_ok=True)
    io.open(OUT, 'w', encoding='utf-8').write(t)

    print('Da sinh %s' % OUT)
    print('  luot thay      : %d' % tong)
    print('  chuoi co ban EN: %d/%d' % (len(tu_dien), len(chuoi)))
    if chua_dich:
        print('  CHUA DICH      : %d' % len(chua_dich))
        for s in chua_dich[:10]:
            print('     - %s' % s[:76])
    if loi:
        print('  LOI CU PHAP JS :')
        for e in loi:
            print('     - %s' % e)
        return 1
    print('  cu phap JS     : hop le')
    return 1 if chua_dich else 0


if __name__ == '__main__':
    sys.exit(main())
