"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { useWeb3 } from "@/context/Web3Context";
import { UploadCloud, CheckCircle2, Loader2, Wallet, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SellPage() {
  const { contract, account, isCorrectNetwork, connectWallet, switchNetwork, isLoading: web3Loading } = useWeb3();
  const router = useRouter();

  const [location,  setLocation]  = useState("");
  const [price,     setPrice]     = useState("");
  const [fileURL,   setFileURL]   = useState("");
  const [fileName,  setFileName]  = useState("");
  const [message,   setMessage]   = useState("");
  const [isBusy,    setIsBusy]    = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => setFileURL(reader.result as string);
    reader.onerror   = () => alert("Error reading file.");
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract)          { alert("Contract not ready. Check wallet & network."); return; }
    if (!location.trim())   { alert("Please enter a location."); return; }
    if (!price || parseFloat(price) <= 0) { alert("Please enter a valid price > 0."); return; }

    try {
      setIsBusy(true);

      // Default Unsplash image
      let finalImageUrl = "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=800";

      // If user uploaded a file, send it to our local API endpoint
      if (fileURL && fileURL.startsWith("data:image")) {
        setMessage("Uploading image...");
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: fileURL, fileName: fileName || "image.png" })
        });
        
        if (res.ok) {
          const data = await res.json();
          // e.g. /uploads/123-image.png
          // We convert it to a full URL (http://localhost:3000/uploads/...) so it works later
          finalImageUrl = window.location.origin + data.url;
        } else {
          throw new Error("Failed to upload the image to the server.");
        }
      }

      const metadata = {
        name:        location,
        description: `A premium property located at ${location}`,
        image:       finalImageUrl,
        location,
        price,
      };
      
      const tokenURI = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(metadata));
      const priceWei = ethers.parseUnits(price, "ether");

      setMessage("Confirm the transaction in MetaMask…");
      const tx = await contract.mintAndListProperty(tokenURI, priceWei, location);

      setMessage("Waiting for block confirmation…");
      await tx.wait();

      setMessage("");
      alert("✅ Property minted and listed!");
      setLocation(""); setPrice(""); setFileURL(""); setFileName("");
      router.push("/buy");
    } catch (err: any) {
      console.error(err);
      const reason = err?.reason || err?.data?.message || err?.message || "Transaction rejected.";
      alert("❌ " + reason);
      setMessage("");
    } finally {
      setIsBusy(false);
    }
  };

  // ── Step 1: Not connected ────────────────────────────────────────────────
  if (!account) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)] px-4">
        <div className="glass-panel p-10 text-center rounded-3xl max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6 border border-primary/30">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6 text-sm leading-relaxed">
            You need to connect MetaMask to list a property. Make sure MetaMask is installed and you have the Hardhat test account imported.
          </p>
          <button
            onClick={connectWallet}
            disabled={web3Loading}
            className="w-full py-3.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {web3Loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5" />}
            {web3Loading ? "Connecting…" : "Connect MetaMask"}
          </button>
        </div>
      </div>
    );
  }

  // ── Step 2: Wrong network ────────────────────────────────────────────────
  if (!isCorrectNetwork) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)] px-4">
        <div className="glass-panel p-10 text-center rounded-3xl max-w-md w-full border border-amber-500/30">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-6 border border-amber-500/30">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Wrong Network</h2>
          <p className="text-gray-400 mb-2 text-sm">
            You're connected to the wrong blockchain network.
          </p>
          <p className="text-gray-500 mb-6 text-xs">
            Please switch MetaMask to <strong className="text-amber-400">Hardhat Localhost (Chain ID: 31337)</strong>.
          </p>
          <button
            onClick={switchNetwork}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all flex items-center justify-center gap-2"
          >
            Switch to Hardhat Network
          </button>
          <p className="text-xs text-gray-600 mt-4">
            Make sure <code className="text-gray-400">npx hardhat node</code> is running in your terminal.
          </p>
        </div>
      </div>
    );
  }

  // ── Step 3: Form (wallet connected + correct network) ────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold mb-3">
          List <span className="gradient-text">Property</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Mint your property as an NFT and list it on the marketplace instantly.
        </p>
        {/* Wallet info strip */}
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-mono">
            {account.slice(0, 6)}...{account.slice(-4)} · Hardhat Localhost
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-8 md:p-10 rounded-3xl shadow-xl space-y-8">

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Location / Property Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. 123 Ocean Drive, Miami, FL"
            value={location}
            onChange={e => setLocation(e.target.value)}
            required
            disabled={isBusy}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 transition-all"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Asking Price (ETH) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.0001"
              min="0.0001"
              placeholder="e.g. 2.5"
              value={price}
              onChange={e => setPrice(e.target.value)}
              required
              disabled={isBusy}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-14 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-60 transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">ETH</span>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Property Image <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer transition-colors
              ${fileURL
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-white/10 bg-white/5 hover:border-primary/50 hover:bg-primary/5"
              } ${isBusy ? "opacity-60 pointer-events-none" : ""}`}
          >
            {fileURL ? (
              <div className="flex flex-col items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fileURL} alt="preview" className="h-20 w-32 object-cover rounded-lg border border-white/10" />
                <span className="text-sm text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {fileName}
                </span>
                <span className="text-xs text-gray-500">Click to change</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center px-4">
                <UploadCloud className="w-10 h-10 text-gray-500" />
                <span className="text-sm text-gray-400">
                  <span className="text-primary font-semibold">Click to upload</span> or drag & drop
                </span>
                <span className="text-xs text-gray-600">PNG, JPG, GIF, WebP — max 10 MB</span>
              </div>
            )}
            <input id="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} disabled={isBusy} />
          </label>
          {!fileURL && (
            <p className="text-xs text-gray-600 mt-2">If no image is uploaded, a stock photo is used automatically.</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isBusy}
          className="w-full py-4 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold text-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_35px_rgba(59,130,246,0.5)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {isBusy ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {message || "Processing…"}
            </>
          ) : (
            "Mint & List Property"
          )}
        </button>

      </form>
    </div>
  );
}
