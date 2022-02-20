async function main() {
	const [deployer] = await ethers.getSigners();
	console.log('Deploying contracts with the account:', deployer.address);
	console.log('Account balance:', (await deployer.getBalance()).toString());

	const Token = await ethers.getContractFactory('Token');
	const seaToken = await Token.deploy(1000000);
	console.log('seaToken address:', seaToken.address);

	const ICO = await ethers.getContractFactory('ICO');
	const ico = await ICO.deploy(seaToken.address, ethers.utils.parseEther('0.01'));
	console.log('ICO address:', ico.address);

	const fs = require("fs");
  	const contractsDir = __dirname + "/../frontend/src/contracts";

  	if (!fs.existsSync(contractsDir)) {
  	  fs.mkdirSync(contractsDir);
  	}

  	fs.writeFileSync(
    	contractsDir + `/seatoken-address.json`,
    	JSON.stringify({ Token: seaToken.address }, undefined, 2)
  	);

  	const TokenArtifact = artifacts.readArtifactSync("Token");

  	fs.writeFileSync(
    	contractsDir + "/Seatoken.json",
    	JSON.stringify(TokenArtifact, null, 2)
  	);

  	fs.writeFileSync(
    	contractsDir + `/ico-address.json`,
    	JSON.stringify({ ICO: ico.address }, undefined, 2)
  	);

  	const ICOArtifact = artifacts.readArtifactSync("ICO");

  	fs.writeFileSync(
    	contractsDir + "/ICO.json",
    	JSON.stringify(ICOArtifact, null, 2)
  	);
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
	console.error(error);
	process.exit(1);
});