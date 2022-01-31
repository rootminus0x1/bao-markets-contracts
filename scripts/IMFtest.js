const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require('fs');

var comptrollerContract;
var ERC20Contract;
var dbERC20Contract;
var oracleContract;
var newEthPrice;
var CEtherContract;

var user1;
var user2;

var initialUser1Mint = ethers.utils.parseEther("100000000000");
var initialUser2Mint = ethers.utils.parseEther("100000000000");

describe("IMF Tests", function () { 
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
        comptrollerContract = await ethers.getContractAt("Comptroller",addressArr[1]);
        unitrollerContract = await ethers.getContractAt("contracts/Comptroller/Unitroller.sol:Unitroller",addressArr[1]);
        oracleContract = await ethers.getContractAt("Oracle",addressArr[2]);
        ERC20Contract = await ethers.getContractAt("ERC20",addressArr[3]);
        JumpRateModelContract = await ethers.getContractAt("JumpRateModelV2",addressArr[4]);
        dbERC20Contract = await ethers.getContractAt("CErc20Delegator",addressArr[5]);
        fedContract = await ethers.getContractAt("Fed",addressArr[6]);
        WhitePaperModelContract = await ethers.getContractAt("WhitePaperInterestRateModel", addressArr[7]);
        CEtherContract = await ethers.getContractAt("CEther",addressArr[8]);
        ethPriceFeedContract = await ethers.getContractAt("MockPriceFeed",addressArr[9]);

        user1 = (await ethers.getSigners())[0];
        user2 = (await ethers.getSigners())[1];

        const removeWhitelistModusTx = await comptrollerContract._setBorrowRestriction([dbERC20Contract.address],[false]);
        await removeWhitelistModusTx.wait();
    });

    it("Setup Test Users", async function () {
        //Take a break to ensure contracts have been loaded
        await sleep(5000);
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        //Give Ether to Users (only works on local testnet)
        await setUserBalances();

        //Users enter markets and deposit collateral
        await setupUser1(1000);
        await setupUser2(1000);
    });     
    
    it("Liquidations", async function () {

        //Get the Max amount that user1 can borrow
        var accountliquidity = await comptrollerContract.getAccountLiquidity(user1.address);
        var oldBorrowAmount = accountliquidity[1];

        //Calculate what borrow amount should be according to IMF formula
        const imfResult = await calcIMF(CEtherContract);
        
        console.log("Calculated Borrowing Power: ",imfResult.toString());
        console.log("Actual Borrowing Power: ",oldBorrowAmount.toString());
        expect(imfResult).to.equal(oldBorrowAmount);
    
        //User1 Borows the max amount of bUSD
        var borrowTx = await dbERC20Contract.borrow(oldBorrowAmount);
        await borrowTx.wait();

        accountliquidity = await comptrollerContract.getAccountLiquidity(user1.address);
        var borrowAmount = accountliquidity[1];
        console.log("Actual Borrowing Power: ",borrowAmount.toString());
        
        //Create a 5% price drop for Ether
        const currentEthPrice = await ethPriceFeedContract.latestAnswer();
        newEthPrice = currentEthPrice.mul(ethers.BigNumber.from("9500000")).div(ethers.BigNumber.from("10000000"));          
        //Set new Eth Price
        var ethIncreaseTx = await ethPriceFeedContract.setPrice(newEthPrice);
        await ethIncreaseTx.wait();
        
        //Calc new borrowing power of user1
        const newBorrowingPower = await calcIMF(CEtherContract);

        //Get debt (shortfall) of user1
        const shortfall = (await comptrollerContract.getAccountLiquidity(user1.address))[2];

        //Check that debt is correct
        expect(shortfall).to.equal(oldBorrowAmount.sub(newBorrowingPower));
        
        //get cToken -> Token exchage rate
        var exchangeRate = await CEtherContract.exchangeRateCurrent();

        const EthPrice = await oracleContract.getUnderlyingPrice(CEtherContract.address);

        //Estimation on 
        const collateralToBeSeized = (await comptrollerContract.liquidateCalculateSeizeTokens(dbERC20Contract.address, CEtherContract.address, shortfall))[1];
        console.log("Actually Seized: ",collateralToBeSeized.toString());
        console.log("Calculated Seized: ",(await calcSeizedAssets(shortfall, EthPrice, exchangeRate)).toString());
        expect(collateralToBeSeized).to.equal((await calcSeizedAssets(shortfall, EthPrice, exchangeRate)));

        //Get collateral amount of user1
        accountSnapshot = await CEtherContract.getAccountSnapshot(user1.address);
        const collateralBeforeLiqUser1 = accountSnapshot[1];

        //Get collateral amount of user2
        accountSnapshot = await CEtherContract.getAccountSnapshot(user2.address);
        const collateralBeforeLiqUser2 = accountSnapshot[1];

        //Liquidate user1 by user2
        var approveTx = await ERC20Contract.connect(user2).approve(dbERC20Contract.address, ethers.constants.MaxUint256);
        approveTx.wait();
        var liquidationTx = await dbERC20Contract.connect(user2).liquidateBorrow(user1.address, shortfall, CEtherContract.address);
        liquidationTx.wait();

        //Get collateral amount
        accountSnapshot = await CEtherContract.getAccountSnapshot(user1.address);
        const collateralAfterLiq = accountSnapshot[1];

        //Check that the correct amount is liquidated
        expect(collateralAfterLiq).to.equal(collateralBeforeLiqUser1.sub(collateralToBeSeized));

        //Get collateral amount user2
        accountSnapshot = await CEtherContract.getAccountSnapshot(user2.address);
        const collateralAfterLiqUser2 = accountSnapshot[1];
        //Check that the liquidator received the correct liquidation reward
        //A rounding error of 1 is exceprible
        expect(collateralAfterLiqUser2.sub(collateralBeforeLiqUser2.add(collateralToBeSeized.mul(ethers.utils.parseEther("0.972")).div(ethers.utils.parseEther("1"))))).to.be.within(0, 1);
        
    });  

    async function setupUser1(depositAmount) {
        const enterMarketTx = await comptrollerContract.connect(user1).enterMarkets([CEtherContract.address, dbERC20Contract.address],user1.address);
        enterMarketTx.wait();
        
        //Deposit Collateral
        let overrides = {
            // To convert Ether to Wei:
            value: ethers.utils.parseEther(String(depositAmount)).toString()
        };
        //Deposit Eth to receive bdETH
        await CEtherContract.connect(user1).mint(false, overrides);
    }
    
    async function setupUser2(depositAmount) {
        const enterMarketTx = await comptrollerContract.connect(user2).enterMarkets([CEtherContract.address, dbERC20Contract.address],user2.address);
        enterMarketTx.wait();
        
        //Deposit Collateral
        let overrides = {
            // To convert Ether to Wei:
            value: ethers.utils.parseEther(String(depositAmount)).toString()
        };
        //Deposit Eth to receive cETH
        //await CEtherContract.connect(user2).mint(false, overrides);

        //const borrowTx = await dbERC20Contract.connect(user2).borrow(ethers.utils.parseEther("400000.0"));
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

    async function calcIMF(cTokenContract){

        var exchangeRate = await cTokenContract.exchangeRateStored();
        var cTokenBalance = await cTokenContract.balanceOf(user1.address);
 
        var underlyingTokenAmount = (exchangeRate.mul(cTokenBalance)).div(ethers.utils.parseEther("1.0"));
        var underlyingPrice = await transformPrice((await oracleContract.getUnderlyingPrice(cTokenContract.address)));

        //Get CollateralFactor info of asset
        var assetInfo = await comptrollerContract.markets(CEtherContract.address);
        var collateralFactor = assetInfo[1];
        var imfFactor = assetInfo[2];
        
        //Calulate value for IMF Factor
        var squareUnderlyingTokenAmount = ethers.utils.parseEther((Math.sqrt((underlyingTokenAmount.div(ethers.utils.parseEther("1.0"))).toNumber())).toString());
        var tempIMF = ((imfFactor.mul(squareUnderlyingTokenAmount)).div(ethers.utils.parseEther("1.0")));
        tempIMF = tempIMF.div(ethers.BigNumber.from("1000000000")).mul(ethers.BigNumber.from("1000000000"));
        var preMinDenum = ethers.utils.parseEther("1.0").add(tempIMF);
        var IMF = ethers.utils.parseEther("1.1").mul(ethers.utils.parseEther("1.0")).div(preMinDenum);
        console.log("IMF: ",IMF.toString());
        console.log("CF: ",collateralFactor.toString());
        //Calculate Collateral
        if(collateralFactor.lt(IMF)){
            collateral = (((underlyingTokenAmount.mul(underlyingPrice)).mul(collateralFactor)).div(ethers.utils.parseEther("1.0"))).div(ethers.utils.parseEther("1.0"));
        }    
        else{
            var exchangeRate = await cTokenContract.exchangeRateCurrent();
            collateral = exchangeRate.mul(IMF).div(ethers.utils.parseEther("1.0"));
            collateral = collateral.mul(underlyingPrice).div(ethers.utils.parseEther("1.0"));
            collateral = (cTokenBalance.mul(collateral).div(ethers.utils.parseEther("1.0"))).toString();
        }
        
        return(collateral);
    }

    async function calcSeizedAssets(accountliquidity, newEthPrice, exchangeRate){
         //const seizeAmount = repayAmount * liquidationIncentive * borrowedPrice / collateralPrice;
         const nominator = exchangeRate.mul(newEthPrice).div(ethers.utils.parseEther("1"));
         console.log("nominator", nominator.toString());
         const denominator = ethers.utils.parseEther("1.1").mul(ethers.utils.parseEther("1")).div(nominator);
         return(denominator.mul(accountliquidity).div(ethers.utils.parseEther("1")));
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
});