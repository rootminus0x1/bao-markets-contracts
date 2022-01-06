# BAO Markets (a.k.a. HardSynths)

A comprehensive documentation will be posted on our gitbook page soonTM.

For those who want to dive into the protocol early we recommend familiarizing yourself with the compound protocol:

https://compound.finance/docs (Excellent documentation)

and after that Inverse Finance:

https://github.com/InverseFinance/anchor

**As of this moment** the only addition to the Inverse Finance protocol is the IMF calculation.
Which you can skip for now, until the gitbook documentation is published.

# Deployed Ropsten Contracts

Contract  	  					| Address									|Etherscan 																			|Code|
--------------------------------| ------------------------------------------|-----------------------------------------------------------------------------------|----|

Comptroller  					| 0x4998d11139D51e7b7f2788532E877C095d400Df2|https://ropsten.etherscan.io/address/0x4998d11139D51e7b7f2788532E877C095d400Df2	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/Comptroller.sol|
Unitroller  					| 0xbF2d7626a66aad910173fB43Ffd738A0F82C7f33|https://ropsten.etherscan.io/address/0xbF2d7626a66aad910173fB43Ffd738A0F82C7f33	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/Unitroller.sol|
Oracle  						| 0x48E1654a7F4deB1cd3d9817D44cAebB7f1404f06|https://ropsten.etherscan.io/address/0x48E1654a7F4deB1cd3d9817D44cAebB7f1404f06	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/Oracle.sol|
Stabilizer  					| 0x89BA107c0a767A6eB317F6b1a715A45D05014eB6|https://ropsten.etherscan.io/address/0x89BA107c0a767A6eB317F6b1a715A45D05014eB6	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/Stabilizer.sol|
Fed  							| 0x214C295F655c502B1380fa42B2e069011736E823|https://ropsten.etherscan.io/address/0x214C295F655c502B1380fa42B2e069011736E823	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/Fed.sol|
bUSD ERC20						| 0x0F051F3C818b495ef27AC46462188295F83469A5|https://ropsten.etherscan.io/address/0x0F051F3C818b495ef27AC46462188295F83469A5	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/ERC20.sol|
bUSD interestrate model  		| 0x796661995a1e5179553268619405Fd18F9d7DdAB|https://ropsten.etherscan.io/address/0x796661995a1e5179553268619405Fd18F9d7DdAB	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/JumpRateModelV2.sol|
bUSD bdToken					| 0x63793577FC659243Df8fF731089FBe60d2A36A0d|https://ropsten.etherscan.io/address/0x63793577FC659243Df8fF731089FBe60d2A36A0d	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/CErc20.sol|
Eth interest rate model  		| 0xe9EC37eE8ef8879f077845702fB3e93F0DaA9916|https://ropsten.etherscan.io/address/0xe9EC37eE8ef8879f077845702fB3e93F0DaA9916	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/WhitePaperInterestRateModel.sol|
Eth bdToken						| 0x895952c8290bf311B4848dE954F1A747Bf97809f|https://ropsten.etherscan.io/address/0x895952c8290bf311B4848dE954F1A747Bf97809f	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/CEther.sol|
USDC ERC20  					| 0x48C1be647204eb97BC5C6914e5D60E7A7b7b398B|https://ropsten.etherscan.io/address/0x48C1be647204eb97BC5C6914e5D60E7A7b7b398B	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/ERC20.sol|
USDC interest rate model  		| 0xF5592Ee74fe2657552a25626cF6eB3e0d34d6398|https://ropsten.etherscan.io/address/0xF5592Ee74fe2657552a25626cF6eB3e0d34d6398	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/JumpRateModelV2.sol|
USDC bdToken 					| 0xfA3545f9Cca55088B30223bc86BE1AEe0F86eE62|https://ropsten.etherscan.io/address/0xfA3545f9Cca55088B30223bc86BE1AEe0F86eE62	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/CErc20.sol|
DAI ERC20 (Reserve)  			| 0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108|https://ropsten.etherscan.io/address/0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/ERC20.sol|


# Ropsten test tokens can be minted using the following contract:

https://ropsten.etherscan.io/address/0xBe565004a2F0C439EdcF68C0e743576149FD03F1#writeContract

To mint, you'll need to enter the symbol of the token and the amount of tokens.
(Remember that the tokens have different decimals)

Currently minting is restricted to a token value of $500K per person.

## Token Symbol List

USDC <br />


## Token Decimals

| Token Names   | Decimals      |
| ------------- |:-------------:|
| bUSD      	| 18 			|
| USDC      	| 6      		|


Example of minting 30 "USDC" tokens:

`mintToken("USDC", YOUR ROPSTEN ADDRESS, 30000000)` 

