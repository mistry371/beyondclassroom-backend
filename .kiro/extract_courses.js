const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\asus\\.gemini\\antigravity\\brain\\35629d34-b19f-46c0-8ea1-0858562f5b2b\\.system_generated\\steps\\75\\content.md';
const content = fs.readFileSync(filePath, 'utf8');

// Strip script, style, and HTML tags
let clean = content
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

console.log('Cleaned text length:', clean.length);
console.log('Clean text snippet:');
console.log(clean.substring(0, 3000));
