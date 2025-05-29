const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../public/icons');
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

async function convertSVGtoPNG() {
  console.log('Converting SVG icons to PNG...');
  
  for (const size of iconSizes) {
    const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
    const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    try {
      if (fs.existsSync(svgPath)) {
        await sharp(svgPath)
          .resize(size, size)
          .png()
          .toFile(pngPath);
        
        console.log(`✓ Converted icon-${size}x${size}.png`);
      } else {
        console.log(`⚠ SVG file not found: icon-${size}x${size}.svg`);
      }
    } catch (error) {
      console.error(`✗ Error converting icon-${size}x${size}.svg:`, error.message);
    }
  }
  
  // Convert favicon
  const faviconSvgPath = path.join(__dirname, '../public/favicon.svg');
  const faviconPngPath = path.join(__dirname, '../public/favicon.png');
  
  try {
    if (fs.existsSync(faviconSvgPath)) {
      await sharp(faviconSvgPath)
        .resize(32, 32)
        .png()
        .toFile(faviconPngPath);
      
      console.log('✓ Converted favicon.png');
    }
  } catch (error) {
    console.error('✗ Error converting favicon:', error.message);
  }
  
  console.log('Icon conversion completed!');
}

convertSVGtoPNG().catch(console.error); 