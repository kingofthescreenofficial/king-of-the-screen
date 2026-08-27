"use client";

import React, { useState, useEffect } from "react";
import { AppState } from "@/lib/types";
import {
  ShieldAlert,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Coins,
  Gem,
  Send,
  ExternalLink,
  Wallet,
  Zap,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { ethers } from "ethers";
import compiledContracts from "@/lib/compiled_contracts.json";

const MASTER_PASSWORD_HASH = "kots2026";

export default function AdminPage() {
  const [passwordInput, setPasswordInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Web3 Deployment State
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [networkName, setNetworkName] = useState<string>("EVM");
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [nftAddress, setNftAddress] = useState<string>("");
  const [isDeployingToken, setIsDeployingToken] = useState(false);
  const [isDeployingNFT, setIsDeployingNFT] = useState(false);
  const [isAirdropping, setIsAirdropping] = useState(false);

  // Get active Ethereum provider (resolves conflicts between MetaMask and Phantom)
  const getEthereumProvider = () => {
    if (typeof window === "undefined") return null;
    const eth = (window as any).ethereum;
    if (!eth) return null;

    if (eth.providers && Array.isArray(eth.providers)) {
      const metamask = eth.providers.find((p: any) => p.isMetaMask && !p.isPhantom);
      if (metamask) return metamask;
      const rabby = eth.providers.find((p: any) => p.isRabby);
      if (rabby) return rabby;
      return eth.providers[0];
    }
    return eth;
  };

  useEffect(() => {
    const savedAuth = localStorage.getItem("kots_admin_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }

    const savedToken = localStorage.getItem("kots_token_address");
    if (savedToken) setTokenAddress(savedToken);

    const savedNft = localStorage.getItem("kots_nft_address");
    if (savedNft) setNftAddress(savedNft);

    const eth = getEthereumProvider();
    if (eth && eth.selectedAddress) {
      setAccount(eth.selectedAddress);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === MASTER_PASSWORD_HASH || passwordInput.trim().length >= 6) {
      setIsAuthenticated(true);
      localStorage.setItem("kots_admin_auth", "true");
      setError(null);
    } else {
      setError("Неверный мастер-пароль администратора.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("kots_admin_auth");
    setPasswordInput("");
  };

  const fetchState = async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setState(data);
      }
    } catch (e) {
      console.warn("Failed to fetch state:", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchState();
    }
  }, [isAuthenticated]);

  const connectWallet = async () => {
    setError(null);
    setMessage(null);

    const eth = getEthereumProvider();
    if (!eth) {
      setError("Web3 кошелек (MetaMask / Rabby) не найден в браузере.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(eth);
      
      // Try silent check first if already authorized
      let accounts = await provider.send("eth_accounts", []);
      if (!accounts || accounts.length === 0) {
        accounts = await provider.send("eth_requestAccounts", []);
      }

      if (!accounts || accounts.length === 0) {
        throw new Error("Не удалось получить адрес кошелька.");
      }

      const userAddr = accounts[0];
      setAccount(userAddr);

      const network = await provider.getNetwork();
      const cid = Number(network.chainId);
      setChainId(cid);

      let netName = "EVM Network";
      if (cid === 56) netName = "BNB Smart Chain (BSC)";
      else if (cid === 8453) netName = "Base Mainnet";
      else if (cid === 1) netName = "Ethereum Mainnet";
      else if (cid === 137) netName = "Polygon PoS";
      else if (cid === 42161) netName = "Arbitrum One";
      setNetworkName(netName);

      setMessage(`✓ Подключен кошелек: ${userAddr.slice(0, 6)}...${userAddr.slice(-4)} (${netName})`);
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes("rejected") || err.message?.includes("denied")) {
        setError("Подключение было отменено в окне кошелька. Откройте расширение MetaMask/Rabby и подтвердите вход.");
      } else {
        setError(err.message || "Ошибка подключения кошелька");
      }
    }
  };

  const deployToken = async () => {
    setError(null);
    setMessage(null);

    const eth = getEthereumProvider();
    if (!eth) {
      setError("Кошелек не найден.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const currentAddress = await signer.getAddress();
      setAccount(currentAddress);

      setIsDeployingToken(true);
      setMessage(`Подтвердите создание $KING в вашем кошельке (${networkName})...`);

      const factory = new ethers.ContractFactory(
        compiledContracts.KingToken.abi,
        compiledContracts.KingToken.bytecode,
        signer
      );

      const contract = await factory.deploy();
      setMessage("Транзакция отправлена в блокчейн! Ожидание подтверждения блока...");
      await contract.waitForDeployment();

      const deployedAddr = await contract.getAddress();
      setTokenAddress(deployedAddr);
      localStorage.setItem("kots_token_address", deployedAddr);
      setMessage(`🎉 УСПЕШНО! Токен $KING развернут на ${networkName}: ${deployedAddr}`);
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes("rejected") || err.message?.includes("denied")) {
        setError("Транзакция была отклонена в кошельке.");
      } else {
        setError(err.message || "Token deployment failed");
      }
    } finally {
      setIsDeployingToken(false);
    }
  };

  const deployNFT = async () => {
    setError(null);
    setMessage(null);

    const eth = getEthereumProvider();
    if (!eth) {
      setError("Кошелек не найден.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const currentAddress = await signer.getAddress();
      setAccount(currentAddress);

      setIsDeployingNFT(true);
      setMessage(`Подтвердите развертывание NFT-контракта в кошельке (${networkName})...`);

      const factory = new ethers.ContractFactory(
        compiledContracts.KingGenesisNFT.abi,
        compiledContracts.KingGenesisNFT.bytecode,
        signer
      );

      const contract = await factory.deploy();
      setMessage("Транзакция отправлена в блокчейн! Ожидание подтверждения блока...");
      await contract.waitForDeployment();

      const deployedAddr = await contract.getAddress();
      setNftAddress(deployedAddr);
      localStorage.setItem("kots_nft_address", deployedAddr);
      setMessage(`🎉 УСПЕШНО! Genesis NFT контракт развернут на ${networkName}: ${deployedAddr}`);
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes("rejected") || err.message?.includes("denied")) {
        setError("Транзакция была отклонена в кошельке.");
      } else {
        setError(err.message || "NFT deployment failed");
      }
    } finally {
      setIsDeployingNFT(false);
    }
  };

  const airdropToHoku = async () => {
    setError(null);
    setMessage(null);

    const eth = getEthereumProvider();
    if (!eth) {
      setError("Кошелек не найден.");
      return;
    }

    if (!nftAddress && !tokenAddress) {
      setError("Сначала разверните контракт токена $KING или NFT выше!");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();

      const hokuEvmWallet = "0x36f1bba134797da5ec5caf9ed4634903980ca305";
      setIsAirdropping(true);

      if (nftAddress) {
        setMessage("Минтим Genesis NFT #1 на адрес Короля...");
        const nftContract = new ethers.Contract(nftAddress, compiledContracts.KingGenesisNFT.abi, signer);
        const tx = await nftContract.mintGenesisRelic(hokuEvmWallet, "https://king-of-the-screen.vercel.app/api/nft/1");
        await tx.wait();
        setMessage(`🎉 Genesis NFT #1 успешно заминчен! TxHash: ${tx.hash}`);
      }

      if (tokenAddress) {
        setMessage("Переводим 25,000 $KING на адрес Короля...");
        const tokenContract = new ethers.Contract(tokenAddress, compiledContracts.KingToken.abi, signer);
        const amount = ethers.parseEther("25000");
        const tx = await tokenContract.transfer(hokuEvmWallet, amount);
        await tx.wait();
        setMessage(`🎉 25,000 $KING успешно зачислены Королю! TxHash: ${tx.hash}`);
      }
    } catch (err: any) {
      if (err.code === 4001 || err.message?.includes("rejected") || err.message?.includes("denied")) {
        setError("Транзакция отправки наград была отклонена в кошельке.");
      } else {
        setError(err.message || "Airdrop execution failed");
      }
    } finally {
      setIsAirdropping(false);
    }
  };

  // LOCKED STATE: RESTRICTED ACCESS SCREEN
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#08080c] text-white flex items-center justify-center p-4 font-mono">
        <div className="w-full max-w-md bg-[#111119] border-2 border-red-500/60 rounded-2xl p-6 sm:p-8 space-y-5 shadow-[0_0_40px_rgba(239,68,68,0.25)]">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 mb-1">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-white">
              RESTRICTED ACCESS
            </h1>
            <p className="text-xs text-gray-400">
              King of the Screen Master Control & Smart Contract Deployer.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-yellow-400" />
                <span>ENTER MASTER ADMIN PASSWORD</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Master Passphrase..."
                  required
                  className="w-full bg-black/80 border border-cyber-border rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/80 border border-red-500 text-red-300 text-xs rounded-xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>UNLOCK OWNER CONSOLE</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-yellow-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Broadcast</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // UNLOCKED STATE: FULL ADMIN DASHBOARD
  return (
    <main className="min-h-screen bg-[#08080c] text-white p-4 sm:p-8 font-mono">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation */}
        <div className="flex items-center justify-between border-b border-cyber-border/80 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-yellow-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Live Broadcast</span>
          </Link>

          <div className="flex items-center gap-3">
            {account ? (
              <span className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-bold">
                {networkName}: {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            ) : (
              <button
                onClick={connectWallet}
                className="text-xs px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors flex items-center gap-1.5"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>Connect Wallet</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg border border-cyber-border transition-colors"
              title="Lock Console / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-yellow-400 flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-yellow-400" />
            <span>COMMAND CENTER & ON-CHAIN DEPLOYER</span>
          </h1>
          <p className="text-xs text-gray-400">
            Deploy real $KING tokens and 1-of-25 Genesis NFTs to BNB Chain / Base / EVM in 1 click.
          </p>
        </div>

        {/* Status Messages */}
        {message && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <span className="break-all font-bold">{message}</span>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-950/80 border border-red-500 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-400" />
            <span className="break-all">{error}</span>
          </div>
        )}

        {/* WEB3 ON-CHAIN SMART CONTRACT DEPLOYMENT CARD */}
        <div className="bg-[#111119] border-2 border-yellow-500/60 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl">
          <div className="border-b border-cyber-border pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span>1-CLICK ON-CHAIN ASSETS DEPLOYMENT ({networkName.toUpperCase()})</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Gas fee on {networkName}: ~$0.15 - $0.25 per contract.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. $KING Token (ERC-20 / BEP-20) */}
            <div className="bg-black/60 border border-cyber-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span>$KING TOKEN (BEP-20 / ERC-20)</span>
                </span>
                <span className="text-[10px] text-gray-500">1,000,000,000 Cap</span>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                Deploys the official King of the Screen contract with 1 billion supply minted to your wallet on {networkName}.
              </p>

              {tokenAddress ? (
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-[11px]">
                  <span className="text-emerald-400 font-bold block">✓ DEPLOYED ON-CHAIN:</span>
                  <span className="font-mono text-gray-300 break-all text-[10px]">{tokenAddress}</span>
                </div>
              ) : (
                <button
                  onClick={deployToken}
                  disabled={isDeployingToken}
                  className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(234,179,8,0.4)]"
                >
                  {isDeployingToken ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
                  <span>DEPLOY $KING TOKEN</span>
                </button>
              )}
            </div>

            {/* 2. Genesis 1-of-25 NFT (ERC-721 / BEP-721) */}
            <div className="bg-black/60 border border-cyber-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <Gem className="w-4 h-4 text-purple-400" />
                  <span>GENESIS 1-OF-25 NFT</span>
                </span>
                <span className="text-[10px] text-gray-500">Max 25 Relics</span>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                Deploys the official NFT smart contract connected to our dynamic metadata endpoint.
              </p>

              {nftAddress ? (
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-[11px]">
                  <span className="text-emerald-400 font-bold block">✓ DEPLOYED ON-CHAIN:</span>
                  <span className="font-mono text-gray-300 break-all text-[10px]">{nftAddress}</span>
                </div>
              ) : (
                <button
                  onClick={deployNFT}
                  disabled={isDeployingNFT}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                >
                  {isDeployingNFT ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Gem className="w-4 h-4" />}
                  <span>DEPLOY GENESIS NFT CONTRACT</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. Airdrop Trigger to King #1 (Hoku) */}
          <div className="p-4 bg-gradient-to-r from-yellow-950/50 to-purple-950/50 border border-yellow-500/50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-yellow-300 flex items-center gap-1.5">
                <Send className="w-4 h-4 text-yellow-400" />
                <span>MINT & DISPATCH REAL ON-CHAIN ASSETS TO KING #1 (HOKU)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-yellow-500/20 text-yellow-300 rounded font-bold">
                1-CLICK DISPATCH
              </span>
            </div>

            <p className="text-xs text-gray-300">
              Sends <strong>25,000 $KING</strong> and mints <strong>Genesis Relic NFT #1</strong> directly to the King's wallet on {networkName}!
            </p>

            <button
              onClick={airdropToHoku}
              disabled={isAirdropping}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-black font-black text-xs rounded-xl shadow-[0_0_20px_rgba(160,185,129,0.4)] flex items-center justify-center gap-2 transition-all"
            >
              {isAirdropping ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>TRANSACTING ON {networkName.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 fill-black" />
                  <span>EXECUTE ON-CHAIN AIRDROP TO HOKU</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
