const fs = require('fs');
let code = fs.readFileSync('web/app/page.tsx', 'utf8');

code = code.replace('import { Crown, Flame, Info } from "lucide-react";', 'import { Crown, Flame, Info, Smartphone } from "lucide-react";\\nimport { WalletMultiButton } from "@solana/wallet-adapter-react-ui";');

fs.writeFileSync('web/app/page.tsx', code);
