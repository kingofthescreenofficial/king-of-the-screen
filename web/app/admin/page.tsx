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
} from "lucide-react";
import Link from "next/link";
import { ethers } from "ethers";
import compiledContracts from "@/lib/compiled_contracts.json";

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Web3 Deployment State
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [nftAddress, setNftAddress] = useState<string>("");
  const [isDeployingToken, setIsDeployingToken] = useState(false);
  const [isDeployingNFT, setIsDeployingNFT] = useState(false);
  const [isAirdropping, setIsAirdropping] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kots_admin_secret");
    if (saved) setSecret(saved);

    const savedToken = localStorage.getItem("kots_token_address");
    if (savedToken) setTokenAddress(savedToken);

    const savedNft = localStorage.getItem("kots_nft_address");
    if (savedNft) setNftAddress(savedNft);
  }, []);

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
    fetchState();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        
        // Auto-switch to Base network (Chain ID 8453)
        try {
          await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x2105" }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await (window as any).ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x2105",
                  chainName: "Base Mainnet",
                  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                  rpcUrls: ["https://mainnet.base.org"],
                  blockExplorerUrls: ["https://basescan.org"],
                },
              ],
            });
          }
        }

        const network = await provider.getNetwork();
        setAccount(accounts[0]);
        setChainId(Number(network.chainId));
      } catch (err: any) {
        setError(err.message || "Failed to connect wallet");
      }
    } else {
      setError("MetaMask / Rabby wallet extension not found in browser");
    }
  };

  const deployToken = async () => {
    if (!account) await connectWallet();
    setIsDeployingToken(true);
    setError(null);
    setMessage(null);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      const factory = new ethers.ContractFactory(
        compiledContracts.KingToken.abi,
        compiledContracts.KingToken.bytecode,
        signer
      );

      setMessage("Please confirm transaction in your wallet to deploy $KING ERC-20...");
      const contract = await factory.deploy(account);
      await contract.waitForDeployment();

      const deployedAddr = await contract.getAddress();
      setTokenAddress(deployedAddr);
      localStorage.setItem("kots_token_address", deployedAddr);
      setMessage(`✓ $KING Token successfully deployed on-chain to: ${deployedAddr}`);
    } catch (err: any) {
      setError(err.message || "Token deployment failed");
    } finally {
      setIsDeployingToken(false);
    }
  };

  const deployNFT = async () => {
    if (!account) await connectWallet();
    setIsDeployingNFT(true);
    setError(null);
    setMessage(null);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      const factory = new ethers.ContractFactory(
        compiledContracts.KingGenesisNFT.abi,
        compiledContracts.KingGenesisNFT.bytecode,
        signer
      );

      setMessage("Please confirm transaction in your wallet to deploy Genesis NFT Contract...");
      const contract = await factory.deploy();
      await contract.waitForDeployment();

      const deployedAddr = await contract.getAddress();
      setNftAddress(deployedAddr);
      localStorage.setItem("kots_nft_address", deployedAddr);
      setMessage(`✓ Genesis 1-of-25 NFT Contract deployed on-chain to: ${deployedAddr}`);
    } catch (err: any) {
      setError(err.message || "NFT deployment failed");
    } finally {
      setIsDeployingNFT(false);
    }
  };

  const airdropToHoku = async () => {
    if (!account) await connectWallet();
    if (!nftAddress && !tokenAddress) {
      setError("Please deploy Token or NFT contract first.");
      return;
    }

    setIsAirdropping(true);
    setError(null);
    setMessage(null);

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      const hokuEvmWallet = "0x36f1bba134797da5ec5caf9ed4634903980ca305";

      if (nftAddress) {
        setMessage("Minting Genesis Relic #1 to King on-chain...");
        const nftContract = new ethers.Contract(nftAddress, compiledContracts.KingGenesisNFT.abi, signer);
        const tx = await nftContract.mintGenesisRelic(hokuEvmWallet, "https://king-of-the-screen.vercel.app/api/nft/1");
        await tx.wait();
        setMessage(`✓ Genesis Relic #1 officially minted to ${hokuEvmWallet}! TxHash: ${tx.hash}`);
      }

      if (tokenAddress) {
        setMessage("Transferring 25,000 $KING tokens on-chain...");
        const tokenContract = new ethers.Contract(tokenAddress, compiledContracts.KingToken.abi, signer);
        const amount = ethers.parseEther("25000");
        const tx = await tokenContract.transfer(hokuEvmWallet, amount);
        await tx.wait();
        setMessage(`✓ 25,000 $KING tokens transferred on-chain! TxHash: ${tx.hash}`);
      }
    } catch (err: any) {
      setError(err.message || "Airdrop execution failed");
    } finally {
      setIsAirdropping(false);
    }
  };

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

          <div className="flex items-center gap-2">
            {account ? (
              <span className="text-xs px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full font-bold">
                Wallet: {account.slice(0, 6)}...{account.slice(-4)} (Chain {chainId})
              </span>
            ) : (
              <button
                onClick={connectWallet}
                className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold transition-colors"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-yellow-400 flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-yellow-400" />
            <span>COMMAND CENTER & ON-CHAIN DEPLOYER</span>
          </h1>
          <p className="text-xs text-gray-400">
            Deploy real $KING ERC-20 tokens and 1-of-25 Genesis NFTs to Base / EVM in 1 click.
          </p>
        </div>

        {/* Status Messages */}
        {message && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="break-all">{message}</span>
          </div>
        )}
        {error && (
          <div className="p-4 bg-red-950/80 border border-red-500 text-red-300 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span className="break-all">{error}</span>
          </div>
        )}

        {/* WEB3 ON-CHAIN SMART CONTRACT DEPLOYMENT CARD */}
        <div className="bg-[#111119] border-2 border-yellow-500/60 rounded-2xl p-5 sm:p-6 space-y-5 shadow-2xl">
          <div className="border-b border-cyber-border pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span>1-CLICK ON-CHAIN ASSETS DEPLOYMENT (BASE / EVM)</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Gas fee on Base: ~$0.01 per contract.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. $KING Token (ERC-20) */}
            <div className="bg-black/60 border border-cyber-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-yellow-400 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <span>$KING TOKEN (ERC-20)</span>
                </span>
                <span className="text-[10px] text-gray-500">1,000,000,000 Cap</span>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                Deploys the official King of the Screen ERC-20 contract with 1 billion supply minted to your wallet.
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
                  className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isDeployingToken ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Coins className="w-4 h-4" />}
                  <span>DEPLOY $KING TOKEN TO BASE</span>
                </button>
              )}
            </div>

            {/* 2. Genesis 1-of-25 NFT (ERC-721) */}
            <div className="bg-black/60 border border-cyber-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <Gem className="w-4 h-4 text-purple-400" />
                  <span>GENESIS 1-OF-25 NFT (ERC-721)</span>
                </span>
                <span className="text-[10px] text-gray-500">Max 25 Relics</span>
              </div>

              <p className="text-[11px] text-gray-400 leading-relaxed">
                Deploys the official ERC-721 smart contract connected to our dynamic metadata endpoint.
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
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-lg transition-colors flex items-center justify-center gap-2"
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
              Sends <strong>25,000 $KING</strong> and mints <strong>Genesis Relic NFT #1</strong> directly to the King's wallet on Base!
            </p>

            <button
              onClick={airdropToHoku}
              disabled={isAirdropping}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 text-black font-black text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2 transition-all"
            >
              {isAirdropping ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>TRANSACTING ON BASE BLOCKCHAIN...</span>
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
