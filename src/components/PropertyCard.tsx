import { ethers } from "ethers";
import { MapPin, Loader2 } from "lucide-react";

interface Property {
  id: number;
  price: string;
  location: string;
  owner: string;
  seller: string;
  currentlyListed: boolean;
  image?: string;
}

interface PropertyCardProps {
  property: Property;
  onBuy?: (id: number, price: string) => void;
  isOwner?: boolean;
  isBuying?: boolean;
}

// Rotate through a set of nice fallback property images
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800",
];

export default function PropertyCard({ property, onBuy, isOwner, isBuying }: PropertyCardProps) {
  // If the stored image is a base64 data URL (uploaded by user) or an Unsplash URL use it directly.
  // Otherwise fall back to a nice rotating image.
  const imageSrc =
    property.image && property.image.length > 0
      ? property.image
      : FALLBACK_IMAGES[property.id % FALLBACK_IMAGES.length];

  const priceEth = (() => {
    try { return ethers.formatEther(property.price); }
    catch { return "–"; }
  })();

  return (
    <div className="glass-panel rounded-3xl overflow-hidden group hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300 hover:-translate-y-2">
      {/* Image */}
      <div className="relative h-56 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a] via-transparent to-transparent z-10 opacity-80" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageSrc}
          alt={property.location}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out"
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLImageElement).src = FALLBACK_IMAGES[0];
          }}
        />
        <div className="absolute top-4 right-4 z-20">
          <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${property.currentlyListed ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
            <span className="text-xs font-semibold text-white tracking-wide uppercase">
              {property.currentlyListed ? "For Sale" : "Owned"}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-1.5 text-gray-400 mb-2">
          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-sm font-medium uppercase tracking-wider truncate">{property.location}</span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-4">{priceEth} ETH</h3>

        <div className="space-y-2 border-t border-white/5 pt-4 mb-5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Token ID</span>
            <span className="text-gray-300 font-mono">#{property.id}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Seller</span>
            <span className="text-gray-300 font-mono">
              {property.seller !== "0x0000000000000000000000000000000000000000"
                ? `${property.seller.slice(0, 6)}...${property.seller.slice(-4)}`
                : `${property.owner.slice(0, 6)}...${property.owner.slice(-4)}`}
            </span>
          </div>
        </div>

        {/* Action button */}
        {property.currentlyListed && onBuy && !isOwner && (
          <button
            onClick={() => onBuy(property.id, property.price)}
            disabled={!!isBuying}
            className="w-full py-3.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-semibold transition-colors shadow-lg hover:shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isBuying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Purchasing…
              </>
            ) : (
              "Purchase Property"
            )}
          </button>
        )}

        {isOwner && (
          <div className="w-full py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-center text-sm">
            ✓ You own this property
          </div>
        )}
      </div>
    </div>
  );
}
