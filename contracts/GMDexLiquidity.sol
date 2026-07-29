// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IUniswapV2Router02 {
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);

    function addLiquidityETH(
        address token,
        uint amountTokenDesired,
        uint amountTokenMin,
        uint amountETHMin,
        address to,
        uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);
}

contract GMDexLiquidity is Ownable {
    using SafeERC20 for IERC20;

    // Uniswap V2 Router on Base
    address public constant UNISWAP_V2_ROUTER = 0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24;
    
    // Fee in basis points (e.g. 10 BPS = 0.1%, 30 BPS = 0.3%)
    uint256 public feeBps;
    
    // Maximum fee limit to protect users (100 BPS = 1%)
    uint256 public constant MAX_FEE_BPS = 100;
    
    // Address where collected fees are sent
    address public treasury;

    event FeeUpdated(uint256 newFeeBps);
    event TreasuryUpdated(address indexed newTreasury);

    constructor(uint256 _feeBps, address _treasury) Ownable(msg.sender) {
        require(_feeBps <= MAX_FEE_BPS, "Fee exceeds limit");
        require(_treasury != address(0), "Invalid treasury address");
        feeBps = _feeBps;
        treasury = _treasury;
    }

    // Set fee rate (only owner)
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

    // Add Liquidity Token/Token (taking fee on both tokens)
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        // Pull tokens from user
        IERC20(tokenA).safeTransferFrom(msg.sender, address(this), amountADesired);
        IERC20(tokenB).safeTransferFrom(msg.sender, address(this), amountBDesired);

        // Send fees to treasury (calculating inline)
        if ((amountADesired * feeBps) / 10000 > 0) {
            IERC20(tokenA).safeTransfer(treasury, (amountADesired * feeBps) / 10000);
        }
        if ((amountBDesired * feeBps) / 10000 > 0) {
            IERC20(tokenB).safeTransfer(treasury, (amountBDesired * feeBps) / 10000);
        }

        // Approve Uniswap Router (calculating inline)
        IERC20(tokenA).safeIncreaseAllowance(UNISWAP_V2_ROUTER, amountADesired - ((amountADesired * feeBps) / 10000));
        IERC20(tokenB).safeIncreaseAllowance(UNISWAP_V2_ROUTER, amountBDesired - ((amountBDesired * feeBps) / 10000));

        // Execute Add Liquidity
        (amountA, amountB, liquidity) = IUniswapV2Router02(UNISWAP_V2_ROUTER).addLiquidity(
            tokenA,
            tokenB,
            amountADesired - ((amountADesired * feeBps) / 10000),
            amountBDesired - ((amountBDesired * feeBps) / 10000),
            amountAMin,
            amountBMin,
            to,
            deadline
        );

        // Transfer leftover tokens back to user (calculating inline)
        if ((amountADesired - ((amountADesired * feeBps) / 10000)) - amountA > 0) {
            IERC20(tokenA).safeTransfer(msg.sender, (amountADesired - ((amountADesired * feeBps) / 10000)) - amountA);
        }
        if ((amountBDesired - ((amountBDesired * feeBps) / 10000)) - amountB > 0) {
            IERC20(tokenB).safeTransfer(msg.sender, (amountBDesired - ((amountBDesired * feeBps) / 10000)) - amountB);
        }
    }

    // Add Liquidity Token/ETH (taking fee on token and ETH)
    function addLiquidityETH(
        address token,
        uint256 amountTokenDesired,
        uint256 amountTokenMin,
        uint256 amountETHMin,
        address to,
        uint256 deadline
    ) external payable returns (uint256 amountToken, uint256 amountETH, uint256 liquidity) {
        // Pull token from user
        IERC20(token).safeTransferFrom(msg.sender, address(this), amountTokenDesired);

        // Send fees to treasury (calculating inline)
        if ((amountTokenDesired * feeBps) / 10000 > 0) {
            IERC20(token).safeTransfer(treasury, (amountTokenDesired * feeBps) / 10000);
        }
        if ((msg.value * feeBps) / 10000 > 0) {
            (bool success, ) = payable(treasury).call{value: (msg.value * feeBps) / 10000}("");
            require(success, "Treasury fee transfer failed");
        }

        // Approve Uniswap Router (calculating inline)
        IERC20(token).safeIncreaseAllowance(UNISWAP_V2_ROUTER, amountTokenDesired - ((amountTokenDesired * feeBps) / 10000));

        // Execute Add Liquidity ETH
        (amountToken, amountETH, liquidity) = IUniswapV2Router02(UNISWAP_V2_ROUTER).addLiquidityETH{
            value: msg.value - ((msg.value * feeBps) / 10000)
        }(
            token,
            amountTokenDesired - ((amountTokenDesired * feeBps) / 10000),
            amountTokenMin,
            amountETHMin,
            to,
            deadline
        );

        // Transfer leftover token and ETH back to user (calculating inline)
        if ((amountTokenDesired - ((amountTokenDesired * feeBps) / 10000)) - amountToken > 0) {
            IERC20(token).safeTransfer(msg.sender, (amountTokenDesired - ((amountTokenDesired * feeBps) / 10000)) - amountToken);
        }
        if ((msg.value - ((msg.value * feeBps) / 10000)) - amountETH > 0) {
            (bool success, ) = payable(msg.sender).call{value: (msg.value - ((msg.value * feeBps) / 10000)) - amountETH}("");
            require(success, "Leftover ETH return failed");
        }
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
