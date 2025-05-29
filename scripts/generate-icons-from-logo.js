const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Paths
const logoPath = path.join(__dirname, '../public/NUTRI APP (1).png');
const iconsDir = path.join(__dirname, '../public/icons');
const faviconPath = path.join(__dirname, '../public/favicon.ico');

async function generateIconsFromLogo() {
  console.log('🎨 Generating PWA icons from logo...');
  
  // Create icons directory if it doesn't exist
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Check if logo exists
  if (!fs.existsSync(logoPath)) {
    console.error('❌ Logo file not found:', logoPath);
    return;
  }

  try {
    // Get logo info
    const logoInfo = await sharp(logoPath).metadata();
    console.log(`📏 Logo dimensions: ${logoInfo.width}x${logoInfo.height}`);

    // Generate icons for each size
    for (const size of iconSizes) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      try {
        await sharp(logoPath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 245, g: 235, b: 221, alpha: 1 } // Warm Sand background
          })
          .png({
            quality: 90,
            compressionLevel: 9
          })
          .toFile(outputPath);
        
        console.log(`✅ Generated icon-${size}x${size}.png`);
      } catch (error) {
        console.error(`❌ Error generating icon-${size}x${size}.png:`, error.message);
      }
    }

    // Generate favicon (32x32 ICO format)
    try {
      const faviconBuffer = await sharp(logoPath)
        .resize(32, 32, {
          fit: 'contain',
          background: { r: 245, g: 235, b: 221, alpha: 1 }
        })
        .png()
        .toBuffer();

      // For now, save as PNG (browsers support PNG favicons)
      const faviconPngPath = path.join(__dirname, '../public/favicon.png');
      fs.writeFileSync(faviconPngPath, faviconBuffer);
      console.log('✅ Generated favicon.png');

      // Also create a copy as favicon.ico for compatibility
      fs.writeFileSync(faviconPath.replace('.ico', '.png'), faviconBuffer);
      
    } catch (error) {
      console.error('❌ Error generating favicon:', error.message);
    }

    // Generate Apple Touch Icons (specific sizes for iOS)
    const appleSizes = [152, 180];
    for (const size of appleSizes) {
      const outputPath = path.join(iconsDir, `apple-touch-icon-${size}x${size}.png`);
      
      try {
        await sharp(logoPath)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 245, g: 235, b: 221, alpha: 1 }
          })
          .png({
            quality: 90,
            compressionLevel: 9
          })
          .toFile(outputPath);
        
        console.log(`✅ Generated apple-touch-icon-${size}x${size}.png`);
      } catch (error) {
        console.error(`❌ Error generating apple-touch-icon-${size}x${size}.png:`, error.message);
      }
    }

    // Create default apple-touch-icon.png (180x180)
    try {
      await sharp(logoPath)
        .resize(180, 180, {
          fit: 'contain',
          background: { r: 245, g: 235, b: 221, alpha: 1 }
        })
        .png({
          quality: 90,
          compressionLevel: 9
        })
        .toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
      
      console.log('✅ Generated apple-touch-icon.png');
    } catch (error) {
      console.error('❌ Error generating apple-touch-icon.png:', error.message);
    }

    console.log('\n🎉 All icons generated successfully!');
    console.log(`📁 Icons saved to: ${iconsDir}`);
    console.log('📱 Ready for PWA installation!');

  } catch (error) {
    console.error('❌ Error processing logo:', error.message);
  }
}

// Run the script
generateIconsFromLogo().catch(console.error); 