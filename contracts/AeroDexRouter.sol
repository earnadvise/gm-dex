// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

struct Route {
    address from;
    address to;
    bool stable;
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

contract AeroDexRouter is Ownable {
    using SafeERC20 for IERC20;

    // Aerodrome Router on Base
    address public constant AERODROME_ROUTER = 0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43;
    
    // Fee in basis points (e.g. 10 BPS = 0.1%, 30 BPS = 0.3%)
    uint256 public feeBps;
    
    // Maximum fee limit to protect users (100 BPS = 1%)
    uint256 public constant MAX_FEE_BPS = 100;
    
    // Address where collected fees are sent
    address public treasury;

    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 feeAmount,
        uint256 amountOut
    );
    event FeeUpdated(uint256 newFeeBps);
    event TreasuryUpdated(address indexed newTreasury);

    constructor(uint256 _feeBps, address _treasury) Ownable(msg.sender) {
        require(_feeBps <= MAX_FEE_BPS, "Fee exceeds limit");
        require(_treasury != address(0), "Invalid treasury address");
        feeBps = _feeBps;
        treasury = _treasury;
    }

    // Set swap fee rate (only owner)
    function setFeeBps(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= MAX_FEE_BPS, "Fee exceeds limit");
        feeBps = _feeBps;
        emit FeeUpdated(_feeBps);
    }

    // Set treasury address (only owner)
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    // 1. Swap native ETH for Tokens (taking native ETH fee)
    function swapExactETHForTokens(
        uint256 amountOutMin,
        Route[] calldata routes,
        address to,
        uint256 deadline
    ) external payable returns (uint[] memory amounts) {
        uint256 totalInput = msg.value;
        require(totalInput > 0, "Amount must be greater than 0");

        uint256 feeAmount = (totalInput * feeBps) / 10000;
        uint256 swapAmount = totalInput - feeAmount;

        // Send fee to treasury
        if (feeAmount > 0) {
            (bool success, ) = payable(treasury).call{value: feeAmount}("");
            require(success, "Treasury fee transfer failed");
        }

        // Execute Swap via Aerodrome Router
        amounts = IAerodromeRouter(AERODROME_ROUTER).swapExactETHForTokens{value: swapAmount}(
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

    // 2. Swap Tokens for native ETH (taking token fee)
    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        Route[] calldata routes,
        address to,
        uint256 deadline
    ) external returns (uint[] memory amounts) {
        require(amountIn > 0, "Amount must be greater than 0");
        IERC20 token = IERC20(routes[0].from);

        // Pull tokens from user
        token.safeTransferFrom(msg.sender, address(this), amountIn);

        uint256 feeAmount = (amountIn * feeBps) / 10000;
        uint256 swapAmount = amountIn - feeAmount;

        // Transfer fee to treasury
        if (feeAmount > 0) {
            token.safeTransfer(treasury, feeAmount);
        }

        // Approve Aerodrome Router
        token.safeIncreaseAllowance(AERODROME_ROUTER, swapAmount);

        // Execute Swap via Aerodrome Router
        amounts = IAerodromeRouter(AERODROME_ROUTER).swapExactTokensForETH(
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

    // 3. Swap Tokens for Tokens (taking input token fee)
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        Route[] calldata routes,
        address to,
        uint256 deadline
    ) external returns (uint[] memory amounts) {
        require(amountIn > 0, "Amount must be greater than 0");
        IERC20 token = IERC20(routes[0].from);

        // Pull tokens from user
        token.safeTransferFrom(msg.sender, address(this), amountIn);

        uint256 feeAmount = (amountIn * feeBps) / 10000;
        uint256 swapAmount = amountIn - feeAmount;

        // Transfer fee to treasury
        if (feeAmount > 0) {
            token.safeTransfer(treasury, feeAmount);
        }

        // Approve Aerodrome Router
        token.safeIncreaseAllowance(AERODROME_ROUTER, swapAmount);

        // Execute Swap via Aerodrome Router
        amounts = IAerodromeRouter(AERODROME_ROUTER).swapExactTokensForTokens(
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

    // Rescue any ERC20 tokens stuck in the contract (only owner)
    function rescueERC20(address tokenAddress) external onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens to rescue");
        token.safeTransfer(msg.sender, balance);
    }

    // Rescue any native ETH stuck in the contract (only owner)
    function rescueETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to rescue");
        (bool success, ) = payable(msg.sender).call{value: balance}("");
        require(success, "ETH rescue failed");
    }

    // Receive function to accept ETH
    receive() external payable {}
}
