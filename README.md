# -Earth-SC
Smart contracts governing $Earth
Changes we have made:

- Removed Exit queue contract. Temple contracts have tokens going to a exit queue once you unstaked them
- Removed Lock,Unlock functions - They had these functions to your staked token
- Mint and Stake seperated - Temple contracts had one function to conduct both these operations in one transaction for the user, we have seperated them
- NFT Gating - We have incorporated NFT token gating for $Earth mint
- Mint Multiple - Temple contracts allowed us to input mint multiple only in whole numbers, we have made provision for us to input in decimals also
  
