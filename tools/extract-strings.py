#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Trích mọi chuỗi tiếng Việt cần dịch trong index.html.

    python3 tools/extract-strings.py

Ghi ra tools/i18n/strings.vi.json — danh sách chuỗi theo thứ tự xuất hiện, kèm
ngữ cảnh để người dịch biết chuỗi nằm ở đâu.

Hai nguồn chuỗi:
  1. Nút văn bản trong markup (giữa các thẻ)
  2. Chuỗi trong mảng dữ liệu JS — this.rows([...]) và các mảng object

Bỏ qua: nội dung giữa DOC:START/DOC:END (tài liệu nhúng có nguồn markdown riêng),
thẻ script/style, và các chuỗi không có ký tự tiếng Việt hoặc chỉ là mã.
"""

import io
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'index.html')
OUT_DIR = os.path.join(ROOT, 'tools', 'i18n')
OUT = os.path.join(OUT_DIR, 'strings.vi.json')

VI = 'àáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ'
CO_DAU = re.compile('[' + VI + VI.upper() + ']')

# chuỗi kỹ thuật không dịch
BO_QUA = re.compile(
    r'^(https?:|#|var\(|clamp\(|\d|[A-Za-z0-9_\-]+\.(js|css|png|svg|woff2)$)'
    r'|^[\s\d.,%×÷+\-–—/·|:()]*$'
)


def la_can_dich(s):
    s = s.strip()
    if len(s) < 2 or BO_QUA.match(s):
        return False
    # có dấu tiếng Việt, hoặc là nhãn hoa toàn phần / câu tiếng Anh trong bản VI
    return bool(CO_DAU.search(s)) or (len(s.split()) >= 2 and re.search(r'[A-Za-zÀ-ỹ]', s))


def main():
    t = io.open(SRC, encoding='utf-8').read()

    # cắt bỏ khối tài liệu nhúng
    a, b = t.find('<!-- DOC:START -->'), t.find('<!-- DOC:END -->')
    if a > 0 and b > a:
        t = t[:a] + t[b:]

    # tách phần script ra xử lý riêng
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', t, re.S)
    markup = re.sub(r'<script[^>]*>.*?</script>', '<!--S-->', t, flags=re.S)
    markup = re.sub(r'<style[^>]*>.*?</style>', '<!--C-->', markup, flags=re.S)

    muc = []
    da_co = set()

    def them(s, nguon):
        s = re.sub(r'\s+', ' ', s).strip()
        if not la_can_dich(s) or s in da_co:
            return
        da_co.add(s)
        muc.append({'vi': s, 'en': '', 'nguon': nguon})

    # 1) nút văn bản trong markup
    for m in re.finditer(r'>([^<>{}]+)<', markup):
        them(m.group(1), 'markup')

    # 2) thuộc tính người dùng đọc được
    for m in re.finditer(r'(?:placeholder|aria-label|alt|title)="([^"]+)"', markup):
        them(m.group(1), 'thuoc-tinh')

    # 3) chuỗi trong dữ liệu JS
    for sc in scripts:
        for m in re.finditer(r"'((?:[^'\\]|\\.){2,400})'", sc):
            them(m.group(1).replace("\\'", "'"), 'du-lieu')

    os.makedirs(OUT_DIR, exist_ok=True)
    with io.open(OUT, 'w', encoding='utf-8') as f:
        json.dump(muc, f, ensure_ascii=False, indent=1)

    theo_nguon = {}
    for x in muc:
        theo_nguon[x['nguon']] = theo_nguon.get(x['nguon'], 0) + 1
    tu = sum(len(x['vi'].split()) for x in muc)
    print('Đã trích %d chuỗi (~%d từ)' % (len(muc), tu))
    for k, v in sorted(theo_nguon.items()):
        print('  %-12s %d' % (k, v))
    print('→ %s' % OUT)


if __name__ == '__main__':
    main()
