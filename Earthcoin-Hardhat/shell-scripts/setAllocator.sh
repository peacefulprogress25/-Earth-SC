#!/usr/bin/bash
npx hardhat run scripts/preSaleAllocationSetAllocation.js --network $(grep NETWORK .env | cut -d '=' -f2)