"""Generate app/favicon.ico and app/icon.png (building + inspection check, brand teal)."""
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "app"

BG = (95, 158, 160, 255)  # --insp-color-shell-teal
FG = (255, 255, 255, 255)
ACCENT = (87, 204, 153, 255)  # --insp-color-progress
INK = (45, 106, 106, 255)  # --insp-color-accent-deep


def draw_icon(px: int) -> Image.Image:
    im = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    radius = max(4, px // 6)
    d.rounded_rectangle([0, 0, px - 1, px - 1], radius=radius, fill=BG)

    bw = int(px * 0.5)
    bh = int(px * 0.36)
    bx = (px - bw) // 2
    by = int(px * 0.4)
    roof_drop = max(2, px // 7)

    d.polygon(
        [
            (bx - max(1, px // 16), by),
            (px // 2, by - roof_drop),
            (bx + bw + max(1, px // 16), by),
        ],
        fill=FG,
    )
    d.rectangle([bx, by, bx + bw, by + bh], fill=FG)

    if px >= 20:
        pad_x = max(1, bw // 8)
        pad_y = max(1, bh // 6)
        win_w = (bw - pad_x * 4) // 3
        win_h = (bh - pad_y * 3) // 2
        for row in range(2):
            for col in range(3):
                x0 = bx + pad_x + col * (win_w + pad_x)
                y0 = by + pad_y + row * (win_h + pad_y)
                d.rectangle([x0, y0, x0 + win_w, y0 + win_h], fill=INK)
    elif px >= 12:
        d.rectangle([bx + bw // 4, by + bh // 4, bx + bw * 3 // 4, by + bh * 3 // 4], fill=INK)

    badge = max(6, px // 4)
    bx0 = px - badge - max(2, px // 10)
    by0 = px - badge - max(2, px // 10)
    d.ellipse([bx0, by0, bx0 + badge, by0 + badge], fill=ACCENT)
    if px >= 16:
        d.line(
            [(bx0 + badge * 0.28, by0 + badge * 0.52), (bx0 + badge * 0.42, by0 + badge * 0.68), (bx0 + badge * 0.74, by0 + badge * 0.32)],
            fill=FG,
            width=max(1, px // 14),
        )

    return im


def main() -> None:
    sizes = (16, 32, 48)
    images = [draw_icon(s) for s in sizes]
    ico_path = APP / "favicon.ico"
    images[-1].save(
        ico_path,
        format="ICO",
        sizes=[(s, s) for s in sizes],
        append_images=images[:-1],
    )
    draw_icon(32).save(APP / "icon.png", format="PNG")
    print(f"Wrote {ico_path} and {APP / 'icon.png'}")


if __name__ == "__main__":
    main()
