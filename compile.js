const fs = require('fs');
const path = require('path');
const solc = require('solc');

const contractsDir = path.join(__dirname, 'contracts');
const outputFile = path.join(__dirname, 'web', 'lib', 'compiled_contracts.json');

const tokenSource = fs.readFileSync(path.join(contractsDir, 'KingToken.sol'), 'utf8');
const nftSource = fs.readFileSync(path.join(contractsDir, 'KingGenesisNFT.sol'), 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'KingToken.sol': { content: tokenSource },
    'KingGenesisNFT.sol': { content: nftSource }
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200
    },
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode']
      }
    }
  }
};

console.log('Compiling Solidity contracts with solc optimizer...');
const output = JSON.parse(solc.compile(JSON.stringify(input)));

if (output.errors) {
  output.errors.forEach(err => {
    console.log(err.formattedMessage);
  });
}

const compiled = {
  KingToken: {
    abi: output.contracts['KingToken.sol']['KingToken'].abi,
    bytecode: output.contracts['KingToken.sol']['KingToken'].evm.bytecode.object
  },
  KingGenesisNFT: {
    abi: output.contracts['KingGenesisNFT.sol']['KingGenesisNFT'].abi,
    bytecode: output.contracts['KingGenesisNFT.sol']['KingGenesisNFT'].evm.bytecode.object
  }
};

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(compiled, null, 2), 'utf8');
console.log('✓ Successfully compiled contracts to:', outputFile);
