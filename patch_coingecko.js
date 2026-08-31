const fs = require('fs');
let code = fs.readFileSync('web/components/TakeoverModal.tsx', 'utf8');

const oldFetchBlock = `    try {
        const solPriceRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
        const priceData = await solPriceRes.json();
        const solPrice = priceData?.solana?.usd || 150;
        
        const lamports = Math.floor((bidAmount / solPrice) * LAMPORTS_PER_SOL);`;

const newFetchBlock = `    try {
        let solPrice = 150;
        try {
            const solPriceRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd");
            if (solPriceRes.ok) {
                const priceData = await solPriceRes.json();
                if (priceData?.solana?.usd) solPrice = priceData.solana.usd;
            }
        } catch (apiErr) {
            console.warn("CoinGecko API blocked or failed, using fallback SOL price.");
        }
        
        const lamports = Math.floor((bidAmount / solPrice) * LAMPORTS_PER_SOL);`;

if (code.includes(oldFetchBlock)) {
    code = code.replace(oldFetchBlock, newFetchBlock);
    fs.writeFileSync('web/components/TakeoverModal.tsx', code);
    console.log("Patched CoinGecko fetch block!");
} else {
    console.log("Could not find the fetch block.");
}
