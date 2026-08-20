const sharp = require('sharp');
const fs = require('fs');

async function cropLogo() {
  try {
    const image = sharp('public/logo.jpg');
    const metadata = await image.metadata();
    
    // Calculate crop parameters
    // We want a rectangle, e.g., 3:1 aspect ratio centered vertically
    const width = metadata.width;
    const height = Math.round(width / 3.5); // about 1024x292
    const top = Math.round((metadata.height - height) / 2);
    
    await image
      .extract({ left: 0, top: top, width: width, height: height })
      .toFile('public/logo_cropped.jpg');
      
    console.log('Logo cropped successfully to ' + width + 'x' + height);
  } catch (err) {
    console.error('Error cropping logo:', err);
  }
}

cropLogo();
