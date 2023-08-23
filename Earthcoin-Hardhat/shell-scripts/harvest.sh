#!/usr/bin/bash
npx hardhat run scripts/earthTreasuryHarvest.js --network $(grep NETWORK .env | cut -d '=' -f2)