"use client";

import { useEffect, useState } from "react";
import { useWeb3 } from "@/context/Web3Context";
import PropertyCard from "@/components/PropertyCard";
import { Loader2 } from "lucide-react";

export default function MyPropertiesPage() {
  const { contract, account, isLoading: isWeb3Loading } = useWeb3();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProperties = async () => {
    if (!contract || !account) return;
    try {
      // Contract gives us properties where owner == msg.sender or seller == msg.sender
      const data = await contract.getMyProperties();
      
      const items = await Promise.all(data.map(async (i: any) => {
        let tokenUri = await contract.tokenURI(i.id);
        
        let meta = { image: "" };
        try {
          if (tokenUri.startsWith("http") || tokenUri.startsWith("ipfs")) {
            const res = await fetch(tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/"));
            meta = await res.json();
          } else if (tokenUri.startsWith("data:text/json;charset=utf-8,")) {
             meta = JSON.parse(decodeURIComponent(tokenUri.replace("data:text/json;charset=utf-8,", "")));
          }
        } catch (e) {
          console.log("Using generic image for token", i.id);
        }

        return {
          id: Number(i.id),
          price: i.price.toString(),
          location: i.location,
          owner: i.owner,
          seller: i.seller,
          currentlyListed: i.currentlyListed,
          image: meta.image || `https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800`
        };
      }));

      setProperties(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contract && account) {
      loadProperties();
    } else if (!isWeb3Loading) {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, account, isWeb3Loading]);

  if (loading || isWeb3Loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <div className="glass-panel p-12 text-center rounded-3xl max-w-lg">
          <p className="text-xl text-gray-400">Please connect your wallet to view your portfolio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold mb-4">
          My <span className="gradient-text">Portfolio</span>
        </h1>
        <p className="text-gray-400 text-lg">
          Manage your real estate investments.
        </p>
      </div>

      {properties.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-3xl">
          <p className="text-xl text-gray-400">You don't own any properties yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((prop) => (
            <PropertyCard 
              key={prop.id} 
              property={prop} 
              isOwner={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
