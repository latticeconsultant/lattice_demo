#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Sinh khối tài liệu "Doanh nghiệp một người" trong index.html từ file markdown gốc.

    python3 tools/build-doc.py

Đọc  : docs/doanh-nghiep-mot-nguoi.md
Ghi  : index.html, thay phần giữa hai mốc
       <!-- DOC:START --> ... <!-- DOC:END -->

Sửa nội dung tài liệu thì sửa file markdown rồi chạy lại script này, đừng sửa tay
trong index.html — lần chạy sau sẽ ghi đè.
"""

import html
import os
import re
import sys
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MD = os.path.join(ROOT, 'docs', 'doanh-nghiep-mot-nguoi.md')
TARGET = os.path.join(ROOT, 'index.html')
START = '<!-- DOC:START -->'
END = '<!-- DOC:END -->'


# ── inline: **đậm**, *nghiêng*, `mã` ────────────────────────────────────────
def inline(text):
    out = html.escape(text, quote=False)
    out = re.sub(r'`([^`]+)`', r'<code>\1</code>', out)
    out = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', out)
    out = re.sub(r'(?<!\*)\*([^*\n]+)\*(?!\*)', r'<em>\1</em>', out)
    return out


def slug(text):
    t = unicodedata.normalize('NFD', text)
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn')
    t = t.replace('đ', 'd').replace('Đ', 'D').lower()
    t = re.sub(r'[^a-z0-9]+', '-', t).strip('-')
    return 'doc-' + (t[:48] or 'muc')


def split_row(line):
    return [c.strip() for c in line.strip().strip('|').split('|')]


def is_sep(line):
    return bool(re.match(r'^\s*\|?[\s:|-]+\|[\s:|-]*$', line)) and '-' in line


# ── chuyển markdown → HTML ──────────────────────────────────────────────────
def convert(md):
    lines = md.split('\n')
    out, toc = [], []
    i, n = 0, len(lines)

    while i < n:
        line = lines[i]
        s = line.strip()

        if not s:
            i += 1
            continue

        # đường kẻ ngang
        if re.match(r'^-{3,}$', s):
            out.append('<hr class="doc-rule">')
            i += 1
            continue

        # khối mã (sơ đồ luồng)
        if s.startswith('```'):
            i += 1
            buf = []
            while i < n and not lines[i].strip().startswith('```'):
                buf.append(html.escape(lines[i], quote=False))
                i += 1
            i += 1
            out.append('<pre class="doc-flow">' + '\n'.join(buf) + '</pre>')
            continue

        # tiêu đề
        m = re.match(r'^(#{1,4})\s+(.*)$', s)
        if m:
            level, text = len(m.group(1)), m.group(2).strip()
            body = inline(text)
            if level == 1 and text.startswith(('PHẦN', 'PART')):
                sid = slug(text)
                toc.append((1, text, sid))
                out.append(f'<h2 class="doc-part" id="{sid}">{body}</h2>')
            elif level == 1:
                # h2 chứ không phải h1: trang chủ đã có h1 riêng cho thông điệp
                # công ty. Hai h1 trên một trang làm loãng tín hiệu tiêu đề.
                out.append(f'<h2 class="doc-title">{body}</h2>')
            elif level == 2 and re.match(r'^\d+\.', text):
                sid = slug(text)
                toc.append((2, text, sid))
                out.append(f'<h3 class="doc-h2" id="{sid}">{body}</h3>')
            elif level == 2:
                out.append(f'<p class="doc-subtitle">{body}</p>')
            elif level == 3:
                out.append(f'<h4 class="doc-h3">{body}</h4>')
            else:
                out.append(f'<h5 class="doc-h4">{body}</h5>')
            i += 1
            continue

        # trích dẫn
        if s.startswith('>'):
            buf = []
            while i < n and lines[i].strip().startswith('>'):
                buf.append(lines[i].strip().lstrip('>').strip())
                i += 1
            out.append('<blockquote class="doc-quote">' + inline(' '.join(buf)) + '</blockquote>')
            continue

        # bảng
        if s.startswith('|') and i + 1 < n and is_sep(lines[i + 1]):
            head = split_row(s)
            i += 2
            rows = []
            while i < n and lines[i].strip().startswith('|'):
                rows.append(split_row(lines[i].strip()))
                i += 1
            th = ''.join(f'<th>{inline(c)}</th>' for c in head)
            body = ''
            for r in rows:
                r += [''] * (len(head) - len(r))
                body += '<tr>' + ''.join(f'<td>{inline(c)}</td>' for c in r[:len(head)]) + '</tr>'
            out.append(
                '<div class="doc-tablewrap"><table class="doc-table">'
                f'<thead><tr>{th}</tr></thead><tbody>{body}</tbody></table></div>'
            )
            continue

        # danh sách đánh số
        if re.match(r'^\d+\.\s', s):
            items = []
            while i < n and re.match(r'^\d+\.\s', lines[i].strip()):
                items.append(inline(re.sub(r'^\d+\.\s', '', lines[i].strip())))
                i += 1
            out.append('<ol class="doc-list">' + ''.join(f'<li>{x}</li>' for x in items) + '</ol>')
            continue

        # danh sách gạch đầu dòng
        if re.match(r'^[-*]\s', s):
            items = []
            while i < n and re.match(r'^[-*]\s', lines[i].strip()):
                items.append(inline(re.sub(r'^[-*]\s', '', lines[i].strip())))
                i += 1
            out.append('<ul class="doc-list">' + ''.join(f'<li>{x}</li>' for x in items) + '</ul>')
            continue

        # đoạn văn — gộp các dòng liền nhau
        buf = []
        while i < n and lines[i].strip() and not re.match(
                r'^(#{1,4}\s|\||>|```|-{3,}$|\d+\.\s|[-*]\s)', lines[i].strip()):
            buf.append(lines[i].strip())
            i += 1
        text = ' '.join(buf)
        if text.startswith('*') and text.endswith('*'):
            # Dòng in nghiêng đứng một mình. Trước mục đầu tiên thì đó là dòng
            # phiên bản/ngày tháng (nhãn nhỏ); sau cùng thì đó là ghi chú nguồn.
            cls = 'doc-meta' if not toc else 'doc-note'
        else:
            cls = 'doc-p'
        out.append(f'<p class="{cls}">{inline(text)}</p>')

    return '\n'.join(out), toc


def build_toc(toc):
    items = []
    for level, text, sid in toc:
        cls = 'doc-toc-part' if level == 1 else 'doc-toc-item'
        label = html.escape(text, quote=False)
        items.append(f'<a class="{cls}" href="#{sid}">{label}</a>')
    return '\n'.join(items)


NHAN = {
    'vi': {
        'kicker': 'Tài liệu nền tảng',
        'ten': 'Doanh nghiệp một người — kiến trúc AI-native cho quy mô 1–3 người',
        'luu': 'LƯU PDF ↓',
        'muc_luc': 'Mục lục',
        'nhan_muc_luc': 'Mục lục tài liệu',
    },
    'en': {
        'kicker': 'Foundation paper',
        'ten': 'The one-person business — AI-native architecture at a scale of 1–3 people',
        'luu': 'SAVE PDF ↓',
        'muc_luc': 'Contents',
        'nhan_muc_luc': 'Document contents',
    },
}


def build(md_path, target_path, lang='vi'):
    with open(md_path, encoding='utf-8') as f:
        md = f.read()

    body, toc = convert(md)
    nav = build_toc(toc)
    L = NHAN[lang]

    block = f'''{START}
      <section class="lnx-docwrap">
        <div class="lnx-doc" id="lnx-doc">
          <div class="lnx-doc-bar">
            <div class="lnx-doc-bar-txt">
              <span class="lnx-doc-kicker">{L['kicker']}</span>
              <span class="lnx-doc-name">{L['ten']}</span>
            </div>
            <button type="button" class="lnx-doc-save" sc-camel-on-click="{{{{ savePdf }}}}">{L['luu']}</button>
          </div>
          <div class="lnx-doc-body">
            <nav class="lnx-doc-toc" aria-label="{L['nhan_muc_luc']}">
              <span class="doc-toc-head">{L['muc_luc']}</span>
{nav}
            </nav>
            <article class="lnx-doc-main">
{body}
            </article>
          </div>
        </div>
      </section>
      {END}'''

    with open(target_path, encoding='utf-8') as f:
        page = f.read()

    if START not in page or END not in page:
        sys.exit('Không tìm thấy mốc DOC:START / DOC:END trong %s' % target_path)

    a = page.index(START)
    b = page.index(END) + len(END)
    page = page[:a] + block + page[b:]

    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(page)

    return len(toc), len(block)


def main():
    so_muc, so_ky_tu = build(MD, TARGET, 'vi')
    print('Đã sinh khối tài liệu: %d mục trong mục lục, %s ký tự'
          % (so_muc, format(so_ky_tu, ',')))


if __name__ == '__main__':
    main()
