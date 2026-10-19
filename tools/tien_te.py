# -*- coding: utf-8 -*-
"""Tiền ở bản Anh và bản Lào ghi bằng US$ (anh chốt 20/10/2026).

Tỷ giá CỐ ĐỊNH 25.000 VND/US$ — không cập nhật theo thị trường. Bản Việt giữ VND.
build-en.py gọi doi_tien() trên trang đã dịch; build-lo.py gọi trên trang gốc tiếng Anh
và trên cả hai vế của từ điển EN→LO, để khóa từ điển khớp đúng chữ đã đổi.
"""
import re

TY_GIA = 25000  # VND cho 1 US$, cố định

_VND = re.compile(r'(\d{1,3}(?:,\d{3})+|\d+)\s*VND\b')
_USD = re.compile(r'\bUSD\s?(?=[~\d])')


def _usd(vnd):
    x = vnd / TY_GIA
    return f'US${x:,.0f}' if abs(x - round(x)) < 1e-9 else f'US${x:,.2f}'


def doi_tien(s):
    """'895,000 VND' → 'US$35.80'; 'USD 10bn' → 'US$10bn'. Chuỗi khác giữ nguyên."""
    s = _VND.sub(lambda m: _usd(int(m.group(1).replace(',', ''))), s)
    return _USD.sub('US$', s)


if __name__ == '__main__':
    for v in ['895,000 VND', 'LATTICE Kit · 8,950,000 VND', '~USD 10–12bn', 'USD 39,000 a year', 'GMV passed USD 10bn']:
        print(v, '→', doi_tien(v))
