const fs = require('fs');
const path = require('path');

// Simple SVG for default profile picture
const svg = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="#e0e0e0"/>
  <circle cx="100" cy="70" r="40" fill="#999999"/>
  <path d="M100 120 C40 120 20 160 20 200 L180 200 C180 160 160 120 100 120Z" fill="#999999"/>
</svg>
`;

// Convert SVG to Buffer
const svgBuffer = Buffer.from(svg);

// Write to file
fs.writeFileSync(
  path.join(__dirname, 'default-profile.svg'),
  svgBuffer
); 