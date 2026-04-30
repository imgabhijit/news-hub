"""
Generates icon-192.png and icon-512.png for PWA.
Uses only Python stdlib — no Pillow needed.

Design: dark background · red circle · white news-bar lines
"""

import struct
import zlib
from pathlib import Path

BG    = (15,  17,  23)   # #0f1117
RED   = (230, 57,  70)   # #e63946
WHITE = (255, 255, 255)


def make_icon(size):
    img = [[list(BG)] * size for _ in range(size)]
    cx = cy = size // 2

    # Red filled circle
    cr = int(size * 0.42)
    cr2 = cr * cr
    for y in range(size):
        for x in range(size):
            if (x - cx) ** 2 + (y - cy) ** 2 <= cr2:
                img[y][x] = list(RED)

    # 3 white horizontal bars inside the circle (newspaper lines)
    bar_h  = max(int(size * 0.055), 3)
    bar_w  = int(cr * 1.35)
    gap    = int(size * 0.09)
    inner  = int(cr * 0.78)
    inner2 = inner * inner

    total_h = 3 * bar_h + 2 * gap
    start_y = cy - total_h // 2

    for i in range(3):
        by = start_y + i * (bar_h + gap)
        bx = cx - bar_w // 2
        for y in range(by, min(by + bar_h, size)):
            for x in range(bx, min(bx + bar_w, size)):
                if (x - cx) ** 2 + (y - cy) ** 2 <= inner2:
                    img[y][x] = list(WHITE)

    # Encode PNG (RGB, 8-bit, no interlace)
    raw = bytearray()
    for row in img:
        raw += b'\x00'
        for px in row:
            raw += bytes(px)

    compressed = zlib.compress(bytes(raw), 9)

    def chunk(tag, data):
        c = tag + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xFFFFFFFF)

    ihdr = struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)
    return (b'\x89PNG\r\n\x1a\n'
            + chunk(b'IHDR', ihdr)
            + chunk(b'IDAT', compressed)
            + chunk(b'IEND', b''))


if __name__ == '__main__':
    icons_dir = Path(__file__).parent.parent / 'icons'
    icons_dir.mkdir(exist_ok=True)

    for size, name in [(192, 'icon-192.png'), (512, 'icon-512.png')]:
        data = make_icon(size)
        (icons_dir / name).write_bytes(data)
        print(f'Created {name}  ({size}x{size}, {len(data):,} bytes)')
