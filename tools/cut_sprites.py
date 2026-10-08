#!/usr/bin/env python3
"""Recorta as folhas do Grok (assets/raw/<id>.jpeg) em 16 frames transparentes.

Saída:
  assets/sprites/<id>.png   atlas com os 16 frames
  assets/portraits/<id>.png retrato recortado do idle
  assets/stage.jpg          cenário em 960x540
  js/atlas.js               CF.ATLAS[id] = {src, frames: [[x, y, w, h, ax, ay], ...]}
  assets/debug/<id>.png     folha de conferência com âncoras

Uso: python3 tools/cut_sprites.py
"""
import glob
import json
import os

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(ROOT, 'assets', 'raw')
TARGET_H = 170          # altura do corpo no idle, em px de jogo
SOLID, SOFT_LO, SOFT_HI = 110, 60, 150
FRAMES = 16


def load(path):
    img = Image.open(path).convert('RGB')
    a = np.asarray(img).astype(np.float32)
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bg = np.median(border, axis=0)
    dist = np.abs(a - bg).sum(axis=2)
    return a, bg, dist


def best_cut(profile, center, radius):
    lo, hi = max(1, int(center - radius)), min(len(profile) - 1, int(center + radius))
    seg = profile[lo:hi]
    m = seg.min()
    cands = np.where(seg <= m)[0] + lo
    return int(cands[np.argmin(np.abs(cands - center))])


def cut_sheet(path):
    a, bg, dist = load(path)
    H, W = dist.shape
    solid = dist > SOLID
    solid = ndimage.binary_opening(solid, iterations=1)
    lab, n = ndimage.label(solid, structure=np.ones((3, 3)))
    sizes = ndimage.sum(solid, lab, range(1, n + 1))
    for i, s in enumerate(sizes, start=1):
        if s < 40:
            solid[lab == i] = False
    lab, n = ndimage.label(solid, structure=np.ones((3, 3)))

    rows = [0] + [best_cut(solid.sum(axis=1), H * k / 4, H * 0.09) for k in (1, 2, 3)] + [H]
    cell = np.full((H, W), -1, dtype=np.int32)
    for r in range(4):
        band = solid[rows[r]:rows[r + 1]]
        cols = [0] + [best_cut(band.sum(axis=0), W * k / 4, W * 0.1) for k in (1, 2, 3)] + [W]
        for c in range(4):
            cell[rows[r]:rows[r + 1], cols[c]:cols[c + 1]] = r * 4 + c

    # Cada componente vai inteiro para a célula majoritária, a não ser que
    # tenha massa relevante em mais de uma (dois corpos encostados).
    owner = np.full((H, W), -1, dtype=np.int32)
    for i in range(1, n + 1):
        m = lab == i
        cells = cell[m]
        counts = np.bincount(cells, minlength=FRAMES)
        major = int(counts.argmax())
        total = counts.sum()
        keep = [k for k in range(FRAMES) if counts[k] >= max(300, 0.15 * total)]
        if len(keep) <= 1:
            owner[m] = major
        else:
            sub = np.where(np.isin(cell, keep), cell, major)
            owner[m] = sub[m]

    alpha_all = np.clip((dist - SOFT_LO) / (SOFT_HI - SOFT_LO), 0, 1)
    frames = []
    for k in range(FRAMES):
        own = owner == k
        if not own.any():
            frames.append(None)
            continue
        region = ndimage.binary_dilation(own, iterations=3) & (alpha_all > 0)
        region &= (owner == k) | (owner == -1)
        ys, xs = np.where(region)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        al = (alpha_all * region)[y0:y1, x0:x1]
        rgb = a[y0:y1, x0:x1]
        # tira o rosa vazado da borda: c = (c - (1 - a) * bg) / a
        safe = np.maximum(al, 1e-3)[..., None]
        rgb = np.clip((rgb - (1 - al[..., None]) * bg) / safe, 0, 255)
        # franja do JPEG: rosa escurecido = fundo misturado com o contorno preto.
        # c ≈ t * bg  ->  contorno escuro com alpha (1 - t)
        edge = ndimage.binary_dilation(al < 0.5, iterations=3) & (al > 0)
        raw = a[y0:y1, x0:x1]
        t = np.clip((raw * bg).sum(axis=2) / (bg * bg).sum(), 0, 1)
        resid = np.abs(raw - t[..., None] * bg).sum(axis=2)
        fringe = edge & (resid < 60) & (t > 0.15)
        al = np.where(fringe, np.minimum(al, 1 - t), al)
        rgb[fringe] = (18, 12, 28)
        rgba = np.dstack([rgb, al * 255]).astype(np.uint8)

        # corpo = maior componente da célula; âncora nos pés
        olab, on = ndimage.label(own[y0:y1, x0:x1], structure=np.ones((3, 3)))
        osz = ndimage.sum(own[y0:y1, x0:x1], olab, range(1, on + 1))
        body = olab == (int(np.argmax(osz)) + 1)
        by, bx = np.where(body)
        bh = by.max() - by.min() + 1
        top = by <= by.min() + bh * 0.22
        ax = float(bx[top].mean()) if k != 14 else float((bx.min() + bx.max()) / 2)
        frames.append({'img': Image.fromarray(rgba), 'ax': ax, 'ay': float(by.max()),
                       'body_h': int(bh)})
    return frames


def pack(frames, scale):
    out, placed = [], []
    x = y = shelf = 0
    maxw = 1600
    imgs = []
    for f in frames:
        w, h = f['img'].size
        im = f['img'].resize((max(1, round(w * scale)), max(1, round(h * scale))), Image.LANCZOS)
        imgs.append(im)
    for im in imgs:
        w, h = im.size
        if x + w > maxw:
            x, y, shelf = 0, y + shelf + 2, 0
        placed.append((x, y))
        x += w + 2
        shelf = max(shelf, h)
    atlas = Image.new('RGBA', (maxw, y + shelf), (0, 0, 0, 0))
    for (px, py), im, f in zip(placed, imgs, frames):
        atlas.paste(im, (px, py))
        out.append([px, py, im.size[0], im.size[1], round(f['ax'] * scale, 1), round(f['ay'] * scale, 1)])
    return atlas, out, imgs


def portrait(im, ax, size=112):
    w, h = im.size
    side = int(h * 0.42)
    x0 = int(max(0, min(w - side, ax - side / 2)))
    crop = im.crop((x0, 0, x0 + side, side))
    return crop.resize((size, size), Image.LANCZOS)


def debug_sheet(cid, imgs, meta):
    cw, ch = 230, 230
    sheet = Image.new('RGBA', (cw * 4, ch * 4), (30, 26, 44, 255))
    d = ImageDraw.Draw(sheet)
    for i, (im, m) in enumerate(zip(imgs, meta)):
        ox, oy = (i % 4) * cw, (i // 4) * ch
        base_y = oy + ch - 20
        px, py = int(ox + cw / 2 - m[4]), int(base_y - m[5])
        sheet.alpha_composite(im, (max(0, px), max(0, py)))
        d.line([(ox, base_y), (ox + cw, base_y)], fill=(57, 255, 136, 255))
        d.ellipse([ox + cw / 2 - 3, base_y - 3, ox + cw / 2 + 3, base_y + 3], fill=(255, 80, 80, 255))
        d.text((ox + 4, oy + 4), str(i + 1), fill=(255, 255, 255, 255))
    return sheet


def main():
    for sub in ('sprites', 'portraits', 'debug'):
        os.makedirs(os.path.join(ROOT, 'assets', sub), exist_ok=True)
    atlas_js = {}
    for path in sorted(glob.glob(os.path.join(RAW, '*.jp*g')) + sorted(glob.glob(os.path.join(RAW, '*.png')))):
        cid = os.path.splitext(os.path.basename(path))[0]
        if cid == 'fundo':
            continue
        frames = cut_sheet(path)
        missing = [i + 1 for i, f in enumerate(frames) if f is None]
        if missing:
            print(f'{cid}: faltam poses {missing}, pulando')
            continue
        scale = TARGET_H / frames[0]['body_h']
        atlas, meta, imgs = pack(frames, scale)
        atlas.save(os.path.join(ROOT, 'assets', 'sprites', cid + '.png'))
        portrait(imgs[0], meta[0][4]).save(os.path.join(ROOT, 'assets', 'portraits', cid + '.png'))
        debug_sheet(cid, imgs, meta).save(os.path.join(ROOT, 'assets', 'debug', cid + '.png'))
        atlas_js[cid] = {'src': f'assets/sprites/{cid}.png', 'frames': meta}
        print(f'{cid}: ok (escala {scale:.2f})')

    stage = os.path.join(RAW, 'fundo.jpeg')
    if os.path.exists(stage):
        im = Image.open(stage).convert('RGB')
        w, h = im.size
        nh = round(h * 960 / w)
        im = im.resize((960, nh), Image.LANCZOS)
        off = max(0, nh - 540 - 40)
        im.crop((0, off, 960, off + 540)).save(os.path.join(ROOT, 'assets', 'stage.jpg'), quality=92)
        print('stage: ok')

    with open(os.path.join(ROOT, 'js', 'atlas.js'), 'w') as f:
        f.write('// Gerado por tools/cut_sprites.py. Não editar à mão.\n')
        f.write('// frames: [x, y, w, h, ancoraX, ancoraY] (âncora = pés)\n')
        f.write('var CF = window.CF || (window.CF = {});\nCF.ATLAS = ')
        f.write(json.dumps(atlas_js, separators=(',', ':')))
        f.write(';\n')


if __name__ == '__main__':
    main()
