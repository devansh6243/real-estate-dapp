"use client";

import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "@/context/Web3Context";
import PropertyCard from "@/components/PropertyCard";
import { Loader2, RefreshCw, WifiOff } from "lucide-react";
import Link from "next/link";

// ── Read-only provider: loads properties even without MetaMask connected ──
let READ_CONTRACT: ethers.Contract | null = null;
try {
  const addr = require("@/lib/contracts/contract-address.json").RealEstateMarketplace;
  const abi  = require("@/lib/contracts/RealEstateMarketplace.json").abi;
  const rpc  = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  READ_CONTRACT = new ethers.Contract(addr, abi, rpc);
} catch (e) {
  console.warn("Could not create read-only contract. Is the contract deployed?");
}

function SkeletonCard() {
  return (
    <div className="glass-panel rounded-3xl overflow-hidden animate-pulse">
      <div className="h-56 bg-white/5" />
      <div className="p-6 space-y-4">
        <div className="h-4 bg-white/5 rounded w-1/2" />
        <div className="h-6 bg-white/5 rounded w-2/3" />
        <div className="h-4 bg-white/5 rounded w-full" />
        <div className="h-12 bg-white/5 rounded-xl mt-2" />
      </div>
    </div>
  );
}

export default function BuyPage() {
  const { contract, account, connectWallet, isLoading: isWeb3Loading } = useWeb3();
  const [properties, setProperties]   = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [fetchError, setFetchError]   = useState<string | null>(null);
  const [buyingId, setBuyingId]       = useState<number | null>(null);

  // Use the signer-contract when connected, otherwise fall back to read-only
  const readContract = contract ?? READ_CONTRACT;

  const loadProperties = useCallback(async () => {
    if (!readContract) {
      setFetchError("Contract not found. Make sure you deployed and restarted the dev server.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setFetchError(null);
    try {
      const data: any[] = await readContract.getAllListedProperties();

      const items = await Promise.all(
        data.map(async (i: any) => {
          let meta: any = {};
          try {
            const uri: string = await readContract.tokenURI(i.id);
            if (uri.startsWith("data:text/json;charset=utf-8,")) {
              meta = JSON.parse(decodeURIComponent(uri.replace("data:text/json;charset=utf-8,", "")));
            } else if (uri.startsWith("http") || uri.startsWith("ipfs")) {
              const res = await fetch(uri.replace("ipfs://", "https://ipfs.io/ipfs/"));
              meta = await res.json();
            }
          } catch (_) {}

          return {
            id:             Number(i.id),
            price:          i.price.toString(),
            location:       i.location,
            owner:          i.owner,
            seller:         i.seller,
            currentlyListed:i.currentlyListed,
            image:          meta.image || "",
          };
        })
      );

      setProperties(items);
    } catch (err: any) {
      console.error(err);
      setFetchError(
        "Could not fetch properties. Is the Hardhat node running? Did you redeploy after restarting it?"
      );
    } finally {
      setLoading(false);
    }
  }, [readContract]);

  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  const buyProperty = async (id: number, price: string) => {
    if (!contract) {
      alert("Please connect your wallet first to buy a property.");
      return;
    }
    if (contract.runner && (contract.runner as any).address?.toLowerCase() === properties.find(p => p.id === id)?.seller?.toLowerCase()) {
      alert("You cannot buy your own listing. Switch to a different MetaMask account.");
      return;
    }
    try {
      setBuyingId(id);
      const tx = await contract.buyProperty(id, { value: BigInt(price) });
      await tx.wait();
      await loadProperties();
      alert("✅ Property purchased successfully!");
    } catch (err: any) {
      const reason = err?.reason || err?.data?.message || err?.message || "Transaction rejected.";
      alert("❌ Purchase failed: " + reason);
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold mb-2">
            Market<span className="gradient-text">place</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Browse and purchase prime real estate minted as NFTs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadProperties}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium text-gray-300 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            href="/sell"
            className="px-5 py-2 rounded-xl bg-primary hover:bg-blue-600 text-white text-sm font-semibold transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          >
            + List Property
          </Link>
        </div>
      </div>

      {/* Wallet banner – only show if not connected */}
      {!account && !isWeb3Loading && (
        <div className="glass-panel p-5 rounded-2xl flex items-center justify-between mb-8 border border-primary/20">
          <p className="text-gray-300 text-sm">
            Connect your wallet to <strong className="text-white">purchase</strong> properties.
          </p>
          <button
            onClick={connectWallet}
            className="px-5 py-2 rounded-full bg-primary hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      )}

      {/* Error state */}
      {fetchError && (
        <div className="glass-panel p-8 rounded-3xl text-center border border-red-500/20 mb-8">
          <WifiOff className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-semibold mb-1">Could not load properties</p>
          <p className="text-gray-500 text-sm">{fetchError}</p>
          <button
            onClick={loadProperties}
            className="mt-4 px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm border border-white/10 transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {/* Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4].map((n) => <SkeletonCard key={n} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && !fetchError && properties.length === 0 && (
        <div className="glass-panel p-12 text-center rounded-3xl">
          <p className="text-2xl font-semibold text-white mb-2">No listings yet</p>
          <p className="text-gray-400 mb-6">
            Be the first to list a property on the marketplace.
          </p>
          <Link
            href="/sell"
            className="inline-block px-8 py-3 rounded-full bg-primary hover:bg-blue-600 text-white font-semibold transition-colors"
          >
            List a Property
          </Link>
        </div>
      )}

      {/* Property grid */}
      {!loading && properties.length > 0 && (
        <>
          <p className="text-gray-500 text-sm mb-6">{properties.length} propert{properties.length === 1 ? "y" : "ies"} listed</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((prop) => (
              <PropertyCard
                key={prop.id}
                property={prop}
                onBuy={buyProperty}
                isBuying={buyingId === prop.id}
                isOwner={
                  account
                    ? prop.seller.toLowerCase() === account.toLowerCase() ||
                      prop.owner.toLowerCase() === account.toLowerCase()
                    : false
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
