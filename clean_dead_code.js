const fs = require('fs');
let code = fs.readFileSync('web/components/TakeoverModal.tsx', 'utf8');

// Remove unused state declarations
code = code.replace(/const \[imageSourceTab, setImageSourceTab\].*\n/, '');
code = code.replace(/const \[paymentMethod, setPaymentMethod\].*\n/, '');
code = code.replace(/const \[txHashInput, setTxHashInput\].*\n/, '');
code = code.replace(/const \[rewardWalletAddress, setRewardWalletAddress\].*\n/, '');

// Fix processTakeover
const oldProcessTakeoverStart = `  const processTakeover = async (hash?: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const finalTxHash = (hash || txHashInput).trim();

      if (!finalTxHash) {
        throw new Error(
          \`Please send \$\${bidAmount.toFixed(2)} to \${walletConfig.evmAddress} and paste your transaction hash below.\`
        );
      }`;

const newProcessTakeoverStart = `  const processTakeover = async (hash?: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const finalTxHash = hash?.trim();

      if (!finalTxHash) {
        throw new Error("Transaction failed or no hash provided.");
      }`;
code = code.replace(oldProcessTakeoverStart, newProcessTakeoverStart);

// Also remove rewardWalletAddress from the fetch payload fallback
code = code.replace(/rewardWalletAddress: publicKey \? publicKey.toBase58\(\) : rewardWalletAddress.trim\(\) \|\| undefined,/g, 'rewardWalletAddress: publicKey ? publicKey.toBase58() : undefined,');

fs.writeFileSync('web/components/TakeoverModal.tsx', code);
console.log("Cleaned dead code from TakeoverModal");
