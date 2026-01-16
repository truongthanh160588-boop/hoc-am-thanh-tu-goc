// Script to generate PWA icons from SVG
// Requires: npm install sharp
// Run: node scripts/generate-icons.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);
  
  for (const size of sizes) {
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, `icon-${size}.png`));
      console.log(`✓ Generated icon-${size}.png`);
    } catch (error) {
      console.error(`✗ Error generating icon-${size}.png:`, error.message);
    }
  }
  
  console.log('\n✓ All icons generated!');
}

generateIcons().catch(console.error);
