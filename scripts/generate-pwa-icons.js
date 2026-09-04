const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function main() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  const appleOctPath = path.join(iconsDir, 'apple-oct.png');

  const octBuffer = await fs.promises.readFile(appleOctPath);

  // Background rounded square 512x512 with exact Navbar gradient:
  // bg-gradient-to-br from-purple-600 (#9333ea) to-cyan-500 (#06b6d4)
  const bgSvg = `
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#9333ea" />
        <stop offset="100%" stop-color="#06b6d4" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="115" fill="url(#grad)" />
  </svg>`;

  const bgBuffer = await sharp(Buffer.from(bgSvg)).png().toBuffer();

  // Resize octopus emoji to 330x330 with lanczos3
  const octResized = await sharp(octBuffer)
    .resize(330, 330, { fit: 'contain', kernel: 'lanczos3' })
    .toBuffer();

  // Standard 512x512 icon
  const icon512 = await sharp(bgBuffer)
    .composite([{ input: octResized, gravity: 'center' }])
    .png()
    .toBuffer();

  await fs.promises.writeFile(path.join(iconsDir, 'icon-512x512.png'), icon512);
  console.log('Saved icon-512x512.png');

  // 192x192 icon
  const icon192 = await sharp(icon512).resize(192, 192).png().toBuffer();
  await fs.promises.writeFile(path.join(iconsDir, 'icon-192x192.png'), icon192);
  console.log('Saved icon-192x192.png');

  // apple-touch-icon (180x180)
  // Apple automatically applies rounding on home screens, but having the full background with slight rounding or full bleed looks pristine
  const appleSvg = `
  <svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#9333ea" />
        <stop offset="100%" stop-color="#06b6d4" />
      </linearGradient>
    </defs>
    <rect width="180" height="180" fill="url(#grad)" />
  </svg>`;
  const appleBg = await sharp(Buffer.from(appleSvg)).png().toBuffer();
  const octApple = await sharp(octBuffer)
    .resize(118, 118, { fit: 'contain', kernel: 'lanczos3' })
    .toBuffer();
  const appleIcon = await sharp(appleBg)
    .composite([{ input: octApple, gravity: 'center' }])
    .png()
    .toBuffer();
  await fs.promises.writeFile(path.join(iconsDir, 'apple-touch-icon.png'), appleIcon);
  console.log('Saved apple-touch-icon.png');

  // Maskable icon (512x512 full bleed background, safe zone center 65%)
  const maskableSvg = `
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#9333ea" />
        <stop offset="100%" stop-color="#06b6d4" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" fill="url(#grad)" />
  </svg>`;
  const maskableBg = await sharp(Buffer.from(maskableSvg)).png().toBuffer();
  const octMaskable = await sharp(octBuffer)
    .resize(290, 290, { fit: 'contain', kernel: 'lanczos3' })
    .toBuffer();
  const iconMaskable = await sharp(maskableBg)
    .composite([{ input: octMaskable, gravity: 'center' }])
    .png()
    .toBuffer();
  await fs.promises.writeFile(path.join(iconsDir, 'icon-maskable-512x512.png'), iconMaskable);
  console.log('Saved icon-maskable-512x512.png');

  // Clean up temporary test files
  const toClean = ['noto-oct.png', 'apple-oct.png', 'test-3d.png'];
  for (const f of toClean) {
    const p = path.join(iconsDir, f);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

main().catch(console.error);
