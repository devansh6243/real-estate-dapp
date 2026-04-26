const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

// Sample properties to seed on deployment
const SAMPLE_PROPERTIES = [
  {
    location: "123 Ocean Drive, Miami Beach, FL",
    price: "2.5",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
    description: "A stunning beachfront villa with panoramic ocean views.",
  },
  {
    location: "47 Skyline Blvd, Manhattan, New York",
    price: "5.0",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
    description: "Luxury penthouse apartment in the heart of Manhattan.",
  },
  {
    location: "8 Vineyard Lane, Napa Valley, CA",
    price: "3.2",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&q=80&w=800",
    description: "Elegant countryside estate surrounded by sprawling vineyards.",
  },
  {
    location: "22 Coral Reef Road, Maldives",
    price: "8.0",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800",
    description: "Exclusive overwater bungalow resort property in the Maldives.",
  },
];

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const Marketplace = await hre.ethers.getContractFactory("RealEstateMarketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();

  const address = await marketplace.getAddress();
  console.log("Marketplace deployed to:", address);

  // Save ABI + address
  saveFrontendFiles(address);

  // Seed sample properties
  console.log("\nSeeding sample properties...");
  for (const prop of SAMPLE_PROPERTIES) {
    const metadata = {
      name: prop.location,
      description: prop.description,
      image: prop.image,
      location: prop.location,
      price: prop.price,
    };

    const tokenURI =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(metadata));

    const priceInWei = hre.ethers.parseUnits(prop.price, "ether");

    const tx = await marketplace.mintAndListProperty(tokenURI, priceInWei, prop.location);
    await tx.wait();
    console.log(`  ✅ Listed: ${prop.location} @ ${prop.price} ETH`);
  }

  console.log("\n🎉 All done! Start the frontend with: npm run dev");
}

function saveFrontendFiles(contractAddress) {
  const contractsDir = path.join(__dirname, "..", "src", "lib", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ RealEstateMarketplace: contractAddress }, undefined, 2)
  );

  const MarketplaceArtifact = hre.artifacts.readArtifactSync("RealEstateMarketplace");
  fs.writeFileSync(
    path.join(contractsDir, "RealEstateMarketplace.json"),
    JSON.stringify(MarketplaceArtifact, null, 2)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
