/**
 * 웨딩 사진이 아직 없을 때, 레이아웃을 미리 보기 위한 임시 사진을 만듭니다.
 *
 *   npm run placeholders
 *
 * public/gallery/01.png ~ 14.png 를 만듭니다.
 * 실제 사진(01.jpg ~ 14.jpg)이 있으면 그쪽이 우선하므로, 사진을 넣은 뒤
 * `npm run placeholders:clean` 으로 지우면 됩니다.
 *
 * 외부 의존성 없이 zlib만으로 PNG를 직접 인코딩합니다.
 */
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "../public/gallery");
const COUNT = 14;
const W = 600;
const H = 800;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (const b of buf) crc = CRC_TABLE[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typed = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typed));
  return Buffer.concat([len, typed, crc]);
}

function encodePng(width, height, pixel) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  let p = 0;
  for (let y = 0; y < height; y++) {
    raw[p++] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixel(x, y);
      raw[p++] = r;
      raw[p++] = g;
      raw[p++] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 6 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// 청첩장 톤과 어울리는 웜 뉴트럴 그라디언트
const TONES = [
  [[214, 200, 184], [168, 150, 132]], [[226, 214, 200], [186, 170, 152]],
  [[198, 186, 176], [150, 138, 128]], [[232, 220, 206], [196, 178, 158]],
  [[206, 192, 180], [160, 146, 134]], [[220, 206, 190], [178, 160, 142]],
  [[212, 204, 196], [164, 156, 148]], [[234, 224, 212], [200, 186, 170]],
  [[200, 190, 182], [154, 144, 136]], [[224, 210, 194], [184, 166, 148]],
  [[210, 198, 186], [166, 152, 140]], [[228, 218, 206], [192, 180, 166]],
  [[204, 194, 186], [158, 148, 140]], [[218, 208, 196], [176, 164, 152]],
];

mkdirSync(OUT, { recursive: true });

for (let i = 0; i < COUNT; i++) {
  const [from, to] = TONES[i % TONES.length];
  const png = encodePng(W, H, (x, y) => {
    const t = (x / W) * 0.35 + (y / H) * 0.65;
    const dx = (x / W - 0.5) * 2;
    const dy = (y / H - 0.5) * 2;
    const vignette = 1 - 0.18 * Math.min(1, dx * dx + dy * dy);
    return [0, 1, 2].map((c) => Math.round((from[c] + (to[c] - from[c]) * t) * vignette));
  });
  writeFileSync(`${OUT}/${String(i + 1).padStart(2, "0")}.png`, png);
}

console.log(`✓ ${COUNT}장의 임시 사진을 만들었습니다 → public/gallery/`);
console.log("  실제 사진을 넣은 뒤에는 npm run placeholders:clean 으로 지우세요.");
