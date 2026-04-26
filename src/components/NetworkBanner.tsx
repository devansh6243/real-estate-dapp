"use client";

import { useWeb3 } from "@/context/Web3Context";
import { AlertTriangle } from "lucide-react";

export default function NetworkBanner() {
  const { account, chainId, isCorrectNetwork, switchNetwork } = useWeb3();

  if (!account || isCorrectNetwork) return null;

  return (
    <div className="fixed top-20 left-0 right-0 z-40 flex justify-center px-4 pt-3">
      <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/40 backdrop-blur-md shadow-lg max-w-2xl w-full">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-amber-300 font-semibold text-sm">Wrong Network (Chain ID: {chainId})</p>
          <p className="text-amber-200/70 text-xs">
            Switch to <strong>Hardhat Localhost (31337)</strong> or <strong>Sepolia Testnet (11155111)</strong> to transact.
          </p>
        </div>
        <button
          onClick={switchNetwork}
          className="flex-shrink-0 px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold transition-colors"
        >
          Switch Network
        </button>
      </div>
    </div>
  );
}
