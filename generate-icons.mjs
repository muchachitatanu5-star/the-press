// generate-icons.mjs
// Run with: node generate-icons.mjs
// Creates icon-192.png, icon-512.png, apple-touch-icon.png, favicon.ico in public/

import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background — ink color
  ctx.fillStyle = '#1a1208';
  ctx.fillRect(0, 0, size, size);

  // Gold border
  const border = size * 0.04;
  ctx.strokeStyle = '#9a7c3f';
  ctx.lineWidth = border;
  ctx.strokeRect(border / 2, border / 2, size - border, size - border);

  // "P" letterform in gold
  ctx.fillStyle = '#9a7c3f';
  ctx.font = `bold ${size * 0.55}px Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('P', size / 2, size / 2 + size * 0.03);

  return canvas;
}

// 192x192
const c192 = drawIcon(192);
writeFileSync('public/icon-192.png', c192.toBuffer('image/png'));
console.log('✓ icon-192.png');

// 512x512
const c512 = drawIcon(512);
writeFileSync('public/icon-512.png', c512.toBuffer('image/png'));
console.log('✓ icon-512.png');

// Apple touch icon (180x180)
const cApple = drawIcon(180);
writeFileSync('public/apple-touch-icon.png', cApple.toBuffer('image/png'));
console.log('✓ apple-touch-icon.png');

// Favicon (32x32)
const cFav = drawIcon(32);
writeFileSync('public/favicon.ico', cFav.toBuffer('image/png'));
console.log('✓ favicon.ico');

console.log('\nAll icons generated in public/');
