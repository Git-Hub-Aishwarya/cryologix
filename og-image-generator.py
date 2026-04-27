"""Generates a 1200x630 OG image for Cryologix link previews.
Run once with: python og-image-generator.py
Outputs: og-image.png
"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
img = Image.new('RGB', (W, H), color='#0b1220')
draw = ImageDraw.Draw(img)

# ── Fonts (Windows defaults) ────────────────────────────────
FONTS = 'C:/Windows/Fonts/'
def f(name, size):
    p = FONTS + name
    if os.path.exists(p):
        return ImageFont.truetype(p, size)
    return ImageFont.load_default()

font_brand     = f('arialbd.ttf', 44)
font_mark      = f('arialbd.ttf', 60)
font_headline  = f('arialbd.ttf', 72)
font_headline2 = f('ariali.ttf', 72)  # italic for the punchline
font_subtitle  = f('arial.ttf', 30)
font_small     = f('arial.ttf', 22)
font_chip      = f('arialbd.ttf', 22)

# ── Subtle radial gradient (top-right green tint) ────────────
overlay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ovd = ImageDraw.Draw(overlay)
# Soft green glow upper-right
for r in range(420, 0, -10):
    alpha = int(60 * (r / 420) ** 0.4)
    ovd.ellipse(
        [W - 200 - r, -200 - r, W - 200 + r, -200 + r],
        fill=(0, 184, 148, max(0, 60 - alpha))
    )
img = Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB')
draw = ImageDraw.Draw(img)

# ── Brand mark (top-left): dark square with green "C" ───────
M = 80
mx, my = 80, 80
draw.rounded_rectangle([mx, my, mx + M, my + M], radius=20, fill='#1a2238')
# Center "C"
b = draw.textbbox((0, 0), 'C', font=font_mark)
draw.text((mx + (M - (b[2]-b[0])) / 2 - b[0],
           my + (M - (b[3]-b[1])) / 2 - b[1]),
          'C', fill='#00b894', font=font_mark)

# Brand wordmark
draw.text((mx + M + 24, my + 16), 'Cryologix', fill='#ffffff', font=font_brand)

# ── Main headline (one line, centered) ──────────────────────
hy = 210
part1 = 'Reefer Marketplace,'
part2 = ' Unlocked.'
p1_w = draw.textlength(part1, font=font_headline)
p2_w = draw.textlength(part2, font=font_headline2)
total_w = p1_w + p2_w
start_x = (W - total_w) / 2
draw.text((start_x, hy), part1, fill='#ffffff', font=font_headline)
draw.text((start_x + p1_w, hy), part2, fill='#00b894', font=font_headline2)

# ── Accent divider (small green line under headline) ────────
divider_y = hy + 110
divider_w = 80
draw.rounded_rectangle(
    [W / 2 - divider_w / 2, divider_y, W / 2 + divider_w / 2, divider_y + 4],
    radius=2, fill='#00b894'
)

# ── Subtitle (centered, larger) ─────────────────────────────
sub_text = "Bid · Match · Realtime"
sub_font = f('arialbd.ttf', 40)
sub_bbox = draw.textbbox((0, 0), sub_text, font=sub_font)
sub_w = sub_bbox[2] - sub_bbox[0]
draw.text((W / 2 - sub_w / 2 - sub_bbox[0], 360),
          sub_text, fill='#ffffff', font=sub_font)

# ── Two pill buttons (centered as a group) ──────────────────
btn_y, btn_h, btn_radius = 460, 66, 33
btn_font = f('arialbd.ttf', 26)
btn_w_each = 220
btn_gap = 30
total_btn_w = btn_w_each * 2 + btn_gap
btn_start_x = (W - total_btn_w) / 2

def pill(x, w, label, fill_color, text_color, outline=None):
    draw.rounded_rectangle([x, btn_y, x + w, btn_y + btn_h], radius=btn_radius,
                           fill=fill_color, outline=outline,
                           width=2 if outline else 0)
    bb = draw.textbbox((0, 0), label, font=btn_font)
    tw = bb[2] - bb[0]
    th = bb[3] - bb[1]
    draw.text((x + (w - tw) / 2 - bb[0],
               btn_y + (btn_h - th) / 2 - bb[1]),
              label, fill=text_color, font=btn_font)

pill(btn_start_x, btn_w_each, 'For Shippers', '#00b894', '#0b1220')
pill(btn_start_x + btn_w_each + btn_gap, btn_w_each,
     'For Movers', '#0b1220', '#ffffff', outline='#00875a')

# ── Bottom-left URL ─────────────────────────────────────────
draw.text((80, 555), 'cryologix.vercel.app',
          fill='#5b6477', font=font_small)

# ── Save ────────────────────────────────────────────────────
out = 'og-image.png'
img.save(out, 'PNG', optimize=True)
print(f'Saved {out} — {os.path.getsize(out) // 1024} KB')
