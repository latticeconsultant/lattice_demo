# -*- coding: utf-8 -*-
"""Nút chọn ngôn ngữ dùng chung cho ba bản trang chủ: EN · VN · LO (thứ tự anh chốt 19/10/2026),
đặt bên phải nút Đặt lịch chẩn đoán, sát lề phải (anh chốt 20/10/2026).

Bản Việt (index.html) viết sẵn đúng markup của NHOM('vi') và MENU('vi').
build-en.py / build-lo.py thay nguyên khối đó bằng NHOM('en') / NHOM('lo'),
nên mỗi bản tự đánh dấu ngôn ngữ đang xem và có đường dẫn tương đối đúng.

Lớp tn-* là "công tắc" do trang /admin/ bật tắt (Worker gắn data-tat lên thẻ <html>).
"""

# (mã, nhãn ngắn, tên đầy đủ, thư mục so với gốc site)
NGON_NGU = [
    ('en', 'EN', 'English', 'en/'),
    ('vi', 'VN', 'Tiếng Việt', ''),
    ('lo', 'LO', 'ພາສາລາວ', 'lo/'),
]

NHAN_NHOM = {'vi': 'Ngôn ngữ', 'en': 'Language', 'lo': 'ພາສາ'}


def _duong_dan(tu, toi):
    """Đường dẫn tương đối từ trang của ngôn ngữ `tu` tới trang chủ ngôn ngữ `toi`."""
    goc = '' if tu == 'vi' else '../'
    dich = next(d for m, _, _, d in NGON_NGU if m == toi)
    return (goc + dich) or './'


def _lop(ma):
    """Mỗi nút một công tắc riêng trong /admin/: tn-nut-en, tn-nut-vn, tn-nut-lo."""
    return ' tn-nut-' + ('vn' if ma == 'vi' else ma)


def NHOM(hien):
    """Nhóm nút trên thanh đầu trang, đặt ngay sau (bên phải) nút Đặt lịch chẩn đoán."""
    nut = []
    for ma, ngan, ten, _ in NGON_NGU:
        dang = ' lnx-lang-on" aria-current="page' if ma == hien else ''
        nut.append(f'<a class="lnx-lang{_lop(ma)}{dang}" href="{_duong_dan(hien, ma)}" hreflang="{ma}" lang="{ma}" title="{ten}">{ngan}</a>')
    return f'<span class="lnx-langs" role="group" aria-label="{NHAN_NHOM[hien]}">' + ''.join(nut) + '</span>'


def MENU(hien):
    """Ba mục trong menu điện thoại."""
    muc = []
    for ma, ngan, ten, _ in NGON_NGU:
        dang = ' lnx-lang-on" aria-current="page' if ma == hien else ''
        muc.append(f'<a class="lnx-lang lnx-lang-menu{_lop(ma)}{dang}" href="{_duong_dan(hien, ma)}" hreflang="{ma}" lang="{ma}">{ngan} · {ten.upper() if ma != "lo" else ten}</a>')
    return ''.join(muc)


if __name__ == '__main__':
    for m in ('vi', 'en', 'lo'):
        print(m, NHOM(m))
        print(m, MENU(m))
