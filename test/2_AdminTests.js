const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require('fs');

var unitrollerContract;
var comptrollerContract;
var ERC20Contract;
var cERC20ImmunatbleContract;
var CEtherContract;

var admin;
var randomUser;

var initialUser1Mint = ethers.utils.parseEther("100000000000");
var initialUser2Mint = ethers.utils.parseEther("100000000000");

describe("Admin Tests", function () { 
    //We have long loading times 
    this.timeout(100000);
   
    ////////////////////////
    //LOAD CONTRACTS HERE///
    ////////////////////////

    it("Setup Test Users", async function () {
        //Loading the contract data might take a while,
        //so we take a small break
        await sleep(5000);
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        //Give Ether to Users (only works on local testnet)
        await setUserBalances();

        //Enter the existing markets
        var enterMarketTx = await comptrollerContract.connect(admin).enterMarkets([CEtherContract.address, cERC20ImmunatbleContract.address]);
        await enterMarketTx.wait();

        //Enter the existing markets
        enterMarketTx = await comptrollerContract.connect(randomUser).enterMarkets([CEtherContract.address, cERC20ImmunatbleContract.address]);
        await enterMarketTx.wait();
    });
 
    it('Setting new Admin', async () => {
        //Non-admin shouldn't be able to set pending admin
        await cERC20ImmunatbleContract.connect(randomUser)._setPendingAdmin(randomUser.address);
        expect(await cERC20ImmunatbleContract.pendingAdmin()).to.equal(await address(0));

        // Setting the pending admin
        await cERC20ImmunatbleContract.connect(admin)._setPendingAdmin(randomUser.address);
        await cERC20ImmunatbleContract.connect(admin)._setPendingAdmin(admin.address);
        expect(await cERC20ImmunatbleContract.pendingAdmin()).to.equal(admin.address);

        // We expect randomUser not to be able to gain the admin role
        await cERC20ImmunatbleContract.connect(randomUser)._acceptAdmin();
        expect(await cERC20ImmunatbleContract.pendingAdmin()).to.equal(admin.address);

        //Pending admin accepts and becomes admin
        await cERC20ImmunatbleContract.connect(admin)._acceptAdmin();
        expect(await cERC20ImmunatbleContract.pendingAdmin()).to.equal(await address(0));
        expect(await cERC20ImmunatbleContract.admin()).to.equal(admin.address);     
    });

    it('Setting new Comptroller', async () => {
        //We just need any address
        var newComptroller = (await ethers.getSigners())[10];

        //We expect that random user cannot change comptroller address
        await cERC20ImmunatbleContract.connect(randomUser)._setComptroller(newComptroller.address);
        expect(await cERC20ImmunatbleContract.comptroller()).to.equal(unitrollerContract.address);

        // Non Controller address should be reverted
        await expect(cERC20ImmunatbleContract.connect(admin)._setComptroller(newComptroller.address)).to.be.reverted;
        expect(await cERC20ImmunatbleContract.comptroller()).to.equal(unitrollerContract.address);

        //Address of a real comptroller contract should work
        newComptroller = comptrollerContract;
        await cERC20ImmunatbleContract.connect(admin)._setComptroller(newComptroller.address);
        expect(await cERC20ImmunatbleContract.comptroller()).to.equal(newComptroller.address);
    });

    it('Pausing Minting', async () => {
        // Admin pauses minting
        var pausingTx = await comptrollerContract.connect(admin)._setMintPaused(CEtherContract.address, true);
        await pausingTx.wait();

        // No one can mint the paused asset
        await expect(CEtherContract.connect(admin).mint({value:"100000"})).to.be.reverted;

        // Admin un-pauses minting
        pausingTx = await comptrollerContract.connect(admin)._setMintPaused(CEtherContract.address, false);
        await pausingTx.wait();

        //get original Mint amount from the user
        const originalDbTokenBalance = await CEtherContract.connect(admin).balanceOf(admin.address);

        //Mint any amount 
        const borrowTx = await CEtherContract.connect(admin).mint({value:"100000"});
        await borrowTx.wait();

        //Check that Mint works again
        expect(originalDbTokenBalance.add(ethers.BigNumber.from("100000").mul(ethers.utils.parseEther("1")).div((await CEtherContract.connect(admin).exchangeRateStored())))).to.equal((await CEtherContract.connect(admin).balanceOf(admin.address))); 
    });

    it('Pausing Borrowing', async () => {
        // Admin pauses borrowing
        var pausingTx = await comptrollerContract.connect(admin)._setBorrowPaused(cERC20ImmunatbleContract.address, true);
        await pausingTx.wait();

        // No one can borrow the paused asset
        await expect(cERC20ImmunatbleContract.connect(admin).borrow("100000")).to.be.reverted;

        // Admin un-pauses borrowing
        pausingTx = await comptrollerContract.connect(admin)._setBorrowPaused(cERC20ImmunatbleContract.address, false);
        await pausingTx.wait();

        //get original borrowed amount from the user
        const originalBorrowBalance = await cERC20ImmunatbleContract.connect(admin).borrowBalanceStored(admin.address);

        //Borrow any amount 
        const borrowTx = await cERC20ImmunatbleContract.connect(admin).borrow("100000");
        await borrowTx.wait();

        //Check that borrow works again
        expect(originalBorrowBalance.add(ethers.BigNumber.from("100000"))).to.equal((await cERC20ImmunatbleContract.connect(admin).borrowBalanceStored(admin.address)));        
    });

    //Create a 0 address
    const address = async (n) => {
        const address_ = `0x${n.toString(16).padStart(40, '0')}`;
        return address_.toString();
    }

    //Set the eth balances on testnet.
    //Sadly only works with a hardhat testnet :( 
    async function setUserBalances(){
        await network.provider.send("hardhat_setBalance", [
            admin.address,
            //30b Eth
            "0x9B18AB5DF7180B6B8000000",
        ]);

        await network.provider.send("hardhat_setBalance", [
            randomUser.address,
            ////30b Eth
            "0x9B18AB5DF7180B6B8000000",
        ]);

        //User1 requires some Synths so that the user can repay the borrow + interest
        await ERC20Contract.connect(admin).mint(admin.address, initialUser1Mint);

        //User2 requires some Synths so they can liquidate user1
        await ERC20Contract.connect(admin).mint(randomUser.address, initialUser2Mint);
    }
    
});