const fs = require('fs');
const Jimp = require('jimp');
const jsQR = require('jsqr');

async function readQR() {
  try {
    const imagePath = 'C:/Users/loren/.gemini/antigravity/brain/bd51901a-f52d-4fe8-8f2a-10da7d01b166/.user_uploaded/media_1788496014125.png';
    const image = await Jimp.read(imagePath);
    const value = jsQR(image.bitmap.data, image.bitmap.width, image.bitmap.height);
    if (value) {
      console.log('QR Code Content:', value.data);
    } else {
      console.log('No QR code found.');
    }
  } catch (error) {
    console.error(error);
  }
}
readQR();
