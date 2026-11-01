// Secondary, self-contained browser review file. Native executable remains primary.
import { build } from "vite";
import react from "@vitejs/plugin-react";
import { writeFile, mkdir } from "node:fs/promises";
const result = await build({
  configFile: false,
  plugins: [react()],
  base: "./",
  build: {
    write: false,
    cssCodeSplit: false,
    rolldownOptions: { output: { codeSplitting: false } },
  },
});
const output = (Array.isArray(result) ? result[0] : result).output;
const assets = output.filter((a) => a.type === "asset");
const css = assets
  .filter((a) => a.fileName.endsWith(".css"))
  .map((a) => String(a.source))
  .join("\n")
  .replace(/url\(([^)]+)\)/g, (original, url) => {
    const name = url.replaceAll('"', "").replaceAll("'", "").split("/").at(-1);
    const font = assets.find(
      (a) => a.fileName.split("/").at(-1) === name && name.endsWith(".woff2"),
    );
    return font
      ? `url(data:font/woff2;base64,${Buffer.from(font.source).toString("base64")})`
      : original;
  });
const js = output
  .filter((a) => a.type === "chunk")
  .map((a) => a.code)
  .join("\n")
  .replace(/<\/script/gi, "<\\/script");
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SENTINEL / Secondary browser preview</title><style>${css}</style></head><body><div id="root"></div><script type="module">${js}</script></body></html>`;
await mkdir("dist-preview", { recursive: true });
await writeFile("dist-preview/SENTINEL-preview.html", html);
console.log(
  `Secondary portable preview: ${Buffer.byteLength(html)} bytes. No external runtime assets.`,
);
