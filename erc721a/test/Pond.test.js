const {expect} = require('chai');
const { ethers } = require("hardhat");

describe('Contract', () => {
	let Cntrct, cntrct, owner, addr1, addr2;
	const name 					= "Pond";
	const symbol 				= "NTD";
	const version 				= "1.0.0";
	const zeroAddr      		= "0x0000000000000000000000000000000000000000000000000000000000000000";
	const MAX_SUPPLY 			= "7777";
	const UpdtMrklRoot  		= "0xc62a029646f4f892956af77127f97afa9bed47f56e2e78fba0d8ff96c2d4fba5";
	const MAX_PUBLIC_MINT 		= "10";
	const PUBLIC_SALE_PRICE 	= "90000000000000"; // 0.00009 ethers == 90000000000000 wei
	const PUBLIC_10_TOKEN_PRICE = "9000000000000000"
	const MAX_WHITELIST_MINT 	= "3";
	const WHITELIST_SALE_PRICE 	= "20000000000000"; // 0.00002 ethers == 20000000000000 wei
	const jack_address			= "0xc3A1Dc669D820baB5eA53C77f190F563762981ee";
	const merkleProof 			= [
									'0x999bf57501565dbd2fdcea36efa2b9aef8340a8901e3459f4a4c926275d36cdb',
									'0x04a10bfd00977f54cc3450c9b25c9b3a502a089eba0097ba35fc33c4ea5fcb54'
								];


	beforeEach(async () => {
		Cntrct = await ethers.getContractFactory('Pond');
		cntrct = await upgrades.deployProxy(Cntrct, [], {initializer: 'initialize'});
		[owner, addr1, addr2, _] = await ethers.getSigners();
	});

	describe('Deployment and verifying variables', () => {
	
		it('Should set the right owner', async () => {
			expect(await cntrct.owner()).to.equal(owner.address);
		});

		it('Should verify the name of contract', async () => {
			expect((await cntrct.name()).toString()).to.equal(name);
		});

		it('Should verify the symbol of contract', async () => {
			expect((await cntrct.symbol()).toString()).to.equal(symbol); 
		});

		it('Should verify the PUBLIC_SALE_PRICE of contract', async () => {
			expect((await cntrct.PUBLIC_SALE_PRICE()).toString()).to.equal(PUBLIC_SALE_PRICE); 
		});

		it('Should verify the MAX_PUBLIC_MINT of contract', async () => {
			expect((await cntrct.MAX_PUBLIC_MINT()).toString()).to.equal(MAX_PUBLIC_MINT); 
		});

		it('Should verify the WHITELIST_SALE_PRICE of contract', async () => {
			expect((await cntrct.WHITELIST_SALE_PRICE()).toString()).to.equal(WHITELIST_SALE_PRICE); 
		});

		it('Should verify the MAX_WHITELIST_MINT of contract', async () => {
			expect((await cntrct.MAX_WHITELIST_MINT()).toString()).to.equal(MAX_WHITELIST_MINT); 
		});

        it('Should verify the MAX_SUPPLY of contract', async () => {
	        expect((await cntrct.MAX_SUPPLY()).toString()).to.equal(MAX_SUPPLY);
	    });

        it('Should verify the version of contract', async () => {
			expect(await cntrct.version()).to.equal(version); 
		});

		it('Should verify the whiteListSale of contract to be false', async () => {
			expect(await cntrct.whiteListSale()).to.equal(false); 
		});

		it('Should verify the isRevealed of contract to be false', async () => {
			expect(await cntrct.isRevealed()).to.equal(false); 
		});

		it('Should verify the publicSale of contract to be false', async () => {
			expect(await cntrct.publicSale()).to.equal(false); 
		});

		it('Should verify the merkleRoot of contract to be 0x00...', async () => {
			expect(await cntrct.getMerkleRoot()).to.equal(zeroAddr);
		});


		it('Should verify the totalSupply of contract to be 0', async () => {
			expect(await cntrct.totalSupply()).to.equal('0');
		});



	});

	describe('Setting variable Tx', () =>{
		it("Should set the whiteListSale to True", async function () {
			await cntrct.deployed();
			expect(await cntrct.whiteListSale()).to.equal(false);
			const toggleWhiteListSaleTx = await cntrct.toggleWhiteListSale();
			await toggleWhiteListSaleTx.wait();
			expect(await cntrct.whiteListSale()).to.equal(true);
		});

     
	 	it("Should set the isRevealed to True", async function () {
	        await cntrct.deployed();
	        expect(await cntrct.isRevealed()).to.equal(false);
	        const toggleRevealTx = await cntrct.toggleReveal();
	        await toggleRevealTx.wait();
	        expect(await cntrct.isRevealed()).to.equal(true);
      	});

		it("Should set the publicSale to True", async function () {
	        await cntrct.deployed();
	        expect(await cntrct.publicSale()).to.equal(false);
	        const togglePublicSaleTx = await cntrct.togglePublicSale();
	        await togglePublicSaleTx.wait();
	        expect(await cntrct.publicSale()).to.equal(true);
      	});

		it('should set  and verify MerkleRoot to whitelist the users addresses', async () => {
			await cntrct.deployed();
	        expect(await cntrct.getMerkleRoot()).to.equal(zeroAddr);
	        const setMerkleRootTx = await cntrct.setMerkleRoot(UpdtMrklRoot);
	        await setMerkleRootTx.wait();
	        expect(await cntrct.getMerkleRoot()).to.equal(UpdtMrklRoot);
		});

	});	


	describe('Whitelist and public mint Transactions', () =>{
		it('should whitelistMint a token and verify the possession of the minted token', async () => {
			await cntrct.deployed();

			// Toggle the WhiteList Sale
			const toggleWhiteListSaleTx = await cntrct.toggleWhiteListSale();
			await toggleWhiteListSaleTx.wait();

			// set merkle root
	        const setMerkleRootTx = await cntrct.setMerkleRoot(UpdtMrklRoot);
			await setMerkleRootTx.wait();

			// // mint the token 
	        expect((await cntrct.balanceOf(owner.address)).toString()).to.equal('0');
	        const mintTx = await cntrct.whitelistMint(merkleProof,1,{  value: WHITELIST_SALE_PRICE });
			const receipt = await mintTx.wait();
            console.log("        Whitelist Mint Tx Gas Used:", (receipt.gasUsed).toString(), "gwei");

	        expect((await cntrct.balanceOf(owner.address)).toString()).to.equal('1');

			// verify the owner balance
			const ownerBalance = await cntrct.balanceOf(owner.address);

			// verify the totalSupply
			expect(await cntrct.totalSupply()).to.equal(ownerBalance);

			// verify ownerOf the token using tokenId
			expect((await cntrct.ownerOf(0)).toString()).to.equal(owner.address);
	        
		});

		it('should mint a token and verify the possession of the minted token', async () => {
			await cntrct.deployed();

			// Toggle the public sale
			const togglePublicSaleTx = await cntrct.togglePublicSale();
	        await togglePublicSaleTx.wait();

			// mint the token 
	        expect((await cntrct.balanceOf(owner.address)).toString()).to.equal('0');
	        const mintTx = await cntrct.mint(1,{  value: PUBLIC_10_TOKEN_PRICE });
			const receipt = await mintTx.wait();
            console.log("        Public Mint Tx Gas Used:", (receipt.gasUsed).toString(), "gwei");

	        expect((await cntrct.balanceOf(owner.address)).toString()).to.equal('1');

			// verify the owner balance
			const ownerBalance = await cntrct.balanceOf(owner.address);

			// verify the totalSupply
			expect(await cntrct.totalSupply()).to.equal(ownerBalance);

			// verify ownerOf the token using tokenId
			expect((await cntrct.ownerOf(0)).toString()).to.equal(owner.address);
	        
		});
	});

	
	
	
});