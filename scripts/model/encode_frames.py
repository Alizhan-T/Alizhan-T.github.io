from pathlib import Path
import subprocess

import numpy as np
from PIL import Image

base = Path(__file__).resolve().parent / "build"
destination = Path(__file__).resolve().parents[2] / "public/media"
(destination / "orbit").mkdir(exist_ok=True, parents=True)
names = [f"{index:02}" for index in range(24)] + ["wheel", "high"]
atlas = Image.new("RGB", (448 * 6, 252 * 5))
for index, name in enumerate(names):
    frame = base / "frames" / f"{name}.png"
    output = destination / ("orbit" if index < 24 else "") / f"{name}.webp"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-i", str(frame), "-vf",
                    "nlmeans=s=4:p=5:r=11", "-quality", "88", "-frames:v", "1",
                    "-y", str(output)], check=True)
    with Image.open(base / "masks" / f"{name}.png") as mask:
        atlas.paste(mask.convert("RGB"), ((index % 6) * 448, (index // 6) * 252))
channels = np.asarray(atlas, dtype=np.int16)
r, g, b = (channels[:, :, i] for i in range(3))
for name, mask in {"paint": r - b, "lamp": g, "indicator": b - r,
                   "brake": np.minimum(r, b)}.items():
    Image.fromarray(mask.clip(0, 255).astype("uint8")).save(
        destination / f"mask-{name}.webp", lossless=True, method=6)
