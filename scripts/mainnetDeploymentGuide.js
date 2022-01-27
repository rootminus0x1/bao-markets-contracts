const { ethers } = require("hardhat");

async function main() {    
    var unitrollerContract;
    var comptrollerContract;
    var delegateContract;
    var originalcomptrollerAddress;
    var bUSDContract;
    var JumpRateModelContract;
    var USDCJumpRateModelContract;
    var bdUSDContract;
    var bdUSDCContract;
    var fedContract;
    var oracleContract;
    var bdEtherContract;
    var WhitePaperModelContract;

    ////////////////////////////////////////
    //Contract Deployments
    ////////////////////////////////////////

    //Deploy Oracle 
    const oracleFactory = await ethers.getContractFactory("Oracle");
    oracleContract = await oracleFactory.deploy();
    await oracleContract.deployTransaction.wait();
    console.log("Oracle Deployed");

    //Deploy Delegate (cERC20 Implementation)
    const delegateFactory = await ethers.getContractFactory("CErc20Delegate");
    delegateContract = await delegateFactory.deploy();
    await delegateContract.deployTransaction.wait();

    // Deploy Comptroller
    const comptrollerFactory = await ethers.getContractFactory("Comptroller");
    comptrollerContract = await comptrollerFactory.deploy();
    await comptrollerContract.deployTransaction.wait();
    originalcomptrollerAddress = comptrollerContract.address;

    // Deploy Unitroller
    const unitrollerFactory = await ethers.getContractFactory("contracts/Comptroller/Unitroller.sol:Unitroller");
    unitrollerContract = await unitrollerFactory.deploy();
    await unitrollerContract.deployTransaction.wait();

    //Set Implementation for Unitroller
    const setPendingImplementationTx = await unitrollerContract._setPendingImplementation(comptrollerContract.address);
    await setPendingImplementationTx.wait();
    const setApproveNewImplementationTx = await comptrollerContract._become(unitrollerContract.address);
    await setApproveNewImplementationTx.wait();

    //We are addressing the Unitroller, which delegates to comptroller
    comptrollerContract = await ethers.getContractAt("Comptroller", unitrollerContract.address);
    console.log("Comptroller Deployed");

    // Deploy bUSD (ERC20 token)
    const bUSDFactory = await ethers.getContractFactory("ERC20");
    bUSDContract = await bUSDFactory.deploy("Bao USD","bUSD","18");
    await bUSDContract.deployTransaction.wait();

    // Deploy InterestRateModels
    //For bUSD (Fuse pool)
    const JumpRateModelFactory = await ethers.getContractFactory("JumpRateModelV2");
    JumpRateModelContract = await JumpRateModelFactory.deploy(
        "0", //uint baseRatePerYear
        "49999999998268800", //uint multiplierPerYear
        "1089999999998841600", //uint jumpMultiplierPerYear
        "800000000000000000", //uint kink_
        "0x3dFc49e5112005179Da613BdE5973229082dAc35" //address owner_
    );
    await JumpRateModelContract.deployTransaction.wait();

    //For USDC (Fuse pool)
    USDCJumpRateModelContract = await JumpRateModelFactory.deploy(
        "0", //uint baseRatePerYear
        "49999999998268800", //uint multiplierPerYear
        "1089999999998841600", //uint jumpMultiplierPerYear
        "800000000000000000", //uint kink_
        "0x3dFc49e5112005179Da613BdE5973229082dAc35" //address owner_
    );
    await USDCJumpRateModelContract.deployTransaction.wait(); 

    // For ETH
    const WhitePaperModelFactory = await ethers.getContractFactory('WhitePaperInterestRateModel');
    WhitePaperModelContract = await WhitePaperModelFactory.deploy('19999999999728000','99999999998640000');
    await WhitePaperModelContract.deployTransaction.wait();
    console.log('Interest Rates Deployed');
    
    //Deploy bdUSD
    const bdUSDFactory = await ethers.getContractFactory("CErc20Delegator");
    bdUSDContract = await bdUSDFactory.deploy(
        bUSDContract.address,  //address underlying_
        unitrollerContract.address, //ComptrollerInterface comptroller_
        JumpRateModelContract.address,  //InterestRateModel interestRateModel_
        "200000000000000000",   //uint initialExchangeRateMantissa_
        "bao deposited bUSD",   //string memory name_
        "bdUSD",   //string memory symbol_
        "8",   //uint8 decimals_
        "0x3dFc49e5112005179Da613BdE5973229082dAc35", //address payable admin_
        delegateContract.address, //address implementation
        0 //Unused data entry
    );
    await bdUSDContract.deployTransaction.wait();   

    //Deploy bdUSDC
    bdUSDCContract = await bdUSDFactory.deploy(
        USDCERC20Contract.address,  //address underlying_
        unitrollerContract.address, //ComptrollerInterface comptroller_
        USDCJumpRateModelContract.address,  //InterestRateModel interestRateModel_
        "200000000000000000",   //uint initialExchangeRateMantissa_
        "bao deposited USDC",   //string memory name_
        "bdUSDC",   //string memory symbol_
        "8",   //uint8 decimals_
        "0x3dFc49e5112005179Da613BdE5973229082dAc35", //address payable admin_
        delegateContract.address, //address implementation
        0 //Unused data entry
    );
    await bdUSDCContract.deployTransaction.wait();


    //Deploy bdETH
    const bdEtherFactory = await ethers.getContractFactory("CEther");
    bdEtherContract = await bdEtherFactory.deploy(
        unitrollerContract.address, //ComptrollerInterface comptroller_
        WhitePaperModelContract.address,  //InterestRateModel interestRateModel_
        "200000000000000000",   //uint initialExchangeRateMantissa_
        "bao deposited ETH",   //string memory name_
        "bdETH",   //string memory symbol_
        "8",   //uint8 decimals_
        "0x3dFc49e5112005179Da613BdE5973229082dAc35"  //address payable admin_
    );
    await bdEtherContract.deployTransaction.wait();
    console.log("bdTokens Deployed");

    //Deploy Fed
    const fedFactory = await ethers.getContractFactory("Fed");
    fedContract = await fedFactory.deploy(bdUSDContract.address, "0x3dFc49e5112005179Da613BdE5973229082dAc35"); //CErc20 ctoken_, address gov_ 
    await fedContract.deployTransaction.wait();
    console.log("Fed Deployed");

    const stabilizerFactory = await ethers.getContractFactory('contracts/InverseFinance/Stabilizer.sol:Stabilizer');
    stabilizerContract = await stabilizerFactory.deploy(
      ERC20Contract.address, // bUSD address
      '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI (Ethereum Mainnet)
      '0x3dFc49e5112005179Da613BdE5973229082dAc35', // governance (Ethereum Multisig)
      100, // 1% buy fee
      100, // 1% sell fee
      '1500000000000000000000000'
    );

    ////////////////////////////////////////
    //Configurations
    ////////////////////////////////////////

    //Set USDC price feed
    const setUSDCPriceTx = await oracleContract.setFeed(bdUSDCContract.address, "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6", "6");
    await setUSDCPriceTx.wait();
    //Set fixed 1USD price feed for bUSD
    const setSynthPriceTx = await oracleContract.setFixedPrice(bdUSDContract.address, "1000000000000000000");
    await setSynthPriceTx.wait();
    //Set Ethereum price feed
    const setEthPriceTx = await oracleContract.setFeed(bdEtherContract.address, "0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419", "18");
    await setEthPriceTx.wait();
    console.log("Price Feeds configured");

    //Set the oracle for price queries
    const setOracleTx = await comptrollerContract._setPriceOracle(oracleContract.address);
    await setOracleTx.wait();
    //Set the close Factor
    const setCloseFactorTx = await comptrollerContract._setCloseFactor("500000000000000000");
    await setCloseFactorTx.wait();
    //Set Liquidation Incentive
    const setLiquidationIncentiveTx = await comptrollerContract._setLiquidationIncentive("1100000000000000000");
    await setLiquidationIncentiveTx.wait();
    //Create bUSD Market
    const setERC20MarketTx = await comptrollerContract._supportMarket(bdUSDContract.address);
    await setERC20MarketTx.wait();
    //Create ETH Market
    const setEthMarketTx = await comptrollerContract._supportMarket(bdEtherContract.address);
    await setEthMarketTx.wait();
    //Create USDC Market
    const setUSDCMarketTx = await comptrollerContract._supportMarket(bdUSDCContract.address);
    await setUSDCMarketTx.wait();
    //Set the CollateralFactor for bUSD
    const setCollateralFactor1Tx = await comptrollerContract._setCollateralFactor(bdUSDContract.address, "250000000000000000");
    await setCollateralFactor1Tx.wait();
    //Set the CollateralFactor for Eth
    const setCollateralFactor2Tx = await comptrollerContract._setCollateralFactor(bdEtherContract.address, "650000000000000000");
    await setCollateralFactor2Tx.wait();
    //Set the CollateralFactor for USDC
    const setCollateralFactor3Tx = await comptrollerContract._setCollateralFactor(bdUSDCContract.address, "700000000000000000");
    await setCollateralFactor3Tx.wait();
    //Set the IMFFactor for bUSD
    const setIMFFactor1Tx = await comptrollerContract._setIMFFactor(bdUSDContract.address, "40000000000000000");
    await setIMFFactor1Tx.wait();
    //Set the IMFFactor for ETH
    const setIMFFactor2Tx = await comptrollerContract._setIMFFactor(bdEtherContract.address, "40000000000000000");
    await setIMFFactor2Tx.wait();
    //Set the IMFFactor for USDC
    const setIMFFactor3Tx = await comptrollerContract._setIMFFactor(bdUSDCContract.address, "40000000000000000");
    await setIMFFactor3Tx.wait();
    //Set the Maximum amount of borrowed bUSD tokens (1mil)
    const setBorrowCapTx = await comptrollerContract._setMarketBorrowCaps([bdUSDContract.address],["1000000000000000000000000"]);
    await setBorrowCapTx.wait();   
    console.log("Comptroller Configured");

    //Set the ReserveFactor for bUSD 
    const setReserveFactor1Tx = await bdUSDContract._setReserveFactor("500000000000000000");
    await setReserveFactor1Tx.wait();
    //Set the ReserveFactor for ETH 
    const setReserveFactor2Tx = await bdEtherContract._setReserveFactor("500000000000000000");
    await setReserveFactor2Tx.wait();
    //Set the ReserveFactor for USDC 
    const setReserveFactor3Tx = await bdUSDCContract._setReserveFactor("500000000000000000");
    await setReserveFactor3Tx.wait();
    console.log("dbTokens configured");

    //Allow Fed to mint the bUSD
    var addMinterTx = await bUSDContract.addMinter(fedContract.address);
    await addMinterTx.wait();
    console.log("Test Minters set");

    //fed expension (minting 1mil bUSD tokens and depositing them into the protocol)
    const expansionTx = await fedContract.expansion(ethers.utils.parseEther("1000000"));
    expansionTx.wait();
    console.log("Fed Expanded");

    //In order for the subgraph to work we accrue interest once for every bdToken
    var accrueTx = await bdUSDContract.accrueInterest();
    await accrueTx.wait();
    var accrueTx = await bdUSDCContract.accrueInterest();
    await accrueTx.wait();
    var accrueTx = await bdEtherContract.accrueInterest();
    await accrueTx.wait();
    console.log("Interests accrued");   

    //Print all addresses
    console.log("----------------------------------------------------------------------------");
    console.log("Deployed Addresses:");
    console.log("----------------------------------------------------------------------------");
    console.log("Comptroller:               " + originalcomptrollerAddress);
    console.log("Unitroller:                " + unitrollerContract.address);
    console.log("Oracle:                    " + oracleContract.address);
    console.log("Implementation             " + delegateContract.address);
    console.log("Fed:                       " + fedContract.address);
    console.log("bUSD:                      " + bUSDContract.address);
    console.log("bUSD interestrate model:   " + JumpRateModelContract.address);
    console.log("bdUSD:                     " + bdUSDContract.address);
    console.log("Eth interest rate model:   " + WhitePaperModelContract.address);
    console.log("bdETH:                     " + bdEtherContract.address);
    console.log("USDC interest rate model:  " + USDCJumpRateModelContract.address);
    console.log("bdUSDC:                    " + bdUSDCContract.address);
    console.log("----------------------------------------------------------------------------");
    console.log("----------------------------------------------------------------------------");
}
  
main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });
  