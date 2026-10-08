const sharp = require('sharp');
const path = require('path');

const inputPath = 'C:\\Users\\Gabin\\.gemini\\antigravity-ide\\brain\\f7427521-87cd-45e0-aa79-63258ae9f310\\.user_uploaded\\media_1791465361785.jpg';

async function generateCircularFavicon() {
  // SVG circular mask (transparent outside, opaque inside the circle)
  // Outer blue ring touches 508px radius
  const maskSvg = Buffer.from(
    `<svg width="1024" height="1024">
      <circle cx="512" cy="510" r="508" fill="#ffffff" />
    </svg>`
  );

  console.log('Applying circular alpha mask to remove white corners outside the blue ring...');
  const circularBuffer = await sharp(inputPath)
    .ensureAlpha()
    .composite([{ input: maskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const baseImg = sharp(circularBuffer);

  // 1. icon.png (512x512)
  await baseImg.clone()
    .resize(512, 512)
    .png()
    .toFile('public/icon.png');
  console.log('✓ public/icon.png (512x512)');

  // 2. src/app/icon.png (512x512)
  await baseImg.clone()
    .resize(512, 512)
    .png()
    .toFile('src/app/icon.png');
  console.log('✓ src/app/icon.png (512x512)');

  // 3. Apple Touch Icon (180x180)
  await baseImg.clone()
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
  console.log('✓ public/apple-touch-icon.png (180x180)');

  // 4. Favicon 32x32
  await baseImg.clone()
    .resize(32, 32)
    .png()
    .toFile('public/favicon-32x32.png');
  console.log('✓ public/favicon-32x32.png (32x32)');

  // 5. Favicon 16x16
  await baseImg.clone()
    .resize(16, 16)
    .png()
    .toFile('public/favicon-16x16.png');
  console.log('✓ public/favicon-16x16.png (16x16)');

  // 6. Favicon 48x48 for favicon.ico
  await baseImg.clone()
    .resize(48, 48)
    .png()
    .toFile('public/favicon.ico');
  console.log('✓ public/favicon.ico (48x48)');

  // 7. Full size badge logo
  await baseImg.clone()
    .resize(1024, 1024)
    .png()
    .toFile('public/images/logo-badge.png');
  console.log('✓ public/images/logo-badge.png (1024x1024)');

  console.log('Done! All favicons now have 100% transparent background outside the blue ring.');
}

generateCircularFavicon().catch(console.error);
