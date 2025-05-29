const fs = require('fs');
const path = require('path');

// Create a simple SVG icon for NutriGuide
const createSVGIcon = (size) => {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#F88379;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#A8CBB7;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background circle -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#grad1)"/>
  
  <!-- Nutrition leaf icon -->
  <g transform="translate(${size * 0.25}, ${size * 0.25}) scale(${size * 0.002})">
    <!-- Main leaf shape -->
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" 
          fill="#F5EBDD" 
          transform="scale(8) translate(6, 6)"/>
    
    <!-- Nutrition symbols -->
    <circle cx="100" cy="80" r="15" fill="#F5EBDD" opacity="0.9"/>
    <circle cx="140" cy="100" r="12" fill="#F5EBDD" opacity="0.8"/>
    <circle cx="120" cy="130" r="10" fill="#F5EBDD" opacity="0.7"/>
  </g>
  
  <!-- App name -->
  <text x="${size/2}" y="${size * 0.85}" 
        font-family="Arial, sans-serif" 
        font-size="${size * 0.08}" 
        font-weight="bold" 
        text-anchor="middle" 
        fill="#F5EBDD">NG</text>
</svg>`;
};

// Icon sizes needed for PWA
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icons for each size
iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`Generated ${filename}`);
});

// Create a favicon.ico placeholder
const faviconContent = createSVGIcon(32);
fs.writeFileSync(path.join(__dirname, '../public/favicon.svg'), faviconContent);

console.log('All icons generated successfully!');
console.log('Note: For production, convert SVG icons to PNG format using a tool like ImageMagick or online converters.');
console.log('Command example: convert icon-192x192.svg icon-192x192.png'); 