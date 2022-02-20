const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Token contract', function () {

	let Token;
	let seaToken;
	let owner;
	let addr1;
	let addr2;
	let addrs;

	beforeEach(async function () {
		Token = await ethers.getContractFactory('Token');
		[owner, addr1, addr2, ...addrs] = await ethers.getSigners();
		seaToken = await Token.deploy(1000000);
	});

	describe('Deployment', function () {
		it('Should set the right owner', async function() {
			expect(await seaToken.owner()).to.equal(owner.address);
		});

		it('Deployment should assign the total supply of tokens to the owner', async function() {
			const ownerBalance = await seaToken.balanceOf(owner.address);
			expect(await seaToken.totalSupply()).to.equal(ownerBalance);
		});
	});

	describe('Transactions', function () {
		it('Should transfer tokens between accounts', async function () {
			await seaToken.transfer(addr1.address, 50);
			expect(await seaToken.balanceOf(addr1.address)).to.equal(50);
			await seaToken.connect(addr1).transfer(addr2.address, 50);
			expect(await seaToken.balanceOf(addr2.address)).to.equal(50);
		});
		it('Should fail if sender doesn\'t have enough tokens', async function () {
			const intitialOwnerBalance = await seaToken.balanceOf(owner.address);
			await expect(seaToken.connect(addr1).transfer(owner.address, 1)).to.be.revertedWith('Not enough tokens');
			expect(await seaToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
		});
		it('Should update balances after transfers', async function () {
			const initialOwnerBalance = await seaToken.balanceOf(owner.address);
			await seaToken.transfer(addr1.address, 100);
			await seaToken.transfer(addr2.address, 50);
			const finalOwnerBalance = await seaToken.balanceOf(owner.address);
			expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));
			expect(await seaToken.balanceOf(addr1.address)).to.equal(100);
			expect(await seaToken.balanceOf(addr2.address)).to.equal(50);
		});
	});
	
});

// intitializes contract with correct values
// allocates initial supply at deployment
// transfers token ownership
// approves tokens for delegated transfer
// handles delegated token transfers