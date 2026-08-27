const { ethers } = require('../web/node_modules/ethers');
const fs = require('fs');
const path = require('path');

const RPC_URL = 'https://bsc-dataseed1.binance.org';
const COMPILED_PATH = path.join(__dirname, '..', 'web', 'lib', 'compiled_contracts.json');
const STATE_JSON_PATH = path.join(__dirname, '..', 'web', 'data', 'state.json');

async function main() {
  const privateKey = process.env.DEPLOYER_KEY || process.argv[2];

  if (!privateKey) {
    console.error('❌ ОШИБКА: Пожалуйста, передайте приватный ключ кошелька 0x36f1bba...');
    process.exit(1);
  }

  const cleanKey = privateKey.trim().startsWith('0x') ? privateKey.trim() : `0x${privateKey.trim()}`;
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(cleanKey, provider);

  console.log('====================================================');
  console.log('👑 KING OF THE SCREEN — ON-CHAIN DEPLOYMENT ENGINE');
  console.log('====================================================');
  console.log('📍 Кошелек владельца:', wallet.address);

  const balance = await provider.getBalance(wallet.address);
  console.log(`💰 Баланс BNB: ${ethers.formatEther(balance)} BNB`);

  if (balance === 0n) {
    console.error('❌ Недостаточно BNB для оплаты газа.');
    process.exit(1);
  }

  const compiled = JSON.parse(fs.readFileSync(COMPILED_PATH, 'utf8'));

  // 1. Deploy $KING Token
  console.log('\n[1/3] 🟡 Развертывание $KING Token (1,000,000,000 supply)...');
  const tokenFactory = new ethers.ContractFactory(
    compiled.KingToken.abi,
    compiled.KingToken.bytecode,
    wallet
  );
  const tokenContract = await tokenFactory.deploy({ gasPrice: 1000000000n });
  console.log('⏳ Ожидание подтверждения блока...');
  await tokenContract.waitForDeployment();
  const tokenAddress = await tokenContract.getAddress();
  console.log(`✓ $KING Token успешно развернут: ${tokenAddress}`);
  console.log(`🔗 BscScan: https://bscscan.com/token/${tokenAddress}`);

  // 2. Deploy Genesis NFT Contract
  console.log('\n[2/3] 🟣 Развертывание Genesis 1-of-25 NFT Contract...');
  const nftFactory = new ethers.ContractFactory(
    compiled.KingGenesisNFT.abi,
    compiled.KingGenesisNFT.bytecode,
    wallet
  );
  const nftContract = await nftFactory.deploy({ gasPrice: 1000000000n });
  console.log('⏳ Ожидание подтверждения блока...');
  await nftContract.waitForDeployment();
  const nftAddress = await nftContract.getAddress();
  console.log(`✓ Genesis NFT контракт успешно развернут: ${nftAddress}`);
  console.log(`🔗 BscScan: https://bscscan.com/address/${nftAddress}`);

  // 3. Execute Airdrop to King #1 (Hoku)
  console.log('\n[3/3] 🟢 Отправка наград Королю #1 (Hoku)...');
  const hokuWallet = '0x36f1bba134797da5ec5caf9ed4634903980ca305';

  console.log('   -> Минтим Genesis NFT #1 на адрес:', hokuWallet);
  const mintTx = await nftContract.mintGenesisRelic(
    hokuWallet,
    'https://king-of-the-screen.vercel.app/api/nft/1',
    { gasPrice: 1000000000n }
  );
  await mintTx.wait();
  console.log(`   ✓ NFT #1 успешно заминчен! Tx: https://bscscan.com/tx/${mintTx.hash}`);

  console.log('   -> Переводим 25,000 $KING на адрес:', hokuWallet);
  const amount = ethers.parseEther('25000');
  const transferTx = await tokenContract.transfer(hokuWallet, amount, { gasPrice: 1000000000n });
  await transferTx.wait();
  console.log(`   ✓ 25,000 $KING переведены! Tx: https://bscscan.com/tx/${transferTx.hash}`);

  // 4. Update state.json with official token config
  console.log('\n💾 Сохраняем адреса смарт-контрактов в конфигурацию сайта...');
  if (fs.existsSync(STATE_JSON_PATH)) {
    const state = JSON.parse(fs.readFileSync(STATE_JSON_PATH, 'utf8'));
    state.tokenConfig = {
      ticker: 'KING',
      name: 'King of the Screen',
      contractAddress: tokenAddress,
      nftContractAddress: nftAddress,
      bscScanUrl: `https://bscscan.com/token/${tokenAddress}`,
      dexScreenerUrl: `https://dexscreener.com/bsc/${tokenAddress}`,
      totalSupply: 1000000000
    };
    fs.writeFileSync(STATE_JSON_PATH, JSON.stringify(state, null, 2), 'utf8');
    console.log('✓ Конфигурация успешно обновлена!');
  }

  console.log('\n====================================================');
  console.log('🎉 ВСЕ СМАРТ-КОНТРАКТЫ И НАГРАДЫ ОНЧЕЙН В BSC!');
  console.log(`👑 Токен: ${tokenAddress}`);
  console.log(`👑 NFT:   ${nftAddress}`);
  console.log('====================================================');
}

main().catch(err => {
  console.error('❌ Ошибка выполнения:', err);
  process.exit(1);
});
