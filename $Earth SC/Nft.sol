// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol"; 
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// @audit-report: consider removing ERC721URIStorage and relying on the tokenURI function 
// (https://github.com/OpenZeppelin/openzeppelin-contracts/blob/9e3f4d60c581010c4a3979480e07cc7752f124cc/contracts/token/ERC721/ERC721.sol#L92)
// Result: _baseURI() could return uri, updateUri could be improved by just setting uri and not looping through all tokens
// @audit-report: use prettier or smlr.
contract SoulBound is  ERC721URIStorage{
    string public uri;
    address public owner; // IDEA: consider using Ownable contract
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    mapping(address => bool) public whitelistedAddresses;//whitlisted Address to mint token
    // @audit-report: can be removed as it's only used to check if a user has minted a token. Which can be done by balanceOf(user) > 0
    mapping(address => bool) public tokenMintedAddress;//address which have already minted token 
    event Attest(address indexed to, uint256 indexed tokenId);
    event Revoke(address indexed to, uint256 indexed tokenId);
    IERC20 token; // @audit-report: can be removed

    // @audit-report: consider renaming this to EarthSoulBoundToken
    constructor(address tokenAddress,string memory _uri) ERC721("SoulBound Token", "SBT") {
     // @audit-report: add zero check
     owner=msg.sender;
     token = IERC20(tokenAddress);
     uri=_uri;
    }

    function updateUri(string memory newUri)public onlyOwner{
        uri=newUri;
        uint256 tokenId = _tokenIdCounter.current();
        for(uint i=0;i<tokenId;i++){
             _setTokenURI(i, newUri);
        }
    }
    function addToWhiteList(address _add)public onlyOwner{
        // GAS_OPTIMIZATION: use custom error instead of require
        require(!whitelistedAddresses[_add], "Sender has already been whitelisted");
         whitelistedAddresses[_add] = true;

         // @audit-report: emit event
    }

    // IDEA: consider using Ownable
    modifier onlyOwner(){
        require(msg.sender==owner,"Not the sa");
        _;
    }

    // @audit-report: avoid using 'whitelisted' and instead use 'approved'
    modifier onlyWhitelistedUser(){
        // @audit-report: GAS_OPTIMIZATION: use custom error instead of require
        require(whitelistedAddresses[msg.sender],"Could not mint the token");
        _;
    }

    // @audit-report: remove unused modifier
    // modifier hasERC20Token(){
    //     uint balance=token.balanceOf(msg.sender);
    //     require(balance>0,"Not Enough STK tokens");
    //     _;
    // }
    function safeMint() public onlyWhitelistedUser  {
         whitelistedAddresses[msg.sender]=false;
         tokenMintedAddress[msg.sender]=true;
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
       
    }

    function burn(uint256 tokenId) external {
        //  @audit-report: GAS_OPTIMIZATION: use custom error instead of require
        require(ownerOf(tokenId) == msg.sender, "Only owner of the token can burn it");
        _burn(tokenId);
    }

    function revoke(uint256 tokenId) external onlyOwner {
        _burn(tokenId);
    }

     function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721)
    {
        // @audit-report: GAS_OPTIMIZATION: use custom error instead of require
        require(from == address(0), "Token not transferable");
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override( ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override( ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    // @audit-report: Function should be external as it's not used internally
    // Can also be removed, since one could just check balanceOf(user) > 0
    function hasToken()public view returns (bool){
        return tokenMintedAddress[msg.sender];
    }

    // @audit-report: If this function is used, it should be external and emit an event. But using Ownable insteads is recommended
    function changeOwner(address _owner)public onlyOwner{
        owner=_owner;
    }
}
