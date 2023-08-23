
const hre = require("hardhat");
const fs = require("fs");

async function main() {
    const Nft = await hre.ethers.getContractFactory("Nft");
    const nft = await Nft.deploy();
    await nft.deployed();
    nftdata = {
        address: nft.address,
        abi: JSON.parse(nft.interface.format("json")),
    };
    fs.writeFileSync(
        "frontend-admin/src/abi/Nft.json",
        JSON.stringify(nftdata)
    );
    fs.writeFileSync(
        "frontend-client/src/abi/Nft.json",
        JSON.stringify(nftdata)
    );
    console.log(nft.address);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
