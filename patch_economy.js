const fs = require('fs');

// 1. Fix the backend emission rate
const apiFile = 'web/app/api/takeover/route.ts';
let apiCode = fs.readFileSync(apiFile, 'utf8');
apiCode = apiCode.replace(/const minedTokens = Math\.floor\(cleanAmount \* 25000\);/g, 'const minedTokens = Math.floor(cleanAmount * 1000);');
fs.writeFileSync(apiFile, apiCode);

// 2. Fix ConceptHero text
const heroFile = 'web/components/ConceptHero.tsx';
let heroCode = fs.readFileSync(heroFile, 'utf8');
heroCode = heroCode.replace(/1-of-25/g, '1-of-100');
heroCode = heroCode.replace(/~25 Kings/g, '~100 Kings');
fs.writeFileSync(heroFile, heroCode);

// 3. Fix TheScreen text and props
const screenFile = 'web/components/TheScreen.tsx';
let screenCode = fs.readFileSync(screenFile, 'utf8');
screenCode = screenCode.replace(/1-OF-25/g, '1-OF-100');
screenCode = screenCode.replace(/totalCap=\{25\}/g, 'totalCap={100}');
fs.writeFileSync(screenFile, screenCode);

// 4. Fix TakeoverModal text
const modalFile = 'web/components/TakeoverModal.tsx';
let modalCode = fs.readFileSync(modalFile, 'utf8');
modalCode = modalCode.replace(/1-of-25/g, '1-of-100');
fs.writeFileSync(modalFile, modalCode);

console.log("Patched all economic and NFT caps");
