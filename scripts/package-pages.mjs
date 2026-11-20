import { copyFile, cp, readdir, rename, unlink } from "node:fs/promises";
import { join } from "node:path";

await rename("dist/index.dev.html", "dist/index.html");

for (const name of ["favicon.svg", ".nojekyll"]) {
  try {
    await cp(name, join("dist", name), { recursive: true });
  } catch {
    // Optional static file may not exist
  }
}

const next = new Set(await readdir("dist/assets"));
await cp("dist/assets", "assets", { recursive: true });
try {
  await cp("dist/videos", "videos", { recursive: true });
} catch {
  // Optional videos folder
}
await copyFile("dist/index.html", "index.html.next");
await rename("index.html.next", "index.html");

try {
  for (const file of await readdir("assets")) {
    if (!next.has(file) && /-[A-Za-z0-9_-]{8}\.(js|css|woff2?|svg|webp)$/.test(file)) {
      await unlink(join("assets", file));
    }
  }
} catch {
  // Ignore if assets directory does not exist
}
