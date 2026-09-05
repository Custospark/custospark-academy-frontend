#!/usr/bin/env python
"""Generate the Custospark Academy logo matching the AcademyLoader design."""
from PIL import Image, ImageDraw
import math

SIZE = 1024
NAVY = (1, 5, 23)          # surface-page
BLUE = (0, 139, 250)        # blue-500
BLUE_LIGHT = (2, 170, 250)  # blue-400
ORANGE = (248, 104, 3)      # orange-500
ORANGE_LIGHT = (252, 145, 3)# orange-400
WHITE = (255, 255, 255)
CARD = (6, 21, 46)          # surface-card
BORDER = (27, 64, 95)       # border-default

im = Image.new("RGBA", (SIZE, SIZE), NAVY + (255,))
d = ImageDraw.Draw(im)

def dashed_ring(cx, cy, r, color, dash=60, gap=40, width=16, rot=0.0):
    """Draw a dashed circle using arcs."""
    n = max(24, int(2 * math.pi * r / (dash + gap)))
    step = 360.0 / n
    for i in range(n):
        start = rot + i * step
        end = start + (dash / (dash + gap)) * step
        d.arc([cx - r, cy - r, cx + r, cy + r], start, end, fill=color, width=width)

cx = cy = SIZE // 2
r_outer = 400
r_inner = 320

# Outer blue dashed ring (clockwise -> start with small offset)
dashed_ring(cx, cy, r_outer, BLUE, dash=70, gap=46, width=18, rot=20)
# Inner orange dashed ring (counter -> rotate opposite)
dashed_ring(cx, cy, r_inner, ORANGE, dash=46, gap=60, width=12, rot=-30)

# Orbiting spark node (top-right of the outer ring)
spark_angle = math.radians(40)
sx = cx + r_outer * math.cos(spark_angle)
sy = cy - r_outer * math.sin(spark_angle)
sr = 34
# glow
for glow_r in (52, 44, 38):
    alpha = 60
    d.ellipse([sx - glow_r, sy - glow_r, sx + glow_r, sy + glow_r],
              fill=ORANGE + (alpha,))
d.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=ORANGE_LIGHT + (255,))
# spark highlight
d.ellipse([sx - 14, sy - 14, sx + 14, sy + 14], fill=(255, 205, 130, 255))

# Center graduation cap
cap_c = 460  # cap size
cx0, cy0 = cx, cy - 18  # mortarboard center

# Skull cap (rounded band below)
band_top = cy0 + 70
d.rounded_rectangle([cx0 - 150, band_top, cx0 + 150, band_top + 96],
                    radius=48, fill=BLUE + (255,))

# Mortarboard (rhombus) - rotated square
mb_r = 250
pts = []
for k in range(4):
    a = math.radians(45 + k * 90)
    pts.append((cx0 + mb_r * math.cos(a), cy0 + mb_r * math.sin(a) * 0.62))
d.polygon(pts, fill=BLUE + (255,))

# Button on top of board
d.ellipse([cx0 - 30, cy0 - 30, cx0 + 30, cy0 + 30], fill=BLUE_LIGHT + (255,))

# Tassel line from center down-right
tassel_end = (cx0 + 60, band_top + 96 + 120)
d.line([(cx0, cy0), tassel_end], fill=ORANGE + (255,), width=16)
# tassel tuft
tx, ty = tassel_end
d.ellipse([tx - 26, ty - 26, tx + 26, ty + 26], fill=ORANGE_LIGHT + (255,))

# Cap top highlight (subtle white stroke)
d.polygon(pts, outline=WHITE + (70,), width=6)

im.save("Frontend/public/custospark_academy_logo.png")
print("saved 1024x1024 logo")