import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generateIcons() {
  const publicDir = path.resolve('public');
  const svgPath = path.join(publicDir, 'icon.svg');

  if (!fs.existsSync(svgPath)) {
    console.error('icon.svg não encontrado!');
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(svgPath);

  // 1. pwa-512x512.png (standard icon)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('✓ pwa-512x512.png gerado');

  // 2. pwa-192x192.png (standard icon)
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('✓ pwa-192x192.png gerado');

  // 3. apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png gerado');

  // 4. pwa-maskable-512x512.png
  // Android maskable icon specification requires a safe zone of 80% with padding around
  // We place the resized icon (410x410) inside a 512x512 canvas filled with the app brand background (#0f172a)
  const innerIcon = await sharp(svgBuffer)
    .resize(410, 410)
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 15, g: 23, b: 42, alpha: 1 }, // #0f172a
    },
  })
    .composite([
      {
        input: innerIcon,
        top: 51,
        left: 51,
      },
    ])
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('✓ pwa-maskable-512x512.png gerado');

  // 5. favicon-32x32.png and favicon.ico
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('✓ favicon.ico gerado');

  console.log('Todos os ícones PWA foram gerados com sucesso!');
}

generateIcons().catch((err) => {
  console.error('Erro ao gerar ícones:', err);
  process.exit(1);
});
