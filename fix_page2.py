with open("web/app/page.tsx", "r") as f:
    code = f.read()

code = code.replace('import { Crown, Flame, Info, Smartphone } from "lucide-react";\\nimport { WalletMultiButton } from "@solana/wallet-adapter-react-ui";', 'import { Crown, Flame, Info, Smartphone } from "lucide-react";\nimport { WalletMultiButton } from "@solana/wallet-adapter-react-ui";')

with open("web/app/page.tsx", "w") as f:
    f.write(code)
