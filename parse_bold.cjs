const fs = require('fs');

const html = fs.readFileSync('C:\\Users\\57318\\.gemini\\antigravity\\brain\\209a2fad-8b31-4f0c-9a2d-806fd805181e\\.system_generated\\steps\\97\\content.md', 'utf8');

// The bold doc content is inside a massive JSON array of strings from Next.js
// Let's just strip all JSON syntax, all HTML tags, and keep the raw text

let text = html.replace(/<[^>]+>/g, ' ');
text = text.replace(/\\"/g, '"').replace(/\\n/g, '\n');

// Extraer palabras relevantes
const lines = text.split('\n');
const relevantLines = [];
for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes('signature') || 
        lines[i].toLowerCase().includes('firma') || 
        lines[i].toLowerCase().includes('hmac') ||
        lines[i].toLowerCase().includes('secret') ||
        lines[i].toLowerCase().includes('secreta') ||
        lines[i].toLowerCase().includes('raw')) {
        
        relevantLines.push(`--- LINE ${i} ---`);
        relevantLines.push(lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).join('\n'));
    }
}

fs.writeFileSync('bold_docs_extracted.txt', relevantLines.join('\n\n'));
