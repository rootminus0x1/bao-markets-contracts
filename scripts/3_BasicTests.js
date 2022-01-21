const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require('fs');
const { Console } = require("console");

var unitrollerContract;
var comptrollerContract;
var ERC20Contract;
var JumpRateModelContract;
var cERC20ImmunatbleContract;
var fedContract;
var oracleContract;
var WhitePaperModelContract;
var newEthPrice;
var CEtherContract;

var user1;
var user2;

var initialUser1Mint = ethers.utils.parseEther("100000000000");
var initialUser2Mint = ethers.utils.parseEther("100000000000");

//The differnt borrowing amounts that we are trying to borrow 
//["0.000000000000000001","0.0000000000000001","1","1000000000"]
const borrowAmounts = ["3000"];

describe("Basic Tests", function () { 
    //We have long loading times 
    this.timeout(100000);
   
    //Get deployed addresses and create contract objects
    fs.readFile('./DeployedContracts.txt', 'utf8' , async function (err, data) {
        if (err) {
            console.error(err)
            return
        }
        var addressArr = data.split(',');
        //We are addressing the unitroller
        comptrollerContract = await ethers.getContractAt("contracts/Comptroller.sol:Comptroller",addressArr[1]);
        unitrollerContract = await ethers.getContractAt("contracts/Unitroller.sol:Unitroller",addressArr[1]);
        oracleContract = await ethers.getContractAt("contracts/Oracle.sol:Oracle",addressArr[2]);
        ERC20Contract = await ethers.getContractAt("contracts/Fed.sol:ERC20",addressArr[3]);
        JumpRateModelContract = await ethers.getContractAt("contracts/JumpRateModelV2.sol:JumpRateModelV2",addressArr[4]);
        cERC20ImmunatbleContract = await ethers.getContractAt("contracts/CToken/CErc20.sol:CErc20Immutable",addressArr[5]);
        fedContract = await ethers.getContractAt("contracts/Fed.sol:Fed",addressArr[6]);
        WhitePaperModelContract = await ethers.getContractAt("contracts/WhitePaperInterestRateModel.sol:WhitePaperInterestRateModel", addressArr[7]);
        CEtherContract = await ethers.getContractAt("contracts/CEther.sol:CEther",addressArr[8]);
        ethPriceFeedContract = await ethers.getContractAt("MockPriceFeed",addressArr[9]);

        user1 = (await ethers.getSigners())[0];
        user2 = (await ethers.getSigners())[1];

        const removeWhitelistModusTx = await comptrollerContract._setBorrowRestriction([cERC20ImmunatbleContract.address],[false]);
        await removeWhitelistModusTx.wait();
    });

    it("Load Setup Test Users", async function () {
        //Take a break to ensure contracts have been loaded
        await sleep(5000);
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        //Give Ether to Users (only works on local testnet)
        await setUserBalances();
    });

    for (let i = 0; i < borrowAmounts.length; i++) {        

        it("Depositing Collateral", async function () {
      
            //Amount of ETH to deposit
            const depositAmount = "1";            
            
            const originalDeposit = await CEtherContract.balanceOf(user1.address);
    
            //Deposit Eth into protocol
            //Mint Synth tokens for user 1 and 2
            await setupUser1(depositAmount);
    
            const newDeposit = await CEtherContract.balanceOf(user1.address);
            
            //Check that user 1 received the right amount of dbEth
            expect((ethers.utils.parseEther(depositAmount)).mul(ethers.utils.parseEther("1")).div(await cERC20ImmunatbleContract.exchangeRateStored())).to.equal(newDeposit.sub(originalDeposit));
            
            await setupUser2(depositAmount);
        });

        it("Borrowing", async function () {

            const originalBorrowBalance = (await cERC20ImmunatbleContract.borrowBalanceStored(user1.address));

            const amountToBorrow = ethers.utils.parseEther(borrowAmounts[i]);
    
            //We Borrow the Synth
            var transaction = await cERC20ImmunatbleContract.borrow(amountToBorrow);
            await transaction.wait();
    
            //We check that the borrow amount is deposited to the users address
            expect(originalBorrowBalance.add(amountToBorrow)).to.equal(await cERC20ImmunatbleContract.borrowBalanceStored(user1.address));
        });

        it("Borrowing Power", async function () {
                    
            //Make sure all values are up to date
            transaction = await cERC20ImmunatbleContract.accrueInterest();
            await transaction.wait();
    
            //Off-chain calculation of what the borrowing power should be
            const borrowingPower = await calcBorrowPower();
            console.log("Borrowing Power: ", borrowingPower.toString());

            //What the deployed contract tells us the collateral is
            var accountliquidity = await comptrollerContract.getAccountLiquidity(user1.address);
            console.log("Borrow Balance (should be 0): ",(await cERC20ImmunatbleContract.getAccountSnapshot(user1.address))[2].toString());
            console.log("Borrowing Power: ", accountliquidity[1].toString());
            
            //We expect the result from the protocol to be the same as the on-chain result
            expect(accountliquidity[1]).to.equal(borrowingPower);
        });
    
        it('Interest Rate', async () => {
            //Contract balance of underlying
            const contractBalanceBefore = await ERC20Contract.balanceOf(cERC20ImmunatbleContract.address);
    
            await evmSetAutomine(false);
    
            const borrowAmount = await cERC20ImmunatbleContract.borrowBalanceStored(user1.address);
            
            const expectedReward = await getInterest(3, borrowAmount);
            
            // create delta of 3 (accrue interest over 3 blocks)
                await cERC20ImmunatbleContract.accrueInterest();
            await evmMine();
                await cERC20ImmunatbleContract.accrueInterest();
            await evmMine();
                //User1 Repays Borrow + Interest
                var approveTx = await ERC20Contract.connect(user1).approve(cERC20ImmunatbleContract.address, ethers.constants.MaxUint256);
                approveTx.wait();
                var repayTx = await cERC20ImmunatbleContract.connect(user1).repayBorrow(ethers.constants.MaxUint256);
                repayTx.wait();       
            await evmMine();           
            await evmSetAutomine(true);
            
            const contractBalanceAfter = await ERC20Contract.balanceOf(cERC20ImmunatbleContract.address);
    
            //We check that the new synth balance of the prtotocol is:
            //Old Amount + Borrowed Amount + Interest
            //expect(contractBalanceBefore.add(borrowAmount.add(expectedReward)).sub(contractBalanceAfter)).to.be.within(0, 1);  
        });
    
        it("Liquidations", async function () {
            //Borrow to the possible limit
            var accountliquidity = await comptrollerContract.getAccountLiquidity(user1.address);
            const borrowAmount = accountliquidity[1];
            
            //Calculate a new eth price
            const currentEthPrice = await ethPriceFeedContract.latestAnswer();
            newEthPrice = currentEthPrice.mul(ethers.BigNumber.from("8000000")).div(ethers.BigNumber.from("10000000"));
            
            //User1 Borows Synth (only works with bUSD)
            var borrowTx = await cERC20ImmunatbleContract.borrow(borrowAmount);
            await borrowTx.wait();
    
            //Set new Eth Price
            var ethIncreaseTx = await ethPriceFeedContract.setPrice(newEthPrice);
            await ethIncreaseTx.wait();
    
            //Calculate interest that is accrued
            const interest = await getInterest(1, borrowAmount);
    
            var accrueTx = await CEtherContract.accrueInterest();
            await accrueTx.wait();
    
            //Get debt of user1
            accountliquidity = await comptrollerContract.getAccountLiquidity(user1.address);
    
            //get cToken -> Token exchage rate
            var exchangeRate = await CEtherContract.exchangeRateStored();
    
            //Get Amount of collateral that would be seized by the protocol
            const actuallySeized = await comptrollerContract.liquidateCalculateSeizeTokens(cERC20ImmunatbleContract.address, CEtherContract.address, accountliquidity[2]);
    
            //Calculate how many tokens should be seized
            const seizeTokens = await calcSeizedAssets(accountliquidity[2],newEthPrice,exchangeRate);
    
            //check that Liquidator received expected amount
            expect(seizeTokens.sub(actuallySeized[1])).to.be.within(ethers.BigNumber.from("0"), 1e7);  
        });  
    
        it("Assets After Liquidation as expected", async function () {
            //get user1 Borrow
            var accountSnapshot = await cERC20ImmunatbleContract.getAccountSnapshot(user1.address);
            const synthBorrowedBeforeLiq = accountSnapshot[2];
    
            //Get the amount of interest that we will be accruing with the next transactions
            const interest = await getInterest(4, synthBorrowedBeforeLiq);
    
            //get user1 collateral
            accountSnapshot = await CEtherContract.getAccountSnapshot(user1.address);
            const collateralBeforeLiq = accountSnapshot[1];
            
            //Get debt of user1
            var accountliquidity = await comptrollerContract.getAccountLiquidity(user1.address);
            const liquidatedAmount = accountliquidity[2];     
    
            //Estimation on 
            const collateralToBeSeized = (await comptrollerContract.liquidateCalculateSeizeTokens(cERC20ImmunatbleContract.address, CEtherContract.address, liquidatedAmount.div(2)))[1];
    
            //Liquidate user1 by user2
            var approveTx = await ERC20Contract.connect(user2).approve(cERC20ImmunatbleContract.address, ethers.constants.MaxUint256);
            approveTx.wait();
            var liquidationTx = await cERC20ImmunatbleContract.connect(user2).liquidateBorrow(user1.address, liquidatedAmount.div(2), CEtherContract.address);
            liquidationTx.wait();
    
            //Get new borrow amount
            var accountSnapshot = await cERC20ImmunatbleContract.getAccountSnapshot(user1.address);
            const synthBorrowedAfterLiq = accountSnapshot[2];
    
            //Get collateral amount
            accountSnapshot = await CEtherContract.getAccountSnapshot(user1.address);
            const collateralAfterLiq = accountSnapshot[1];
    
            //Check that Borrowing power after liquidation is as expected
            //A rounding error of 1 is exceprible
            //expect((synthBorrowedBeforeLiq.add(interest).sub(synthBorrowedAfterLiq.add(liquidatedAmount.div(2))))).to.be.within(0, 1);
    
            //Check that the new collateral balance of the liquidator is correct.
            expect(collateralAfterLiq).to.equal(collateralBeforeLiq.sub(collateralToBeSeized));
        });

        it("RepayBorrow", async function () {
            
            console.log("Balance of Underlying: ",(await CEtherContract.balanceOfUnderlying(user1.address)).toString());
            console.log("ExchangeRate: ",(await CEtherContract.exchangeRateCurrent()).toString());

            //get user1 Borrow before repay
            const synthBorrowedBeforeRepay = (await cERC20ImmunatbleContract.getAccountSnapshot(user1.address))[2];
            console.log("SYnths borrowed before Repay: ",synthBorrowedBeforeRepay.toString());
            //Repay the borrowed amount
            const reapyTransaction = await cERC20ImmunatbleContract.repayBorrow(synthBorrowedBeforeRepay);
            await reapyTransaction.wait();

            //get user1 Borrow after repay
            const synthBorrowedAfterRepay = (await cERC20ImmunatbleContract.getAccountSnapshot(user1.address))[2];

            //Check that the new collateral balance of the liquidator is correct.
            expect(synthBorrowedAfterRepay).to.equal(0);
        });

        it("Withdraw Assets", async function () {
            
            //get user1 Borrow before repay
            const synthBorrowedBeforeRepay = (await cERC20ImmunatbleContract.getAccountSnapshot(user1.address))[2];

            //Repay the borrowed amount
            const reapyTransaction = await cERC20ImmunatbleContract.repayBorrow(synthBorrowedBeforeRepay);
            await reapyTransaction.wait();

            //get user1 Borrow after repay
            const synthBorrowedAfterRepay = (await cERC20ImmunatbleContract.getAccountSnapshot(user1.address))[2];

            //Withdraw all Collateral
            var withdrawTx = await CEtherContract.connect(user1).redeem((await CEtherContract.balanceOf(user1.address)));
            await withdrawTx.wait();

            //Check that the new collateral balance of the liquidator is correct.
            expect(synthBorrowedAfterRepay).to.equal(0);
        });
        
    }

    async function setupUser1(depositAmount) {
        const enterMarketTx = await comptrollerContract.connect(user1).enterMarkets([CEtherContract.address, cERC20ImmunatbleContract.address]);
        enterMarketTx.wait();
        
        //Deposit Collateral
        let overrides = {
            // To convert Ether to Wei:
            value: ethers.utils.parseEther(String(depositAmount)).toString()
        };
        //Deposit Eth to receive bdETH
        await CEtherContract.connect(user1).mint(overrides);
    }
    
    async function setupUser2(depositAmount) {
        const enterMarketTx = await comptrollerContract.connect(user2).enterMarkets([CEtherContract.address, cERC20ImmunatbleContract.address]);
        enterMarketTx.wait();
        
        //Deposit Collateral
        let overrides = {
            // To convert Ether to Wei:
            value: ethers.utils.parseEther(String(depositAmount)).toString()
        };
        //Deposit Eth to receive cETH
        //await CEtherContract.connect(user2).mint(overrides);

        //const borrowTx = await cERC20ImmunatbleContract.connect(user2).borrow(ethers.utils.parseEther("400000.0"));
        //borrowTx.wait();
    }

    async function setUserBalances(){
        await network.provider.send("hardhat_setBalance", [
            user1.address,
            //30b Eth
            "0x9B18AB5DF7180B6B8000000",
        ]);

        await network.provider.send("hardhat_setBalance", [
            user2.address,
            ////30b Eth
            "0x9B18AB5DF7180B6B8000000",
        ]);

        //User1 requires some Synths so that the user can repay the borrow + interest
        await ERC20Contract.connect(user1).mint(user1.address, initialUser1Mint);

        //User2 requires some Synths so they can liquidate user1
        await ERC20Contract.connect(user1).mint(user2.address, initialUser2Mint);
    }

    async function calcIMF(asset, cTokenContract){

        var exchangeRate = await cTokenContract.exchangeRateStored();
        var cTokenBalance = await cTokenContract.balanceOf(user1.address);
 
        var underlyingTokenAmount = (exchangeRate.mul(cTokenBalance)).div(ethers.utils.parseEther("1.0"));
        var underlyingPrice = await transformPrice((await oracleContract.getUnderlyingPrice(asset)));

        //Get CollateralFactor info of asset
        var assetInfo = await comptrollerContract.markets(CEtherContract.address);
        var collateralFactor = assetInfo[1];
        var imfFactor = assetInfo[2];

        //Calulate value for IMF Factor
        var squareUnderlyingTokenAmount = ethers.utils.parseEther((Math.sqrt((underlyingTokenAmount.div(ethers.utils.parseEther("1.0"))).toNumber())).toString());
        var tempIMF = ((imfFactor.mul(squareUnderlyingTokenAmount)).div(ethers.utils.parseEther("1.0")));
        var IMF = ethers.utils.parseEther("1.0").add(tempIMF);
        console.log("IMF: ",IMF.toString());
        console.log("CF: ",collateralFactor.toString());
        //Calculate Collateral
        if(collateralFactor.lt(IMF)){
            collateral = (((underlyingTokenAmount.mul(underlyingPrice)).mul(collateralFactor)).div(ethers.utils.parseEther("1.0"))).div(ethers.utils.parseEther("1.0"));
        }    
        else{
            collateral = (((underlyingTokenAmount.mul(underlyingPrice)).mul(IMF)).div(ethers.utils.parseEther("1.0"))).div(ethers.utils.parseEther("1.0"));
        }
        return(collateral);
    }

    async function calcBorrowPower(){
        //Calculate borrowing power
        depositedAssets = await comptrollerContract.getAssetsIn(user1.address);
        
        var collateral = ethers.BigNumber.from("0");
        var borrow = ethers.BigNumber.from("0");
        //Only consider assets that where added as collateral by the user
        for (let i = 0; i < depositedAssets.length; i++) {
            const asset = depositedAssets[i];

            //Get contract reference
            var cTokenContract = await ethers.getContractAt("contracts/CToken.sol:CErc20Immutable",asset);

            //For every added asset we calculate and add up the borrowing power
            if(await comptrollerContract.checkMembership(user1.address, asset)){         
                const borrowedAmount = await cTokenContract.borrowBalanceStored(user1.address);
                console.log("BORROW AMOUNT: ", borrowedAmount.toString());
                if(borrowedAmount.gt(0)){
                    underlyingAsset = await ethers.getContractAt("contracts/Fed.sol:ERC20",(await cTokenContract.underlying()));
                    //borrow += borrowAmount * tokenValue
                    var price = transformPrice((await oracleContract.getUnderlyingPrice(cTokenContract.address)), (await underlyingAsset.decimals()));
                    borrow = borrow.add(borrowedAmount.mul(price));
                }

                //only consider assets where user has collateral       
                if((await cTokenContract.balanceOf(user1.address)) == 0){
                    continue;
                }    
                collateral =  collateral.add((await calcIMF(asset, cTokenContract)));      
                console.log("COLLATERAL AMOUNT: ", collateral.toString());  
            };
        };
        console.log("Collateral: ", collateral.toString());
        console.log("Borrow: ", borrow.toString());
        console.log("Collateral-Borrow: ", (collateral.sub(borrow)).toString());
        return(collateral.sub(borrow));
    }

    async function calcSeizedAssets(accountliquidity, newEthPrice, exchangeRate){
         //const seizeAmount = repayAmount * liquidationIncentive * borrowedPrice / collateralPrice;
         const repayAmount = accountliquidity;
         const step1 = repayAmount.mul(ethers.utils.parseEther("1.1"));
         const seizeAmount = step1.div(newEthPrice.mul(ethers.BigNumber.from("10000000000")));
         const seizeTokens = (seizeAmount.mul(ethers.utils.parseEther("1"))).div(exchangeRate);
         return(seizeTokens);
    }

    function transformPrice(oraclePrice, decmials){
		let mantissaDecimalFactor = 18 - decmials + 18
		let bdFactor = exponentToBigDecimal(mantissaDecimalFactor)
		return(oraclePrice.div(bdFactor))  
	}

	function exponentToBigDecimal(decimals){
		let bd = ethers.BigNumber.from("1");
		for (let i = 0; i < decimals; i++) {
		bd = bd.mul(ethers.BigNumber.from('10'))
		}
		return bd
	}

    async function getInterest(delta, borrowAmount){
        const borrowRate = (await cERC20ImmunatbleContract.borrowRatePerBlock()).mul(delta);
        const expectedReward = (borrowRate.mul((borrowAmount))).div(ethers.utils.parseEther("1.0"));
        return(expectedReward);
    }

    const evmMine = async () => { return await hre.network.provider.send("evm_mine"); }
    
    const evmSetAutomine = async (state) => {
        return await hre.network.provider.send("evm_setAutomine", [ state ]);
    }
    
});