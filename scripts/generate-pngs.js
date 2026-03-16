import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

async function generatePNGs() {
  console.log('🎨 Gerando PNGs a partir do SVG...');
  
  const svgBuffer = fs.readFileSync(svgPath);
  
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    
    console.log(`✅ Gerado: icon-${size}x${size}.png`);
  }
  
  // Gerar favicon.ico (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .toFile(path.join(outputDir, 'favicon.ico'));
  console.log('✅ Gerado: favicon.ico');
  
  // Gerar apple-touch-icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));
  console.log('✅ Gerado: apple-touch-icon.png');
}

generatePNGs().catch(console.error);