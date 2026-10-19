#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sinh bản tiếng Lào lo/index.html từ bản tiếng Anh en/index.html.

    python3 tools/build-en.py && python3 tools/build-lo.py

Nguồn:
  en/index.html                   bản tiếng Anh (sinh từ index.html bằng build-en.py)
  tools/i18n/strings.lo.json      từ điển EN → LO, dịch NGUYÊN VĂN từ tiếng Anh (anh chốt 19/10/2026)
  docs/one-person-business.lo.md  tài liệu nền tảng bản Lào (dịch nguyên văn từ bản .en.md)

Quy tắc thay chuỗi giống hệt build-en.py (dùng lại chính các hàm của nó): chỉ thay khi
chuỗi khớp TRỌN một đơn vị — 'trong nháy đơn' ở script, >nút văn bản< hoặc ="thuộc tính".

Khi bản Việt thêm chuỗi mới:
  1. dịch sang tiếng Anh như thường (strings.vi.json, build-en.py)
  2. python3 tools/build-lo.py      liệt kê chuỗi tiếng Anh chưa có bản Lào
  3. thêm {"en": ..., "lo": ...} vào strings.lo.json rồi chạy lại
Bản dịch Lào do máy dịch (Claude) — nên nhờ người bản ngữ rà trước khi quảng bá rộng.
"""

import importlib.util
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'en', 'index.html')
OUT_DIR = os.path.join(ROOT, 'lo')
OUT = os.path.join(OUT_DIR, 'index.html')
TU_DIEN = os.path.join(ROOT, 'tools', 'i18n', 'strings.lo.json')
MD_LO = os.path.join(ROOT, 'docs', 'one-person-business.lo.md')


def nap(ten, tep):
    spec = importlib.util.spec_from_file_location(ten, os.path.join(ROOT, 'tools', tep))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


def main():
    be = nap('build_en', 'build-en.py')
    sys.path.insert(0, os.path.join(ROOT, 'tools'))
    from ngon_ngu import NHOM, MENU

    t = io.open(SRC, encoding='utf-8').read()
    for khoi_en, khoi_lo in ((NHOM('en'), NHOM('lo')), (MENU('en'), MENU('lo'))):
        if khoi_en not in t:
            sys.exit('en/index.html thiếu khối nút ngôn ngữ chuẩn — chạy lại build-en.py')
        t = t.replace(khoi_en, khoi_lo)

    cap = json.load(io.open(TU_DIEN, encoding='utf-8'))
    tu_dien = sorted({(x['en'], x['lo']) for x in cap if x.get('lo') and x['lo'] != x['en']},
                     key=lambda x: -len(x[0]))

    phan = re.split(r'(<script[^>]*>.*?</script>)', t, flags=re.S)
    tong = 0
    for i, doan in enumerate(phan):
        if doan.startswith('<script'):
            phan[i], n = be.thay_trong_script(doan, tu_dien)
        else:
            phan[i], n = be.thay_trong_markup(doan, tu_dien)
        tong += n
    t = ''.join(phan)
    t = t.replace('<html lang="en">', '<html lang="lo">', 1)

    loi = be.kiem_cu_phap(t)
    os.makedirs(OUT_DIR, exist_ok=True)
    io.open(OUT, 'w', encoding='utf-8').write(t)

    if os.path.exists(MD_LO):
        bd = nap('build_doc', 'build-doc.py')
        so_muc, so_ky_tu = bd.build(MD_LO, OUT, 'lo')
        print('  tai lieu LO    : %d muc, %s ky tu' % (so_muc, format(so_ky_tu, ',')))
    else:
        print('  tai lieu LO    : CHUA CO %s (giu ban tieng Anh)' % MD_LO)

    # Chuỗi tiếng Anh của từ điển VI→EN chưa có bản Lào (bỏ mảnh mã: không có chữ cái hoặc giống mã)
    co_lo = {x['en'] for x in cap if x.get('lo')}
    en_vi = json.load(io.open(os.path.join(ROOT, 'tools', 'i18n', 'strings.vi.json'), encoding='utf-8'))
    thieu = sorted({x['en'] for x in en_vi if x.get('en') and x['en'] not in co_lo
                    and re.search(r'[A-Za-z]{3,}', x['en']) and not re.search(r'[;{}()=]', x['en'])})

    print('Da sinh %s' % OUT)
    print('  luot thay      : %d' % tong)
    print('  cap EN→LO      : %d' % len(tu_dien))
    if thieu:
        print('  CHUA CO BAN LAO: %d' % len(thieu))
        for s in thieu[:15]:
            print('     - %s' % s[:76])
    if loi:
        print('  LOI CU PHAP JS :')
        for e in loi:
            print('     - %s' % e)
        return 1
    print('  cu phap JS     : hop le')
    return 1 if thieu else 0


if __name__ == '__main__':
    sys.exit(main())
