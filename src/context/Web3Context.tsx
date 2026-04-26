"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { ethers } from "ethers";

let MarketplaceABI: any = null;
let MarketplaceAddress = "";

try {
  const addr = require("@/lib/contracts/contract-address.json");
  const art  = require("@/lib/contracts/RealEstateMarketplace.json");
  MarketplaceAddress = addr.RealEstateMarketplace;
  MarketplaceABI     = art.abi;
} catch {
  console.warn("Contract files not found. Run the deploy script first.");
}

const HARDHAT_CHAIN_ID     = 31337;          // Hardhat localhost
const SEPOLIA_CHAIN_ID     = 11155111;       // Sepolia testnet
const HARDHAT_CHAIN_ID_HEX = "0x7a69";
const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

// Accepted networks: localhost (dev) or Sepolia (testnet)
const ACCEPTED_CHAINS = [HARDHAT_CHAIN_ID, SEPOLIA_CHAIN_ID];

interface Web3ContextType {
  account:       string | null;
  provider:      ethers.BrowserProvider | null;
  contract:      ethers.Contract | null;
  chainId:       number | null;
  isCorrectNetwork: boolean;
  connectWallet:    () => Promise<void>;
  switchNetwork:    () => Promise<void>;
  isLoading:     boolean;
  error:         string | null;
}

const Web3Context = createContext<Web3ContextType>({
  account:          null,
  provider:         null,
  contract:         null,
  chainId:          null,
  isCorrectNetwork: false,
  networkName:      "Unknown",
  connectWallet:    async () => {},
  switchNetwork:    async () => {},
  isLoading:        true,
  error:            null,
});

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [account,  setAccount]  = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [chainId,  setChainId]  = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  const isCorrectNetwork = chainId !== null && ACCEPTED_CHAINS.includes(chainId);
  const networkName = chainId === HARDHAT_CHAIN_ID ? "Hardhat Localhost" 
    : chainId === SEPOLIA_CHAIN_ID ? "Sepolia Testnet" 
    : chainId ? `Chain ${chainId}` : "Unknown";

  // ── Build contract with signer ────────────────────────────────────────────
  const buildContract = useCallback(async (bp: ethers.BrowserProvider) => {
    if (!MarketplaceAddress || !MarketplaceABI) return;
    try {
      const signer = await bp.getSigner();
      setContract(new ethers.Contract(MarketplaceAddress, MarketplaceABI, signer));
    } catch (e) {
      console.error("buildContract:", e);
      setContract(null);
    }
  }, []);

  // ── Switch / add Hardhat network ──────────────────────────────────────────
  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    // Try Hardhat localhost first, fall back to Sepolia
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: HARDHAT_CHAIN_ID_HEX }],
      });
    } catch (err: any) {
      if (err.code === 4902) {
        // Not found locally — switch to Sepolia instead
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
          });
        } catch (sepoliaErr: any) {
          if (sepoliaErr.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId:        SEPOLIA_CHAIN_ID_HEX,
                chainName:      "Sepolia Testnet",
                rpcUrls:        ["https://rpc.sepolia.org"],
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              }],
            });
          }
        }
      }
    }
  }, []);

  // ── Auto-detect on page load ──────────────────────────────────────────────
  const init = useCallback(async () => {
    if (!window.ethereum) { setIsLoading(false); return; }
    try {
      const bp = new ethers.BrowserProvider(window.ethereum as any);
      const network = await bp.getNetwork();
      const cid = Number(network.chainId);
      setChainId(cid);
      setProvider(bp);

      const accounts = await bp.listAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0].address);
        if (cid === HARDHAT_CHAIN_ID) await buildContract(bp);
      else if (cid === SEPOLIA_CHAIN_ID) await buildContract(bp);
      }
    } catch (e) {
      console.error("init:", e);
    } finally {
      setIsLoading(false);
    }
  }, [buildContract]);

  // ── Manual connect wallet ─────────────────────────────────────────────────
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed.\nPlease install it from https://metamask.io");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      // 1. Request accounts
      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (!accounts.length) throw new Error("No accounts returned.");

      // 2. Build provider & get chainId
      const bp = new ethers.BrowserProvider(window.ethereum as any);
      const network = await bp.getNetwork();
      const cid = Number(network.chainId);

      setProvider(bp);
      setAccount(accounts[0]);
      setChainId(cid);

      // 3. Build contract only if on correct chain
      if (cid === HARDHAT_CHAIN_ID) {
        await buildContract(bp);
      }
    } catch (err: any) {
      if (err.code === 4001) {
        setError("Connection rejected. Please approve MetaMask.");
      } else {
        setError(err.message || "Failed to connect.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [buildContract]);

  // ── MetaMask event listeners ──────────────────────────────────────────────
  useEffect(() => {
    init();

    const eth = (window as any).ethereum;
    if (!eth) return;

    const onAccounts = async (accounts: string[]) => {
      if (!accounts.length) {
        setAccount(null); setContract(null); return;
      }
      setAccount(accounts[0]);
      const bp = new ethers.BrowserProvider(eth);
      setProvider(bp);
      const network = await bp.getNetwork();
      const cid = Number(network.chainId);
      setChainId(cid);
      if (ACCEPTED_CHAINS.includes(cid)) await buildContract(bp);
      else setContract(null);
    };

    const onChain = async (chainIdHex: string) => {
      const cid = parseInt(chainIdHex, 16);
      setChainId(cid);
      if (ACCEPTED_CHAINS.includes(cid)) await buildContract(bp);
      else setContract(null);
    };

    eth.on("accountsChanged", onAccounts);
    eth.on("chainChanged",    onChain);
    return () => {
      eth.removeListener("accountsChanged", onAccounts);
      eth.removeListener("chainChanged",    onChain);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Web3Context.Provider value={{
      account, provider, contract, chainId, isCorrectNetwork, networkName,
      connectWallet, switchNetwork, isLoading, error,
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
