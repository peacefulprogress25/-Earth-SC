const fs = require("fs");


// import { EarthTreasury as EarthTreasuryJson } from "./frontend-admin/src/abi/";
// import { StableCoin as StableCoinJson } from "../../abi";
// import { EarthERC20Token as EarthERC20TokenJson } from "../../abi";
// import { PresaleAllocation as PresaleAllocationJson } from "../../abi";
// import { Presale as PresaleJson } from "../../abi";
// import { LockedFruit as LockedFruitJson } from "../../abi";
// import { EarthStaking as EarthStakingJson } from "../../abi";
// import { ExitQueue as ExitQueueJson } from "../../abi";
// import { Fruit as FruitJson } from "../../abi";
// import { EarthERC20Token as EarthERC20TokenJson } from "./frontend-admin/src/abi";

const earth = require("../frontend-admin/src/abi/EarthERC20Token.json");
const exitq = require("../frontend-admin/src/abi/ExitQueue.json");
const earths = require("../frontend-admin/src/abi/EarthStaking.json");
const fruit = require("../frontend-admin/src/abi/Fruit.json");
const locked = require("../frontend-admin/src/abi/LockedFruit.json");
const stable = require("../frontend-admin/src/abi/StableCoin.json");
const eartht = require("../frontend-admin/src/abi/EarthTreasury.json");
// const mintal= require("../frontend-admin/src/abi/");
const presaleall = require("../frontend-admin/src/abi/PresaleAllocation.json");
const presale = require("../frontend-admin/src/abi/Presale.json");
const mintallow = require("../frontend-admin/src/abi/MintAllowance.json");
const nft = require("../frontend-admin/src/abi/Nft.json");


async function main() {



    fs.writeFileSync(
        "./scripts/deployAddresses.json",
        JSON.stringify({
            EarthERC20Token: earth.address, //future-change
            // ExitQueue: exitq.address,
            EarthStaking: earths.address,
            Fruit: fruit.address,
            // LockedFruit: locked.address,
            StableCoin: stable.address, //future-change
            EarthTreasury: eartht.address,
            MintAllowance: mintallow.address,     //manul
            // PresaleAllocation: presaleall.address,
            Presale: presale.address,
            Nft: nft.address,

        })
    );

}


main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
