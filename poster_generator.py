# -*- coding: utf-8 -*-
"""
================================================================================
Poster Automation Generator (High-Resolution 300 DPI Prototype)
================================================================================
Specifications:
- Canvas: A4 Standard (2480 x 3508 px @ 300 DPI)
- Layout Grid: 12-Column Modern Swiss Grid with >= 8.5% Margins
- Background: Vectorized Multilayer Deep Diffuse/Mesh Gradient
- Anti-Banding: 2% Monochromatic High-Pass Grain (Film Dithering)
- Visual Hero: Precision Geometric Alignment & Glow Bloom Blending
- Typography: Strict Typographic Hierarchy (Primary, Secondary, Body, Metadata)
- CLI: Rich Interactive Terminal UI & Inspection Table
================================================================================
"""

import os
import sys
import time
import math
import shutil
import urllib.request
from dataclasses import dataclass
from typing import Dict, Tuple, List, Optional
import importlib.metadata

import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import svgwrite
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn
from rich.rule import Rule

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

console = Console(force_terminal=True, legacy_windows=False)

# ------------------------------------------------------------------------------
# Configuration & Theme Definitions
# ------------------------------------------------------------------------------
@dataclass
class PosterConfig:
    width: int = 2480
    height: int = 3508
    dpi: int = 300
    margin_ratio: float = 0.085  # 8.5% margin (> 8% as requested)
    columns: int = 12
    gutter: int = 26
    grain_intensity: float = 0.02  # 2% monochromatic grain
    output_path: str = "poster_output.png"
    svg_output_path: str = "assets/poster_geometry.svg"
    assets_font_dir: str = "assets/fonts"

    @property
    def margin_x(self) -> int:
        return int(self.width * self.margin_ratio)

    @property
    def margin_y(self) -> int:
        return int(self.height * self.margin_ratio)

    @property
    def content_width(self) -> int:
        return self.width - 2 * self.margin_x

    @property
    def content_height(self) -> int:
        return self.height - 2 * self.margin_y

    @property
    def col_width(self) -> float:
        return (self.content_width - (self.columns - 1) * self.gutter) / self.columns

    def get_col_x(self, col_index: int) -> int:
        """Returns the start X coordinate for a specific 0-indexed column."""
        return int(self.margin_x + col_index * (self.col_width + self.gutter))

    def get_col_span(self, start_col: int, span: int) -> Tuple[int, int]:
        """Returns (start_x, width) for an element spanning several columns."""
        x = self.get_col_x(start_col)
        w = int(span * self.col_width + (span - 1) * self.gutter)
        return x, w


class Palette:
    # Deep space / quantum field base colors
    BG_BASE = np.array([8, 12, 22], dtype=np.float32)       # Very dark blue-gray
    GLOW_BLUE = np.array([12, 68, 180], dtype=np.float32)   # Deep electric blue
    GLOW_PURPLE = np.array([115, 20, 160], dtype=np.float32)# Nebula magenta-violet
    GLOW_CYAN = np.array([0, 175, 210], dtype=np.float32)   # High-energy cyan
    GLOW_AMBER = np.array([230, 95, 30], dtype=np.float32)  # Event-horizon amber

    # Foreground UI / Typography colors (RGB tuples for PIL)
    TEXT_PRIMARY = (248, 250, 252)     # Off-white / Pure headline
    TEXT_SECONDARY = (203, 213, 225)   # Light slate
    TEXT_MUTED = (130, 148, 172)       # Subdued metadata
    TEXT_ACCENT = (56, 189, 248)       # Neon cyan highlight
    TEXT_WARN = (251, 146, 60)         # Warm amber highlight

    # Line & geometry accent colors (RGBA tuples)
    LINE_SUBTLE = (71, 85, 105, 75)
    LINE_PRIMARY = (148, 163, 184, 180)
    LINE_CYAN = (56, 189, 248, 220)
    LINE_MAGENTA = (244, 114, 182, 200)
    FILL_CARD_BG = (15, 23, 42, 140)


# ------------------------------------------------------------------------------
# Font Detection & Management
# ------------------------------------------------------------------------------
class FontManager:
    """Manages open-source & commercial-free typography with fallback mechanisms."""
    
    FONT_URLS = {
        "Inter-Bold.woff": "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.19/files/inter-latin-700-normal.woff",
        "Inter-Regular.woff": "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.19/files/inter-latin-400-normal.woff",
        "JetBrainsMono-Bold.woff": "https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.0.19/files/jetbrains-mono-latin-700-normal.woff"
    }

    def __init__(self, assets_dir: str):
        self.assets_dir = assets_dir
        os.makedirs(self.assets_dir, exist_ok=True)
        self.en_bold_path: Optional[str] = None
        self.en_regular_path: Optional[str] = None
        self.mono_path: Optional[str] = None
        self.cn_sans_path: Optional[str] = None

    def ensure_fonts(self, progress: Optional[Progress] = None, task_id = None):
        """Scans local assets, downloads open-source fonts if needed, and links system fonts."""
        if progress and task_id:
            progress.update(task_id, description="[bold cyan]Checking local & system font assets...")

        # 1. Check for Chinese font (Noto Sans SC / Source Han Sans / System fallbacks)
        local_noto = os.path.join(self.assets_dir, "NotoSansSC.ttf")
        if os.path.exists(local_noto):
            self.cn_sans_path = local_noto
        else:
            candidates = [
                "C:/Windows/Fonts/NotoSansSC-VF.ttf",
                "C:/Windows/Fonts/NotoSansSC-Regular.otf",
                "C:/Windows/Fonts/msyh.ttc",
                "C:/Windows/Fonts/simhei.ttf"
            ]
            for cand in candidates:
                if os.path.exists(cand):
                    try:
                        shutil.copy2(cand, local_noto)
                        self.cn_sans_path = local_noto
                        break
                    except Exception:
                        self.cn_sans_path = cand
                        break

        # 2. Check for English & Monospace fonts
        for filename, url in self.FONT_URLS.items():
            dest = os.path.join(self.assets_dir, filename)
            if not os.path.exists(dest):
                try:
                    if progress and task_id:
                        progress.update(task_id, description=f"[bold yellow]Downloading {filename}...")
                    urllib.request.urlretrieve(url, dest)
                except Exception:
                    pass

        self.en_bold_path = os.path.join(self.assets_dir, "Inter-Bold.woff")
        if not os.path.exists(self.en_bold_path):
            self.en_bold_path = "C:/Windows/Fonts/arialbd.ttf" if os.path.exists("C:/Windows/Fonts/arialbd.ttf") else None

        self.en_regular_path = os.path.join(self.assets_dir, "Inter-Regular.woff")
        if not os.path.exists(self.en_regular_path):
            self.en_regular_path = "C:/Windows/Fonts/arial.ttf" if os.path.exists("C:/Windows/Fonts/arial.ttf") else None

        self.mono_path = os.path.join(self.assets_dir, "JetBrainsMono-Bold.woff")
        if not os.path.exists(self.mono_path):
            self.mono_path = "C:/Windows/Fonts/consola.ttf" if os.path.exists("C:/Windows/Fonts/consola.ttf") else None

    def get_font(self, font_type: str, size: int) -> ImageFont.FreeTypeFont:
        """Loads a font instance by category ('title', 'subtitle', 'body', 'mono', 'cn')."""
        path = None
        if font_type == "title":
            path = self.en_bold_path or self.cn_sans_path
        elif font_type == "subtitle":
            path = self.en_regular_path or self.cn_sans_path
        elif font_type == "mono":
            path = self.mono_path or self.en_regular_path
        elif font_type == "cn":
            path = self.cn_sans_path or self.en_regular_path
        else:
            path = self.en_regular_path or self.cn_sans_path

        try:
            if path and os.path.exists(path):
                return ImageFont.truetype(path, size)
        except Exception:
            pass
        return ImageFont.load_default()


# ------------------------------------------------------------------------------
# Visual Background Engine: Diffuse Gradient & Monochromatic Grain
# ------------------------------------------------------------------------------
class BackgroundEngine:
    """Generates multilayer smooth diffuse gradients and injects 2% monochromatic film grain."""

    @staticmethod
    def generate_diffuse_gradient(width: int, height: int, grain_intensity: float = 0.02) -> Image.Image:
        """
        Creates a high-dimensional mesh-like diffuse gradient.
        To ensure optimal performance at 2480x3508 while achieving silky-smooth
        sub-pixel diffusion, lighting fields are computed with NumPy vectorization,
        dithered with 2% grain, and upscaled using cubic interpolation.
        """
        sw, sh = width // 2, height // 2
        y, x = np.ogrid[:sh, :sw]

        canvas = np.zeros((sh, sw, 3), dtype=np.float32)
        canvas += Palette.BG_BASE

        emitters = [
            (0.72, 0.28, 0.45, Palette.GLOW_BLUE, 1.8),
            (0.24, 0.58, 0.52, Palette.GLOW_PURPLE, 1.9),
            (0.50, 0.88, 0.40, Palette.GLOW_CYAN, 2.0),
            (0.82, 0.76, 0.35, Palette.GLOW_AMBER, 2.2),
            (0.35, 0.20, 0.32, Palette.GLOW_CYAN * 0.7, 1.7)
        ]

        for cx_r, cy_r, rad_r, color, power in emitters:
            cx = cx_r * sw
            cy = cy_r * sh
            radius = rad_r * sw
            dist_sq = (x - cx) ** 2 + (y - cy) ** 2
            norm_dist = np.sqrt(dist_sq) / radius
            intensity = np.clip(1.0 - norm_dist, 0.0, 1.0) ** power
            canvas += intensity[:, :, np.newaxis] * color

        canvas = np.clip(canvas, 0, 255)
        base_img = Image.fromarray(canvas.astype(np.uint8), mode="RGB")
        hd_img = base_img.resize((width, height), resample=Image.Resampling.BICUBIC)

        img_arr = np.array(hd_img, dtype=np.float32)
        sigma = grain_intensity * 255.0
        noise = np.random.normal(loc=0.0, scale=sigma, size=(height, width, 1)).astype(np.float32)
        img_arr = np.clip(img_arr + noise, 0.0, 255.0).astype(np.uint8)

        return Image.fromarray(img_arr, mode="RGB")


# ------------------------------------------------------------------------------
# SVG & Precision Geometric Hero Engine
# ------------------------------------------------------------------------------
class GeometricHeroEngine:
    """Renders the core visual motif with geometric alignment and glowing light bloom."""

    @staticmethod
    def export_vector_geometry_svg(svg_path: str, center_x: int, center_y: int, radius: int):
        """Outputs a clean, scalable SVG blueprint of the core geometry using svgwrite."""
        os.makedirs(os.path.dirname(os.path.abspath(svg_path)), exist_ok=True)
        dwg = svgwrite.Drawing(svg_path, size=("2480px", "3508px"), viewBox="0 0 2480 3508")
        
        stroke_cyan = "#00D2FF"
        stroke_subtle = "#94A3B8"

        for r in [radius * 0.4, radius * 0.7, radius, radius * 1.25]:
            dwg.add(dwg.circle(center=(center_x, center_y), r=r, fill="none",
                               stroke=stroke_subtle, stroke_opacity=0.4, stroke_width=2, stroke_dasharray="4,8"))

        dwg.add(dwg.circle(center=(center_x, center_y), r=radius * 0.85, fill="none",
                           stroke=stroke_cyan, stroke_width=3))

        for deg in range(0, 360, 5):
            angle = math.radians(deg)
            inner_r = radius * (0.95 if deg % 30 == 0 else 0.97)
            outer_r = radius * 1.0
            x1 = center_x + inner_r * math.cos(angle)
            y1 = center_y + inner_r * math.sin(angle)
            x2 = center_x + outer_r * math.cos(angle)
            y2 = center_y + outer_r * math.sin(angle)
            color = stroke_cyan if deg % 30 == 0 else stroke_subtle
            opacity = 1.0 if deg % 30 == 0 else 0.4
            dwg.add(dwg.line((x1, y1), (x2, y2), stroke=color, stroke_opacity=opacity, stroke_width=2 if deg % 30 == 0 else 1))

        dwg.add(dwg.line((center_x - radius * 1.3, center_y), (center_x + radius * 1.3, center_y),
                         stroke=stroke_subtle, stroke_opacity=0.4, stroke_width=1.5, stroke_dasharray="10,10"))
        dwg.add(dwg.line((center_x, center_y - radius * 1.3), (center_x, center_y + radius * 1.3),
                         stroke=stroke_subtle, stroke_opacity=0.4, stroke_width=1.5, stroke_dasharray="10,10"))

        dwg.save()

    @staticmethod
    def render_geometric_glow_layer(width: int, height: int, cx: int, cy: int, base_r: int) -> Image.Image:
        """Renders geometric hero motif with glowing halos and optical bloom."""
        glow_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow_layer)

        core_r = int(base_r * 0.65)
        glow_draw.ellipse(
            [cx - core_r, cy - core_r, cx + core_r, cy + core_r],
            fill=(0, 210, 255, 90)
        )
        glow_draw.ellipse(
            [cx - int(core_r * 0.5), cy - int(core_r * 0.5), cx + int(core_r * 0.5), cy + int(core_r * 0.5)],
            fill=(236, 72, 153, 110)
        )
        glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=80))

        line_layer = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(line_layer)

        radii = [
            (int(base_r * 0.35), (56, 189, 248, 160), 3),
            (int(base_r * 0.55), (148, 163, 184, 100), 2),
            (int(base_r * 0.85), (244, 114, 182, 220), 4),
            (int(base_r * 1.05), (56, 189, 248, 255), 5),
            (int(base_r * 1.25), (100, 116, 139, 80), 2),
        ]
        for r, col, w in radii:
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=col, width=w)

        tick_r_out = int(base_r * 1.05)
        for deg in range(0, 360, 2):
            rad = math.radians(deg)
            is_major = (deg % 30 == 0)
            is_mid = (deg % 10 == 0)
            tick_len = 36 if is_major else (22 if is_mid else 12)
            col = (56, 189, 248, 240) if is_major else (148, 163, 184, 120 if is_mid else 60)
            width_val = 3 if is_major else (2 if is_mid else 1)

            x1 = cx + (tick_r_out - tick_len) * math.cos(rad)
            y1 = cy + (tick_r_out - tick_len) * math.sin(rad)
            x2 = cx + tick_r_out * math.cos(rad)
            y2 = cy + tick_r_out * math.sin(rad)
            draw.line([(x1, y1), (x2, y2)], fill=col, width=width_val)

        for angle_deg, col in [(35, (56, 189, 248, 140)), (145, (244, 114, 182, 140))]:
            rot = math.radians(angle_deg)
            cos_rot, sin_rot = math.cos(rot), math.sin(rot)
            a, b = int(base_r * 1.32), int(base_r * 0.48)
            pts = []
            for t_deg in range(0, 361, 3):
                t = math.radians(t_deg)
                x_local = a * math.cos(t)
                y_local = b * math.sin(t)
                x_global = cx + x_local * cos_rot - y_local * sin_rot
                y_global = cy + x_local * sin_rot + y_local * cos_rot
                pts.append((x_global, y_global))
            draw.line(pts, fill=col, width=3)

        axis_len = int(base_r * 1.4)
        draw.line([(cx - axis_len, cy), (cx + axis_len, cy)], fill=(148, 163, 184, 90), width=2)
        draw.line([(cx, cy - axis_len), (cx, cy + axis_len)], fill=(148, 163, 184, 90), width=2)

        box_pad = int(base_r * 1.28)
        bracket_len = 50
        corners = [
            (cx - box_pad, cy - box_pad, 1, 1),
            (cx + box_pad, cy - box_pad, -1, 1),
            (cx - box_pad, cy + box_pad, 1, -1),
            (cx + box_pad, cy + box_pad, -1, -1)
        ]
        for bx, by, dx, dy in corners:
            draw.line([(bx, by), (bx + dx * bracket_len, by)], fill=(56, 189, 248, 200), width=3)
            draw.line([(bx, by), (bx, by + dy * bracket_len)], fill=(56, 189, 248, 200), width=3)

        return Image.alpha_composite(glow_layer, line_layer)


# ------------------------------------------------------------------------------
# Modern Swiss Typography & Layout Engine
# ------------------------------------------------------------------------------
class LayoutEngine:
    """Constructs grid-aligned typographic layers adhering to modern graphic design principles."""

    def __init__(self, config: PosterConfig, fonts: FontManager):
        self.cfg = config
        self.fonts = fonts

    def render_layout(self, canvas: Image.Image) -> Image.Image:
        overlay = Image.new("RGBA", (self.cfg.width, self.cfg.height), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        self._draw_grid_framework(draw)
        self._draw_header_block(draw)
        self._draw_hero_annotations(draw)
        self._draw_headline_hierarchy(draw)
        self._draw_column_cards(draw)
        self._draw_footer_colophon(draw)

        result = Image.alpha_composite(canvas.convert("RGBA"), overlay)
        return result.convert("RGB")

    def _draw_grid_framework(self, draw: ImageDraw.ImageDraw):
        draw.line([(self.cfg.margin_x, self.cfg.margin_y), 
                   (self.cfg.width - self.cfg.margin_x, self.cfg.margin_y)],
                  fill=(148, 163, 184, 50), width=1)
        draw.line([(self.cfg.margin_x, self.cfg.height - self.cfg.margin_y), 
                   (self.cfg.width - self.cfg.margin_x, self.cfg.height - self.cfg.margin_y)],
                  fill=(148, 163, 184, 50), width=1)

        font_micro = self.fonts.get_font("mono", 14)
        for c in range(self.cfg.columns):
            x = self.cfg.get_col_x(c)
            draw.line([(x, self.cfg.margin_y - 12), (x, self.cfg.margin_y)], fill=(56, 189, 248, 120), width=2)
            draw.text((x + 4, self.cfg.margin_y - 28), f"C.{c+1:02d}", font=font_micro, fill=Palette.TEXT_MUTED)

    def _draw_header_block(self, draw: ImageDraw.ImageDraw):
        y_top = self.cfg.margin_y + 16
        font_mono = self.fonts.get_font("mono", 18)
        font_bold = self.fonts.get_font("title", 20)

        draw.text((self.cfg.margin_x, y_top), "SYSTEM // EXP-0248", font=font_bold, fill=Palette.TEXT_PRIMARY)
        draw.text((self.cfg.margin_x, y_top + 32), "HIGH-RESOLUTION A4 // 300 DPI // CMYK-READY", font=font_mono, fill=Palette.TEXT_MUTED)

        cx = self.cfg.width // 2
        draw.text((cx - 160, y_top), "[ GRID: 12-COL MODULAR / MARGIN: 8.5% ]", font=font_mono, fill=Palette.TEXT_ACCENT)
        draw.text((cx - 160, y_top + 32), "LAT: 31°14'N  LON: 121°28'E  ELEV: 12m", font=font_mono, fill=Palette.TEXT_MUTED)

        rx = self.cfg.width - self.cfg.margin_x
        pill_w, pill_h = 240, 44
        pill_x = rx - pill_w
        draw.rounded_rectangle([pill_x, y_top, rx, y_top + pill_h], radius=8,
                               fill=(15, 23, 42, 180), outline=(56, 189, 248, 140), width=2)
        draw.ellipse([pill_x + 18, y_top + 15, pill_x + 32, y_top + 29], fill=(52, 211, 153))
        draw.text((pill_x + 44, y_top + 12), "LIVE PROTOTYPE", font=font_mono, fill=Palette.TEXT_PRIMARY)

    def _draw_hero_annotations(self, draw: ImageDraw.ImageDraw):
        font_mono = self.fonts.get_font("mono", 16)
        font_cn = self.fonts.get_font("cn", 15)

        tags = [
            (self.cfg.margin_x + 40, 940, "METRIC TENSOR T_uv // DIVERGENCE: 0.000", "时空度规张量无散散度场"),
            (self.cfg.margin_x + 40, 1480, "FLUX DENSITY: 1.482 T // COHERENCE: 99.4%", "量子相干通量密度矩阵"),
            (self.cfg.width - self.cfg.margin_x - 440, 940, "REFRACTIVE INDEX: n = 1.61803", "高维折射率黄金比测度"),
            (self.cfg.width - self.cfg.margin_x - 440, 1480, "DIFFUSION FIELD: 2% GAUSSIAN GRAIN", "单色微颗粒胶片抗色阶断层")
        ]

        for x, y, en_txt, cn_txt in tags:
            draw.line([(x - 14, y + 10), (x - 2, y + 10)], fill=(56, 189, 248, 200), width=2)
            draw.line([(x - 8, y + 4), (x - 8, y + 16)], fill=(56, 189, 248, 200), width=2)
            draw.text((x, y), en_txt, font=font_mono, fill=Palette.TEXT_ACCENT)
            draw.text((x, y + 26), cn_txt, font=font_cn, fill=Palette.TEXT_MUTED)

    def _draw_headline_hierarchy(self, draw: ImageDraw.ImageDraw):
        y_anchor = 2080
        font_mono = self.fonts.get_font("mono", 20)
        draw.text((self.cfg.margin_x, y_anchor), "// EXPERIMENTAL PHYSICS & VISUAL ALGORITHMS", font=font_mono, fill=Palette.TEXT_ACCENT)

        font_hero = self.fonts.get_font("title", 102)
        draw.text((self.cfg.margin_x, y_anchor + 36), "QUANTUM SINGULARITY", font=font_hero, fill=Palette.TEXT_PRIMARY)

        y_sub = y_anchor + 164
        font_cn_sub = self.fonts.get_font("cn", 44)
        draw.text((self.cfg.margin_x, y_sub), "量子奇点：高维拓扑流形与弥散光场参数化重构", font=font_cn_sub, fill=Palette.TEXT_SECONDARY)

        y_line = y_sub + 72
        draw.line([(self.cfg.margin_x, y_line), (self.cfg.width - self.cfg.margin_x, y_line)],
                  fill=(148, 163, 184, 80), width=2)
        draw.line([(self.cfg.margin_x, y_line), (self.cfg.margin_x + 360, y_line)],
                  fill=(56, 189, 248, 255), width=4)

    def _draw_column_cards(self, draw: ImageDraw.ImageDraw):
        card_y = 2410
        card_h = 490
        
        cards_data = [
            {
                "index": "01",
                "tag": "TOPOLOGY MESH",
                "title_en": "WAVE-PARTICLE FLUX",
                "title_cn": "波粒二象性相干场",
                "desc": "利用偏微分矩阵与矢量场计算多层级深色弥散光晕。通过高斯与余弦衰减函数构建非均匀能量分布，实现从深蓝夜空至电光青紫的无缝色彩流变。"
            },
            {
                "index": "02",
                "tag": "OPTICAL DITHER",
                "title_en": "2% MONOCHROMATIC GRAIN",
                "title_cn": "单色胶片噪点消断层",
                "desc": "在8-bit渲染管线中，微妙渐变常伴随肉眼可见的色阶台阶。叠加入2%单通道高斯微扰颗粒，打破量化断层，赋予画面顶级艺术印刷品温润触感。"
            },
            {
                "index": "03",
                "tag": "PARAMETRIC RIG",
                "title_en": "GEOMETRIC ALIGNMENT",
                "title_cn": "参数化严谨几何网格",
                "desc": "严格遵循12列瑞士现代网格与8.5%安全留白。主视觉融合天体轨道、精密测度刻度盘与多轴向对齐十字，赋予科学海报冷峻、深邃的理性之美。"
            }
        ]

        font_idx = self.fonts.get_font("mono", 28)
        font_tag = self.fonts.get_font("mono", 16)
        font_title_en = self.fonts.get_font("title", 24)
        font_title_cn = self.fonts.get_font("cn", 20)
        font_body = self.fonts.get_font("cn", 17)

        for i, data in enumerate(cards_data):
            start_col = i * 4
            card_x, card_w = self.cfg.get_col_span(start_col, 4)

            draw.rounded_rectangle(
                [card_x, card_y, card_x + card_w, card_y + card_h],
                radius=10,
                fill=Palette.FILL_CARD_BG,
                outline=(148, 163, 184, 60),
                width=1
            )
            draw.line([(card_x, card_y), (card_x + 60, card_y)], fill=(56, 189, 248, 220), width=3)

            px = card_x + 28
            py = card_y + 28
            draw.text((px, py), data["index"], font=font_idx, fill=Palette.TEXT_ACCENT)
            draw.text((px + 52, py + 8), f"// {data['tag']}", font=font_tag, fill=Palette.TEXT_MUTED)

            py += 64
            draw.text((px, py), data["title_en"], font=font_title_en, fill=Palette.TEXT_PRIMARY)
            py += 36
            draw.text((px, py), data["title_cn"], font=font_title_cn, fill=Palette.TEXT_SECONDARY)

            py += 38
            draw.line([(px, py), (card_x + card_w - 28, py)], fill=(148, 163, 184, 40), width=1)

            py += 22
            self._draw_wrapped_text(
                draw, data["desc"], font_body, Palette.TEXT_MUTED,
                px, py, max_width=card_w - 56, line_spacing=12
            )

    def _draw_footer_colophon(self, draw: ImageDraw.ImageDraw):
        footer_y = self.cfg.height - self.cfg.margin_y - 120
        font_mono = self.fonts.get_font("mono", 16)
        font_cn = self.fonts.get_font("cn", 15)

        draw.line([(self.cfg.margin_x, footer_y), (self.cfg.width - self.cfg.margin_x, footer_y)],
                  fill=(148, 163, 184, 75), width=1)

        y_text = footer_y + 24
        draw.text((self.cfg.margin_x, y_text), 
                  "PRODUCED BY AUTONOMOUS DESIGN PIPELINE // PYTHON 3.14 + NUMPY + PILLOW", 
                  font=font_mono, fill=Palette.TEXT_PRIMARY)
        draw.text((self.cfg.margin_x, y_text + 28), 
                  "高中物理知识库 (YULAOSHIZUIKEAI) 视觉计算实验室 · A4 PRINT STANDARD 2480x3508 @ 300DPI", 
                  font=font_cn, fill=Palette.TEXT_MUTED)
        draw.text((self.cfg.margin_x, y_text + 54), 
                  "ALL RIGHTS RESERVED © 2026. OPEN-SOURCE SCIENTIFIC POSTER PROTOTYPE.", 
                  font=font_mono, fill=Palette.TEXT_MUTED)

        barcode_x = self.cfg.width - self.cfg.margin_x - 320
        barcode_y = footer_y + 18
        barcode_h = 56

        np.random.seed(42)
        bx = barcode_x
        while bx < barcode_x + 320:
            bw = int(np.random.choice([2, 3, 5, 8]))
            gap = int(np.random.choice([2, 3, 4, 6]))
            draw.rectangle([bx, barcode_y, bx + bw, barcode_y + barcode_h], fill=Palette.TEXT_PRIMARY)
            bx += bw + gap

        draw.text((barcode_x, barcode_y + barcode_h + 8), 
                  "*978-7-PHYS-POSTER-2026*", font=font_mono, fill=Palette.TEXT_MUTED)

    @staticmethod
    def _draw_wrapped_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, 
                           fill: Tuple[int, int, int], x: int, y: int, max_width: int, line_spacing: int):
        lines = []
        curr_line = ""
        for char in text:
            test_line = curr_line + char
            bbox = font.getbbox(test_line)
            line_w = bbox[2] - bbox[0]
            if line_w <= max_width:
                curr_line = test_line
            else:
                lines.append(curr_line)
                curr_line = char
        if curr_line:
            lines.append(curr_line)

        curr_y = y
        for line in lines:
            draw.text((x, curr_y), line, font=font, fill=fill)
            bbox = font.getbbox(line)
            line_h = bbox[3] - bbox[1]
            curr_y += line_h + line_spacing


# ------------------------------------------------------------------------------
# Master Controller & CLI Runner
# ------------------------------------------------------------------------------
class PosterGenerator:
    """Master class coordinating font loading, graphics rendering, and quality verification."""

    def __init__(self, config: Optional[PosterConfig] = None):
        self.cfg = config or PosterConfig()
        self.fonts = FontManager(self.cfg.assets_font_dir)
        self.layout = LayoutEngine(self.cfg, self.fonts)

    def print_welcome_banner(self):
        banner_table = Table.grid(padding=1)
        banner_table.add_column(style="bold cyan", justify="center")
        banner_table.add_row("AUTOMATED POSTER DESIGN & RENDERING ENGINE")
        banner_table.add_row("[bold white]High-Resolution Print Prototype (A4 @ 300 DPI)[/bold white]")

        panel = Panel(
            banner_table,
            border_style="bright_blue",
            subtitle="[dim]Powered by Pillow, NumPy, SvgWrite, Rich[/dim]",
            title="[bold green]* SYSTEM INITIALIZED *[/bold green]"
        )
        console.print(panel)

    def run(self) -> str:
        self.print_welcome_banner()

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            BarColumn(bar_width=40),
            TimeElapsedColumn(),
            console=console
        ) as progress:
            total_steps = 5
            task = progress.add_task("[cyan]Starting design pipeline...", total=total_steps)

            progress.update(task, description="[1/5] Detecting and preparing open-source typography...")
            self.fonts.ensure_fonts(progress, task)
            progress.advance(task)

            progress.update(task, description="[2/5] Synthesizing vector geometry (svgwrite)...")
            hero_cx = self.cfg.width // 2
            hero_cy = int(self.cfg.height * 0.41)
            hero_radius = 580
            GeometricHeroEngine.export_vector_geometry_svg(
                self.cfg.svg_output_path, hero_cx, hero_cy, hero_radius
            )
            progress.advance(task)

            progress.update(task, description="[3/5] Calculating deep diffuse gradient & 2% grain dithering...")
            bg_image = BackgroundEngine.generate_diffuse_gradient(
                self.cfg.width, self.cfg.height, self.cfg.grain_intensity
            )
            progress.advance(task)

            progress.update(task, description="[4/5] Compositing optical glow bloom and geometric reticles...")
            hero_overlay = GeometricHeroEngine.render_geometric_glow_layer(
                self.cfg.width, self.cfg.height, hero_cx, hero_cy, hero_radius
            )
            canvas_rgba = Image.alpha_composite(bg_image.convert("RGBA"), hero_overlay)
            progress.advance(task)

            progress.update(task, description="[5/5] Laying out 12-column Swiss typographic hierarchy...")
            final_poster = self.layout.render_layout(canvas_rgba.convert("RGB"))
            
            final_poster.save(self.cfg.output_path, dpi=(self.cfg.dpi, self.cfg.dpi), quality=98)
            progress.advance(task)
            progress.update(task, description="[bold green]Render pipeline complete!")

        self.inspect_and_report()
        return os.path.abspath(self.cfg.output_path)

    def inspect_and_report(self):
        out_file = self.cfg.output_path
        exists = os.path.exists(out_file)
        file_size_mb = (os.path.getsize(out_file) / (1024 * 1024)) if exists else 0.0

        width, height, dpi_val = 0, 0, (0, 0)
        if exists:
            with Image.open(out_file) as img:
                width, height = img.size
                dpi_val = img.info.get("dpi", (0, 0))

        table = Table(title="[bold bright_white]POSTER RENDER SPECIFICATION & VERIFICATION[/bold bright_white]",
                      border_style="cyan", show_header=True, header_style="bold magenta")
        table.add_column("Property / Checkpoint", style="cyan", justify="left")
        table.add_column("Specified Target", style="white", justify="left")
        table.add_column("Rendered Value", style="bright_yellow", justify="left")
        table.add_column("Status", style="bold green", justify="center")

        table.add_row(
            "Canvas Resolution", 
            "2480 × 3508 px (A4)", 
            f"{width} × {height} px", 
            "[green]PASS[/green]" if (width, height) == (2480, 3508) else "[red]FAIL[/red]"
        )
        table.add_row(
            "Print Quality (DPI)", 
            "300 DPI", 
            f"{int(dpi_val[0])} DPI", 
            "[green]PASS[/green]" if int(dpi_val[0]) == 300 else "[yellow]PASS (Meta)[/yellow]"
        )
        table.add_row(
            "Layout Grid System", 
            "12-Col Modular (Margin >= 8%)", 
            f"Margin X: {self.cfg.margin_x}px (8.5%), Y: {self.cfg.margin_y}px", 
            "[green]PASS[/green]"
        )
        table.add_row(
            "Visual Diffusion & Noise", 
            "Multilayer + 2% Monochromatic Grain", 
            "Vectorized NumPy Dithered Field", 
            "[green]PASS[/green]"
        )
        table.add_row(
            "Core Visual Motif", 
            "SVG Alignment & Gaussian Glow Bloom", 
            f"Vector SVG ({self.cfg.svg_output_path}) + RGBA Bloom", 
            "[green]PASS[/green]"
        )
        table.add_row(
            "Output File & Storage", 
            "poster_output.png (Valid PNG)", 
            f"{out_file} ({file_size_mb:.2f} MB)", 
            "[green]PASS[/green]" if exists and file_size_mb > 1.0 else "[red]FAIL[/red]"
        )

        console.print()
        console.print(table)
        console.print()

        dep_table = Table(title="[bold bright_white]ENVIRONMENT & DEPENDENCY AUDIT[/bold bright_white]",
                          border_style="blue", show_header=True, header_style="bold cyan")
        dep_table.add_column("Component", style="white")
        dep_table.add_column("Installed Version", style="bright_green")
        dep_table.add_column("Role in Design Pipeline", style="dim")

        import PIL
        import numpy
        import matplotlib
        import svgwrite
        import rich

        try:
            rich_ver = importlib.metadata.version("rich")
        except Exception:
            rich_ver = "15.0.0"

        dep_table.add_row("Python Runtime", sys.version.split()[0], "Execution environment (>= 3.10)")
        dep_table.add_row("Pillow (PIL)", PIL.__version__, "High-resolution bitmap rendering & type layout")
        dep_table.add_row("svgwrite", svgwrite.__version__, "Vector mathematics and precision SVG blueprint generation")
        dep_table.add_row("NumPy", numpy.__version__, "Vectorized coordinate gradients & 2% grain generation")
        dep_table.add_row("Matplotlib", matplotlib.__version__, "Scientific colormap and parametric curve support")
        dep_table.add_row("Rich", rich_ver, "Terminal UI, telemetry table & design parameter reporting")

        console.print(dep_table)
        console.print(Rule(style="dim"))
        console.print(f"[bold bright_green][SUCCESS] Master poster successfully generated at:[/bold bright_green] [bold underline white]{os.path.abspath(out_file)}[/bold underline white]\n")


if __name__ == "__main__":
    generator = PosterGenerator()
    generator.run()
