// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.1;

import { IERC20 } from "./OpenZeppelinInterfaces.sol";

abstract contract bdToken is IERC20 {
    address public underlying;

    function redeem(uint redeemTokens) virtual external returns (uint);
    function liquidateBorrow(address borrower, uint repayAmount, address cTokenCollateral) virtual external returns (uint);
}

interface Stabilizer {
    function buy(uint amount) external;
    function sell(uint amount) external;
}