import Link from "next/link";
import { ArrowRight, ShieldCheck, Globe2, Coins } from "lucide-react";

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[40%] rounded-full bg-accent/20 blur-[120px] mix-blend-screen pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium text-gray-300">Live on Localnet</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            The Future of <br className="hidden md:block" />
            <span className="gradient-text">Real Estate Trading</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Buy, sell, and manage physical properties as liquid NFTs on the blockchain. Frictionless transactions, absolute transparency, zero intermediaries.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              href="/buy" 
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary hover:bg-blue-600 text-white font-semibold text-lg transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2"
            >
              Explore Properties
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link 
              href="/sell" 
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all font-semibold text-lg text-white text-center"
            >
              List Your Property
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-8 rounded-3xl hover:bg-white/5 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 border border-primary/30 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Immutable Registry</h3>
            <p className="text-gray-400 leading-relaxed">
              Every property deed is cryptographically secured as an ERC-721 NFT, guaranteeing indisputable ownership.
            </p>
          </div>
          
          <div className="glass-panel p-8 rounded-3xl hover:bg-white/5 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center mb-6 border border-accent/30 group-hover:scale-110 transition-transform">
              <Globe2 className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Global Access</h3>
            <p className="text-gray-400 leading-relaxed">
              Transact real estate globally without geographical restrictions or heavy cross-border compliances.
            </p>
          </div>
          
          <div className="glass-panel p-8 rounded-3xl hover:bg-white/5 transition-colors group">
            <div className="w-14 h-14 rounded-2xl bg-pink-500/20 flex items-center justify-center mb-6 border border-pink-500/30 group-hover:scale-110 transition-transform">
              <Coins className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-white">Zero Intermediaries</h3>
            <p className="text-gray-400 leading-relaxed">
              Eliminate brokers, lawyers, and escrows. Smart contracts handle the transfer of funds and ownership instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
