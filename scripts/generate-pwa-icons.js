const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function main() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Fetch pristine Google Noto octopus SVG
  const notoRes = await fetch('https://raw.githubusercontent.com/googlefonts/noto-emoji/main/svg/emoji_u1f419.svg');
  const notoText = await notoRes.text();
  const notoBuffer = Buffer.from(notoText);

  // 1. Squircle background 512x512 with exact gradient matching user's screenshot
  // Top-left: #c2454b, middle: #a26b86, bottom-right: #727ea8
  const squircleSvg = `
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#c2454b" />
        <stop offset="50%" stop-color="#a26b86" />
        <stop offset="100%" stop-color="#727ea8" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="118" fill="url(#grad)" />
  </svg>`;
  const squircleBg = await sharp(Buffer.from(squircleSvg)).png().toBuffer();

  // Full-bleed square gradient for maskable (Android) and apple-touch-icon (iOS)
  const fullBleedSvg = `
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#c2454b" />
        <stop offset="50%" stop-color="#a26b86" />
        <stop offset="100%" stop-color="#727ea8" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" fill="url(#grad)" />
  </svg>`;
  const fullBleedBg = await sharp(Buffer.from(fullBleedSvg)).png().toBuffer();

  // Octopus resized for standard 512x512 icon (340x340)
  const oct512 = await sharp(notoBuffer)
    .resize(340, 340, { fit: 'contain' })
    .toBuffer();

  // 1. Standard icon-512x512.png
  const icon512 = await sharp(squircleBg)
    .composite([{ input: oct512, gravity: 'center' }])
    .png({ quality: 100 })
    .toBuffer();
  await fs.promises.writeFile(path.join(iconsDir, 'icon-512x512.png'), icon512);
  console.log('Saved icon-512x512.png');

  // 2. Standard icon-192x192.png
  const icon192 = await sharp(icon512)
    .resize(192, 192)
    .png({ quality: 100 })
    .toBuffer();
  await fs.promises.writeFile(path.join(iconsDir, 'icon-192x192.png'), icon192);
  console.log('Saved icon-192x192.png');

  // 3. Maskable icon-maskable-512x512.png (full bleed gradient, safe zone 65% for Android adaptive launchers)
  const octMaskable = await sharp(notoBuffer)
    .resize(300, 300, { fit: 'contain' })
    .toBuffer();
  const iconMaskable = await sharp(fullBleedBg)
    .composite([{ input: octMaskable, gravity: 'center' }])
    .png({ quality: 100 })
    .toBuffer();
  await fs.promises.writeFile(path.join(iconsDir, 'icon-maskable-512x512.png'), iconMaskable);
  console.log('Saved icon-maskable-512x512.png');

  // 4. apple-touch-icon.png (180x180 full bleed for iOS home screen)
  const appleSvg = `
  <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#c2454b" />
        <stop offset="50%" stop-color="#a26b86" />
        <stop offset="100%" stop-color="#727ea8" />
      </linearGradient>
    </defs>
    <rect width="180" height="180" fill="url(#grad)" />
  </svg>`;
  const appleBg = await sharp(Buffer.from(appleSvg)).png().toBuffer();
  const octApple = await sharp(notoBuffer)
    .resize(122, 122, { fit: 'contain' })
    .toBuffer();
  const appleIcon = await sharp(appleBg)
    .composite([{ input: octApple, gravity: 'center' }])
    .png({ quality: 100 })
    .toBuffer();
  await fs.promises.writeFile(path.join(iconsDir, 'apple-touch-icon.png'), appleIcon);
  console.log('Saved apple-touch-icon.png');

  console.log('All icons generated successfully!');
}

main().catch(console.error);
