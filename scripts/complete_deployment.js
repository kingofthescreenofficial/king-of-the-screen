const { ethers } = require('/Users/aleksejsavcenko/Documents/ANTIGRAVITY/GMAIL/VIRAL_SITE/web/node_modules/ethers');
const fs = require('fs');
const path = require('path');

const RPC_URL = 'https://bsc-dataseed1.binance.org';
const COMPILED_PATH = '/Users/aleksejsavcenko/Documents/ANTIGRAVITY/GMAIL/VIRAL_SITE/web/lib/compiled_contracts.json';
const STATE_JSON_PATH = '/Users/aleksejsavcenko/Documents/ANTIGRAVITY/GMAIL/VIRAL_SITE/web/data/state.json';
const TOKEN_ADDRESS = '0x2d394Fb23f00544C724601e9a774bC928656E4Da';
const HOKU_WALLET = '0x36f1bba134797da5ec5caf9ed4634903980ca305';

async function main() {
  const privateKey = process.argv[2];
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log('====================================================');
  console.log('👑 KING OF THE SCREEN — ON-CHAIN DEPLOYMENT & MINT');
  console.log('====================================================');
  console.log('📍 Кошелек владельца:', wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Баланс BNB: ${ethers.formatEther(balance)} BNB`);

  const compiled = JSON.parse(fs.readFileSync(COMPILED_PATH, 'utf8'));

  // 1. $KING Token (Already Deployed!)
  console.log('\n[1/3] ✓ $KING Token уже развернут в сети!');
  console.log(`      Адрес токена: ${TOKEN_ADDRESS}`);
  console.log(`      🔗 BscScan: https://bscscan.com/token/${TOKEN_ADDRESS}`);

  // 2. Deploy Genesis NFT Contract
  console.log('\n[2/3] 🟣 Развертывание Genesis 1-of-25 NFT Contract...');
  const nftFactory = new ethers.ContractFactory(
    compiled.KingGenesisNFT.abi,
    compiled.KingGenesisNFT.bytecode,
    wallet
  );
  const nftContract = await nftFactory.deploy();
  console.log('      ⏳ Ожидание подтверждения блока (Tx:', nftContract.deploymentTransaction().hash, ')...');
  await nftContract.waitForDeployment();
  const nftAddress = await nftContract.getAddress();
  console.log(`      ✓ Genesis NFT контракт успешно развернут: ${nftAddress}`);
  console.log(`      🔗 BscScan: https://bscscan.com/address/${nftAddress}`);

  // 3. Mint Genesis NFT #1 to Hoku
  console.log('\n[3/3] 🟢 Минтинг и отправка наград Королю Hoku...');
  console.log('      -> Минтим Genesis NFT #1 на адрес:', HOKU_WALLET);
  const mintTx = await nftContract.mintGenesisRelic(
    HOKU_WALLET,
    'https://king-of-the-screen.vercel.app/api/nft/1'
  );
  console.log('      ⏳ Ожидание минта Tx:', mintTx.hash);
  await mintTx.wait();
  console.log(`      ✓ Genesis NFT #1 официально заминчен в блокчейне!`);

  // 4. Transfer 25,000 $KING to Hoku
  console.log('      -> Переводим 25,000 $KING токенов Королю...');
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, compiled.KingToken.abi, wallet);
  const amount = ethers.parseEther('25000');
  const transferTx = await tokenContract.transfer(HOKU_WALLET, amount);
  console.log('      ⏳ Ожидание трансфера Tx:', transferTx.hash);
  await transferTx.wait();
  console.log(`      ✓ 25,000 $KING успешно на балансе Короля!`);

  // 5. Update state.json
  console.log('\n💾 Сохраняем адреса смарт-контрактов в конфигурацию проекта...');
  if (fs.existsSync(STATE_JSON_PATH)) {
    const state = JSON.parse(fs.readFileSync(STATE_JSON_PATH, 'utf8'));
    state.tokenConfig = {
      ticker: 'KING',
      name: 'King of the Screen',
      contractAddress: TOKEN_ADDRESS,
      nftContractAddress: nftAddress,
      bscScanUrl: `https://bscscan.com/token/${TOKEN_ADDRESS}`,
      dexScreenerUrl: `https://dexscreener.com/bsc/${TOKEN_ADDRESS}`,
      totalSupply: 1000000000
    };
    state.currentKing.airdropStatus = 'DELIVERED_ON_CHAIN';
    state.currentKing.tokenAirdropTxHash = transferTx.hash;
    state.currentKing.nftMintTxHash = mintTx.hash;
    fs.writeFileSync(STATE_JSON_PATH, JSON.stringify(state, null, 2), 'utf8');
    console.log('✓ state.json обновлен!');
  }

  console.log('\n====================================================');
  console.log('🎉 ВСЕ СМАРТ-КОНТРАКТЫ И НАГРАДЫ УСПЕШНО ВЫПОЛНЕНЫ В БЛОКЧЕЙНЕ!');
  console.log(`👑 Токен $KING:    ${TOKEN_ADDRESS}`);
  console.log(`👑 Genesis NFT CA: ${nftAddress}`);
  console.log(`💎 NFT #1 Mint Tx: https://bscscan.com/tx/${mintTx.hash}`);
  console.log(`🪙 $KING Trans Tx: https://bscscan.com/tx/${transferTx.hash}`);
  console.log('====================================================');
}

main().catch(err => {
  console.error('❌ Ошибка выполнения:', err);
  process.exit(1);
});
