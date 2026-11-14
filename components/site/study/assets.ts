import fs from "node:fs";
import path from "node:path";

/**
 * Finds a case study's images on disk at build time, so a screenshot
 * appears as soon as its file is added to /public (no code change).
 */
const PUBLIC = path.join(process.cwd(), "public");
const EXT = ["webp", "png", "jpg", "jpeg", "avif"];

export type Found = { src: string; width?: number; height?: number };

/** width × height from a PNG, JPEG or WebP header (so the page reserves the right space) */
function size(file: string): { width: number; height: number } | undefined {
  try {
    const b = fs.readFileSync(file);
    if (b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") {
      const kind = b.toString("ascii", 12, 16);
      if (kind === "VP8X") return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
      if (kind === "VP8L") { const v = b.readUInt32LE(21); return { width: 1 + (v & 0x3fff), height: 1 + ((v >> 14) & 0x3fff) }; }
      if (kind === "VP8 ") return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    }
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { width: b.readUInt16BE(i + 7), height: b.readUInt16BE(i + 5) };
        i += 2 + b.readUInt16BE(i + 2);
      }
    }
  } catch {}
  return undefined;
}

function find(rel: string): Found | null {
  const file = path.join(PUBLIC, rel);
  if (!fs.existsSync(file)) return null;
  return { src: "/" + rel.split(path.sep).join("/"), ...size(file) };
}

/** /images/case-studies/<slug>/screens/<id>.(webp|png|jpg|jpeg|avif) */
export function screenFile(slug: string, id: string): Found | null {
  for (const e of EXT) {
    const f = find(path.join("images", "case-studies", slug, "screens", `${id}.${e}`));
    if (f) return f;
  }
  return null;
}
