const fs = require('fs');

const TOTAL_SUPPLY = 1000000000; // 1 Billion
const TOKENS_PER_USD = 900;
const HYPE_MULTIPLIER = 5; // Meme coin market cap is usually 5-10x the actual raised capital

let currentPriceUsd = 1;
let totalRaisedUsd = 0;
let totalTokensMined = 0;
let nftsMinted = 0;

function calculateNextPrice(p) {
  if (p < 10) return p + 1;
  if (p < 100) return p + 5;
  return Math.round(p * 1.10);
}

let report = `# 📈 Полная симуляция экономики King of the Screen (От $1 до $1,000,000)

В этой песочнице эмулируются 100 захватов экрана. Все средства ($) идут напрямую на кошелек Создателя. Юзеры получают $KOTS и NFT (Airdrop).
Цена токена $KOTS на "бирже" эмулируется по консервативной мем-оценке: \`FDV = Total Raised * ${HYPE_MULTIPLIER}\`.

### 💰 Итоговая сводка (после 100 королей)
- **Цель:** Достигнута ($1M+)
- **Выпущено NFT:** 100 / 100
- **Добыто токенов юзерами:** [CALC_TOTAL_MINED] $KOTS ([CALC_PERCENT]% эмиссии)
- **Остаток токенов у Создателя:** [CALC_REMAINING] $KOTS
- **Заработано Создателем (USD на кошельке):** $[CALC_TOTAL_USD]
- **Оценочная цена 1 $KOTS:** $[CALC_FINAL_PRICE]

---

### 👑 Пошаговая таблица распределения

| King # | Стоимость Захвата | Токенов юзеру ($KOTS) | Выпущено NFT | Казна Создателя (Total $) | Добыто токенов (Всего) | Остаток токенов | Эмуляция цены $KOTS |
|--------|-------------------|-----------------------|--------------|---------------------------|------------------------|-----------------|---------------------|
`;

for (let king = 1; king <= 100; king++) {
  // Process payment
  totalRaisedUsd += currentPriceUsd;
  
  // Mint tokens & NFT
  const tokensForKing = currentPriceUsd * TOKENS_PER_USD;
  totalTokensMined += tokensForKing;
  nftsMinted++;
  
  // Emulate market price (FDV = raised * multiplier)
  const fdv = totalRaisedUsd * HYPE_MULTIPLIER;
  const tokenPrice = fdv / TOTAL_SUPPLY;
  
  // Format row
  report += `| #${king} | $${currentPriceUsd.toLocaleString()} | ${tokensForKing.toLocaleString()} | ${nftsMinted}/100 | **$${totalRaisedUsd.toLocaleString()}** | ${totalTokensMined.toLocaleString()} | ${(TOTAL_SUPPLY - totalTokensMined).toLocaleString()} | $${tokenPrice.toFixed(6)} |\n`;
  
  // Advance to next price
  currentPriceUsd = calculateNextPrice(currentPriceUsd);
}

// Replace placeholders
report = report.replace('[CALC_TOTAL_MINED]', totalTokensMined.toLocaleString());
report = report.replace('[CALC_PERCENT]', ((totalTokensMined / TOTAL_SUPPLY) * 100).toFixed(2));
report = report.replace('[CALC_REMAINING]', (TOTAL_SUPPLY - totalTokensMined).toLocaleString());
report = report.replace('[CALC_TOTAL_USD]', totalRaisedUsd.toLocaleString());
report = report.replace('[CALC_FINAL_PRICE]', ((totalRaisedUsd * HYPE_MULTIPLIER) / TOTAL_SUPPLY).toFixed(6));

fs.writeFileSync('simulation_report.md', report);
console.log("Simulation complete. Wrote to simulation_report.md");
