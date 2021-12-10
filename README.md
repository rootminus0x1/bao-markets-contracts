# Deployed Ropsten Contracts 

Contract  	  					| Address
--------------------------------| ------------------------------------------
Comptroller  					| 0x099452149D33E86374bEa74dB96d0a7B038BcA4D
Unitroller  					| 0x8B932257a6b5D20EaD78FB4d5Fd00a19daF937b3
Oracle  						| 0xf9941b9E8D010d961f7d3D6Aea57a108Bcfe1026
Stabilizer  					| 0xD15C57FE113C6276FAD2F82658BB420351147f5E
Fed  							| 0xcD4544dCa0fb0ad50F89F7cae23D8F4Da53784C5
bUSD  							| 0xDF559301C178221E8D76E4A91126C504Dfe5947a
bUSD interestrate model  		| 0xA50431c1C5aff4faD72ADcA6f473a729027332F9
bUSD dbToken					| 0x8584B05012749bdd32E41f8c7eB973D2283d1e56
Eth interest rate model  		| 0x9DAC84a0529B35Bc124f1c323ed9eC2Bb9B75066
Eth dbToken						| 0x1d2728a36dC794e92374e629cC0e7F25C7f60162
USDC ERC20  					| 0x14bFFDf158D0DbDA11E4e4105e6e2FE1D24F4D2e
USDC interest rate model  		| 0x216c31D2427c3Ca59B70e85A2179717F3134003C
USDC dbToken 					| 0xb4e94d554736C76a9EB44FA1ca561c20AcfdeB26
KoreanWon bdToken  				| 0x7c59B99C07fd6c41cb25c9364FcE4d46a58b4Ce3
KoreanWon InterestRateModel  	| 0x6dB55A7F24577a3CF4e7b1d1aA99379B0A1b444C
KoreanWon ERC20  				| 0x96b2fab13ea34EE6bAf8aBD8840eb45e4176251b
TwoDecimal bdToken  			| 0x53dBc6dF6227838b6609c77037c438D0a33fc446
TwoDecimal InterestRateModel  	| 0xe9E8878F90943E953dCd744Ec730F278De9D5F3B
TwoDecimal ERC20  				| 0x6d6C89CE746284F1d66C4a229cb449b32f494BF5
EightDeciaml bdToken  			| 0x51da2c4A7378c28282Ef3022890A935c56c97E7E
EightDeciaml InterestRateModel  | 0xD1ceE226016e7060f54eEF5754f3DC80bD79dA27
EightDeciaml ERC20  			| 0x92Af1BCA5B2A1Ecbd835646D22cbc9b01Fb17600
TwelveDecimal bdToken  			| 0x30d5237C74520a99F957B3ad7435350C8D71d791
TwelveDecimal InterestRateModel | 0x1d5848842DeE52EFCA44E3b8Bcc4DEea1111596d
TwelveDecimal ERC20  			| 0x44658B8C5996D341064F569cdc3f0BD172600a77
DAI ERC20 (Reserve)  			| 0xDc3c1D7741E454DEC2d2e6CFFe29605E4b7e01e3

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

