// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract RealEstateMarketplace is ERC721URIStorage, IERC721Receiver {
    uint256 private _tokenIds;

    struct Property {
        uint256 id;
        uint256 price;
        string location;
        address payable owner;
        address payable seller;
        bool currentlyListed;
    }

    mapping(uint256 => Property) private idToProperty;

    event PropertyListedSuccess(
        uint256 indexed id,
        uint256 price,
        string location,
        address owner,
        address seller,
        bool currentlyListed
    );

    event PropertySoldSuccess(
        uint256 indexed id,
        address oldOwner,
        address newOwner,
        uint256 price
    );

    constructor() ERC721("RealEstateNFT", "RENFT") {}

    /// @dev Required to accept ERC-721 safe transfers (minting to this contract).
    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }



    /**
     * @dev Mints a new property NFT and immediately lists it for sale.
     * The contract holds custody of the token while it is listed.
     */
    function mintAndListProperty(
        string memory tokenURI,
        uint256 price,
        string memory location
    ) public returns (uint256) {
        require(price > 0, "Price must be at least 1 wei");

        _tokenIds++;
        uint256 newTokenId = _tokenIds;

        // Mint to the contract itself so it can manage the sale
        _safeMint(address(this), newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        idToProperty[newTokenId] = Property({
            id: newTokenId,
            price: price,
            location: location,
            owner: payable(address(this)),
            seller: payable(msg.sender),
            currentlyListed: true
        });

        emit PropertyListedSuccess(
            newTokenId,
            price,
            location,
            address(this),
            msg.sender,
            true
        );

        return newTokenId;
    }

    /**
     * @dev Allows the seller to delist their property (take it off market).
     */
    function delistProperty(uint256 tokenId) public {
        require(idToProperty[tokenId].seller == msg.sender, "Only seller can delist");
        require(idToProperty[tokenId].currentlyListed, "Property not listed");

        idToProperty[tokenId].currentlyListed = false;
        idToProperty[tokenId].owner = payable(msg.sender);
        idToProperty[tokenId].seller = payable(address(0));

        _transfer(address(this), msg.sender, tokenId);
    }

    /**
     * @dev Buys a listed property. Buyer sends exact ETH equal to price.
     */
    function buyProperty(uint256 tokenId) public payable {
        require(idToProperty[tokenId].currentlyListed, "Property not listed for sale");
        uint256 price = idToProperty[tokenId].price;
        require(msg.value == price, "Please send the exact asking price");

        address payable seller = idToProperty[tokenId].seller;

        // Update state before transfer (checks-effects-interactions)
        idToProperty[tokenId].currentlyListed = false;
        idToProperty[tokenId].seller = payable(address(0));
        idToProperty[tokenId].owner = payable(msg.sender);

        // Transfer NFT to buyer
        _transfer(address(this), msg.sender, tokenId);

        // Pay the seller
        (bool success, ) = seller.call{value: msg.value}("");
        require(success, "ETH transfer to seller failed");

        emit PropertySoldSuccess(tokenId, seller, msg.sender, price);
    }

    function getPropertyDetails(uint256 tokenId) public view returns (Property memory) {
        return idToProperty[tokenId];
    }

    function getAllListedProperties() public view returns (Property[] memory) {
        uint256 totalItemCount = _tokenIds;
        uint256 listedItemCount = 0;

        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToProperty[i].currentlyListed) {
                listedItemCount++;
            }
        }

        Property[] memory items = new Property[](listedItemCount);
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToProperty[i].currentlyListed) {
                items[currentIndex] = idToProperty[i];
                currentIndex++;
            }
        }
        return items;
    }

    function getMyProperties() public view returns (Property[] memory) {
        uint256 totalItemCount = _tokenIds;
        uint256 itemCount = 0;

        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToProperty[i].owner == msg.sender || idToProperty[i].seller == msg.sender) {
                itemCount++;
            }
        }

        Property[] memory items = new Property[](itemCount);
        uint256 currentIndex = 0;
        for (uint256 i = 1; i <= totalItemCount; i++) {
            if (idToProperty[i].owner == msg.sender || idToProperty[i].seller == msg.sender) {
                items[currentIndex] = idToProperty[i];
                currentIndex++;
            }
        }
        return items;
    }
}
