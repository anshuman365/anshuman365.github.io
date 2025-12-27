// scripts/optimize-images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImages() {
  const assetsDir = path.join(__dirname, '../assets');
  const files = fs.readdirSync(assetsDir);
  
  for (const file of files) {
    if (file.match(/\.(jpg|jpeg|png)$/i)) {
      const inputPath = path.join(assetsDir, file);
      const outputPath = path.join(assetsDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
      
      try {
        await sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(outputPath);
        
        console.log(`Optimized: ${file} -> ${path.basename(outputPath)}`);
      } catch (error) {
        console.error(`Error optimizing ${file}:`, error);
      }
    }
  }
}

optimizeImages();