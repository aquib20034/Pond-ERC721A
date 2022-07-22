const {MerkleTree} 	=  require("merkletreejs");
const keccak256 	= require("keccak256");
let myAccount 		= null;
let _merkleProof  	= null;


// hardhat
let whiteListAdresses = [
	"0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",  //  use this address as myAccount
	"0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2",
	"0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db"
]

const leafNodes 		= whiteListAdresses.map(addr => keccak256(addr));
const merkleTree 		= new MerkleTree(leafNodes, keccak256,{sortPairs: true});

// BEGIN: Generating merkle tree root address to store it on blockchain
	console.log("Whitelist MerkleTree\n" ,merkleTree.toString() ); // this shows complete tree of your addresses
	const rootHash = merkleTree.getRoot();
// END: Generating merkle tree root address to store it on blockchain


// BEGIN :: Verifying that myAccount address is from our tree
	myAccount 			= "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
	myAccount 		    = keccak256(myAccount);
	_merkleProof 		= merkleTree.getHexProof(myAccount);
	console.log("myAccount _merkleProof", _merkleProof);
	console.log(merkleTree.verify(_merkleProof,myAccount, rootHash));
// BEGIN :: Verifying that myAccount address is from our tree






