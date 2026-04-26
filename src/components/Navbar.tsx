"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useWeb3 } from "@/context/Web3Context";
import { Building2, Wallet, ChevronDown, LogOut, LayoutDashboard, Copy, CheckCheck } from "lucide-react";

export default function Navbar() {
  const { account, connectWallet, isLoading } = useWeb3();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const copyAddress = () => {
    if (!account) return;
    navigator.clipboard.writeText(account);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const disconnect = () => {
    // MetaMask doesn't have a true "disconnect" via ethers, but we can guide user
    setDropdownOpen(false);
    alert(
      "To switch wallets, open MetaMask and:\n" +
      "1. Click the account circle at the top\n" +
      "2. Select a different account\n\n" +
      "The app will update automatically."
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xl font-bold gradient-text tracking-wider uppercase">
                BlockEstates
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-1">
                <Link href="/buy" className="text-gray-300 hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Marketplace
                </Link>
                <Link href="/sell" className="text-gray-300 hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  List Property
                </Link>
                {account && (
                  <Link href="/my-properties" className="text-gray-300 hover:text-white hover:bg-white/5 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Wallet area */}
          <div className="flex items-center">
            {account ? (
              <div className="relative" ref={dropdownRef}>
                {/* Account button */}
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 py-2 pl-3 pr-4 rounded-full border border-white/10 transition-colors group"
                >
                  {/* Avatar circle */}
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {account.slice(2, 4).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-300 font-mono hidden sm:block">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-14 w-64 glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50">
                    {/* Address header */}
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-xs text-gray-500 mb-1">Connected wallet</p>
                      <p className="text-sm text-white font-mono break-all">{account}</p>
                    </div>

                    {/* Actions */}
                    <div className="p-2">
                      <button
                        onClick={copyAddress}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        {copied ? <CheckCheck className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copied!" : "Copy address"}
                      </button>

                      <Link
                        href="/my-properties"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        My Properties
                      </Link>

                      <button
                        onClick={disconnect}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Switch / Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isLoading}
                className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-full font-medium transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] disabled:opacity-70"
              >
                <Wallet className="w-4 h-4" />
                {isLoading ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
