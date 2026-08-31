const fs = require('fs');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf8');
    for (const {old, newText} of replacements) {
        content = content.replace(new RegExp(old, 'g'), newText);
    }
    fs.writeFileSync(filePath, content);
}

// 1. ConceptHero.tsx
replaceInFile('web/components/ConceptHero.tsx', [
    { old: '1-OF-25 NFT', newText: '1-OF-100 NFT' }
]);

// 2. HallOfFame.tsx
replaceInFile('web/components/HallOfFame.tsx', [
    { old: '1-OF-25 NFT', newText: '1-OF-100 NFT' },
    { old: '#\\$\\{index \\+ 1\\}/25', newText: '#${index + 1}/100' },
    { old: 'totalCap=\\{25\\}', newText: 'totalCap={100}' }
]);

// 3. RoyalNFTCard.tsx
replaceInFile('web/components/RoyalNFTCard.tsx', [
    { old: 'ordinalNumber\\?: number; // e.g. 1 of 25', newText: 'ordinalNumber?: number; // e.g. 1 of 100' },
    { old: 'totalCap\\?: number; // 25', newText: 'totalCap?: number; // 100' },
    { old: 'totalCap = 25,', newText: 'totalCap = 100,' },
    { old: 'OF \\$\\{totalCap\\}', newText: 'OF ${totalCap}' },
    { old: 'mined 25,000 \\$KOTS', newText: 'mined a proportional share of \\$KOTS' }, // Generic text for social share
    { old: '1-OF-25 RELIC', newText: '1-OF-100 RELIC' },
    { old: '\\* 25000', newText: '* 900' }
]);

// 4. TakeoverModal.tsx
replaceInFile('web/components/TakeoverModal.tsx', [
    { old: '\\* 25000', newText: '* 900' },
    { old: 'totalCap=\\{25\\}', newText: 'totalCap={100}' }
]);

// 5. TheScreen.tsx
replaceInFile('web/components/TheScreen.tsx', [
    { old: '1-of-25 NFT', newText: '1-of-100 NFT' }
]);

// 6. TokenBanner.tsx
replaceInFile('web/components/TokenBanner.tsx', [
    { old: '25 Kings', newText: '100 Kings' }
]);

console.log("Patched UI math!");
