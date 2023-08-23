#!/usr/bin/bash
npx hardhat run scripts/deployAll.js --network $(grep NETWORK .env | cut -d '=' -f2)
