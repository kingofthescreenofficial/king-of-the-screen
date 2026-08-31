const fs = require('fs');
let code = fs.readFileSync('web/app/page.tsx', 'utf8');

const oldLink = 'https://phantom.app/ul/browse/https://kingofthescreen.fun?ref=https://kingofthescreen.fun';
const newLink = 'https://phantom.app/ul/browse/https%3A%2F%2Fkingofthescreen.fun?ref=https%3A%2F%2Fkingofthescreen.fun';

if (code.includes(oldLink)) {
    code = code.replace(oldLink, newLink);
    fs.writeFileSync('web/app/page.tsx', code);
    console.log("Patched URL encoding!");
} else {
    console.log("Link not found or already patched.");
}
