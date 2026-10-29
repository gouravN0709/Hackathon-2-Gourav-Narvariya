const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../public/icons');
const PUBLIC_DIR = path.join(__dirname, '../public');

// Master SVG: FitAI bolt logo
// Path: M13 2L4 14h7l-1 8 9-12h-7z (24x24 viewBox)
function createSvg({ size, scale = 0.6, bgColor = '#0B0B0D', boltColor = '#C6FF3D', rx = 0 }) {
  const boltSize = size * scale;
  const offset = (size - boltSize) / 2;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" rx="${rx}" fill="${bgColor}" />
      <g transform="translate(${offset}, ${offset}) scale(${boltSize / 24})">
        <path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="${boltColor}" stroke="${boltColor}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    </svg>
  `;
}

function createSplashSvg({ width, height }) {
  const logoSize = Math.min(width, height) * 0.22;
  const offsetX = (width - logoSize) / 2;
  const offsetY = (height - logoSize) / 2;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#0B0B0D" />
      <g transform="translate(${offsetX}, ${offsetY}) scale(${logoSize / 24})">
        <path d="M13 2L4 14h7l-1 8 9-12h-7z" fill="#C6FF3D" stroke="#C6FF3D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    </svg>
  `;
}

async function generate() {
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  // Save master SVG
  const masterSvg = createSvg({ size: 512, scale: 0.65 });
  fs.writeFileSync(path.join(ICONS_DIR, 'favicon.svg'), masterSvg.trim());

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const configs = [
    { name: 'icon-192x192.png', size: 192, scale: 0.65 },
    { name: 'icon-512x512.png', size: 512, scale: 0.65 },
    // Maskable icon: centered inside 80% safe zone (scale 0.55 ensures 100% within safe zone)
    { name: 'icon-maskable-512x512.png', size: 512, scale: 0.52 },
    // Apple touch icon 180x180
    { name: 'apple-touch-icon.png', size: 180, scale: 0.65 },
    { name: 'favicon-32x32.png', size: 32, scale: 0.75 },
    { name: 'favicon-16x16.png', size: 16, scale: 0.8 },
  ];

  for (const cfg of configs) {
    const svg = createSvg({ size: cfg.size, scale: cfg.scale });
    await page.setViewportSize({ width: cfg.size, height: cfg.size });
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;background:#0B0B0D;">${svg}</body></html>`);
    const buffer = await page.screenshot({ type: 'png', omitBackground: false });
    fs.writeFileSync(path.join(ICONS_DIR, cfg.name), buffer);
    console.log(`Generated public/icons/${cfg.name}`);
  }

  // Also copy apple-touch-icon and favicon to public root for fallback crawlers
  fs.copyFileSync(path.join(ICONS_DIR, 'apple-touch-icon.png'), path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  fs.copyFileSync(path.join(ICONS_DIR, 'icon-192x192.png'), path.join(PUBLIC_DIR, 'icon-192x192.png'));
  fs.copyFileSync(path.join(ICONS_DIR, 'icon-512x512.png'), path.join(PUBLIC_DIR, 'icon-512x512.png'));

  // Generate splash screens for iOS devices
  const splashes = [
    { name: 'apple-splash-1170-2532.png', width: 1170, height: 2532 }, // iPhone 12/13/14
    { name: 'apple-splash-1179-2556.png', width: 1179, height: 2556 }, // iPhone 14 Pro / 15
    { name: 'apple-splash-1290-2796.png', width: 1290, height: 2796 }, // iPhone 14 Pro Max / 15 Plus / 15 Pro Max
  ];

  for (const s of splashes) {
    const splashSvg = createSplashSvg({ width: s.width, height: s.height });
    await page.setViewportSize({ width: s.width, height: s.height });
    await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;background:#0B0B0D;">${splashSvg}</body></html>`);
    const buffer = await page.screenshot({ type: 'png', omitBackground: false });
    fs.writeFileSync(path.join(ICONS_DIR, s.name), buffer);
    console.log(`Generated public/icons/${s.name}`);
  }

  await browser.close();
  console.log('All icons generated successfully!');
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
