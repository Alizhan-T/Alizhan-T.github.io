"""Render scripts/intro/scene.js to an MP4.

usage: python3 scripts/intro/render.py preview t1 t2 ...   -> /tmp/intro_preview/f_<t>.png
       python3 scripts/intro/render.py full out.mp4         -> 60fps render, 2-frame shutter blur -> 30fps
Run from the repo root (it serves the repo on :8765 so node_modules/three resolves).
"""
import asyncio, base64, os, subprocess, sys, time
from playwright.async_api import async_playwright

W, H = 1920, 1080
FPS_RENDER, DURATION = 60, 5.0
BG = (4, 6, 10)  # #04060A


async def main():
    mode = sys.argv[1]
    server = subprocess.Popen([sys.executable, "-m", "http.server", "8765", "--bind", "127.0.0.1"],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1.0)
    try:
        async with async_playwright() as p:
            b = await p.chromium.launch(executable_path="/usr/bin/google-chrome",
                                        args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader",
                                              "--ignore-gpu-blocklist"])
            pg = await b.new_page(viewport={"width": W, "height": H})
            pg.on("pageerror", lambda e: print("PAGEERROR", e))
            pg.on("console", lambda m: print("console:", m.text) if m.type in ("error", "warning") else None)
            await pg.goto(f"http://127.0.0.1:8765/scripts/intro/index.html?w={W}&h={H}" + os.environ.get("EXTRA", ""))
            await pg.wait_for_function("window.sceneReady === true", timeout=120000)

            async def grab(t):
                data = await pg.evaluate(
                    "(t) => { window.renderAt(t); return document.querySelector('canvas').toDataURL('image/png'); }", t)
                return base64.b64decode(data.split(",", 1)[1])

            if mode == "preview":
                os.makedirs("/tmp/intro_preview", exist_ok=True)
                for ts in sys.argv[2:]:
                    t0 = time.time()
                    png = await grab(float(ts))
                    open(f"/tmp/intro_preview/f_{ts}.png", "wb").write(png)
                    print(f"t={ts} {time.time()-t0:.2f}s")
            else:
                out = sys.argv[2]
                tmp = out[:-4] + ".partial.mp4"
                # lift pure black to #04060A with a screen blend so the clip matches the site background exactly
                lut = ":".join(f"{c}='val+{v}-{v}*val/255'" for c, v in zip("rgb", BG))
                ff = subprocess.Popen([
                    "ffmpeg", "-v", "error", "-y", "-f", "image2pipe", "-framerate", str(FPS_RENDER), "-c:v", "png",
                    "-i", "-", "-vf", f"tmix=frames=2,fps=30,lutrgb={lut},format=yuv420p",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-tune", "film", "-profile:v", "high",
                    "-level", "4.1", "-pix_fmt", "yuv420p", "-color_range", "tv", "-colorspace", "bt709",
                    "-color_primaries", "bt709", "-color_trc", "bt709", "-movflags", "+faststart", "-g", "60", tmp,
                ], stdin=subprocess.PIPE)
                n = int(DURATION * FPS_RENDER)
                t0 = time.time()
                for i in range(n):
                    ff.stdin.write(await grab(i / FPS_RENDER))
                    if i % 30 == 0:
                        print(f"frame {i}/{n} {time.time()-t0:.0f}s", flush=True)
                ff.stdin.close()
                if ff.wait() == 0:
                    os.replace(tmp, out)
                    print("done", out)
                else:
                    sys.exit("ffmpeg failed")
            await b.close()
    finally:
        server.terminate()


asyncio.run(main())
