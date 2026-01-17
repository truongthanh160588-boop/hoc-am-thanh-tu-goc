// Script to generate PWA icons from logo PNG
// Requires: npm install sharp
// Run: node scripts/generate-icons.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const logoPath = path.join(__dirname, '../public/logo-source.png');
const outputDir = path.join(__dirname, '../public/icons');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  // Check if logo exists
  if (!fs.existsSync(logoPath)) {
    console.error(`✗ Logo not found at: ${logoPath}`);
    console.error('Please place your logo as public/logo-source.png');
    process.exit(1);
  }

  console.log('Generating PWA icons from logo...\n');

  // Generate PWA icons
  for (const size of sizes) {
    try {
      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 11, g: 15, b: 20, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(path.join(outputDir, `icon-${size}.png`));
      console.log(`✓ Generated icon-${size}.png`);
    } catch (error) {
      console.error(`✗ Error generating icon-${size}.png:`, error.message);
    }
  }

  // Generate apple-touch-icon (180x180)
  try {
    await sharp(logoPath)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 11, g: 15, b: 20, alpha: 0 }
      })
      .png()
      .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
    console.log('✓ Generated apple-touch-icon.png');
  } catch (error) {
    console.error('✗ Error generating apple-touch-icon.png:', error.message);
  }

  // Generate favicon (32x32)
  try {
    await sharp(logoPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 11, g: 15, b: 20, alpha: 0 }
      })
      .png()
      .toFile(path.join(__dirname, '../public/favicon-32x32.png'));
    console.log('✓ Generated favicon-32x32.png');
  } catch (error) {
    console.error('✗ Error generating favicon-32x32.png:', error.message);
  }

  // Generate main logo (update existing)
  try {
    await sharp(logoPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 11, g: 15, b: 20, alpha: 0 }
      })
      .png()
      .toFile(path.join(__dirname, '../public/logo.png'));
    console.log('✓ Updated logo.png');
  } catch (error) {
    console.error('✗ Error updating logo.png:', error.message);
  }

  // Update icon-192.png and icon-512.png in public root (for PWA)
  try {
    await sharp(logoPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 11, g: 15, b: 20, alpha: 0 }
      })
      .png()
      .toFile(path.join(__dirname, '../public/icon-192.png'));
    console.log('✓ Updated public/icon-192.png');
  } catch (error) {
    console.error('✗ Error updating icon-192.png:', error.message);
  }

  try {
    await sharp(logoPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 11, g: 15, b: 20, alpha: 0 }
      })
      .png()
      .toFile(path.join(__dirname, '../public/icon-512.png'));
    console.log('✓ Updated public/icon-512.png');
  } catch (error) {
    console.error('✗ Error updating icon-512.png:', error.message);
  }

  console.log('\n✓ All icons generated successfully!');
  console.log('\nIcons are ready for PWA installation on mobile devices.');
}

generateIcons().catch(console.error);
