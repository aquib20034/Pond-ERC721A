// contracts/POND.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "erc721a-upgradeable/contracts/ERC721AUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";

contract Pond is Initializable, ERC721AUpgradeable, OwnableUpgradeable{

    uint256 public constant MAX_SUPPLY = 7777;
    uint256 public constant MAX_PUBLIC_MINT = 10;
    uint256 public constant MAX_WHITELIST_MINT = 3;
    uint256 public constant PUBLIC_SALE_PRICE = 0.00009 ether;
    uint256 public constant WHITELIST_SALE_PRICE = .00002 ether;

    bool public isRevealed;
    bool public publicSale;
    bool public whiteListSale;
    bytes32 private merkleRoot;
    string private baseTokenUri;

    mapping(address => uint256) private mintAddress;
    
    // events
    event _etherWidthdraw(uint256 _amount); 
    event _publicMinted(address owner, uint256 amount);
    event _whitelistMinted(address owner, uint256 amount);

    modifier callerIsUser() {
        require(tx.origin == msg.sender, "POND :: Cannot be called by a contract");
        _;
    }
    
    
    function initialize() initializerERC721A initializer public {
        __ERC721A_init("Pond","NTD");
        __Ownable_init();
    } 

    function mint(uint256 _quantity) external payable callerIsUser{
        require(publicSale, "POND :: Not Yet Active.");
        require((totalSupply() + _quantity) <= MAX_SUPPLY, "POND :: Beyond Max Supply");
        require(_quantity <= MAX_PUBLIC_MINT, "POND :: Max 10 NFT per transaction");
        require(msg.value >= (PUBLIC_SALE_PRICE * _quantity), "POND :: Payment is below the price ");
        // emit event
        emit _publicMinted(msg.sender, _quantity);
        mintAddress[msg.sender] += _quantity;
        _safeMint(msg.sender, _quantity);
    }

    function whitelistMint(bytes32[] memory _merkleProof, uint256 _quantity) external payable callerIsUser{
        require(whiteListSale, "POND :: Minting is on Pause");
        require((totalSupply() + _quantity) <= MAX_SUPPLY, "POND :: Cannot mint beyond max supply");
        require(_quantity <= MAX_WHITELIST_MINT, "POND :: Max 3 NFT per transaction");
        require(msg.value >= (WHITELIST_SALE_PRICE * _quantity), "POND :: Payment is below the price");
        bytes32 sender = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProofUpgradeable.verify(_merkleProof, merkleRoot, sender), "POND :: You are not whitelisted");
        // emit event
        emit _whitelistMinted(msg.sender, _quantity);
        mintAddress[msg.sender] += _quantity;
        _safeMint(msg.sender, _quantity);
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenUri;
    }

    function setTokenUri(string memory _baseTokenUri) external onlyOwner{
        baseTokenUri = _baseTokenUri;
    }
   
    function setMerkleRoot(bytes32 _merkleRoot) external onlyOwner{
        merkleRoot = _merkleRoot;
    }

    function getMerkleRoot() external view returns (bytes32){
        return merkleRoot;
    }

    function toggleWhiteListSale() external onlyOwner{
        whiteListSale = !whiteListSale;
    }

    function toggleReveal() external onlyOwner{
        isRevealed = !isRevealed;
    }

    function togglePublicSale() external onlyOwner{
        publicSale = !publicSale;
    }

    function tokenIdsOfOwner(address owner) external view  returns (uint256[] memory) {
        unchecked {
            uint256 tokenIdsIdx;
            address currOwnershipAddr;
            uint256 tokenIdsLength = balanceOf(owner);
            uint256[] memory tokenIds = new uint256[](tokenIdsLength);
            TokenOwnership memory ownership;
            for (uint256 i = _startTokenId(); tokenIdsIdx != tokenIdsLength; ++i) {
                ownership = _ownershipAt(i);
                if (ownership.burned) {
                    continue;
                }
                if (ownership.addr != address(0)) {
                    currOwnershipAddr = ownership.addr;
                }
                if (currOwnershipAddr == owner) {
                    tokenIds[tokenIdsIdx++] = i;
                }
            }
            return tokenIds;
        }
    }


    // it includes public mint + whitelist mint token
    function tokensMintedtBy(address owner) external view returns (uint256) {
        return _numberMinted(owner);
    }

    function withdraw() external onlyOwner{
        emit _etherWidthdraw(address(this).balance);
        payable(msg.sender).transfer(address(this).balance);
    }


    function version() external pure returns (string memory) {
        return "1.0.0";
    }   
    
    // important to receive ETH
    // receive() payable external {}
}