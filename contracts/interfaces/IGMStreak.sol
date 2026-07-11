// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IGMStreak {
    struct Streak {
        uint256 currentStreak;
        uint256 longestStreak;
        uint256 lastGMTime;
        uint256 totalGMs;
        uint256 xp;
    }

    event GMEvent(address indexed user, uint256 currentStreak, uint256 xp, uint256 timestamp);

    function sayGM() external;
    function getStreak(address user) external view returns (uint256, uint256, uint256, uint256, uint256);
}
