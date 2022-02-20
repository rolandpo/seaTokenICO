const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('ICO contract', function() {

	let Token;
	let ICO;
	let owner;
	let addr1;
	let addr2;
	let seaToken;
	let ico;
	let tokensAvailable = 500000;

	beforeEach(async function() {
		Token = await ethers.getContractFactory('Token');
		ICO = await ethers.getContractFactory('ICO');
		[owner, addr1, addr2] = await ethers.getSigners();
		seaToken = await Token.deploy(1000000);
		ico = await ICO.deploy(seaToken.address, ethers.utils.parseEther('0.01'));
		await seaToken.transfer(ico.address, 500000, {from: owner.address});
		provider = ethers.provider;
	});

	describe('Deployment', async function() {
		it('Should make owner admin', async function() {
			expect(owner.address).to.equal(await ico.admin());
		});
		it('Should make 500000 tokens available', async function() {
			expect(await seaToken.balanceOf(ico.address)).to.equal(500000);
			expect(await seaToken.balanceOf(owner.address)).to.equal(500000);
		});
	});

	describe('Sale', async function() {
		it('Should transfer correct number of tokens to buyer', async function() {
			await ico.connect(addr1).buyTokens(200, {from: addr1.address, value: ethers.utils.parseEther('2.0')});
			expect(await seaToken.balanceOf(addr1.address)).to.equal(200);
		});
		it('Should increase number of tokens sold', async function() {
			await ico.connect(addr1).buyTokens(200, {from: addr1.address, value: ethers.utils.parseEther('2.0')});
			expect(await ico.tokensSold()).to.equal(200);
		});
	});

	describe('End of sale', async function() {
		it('Should transfer all tokens to admin', async function() {
			expect(await seaToken.balanceOf(ico.address)).to.equal(500000);
			expect(await seaToken.balanceOf(ico.admin())).to.equal(500000);
			await ico.connect(addr1).buyTokens(200, {from: addr1.address, value: ethers.utils.parseEther('2.0')});
			expect(await seaToken.balanceOf(ico.address)).to.equal(499800);
			await ico.endSale();
			expect(await seaToken.balanceOf(ico.address)).to.equal(0);
			expect(await seaToken.balanceOf(owner.address)).to.equal(999800);
		});
		it('Should transfer all ether to admin', async function() {
			let ownerBalance = await provider.getBalance(owner.address);
			console.log('Initial owner balance: ' + ownerBalance);

			await owner.sendTransaction({to: addr1.address, value: ethers.utils.parseEther('2.0')});
			let addr1Balance = await provider.getBalance(addr1.address);
			console.log('Initial addr1 balance: ' + addr1Balance);

			await ico.connect(addr1).buyTokens(200, {from: addr1.address, value: ethers.utils.parseEther('2.0')});

			console.log('ICO contract new balance: ' + await provider.getBalance(ico.address));
			console.log('Addr1 new balance: ' + await provider.getBalance(addr1.address));

			await ico.endSale();
			expect(await provider.getBalance(owner.address)).to.equal('10001986774195099785936');
		})
	})
});