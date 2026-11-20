import { copyFile, cp, readdir, rename, unlink } from "node:fs/promises";
import { join } from "node:path";

await rename("dist/index.dev.html", "dist/index.html");

// Both the root Pages deployment and a standalone dist/ need the same runtime URLs.
for (const name of ["models", "draco", "media", "favicon.svg", ".nojekyll"]) {
  await cp(name, join("dist", name), { recursive: true });
}

// Publish the entry after every chunk it references is present.
const next = new Set(await readdir("dist/assets"));
await cp("dist/assets", "assets", { recursive: true });
await copyFile("dist/index.html", "index.html.next");
await rename("index.html.next", "index.html");

// Only prune stale content-hashed Vite outputs; leave any hand-authored assets alone.
for (const file of await readdir("assets")) {
  if (!next.has(file) && /-[A-Za-z0-9_-]{8}\.(js|css|woff2?|svg|webp)$/.test(file)) {
    await unlink(join("assets", file));
  }
}
