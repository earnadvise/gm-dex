// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

struct Route {
    address from;
    address to;
    bool stable;
    address factory;
}

interface IAerodromeRouter {
    function swapExactETHForTokens(
        uint amountOutMin,
        Route[] calldata routes,
        address to,
        uint deadline
    ) external payable returns (uint[] memory amounts);

    function swapExactTokensForETH(
        uint amountIn,
        uint amountOutMin,
        Route[] calldata routes,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        Route[] calldata routes,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

contract GMDexAerodromeRouter is Ownable {
    using SafeERC20 for IERC20;

    // Aerodrome V2 Router on Base
    address public constant AERO_ROUTER = 0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43;
    
    // Fee in basis points (10 BPS = 0.1%)
    uint256 public feeBps;
    uint256 public constant MAX_FEE_BPS = 100;
    
    // Treasury Address
    address public treasury;

    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 feeAmount,
        uint256 amountOut
    );

    constructor(uint256 _feeBps, address _treasury) Ownable(msg.sender) {
        require(_feeBps <= MAX_FEE_BPS, "Fee exceeds limit");
        require(_treasury != address(0), "Invalid treasury");
        feeBps = _feeBps;
        treasury = _treasury;
    }

    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= MAX_FEE_BPS, "Fee exceeds limit");
        feeBps = _feeBps;
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }

    // 1. Swap ETH -> Tokens on Aerodrome V2 (taking 0.1% ETH fee to Treasury)
    function swapExactETHForTokens(
        uint256 amountOutMin,
        Route[] calldata routes,
        address to,
        uint256 deadline
    ) external payable returns (uint[] memory amounts) {
        uint256 totalInput = msg.value;
        require(totalInput > 0, "Amount must be > 0");

        uint256 feeAmount = (totalInput * feeBps) / 10000;
        uint256 swapAmount = totalInput - feeAmount;

        if (feeAmount > 0) {
            (bool success, ) = payable(treasury).call{value: feeAmount}("");
            require(success, "Treasury fee transfer failed");
        }

        amounts = IAerodromeRouter(AERO_ROUTER).swapExactETHForTokens{value: swapAmount}(
            amountOutMin,
            routes,
            to,
            deadline
        );

        emit SwapExecuted(
            msg.sender,
            routes[0].from,
            routes[routes.length - 1].to,
            totalInput,
            feeAmount,
            amounts[amounts.length - 1]
        );
    }

    // 2. Swap Tokens -> ETH on Aerodrome V2 (taking 0.1% Token fee to Treasury)
    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        Route[] calldata routes,
        address to,
        uint256 deadline
    ) external returns (uint[] memory amounts) {
        require(amountIn > 0, "Amount must be > 0");
        IERC20 token = IERC20(routes[0].from);

        token.safeTransferFrom(msg.sender, address(this), amountIn);

        uint256 feeAmount = (amountIn * feeBps) / 10000;
        uint256 swapAmount = amountIn - feeAmount;

        if (feeAmount > 0) {
            token.safeTransfer(treasury, feeAmount);
        }

        token.safeIncreaseAllowance(AERO_ROUTER, swapAmount);

        amounts = IAerodromeRouter(AERO_ROUTER).swapExactTokensForETH(
            swapAmount,
            amountOutMin,
            routes,
            to,
            deadline
        );

        emit SwapExecuted(
            msg.sender,
            routes[0].from,
            routes[routes.length - 1].to,
            amountIn,
            feeAmount,
            amounts[amounts.length - 1]
        );
    }

    // 3. Swap Tokens -> Tokens on Aerodrome V2 (taking 0.1% Token fee to Treasury)
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        Route[] calldata routes,
        address to,
        uint256 deadline
    ) external returns (uint[] memory amounts) {
        require(amountIn > 0, "Amount must be > 0");
        IERC20 token = IERC20(routes[0].from);

        token.safeTransferFrom(msg.sender, address(this), amountIn);

        uint256 feeAmount = (amountIn * feeBps) / 10000;
        uint256 swapAmount = amountIn - feeAmount;

        if (feeAmount > 0) {
            token.safeTransfer(treasury, feeAmount);
        }

        token.safeIncreaseAllowance(AERO_ROUTER, swapAmount);

        amounts = IAerodromeRouter(AERO_ROUTER).swapExactTokensForTokens(
            swapAmount,
            amountOutMin,
            routes,
            to,
            deadline
        );

        emit SwapExecuted(
            msg.sender,
            routes[0].from,
            routes[routes.length - 1].to,
            amountIn,
            feeAmount,
            amounts[amounts.length - 1]
        );
    }

    receive() external payable {}
}
