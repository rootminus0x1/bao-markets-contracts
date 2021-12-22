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
Comptroller  					| 0x099452149D33E86374bEa74dB96d0a7B038BcA4D|https://ropsten.etherscan.io/address/0x099452149D33E86374bEa74dB96d0a7B038BcA4D	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/Comptroller.sol|
Unitroller  					| 0x8B932257a6b5D20EaD78FB4d5Fd00a19daF937b3|https://ropsten.etherscan.io/address/0x8B932257a6b5D20EaD78FB4d5Fd00a19daF937b3	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/Unitroller.sol|
Oracle  						| 0xf9941b9E8D010d961f7d3D6Aea57a108Bcfe1026|https://ropsten.etherscan.io/address/0xf9941b9E8D010d961f7d3D6Aea57a108Bcfe1026	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/Oracle.sol|
Stabilizer  					| 0xf867C6C7C0eFAD233fA3bdD7eaC62C61F3FD00Cd|https://ropsten.etherscan.io/address/0xf867C6C7C0eFAD233fA3bdD7eaC62C61F3FD00Cd	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/Stabilizer.sol|
Fed  							| 0xcD4544dCa0fb0ad50F89F7cae23D8F4Da53784C5|https://ropsten.etherscan.io/address/0xcD4544dCa0fb0ad50F89F7cae23D8F4Da53784C5	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/Fed.sol|
bUSD ERC20						| 0xDF559301C178221E8D76E4A91126C504Dfe5947a|https://ropsten.etherscan.io/address/0xDF559301C178221E8D76E4A91126C504Dfe5947a	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/ERC20.sol|
bUSD interestrate model  		| 0xA50431c1C5aff4faD72ADcA6f473a729027332F9|https://ropsten.etherscan.io/address/0xA50431c1C5aff4faD72ADcA6f473a729027332F9	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/JumpRateModelV2.sol|
bUSD bdToken					| 0x8584B05012749bdd32E41f8c7eB973D2283d1e56|https://ropsten.etherscan.io/address/0x8584B05012749bdd32E41f8c7eB973D2283d1e56	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/CErc20.sol|
Eth interest rate model  		| 0x9DAC84a0529B35Bc124f1c323ed9eC2Bb9B75066|https://ropsten.etherscan.io/address/0x9DAC84a0529B35Bc124f1c323ed9eC2Bb9B75066	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/WhitePaperInterestRateModel.sol|
Eth bdToken						| 0x1d2728a36dC794e92374e629cC0e7F25C7f60162|https://ropsten.etherscan.io/address/0x1d2728a36dC794e92374e629cC0e7F25C7f60162	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/CEther.sol|
USDC ERC20  					| 0x14bFFDf158D0DbDA11E4e4105e6e2FE1D24F4D2e|https://ropsten.etherscan.io/address/0x14bFFDf158D0DbDA11E4e4105e6e2FE1D24F4D2e	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/ERC20.sol|
USDC interest rate model  		| 0x216c31D2427c3Ca59B70e85A2179717F3134003C|https://ropsten.etherscan.io/address/0x216c31D2427c3Ca59B70e85A2179717F3134003C	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/JumpRateModelV2.sol|
USDC bdToken 					| 0xb4e94d554736C76a9EB44FA1ca561c20AcfdeB26|https://ropsten.etherscan.io/address/0xb4e94d554736C76a9EB44FA1ca561c20AcfdeB26	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/CErc20.sol|
KoreanWon bdToken  				| 0x7c59B99C07fd6c41cb25c9364FcE4d46a58b4Ce3|https://ropsten.etherscan.io/address/0x7c59B99C07fd6c41cb25c9364FcE4d46a58b4Ce3	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/CErc20.sol|
KoreanWon InterestRateModel  	| 0x6dB55A7F24577a3CF4e7b1d1aA99379B0A1b444C|https://ropsten.etherscan.io/address/0x6dB55A7F24577a3CF4e7b1d1aA99379B0A1b444C	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/JumpRateModelV2.sol|
KoreanWon ERC20  				| 0x96b2fab13ea34EE6bAf8aBD8840eb45e4176251b|https://ropsten.etherscan.io/address/0x96b2fab13ea34EE6bAf8aBD8840eb45e4176251b	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/ERC20.sol|
TwoDecimal bdToken  			| 0x53dBc6dF6227838b6609c77037c438D0a33fc446|https://ropsten.etherscan.io/address/0x53dBc6dF6227838b6609c77037c438D0a33fc446	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/CErc20.sol|
TwoDecimal InterestRateModel  	| 0xe9E8878F90943E953dCd744Ec730F278De9D5F3B|https://ropsten.etherscan.io/address/0xe9E8878F90943E953dCd744Ec730F278De9D5F3B	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/JumpRateModelV2.sol|
TwoDecimal ERC20  				| 0x6d6C89CE746284F1d66C4a229cb449b32f494BF5|https://ropsten.etherscan.io/address/0x6d6C89CE746284F1d66C4a229cb449b32f494BF5	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/ERC20.sol|
EightDeciaml bdToken  			| 0x51da2c4A7378c28282Ef3022890A935c56c97E7E|https://ropsten.etherscan.io/address/0x51da2c4A7378c28282Ef3022890A935c56c97E7E	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/CErc20.sol|
EightDeciaml InterestRateModel  | 0xD1ceE226016e7060f54eEF5754f3DC80bD79dA27|https://ropsten.etherscan.io/address/0xD1ceE226016e7060f54eEF5754f3DC80bD79dA27	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/JumpRateModelV2.sol|
EightDeciaml ERC20  			| 0x92Af1BCA5B2A1Ecbd835646D22cbc9b01Fb17600|https://ropsten.etherscan.io/address/0x92Af1BCA5B2A1Ecbd835646D22cbc9b01Fb17600	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/ERC20.sol|
TwelveDecimal bdToken  			| 0x30d5237C74520a99F957B3ad7435350C8D71d791|https://ropsten.etherscan.io/address/0x30d5237C74520a99F957B3ad7435350C8D71d791	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/CErc20.sol|
TwelveDecimal InterestRateModel | 0x1d5848842DeE52EFCA44E3b8Bcc4DEea1111596d|https://ropsten.etherscan.io/address/0x1d5848842DeE52EFCA44E3b8Bcc4DEea1111596d	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/JumpRateModelV2.sol|
TwelveDecimal ERC20  			| 0x44658B8C5996D341064F569cdc3f0BD172600a77|https://ropsten.etherscan.io/address/0x44658B8C5996D341064F569cdc3f0BD172600a77	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/ERC20.sol|
DAI ERC20 (Reserve)  			| 0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108|https://ropsten.etherscan.io/address/0xf80A32A835F79D7787E8a8ee5721D0fEaFd78108	|https://github.com/baofinance/bao-markets-contracts/blob/master/contracts/ERC20.sol|
SushiPool (USDC/bUSD)			| 0x22b4dca09bcede9fb45fd9fc53c17daeed54c306| 										||	

# Ropsten test tokens can be minted using the following contract:

https://ropsten.etherscan.io/address/0xBe565004a2F0C439EdcF68C0e743576149FD03F1#writeContract

To mint, you'll need to enter the symbol of the token and the amount of tokens.
(Remember that the tokens have different decimals)

Currently minting is restricted to a token value of $500K per person.

## Token Symbol List

USDC <br />
Kor <br />
Two <br />
Eig <br />
Twe <br />


## Token Decimals

| Token Names   | Decimals      |
| ------------- |:-------------:|
| bUSD      	| 18 			|
| USDC      	| 6      		|
| Kor 			| 18      		|
| Two      		| 2 			|
| Eig      		| 8      		|
| Twe 			| 12    	  	|


Example of minting 30 "Two" tokens:

`mintToken("Two", YOUR ROPSTEN ADDRESS, 3000)` 

