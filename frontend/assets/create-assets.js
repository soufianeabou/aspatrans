// Simple script to create placeholder assets for Expo
// Run: node assets/create-assets.js

const fs = require('fs');
const path = require('path');

// Minimal 1x1 PNG (transparent) as base64
const minimalPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

const assetsDir = __dirname;

const files = [
  'icon.png',
  'splash.png',
  'adaptive-icon.png',
  'favicon.png'
];

files.forEach(file => {
  const filePath = path.join(assetsDir, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, minimalPNG);
    console.log(`Created ${file}`);
  } else {
    console.log(`${file} already exists`);
  }
});

console.log('\n✅ Placeholder assets created!');
console.log('Note: Replace these with proper images later.');

