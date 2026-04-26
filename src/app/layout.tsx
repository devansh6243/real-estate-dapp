import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/context/Web3Context";
import Navbar from "@/components/Navbar";
import NetworkBanner from "@/components/NetworkBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BlockEstates - Web3 Real Estate",
  description: "Futuristic Blockchain Real Estate Platform Built on Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background text-foreground`}>
        <Web3Provider>
          <Navbar />
          <NetworkBanner />
          <main className="pt-20 min-h-screen">
            {children}
          </main>
        </Web3Provider>
      </body>
    </html>
  );
}
