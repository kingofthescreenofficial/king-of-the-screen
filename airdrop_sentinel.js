const fs = require('fs');
const path = require('path');
const { Connection, Keypair, PublicKey, Transaction } = require('@solana/web3.js');
const { getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_2022_PROGRAM_ID } = require('@solana/spl-token');
const { Metaplex, keypairIdentity, irysStorage, toMetaplexFile } = require('@metaplex-foundation/js');

const RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=3de7f4a5-c279-4ed6-8fd1-9609a0d6cc9c';
const TOKEN_CA = new PublicKey('HzkfcbeL2gTG5Xm1GomNbr9SwN96RUbGS6M42VhPpump');
const QUEUE_FILE = '/var/www/king-of-the-screen/web/analytics/airdrop_queue.jsonl';
const PROCESSED_FILE = '/var/www/king-of-the-screen/web/analytics/airdrop_processed.jsonl';

const walletData = JSON.parse(fs.readFileSync('/var/www/king-of-the-screen/hot_wallet.json', 'utf-8'));
const hotWallet = Keypair.fromSecretKey(new Uint8Array(walletData));

function logTelemetry(type, event, details) {
  try {
    const logDir = path.join(process.cwd(), "web/analytics");
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const logEntry = { timestamp: new Date().toISOString(), type, event, details };
    fs.appendFileSync(path.join(logDir, "telemetry.jsonl"), JSON.stringify(logEntry) + '\n');
  } catch(e) {}
}

const connection = new Connection(RPC_URL, 'confirmed');

const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(hotWallet))
    .use(irysStorage({
        address: 'https://node1.irys.xyz',
        providerUrl: RPC_URL,
        timeout: 60000,
    }));

console.log('--- AIRDROP & NFT SENTINEL ACTIVE (QUEUE PROCESSOR) ---');
console.log('Hot Wallet:', hotWallet.publicKey.toBase58());

async function getBufferFromDataUri(dataUri) {
  const matches = dataUri.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sec timeout
        const response = await fetch(dataUri, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        // Strict size check for remote images (max 2MB)
        const contentLength = response.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 2 * 1024 * 1024) {
             throw new Error("Image too large");
        }
        
        const arrayBuffer = await response.arrayBuffer();
        if (arrayBuffer.byteLength > 2 * 1024 * 1024) throw new Error("Image too large");
        
        return { buffer: Buffer.from(arrayBuffer), contentType: response.headers.get('content-type') || 'image/jpeg' };
    } catch(e) {
        console.error("Failed to fetch remote image:", e.message);
        return null; // fallback
    }
  }
  
  const buffer = Buffer.from(matches[2], 'base64');
  if (buffer.length > 2 * 1024 * 1024) return null;
  return { buffer, contentType: matches[1] };
}

async function processQueue() {
  if (!fs.existsSync(QUEUE_FILE)) return;
  
  const tempFile = QUEUE_FILE + '.processing';
  try {
     fs.renameSync(QUEUE_FILE, tempFile);
  } catch(e) {
     return; // File probably doesn't exist right now or is locked
  }

  const lines = fs.readFileSync(tempFile, 'utf-8').split('\n').filter(l => l.trim());
  
  for (const line of lines) {
    let entry;
    try {
      entry = JSON.parse(line);
      console.log(`\n[👑] Found new King in queue: ${entry.nickname} (${entry.kingId})`);
      logTelemetry('SYSTEM', 'SENTINEL_PROCESSING_KING', { kingId: entry.kingId });
      
      const destinationWallet = new PublicKey(entry.rewardWallet);

      // 1. Dynamic Airdrop (Manual on Pump.fun for now)
      console.log(`[ACTION REQUIRED] Manual Buy-and-Airdrop pending for ${destinationWallet.toBase58()}`);
      console.log(`Instructions: Buy ${entry.paidUsd * 0.20} USD worth of KOTS on Pump.fun and send to ${destinationWallet.toBase58()}`);

      // 2. Mint NFT
      console.log('Generating NFT...');
      try {
        const stateUrl = 'http://127.0.0.1:3000/api/state';
        const res = await fetch(stateUrl);
        const fullState = await res.json();
        
        // Try to find the image in state, fallback to default
        let mediaUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe";
        if (fullState.currentKing.id === entry.kingId) {
             mediaUrl = fullState.currentKing.mediaUrl;
        }

        const mediaData = await getBufferFromDataUri(mediaUrl);
        let imageUri = "";
        
        if (mediaData) {
            console.log('Uploading image to Arweave...');
            const metaplexFile = toMetaplexFile(mediaData.buffer, `king_${entry.kingId}.jpg`, { contentType: mediaData.contentType });
            imageUri = await metaplex.storage().upload(metaplexFile);
            console.log('✅ Image uploaded:', imageUri);
        }

        const { uri } = await metaplex.nfts().uploadMetadata({
            name: `KOTS King #${entry.kingId.slice(-6).toUpperCase()}`,
            symbol: "KOTS",
            description: `This NFT proves that ${entry.nickname} conquered the $1,000,000 Global Live Canvas for $${entry.paidUsd}.`,
            image: imageUri,
            attributes: [
                { trait_type: 'Reign ID', value: entry.kingId },
                { trait_type: 'Paid Amount', value: `$${entry.paidUsd}` },
                { trait_type: 'Nickname', value: entry.nickname }
            ]
        });

        console.log('✅ Metadata uploaded:', uri);
        
        console.log('Minting NFT to', destinationWallet.toBase58(), '...');
        const { nft } = await metaplex.nfts().create({
            uri: uri,
            name: `KOTS King #${entry.kingId.slice(-6).toUpperCase()}`,
            sellerFeeBasisPoints: 500,
            tokenOwner: destinationWallet,
        });
        
        console.log('✅ NFT Minted successfully! Address:', nft.address.toBase58());
      } catch(err) {
        console.error('❌ NFT generation failed:', err.message);
      }

      // Append to processed log
      fs.appendFileSync(PROCESSED_FILE, line + '\n');
    } catch(err) {
      console.error('❌ Failed to process entry:', line, err.message);
    }
  }
  
  fs.unlinkSync(tempFile);
}

setInterval(processQueue, 5000);
