// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IGMBadge.sol";
import "./interfaces/IGMStreak.sol";

contract GMStreak is Ownable, ReentrancyGuard, IGMStreak {
    // Reference to the GMBadge contract
    IGMBadge public gmBadgeContract;

    // Mapping of user addresses to their Streak data
    mapping(address => Streak) public userStreaks;

    // Track the total number of unique users who have said GM
    uint256 public totalUsers;
    mapping(address => bool) private _hasUserRegistered;

    // Leaderboard tracking: store top 10 onchain
    address[10] public topUsers;

    constructor(address _gmBadge) Ownable(msg.sender) {
        gmBadgeContract = IGMBadge(_gmBadge);
    }

    function setGMBadgeContract(address _gmBadge) external onlyOwner {
        gmBadgeContract = IGMBadge(_gmBadge);
    }

    /**
     * @dev Says GM to increment the streak and claim XP. Can only be called once every 23 hours.
     */
    function sayGM() external override nonReentrant {
        Streak storage streak = userStreaks[msg.sender];
        uint256 currentTime = block.timestamp;

        // Check 23-hour cooldown
        require(currentTime >= streak.lastGMTime + 23 hours, "GM: Cooldown active (23 hours)");

        if (!_hasUserRegistered[msg.sender]) {
            _hasUserRegistered[msg.sender] = true;
            totalUsers++;
        }

        uint256 newStreak = 1;
        // Streak maintenance: if within 48 hours, increment; otherwise it resets to 1 (broken streak)
        if (streak.lastGMTime > 0 && currentTime <= streak.lastGMTime + 48 hours) {
            newStreak = streak.currentStreak + 1;
        }

        // Calculate XP: 10 base XP + streak bonus (5 XP per streak day, capped at 100 extra XP)
        uint256 streakBonus = (newStreak * 5) > 100 ? 100 : (newStreak * 5);
        uint256 xpAwarded = 10 + streakBonus;

        // Update user state
        streak.currentStreak = newStreak;
        if (newStreak > streak.longestStreak) {
            streak.longestStreak = newStreak;
        }
        streak.lastGMTime = currentTime;
        streak.totalGMs += 1;
        streak.xp += xpAwarded;

        emit GMEvent(msg.sender, newStreak, streak.xp, currentTime);

        // Check and mint badges based on current streak milestones
        _checkAndMintBadges(msg.sender, newStreak);

        // Update leaderboard
        _updateLeaderboard(msg.sender);
    }

    /**
     * @dev Helper to query user streak details in one RPC call
     */
    function getStreak(address user) external view override returns (
        uint256 currentStreak,
        uint256 longestStreak,
        uint256 lastGMTime,
        uint256 totalGMs,
        uint256 xp
    ) {
        Streak memory streak = userStreaks[user];
        return (
            streak.currentStreak,
            streak.longestStreak,
            streak.lastGMTime,
            streak.totalGMs,
            streak.xp
        );
    }

    /**
     * @dev Mint badges automatically at 7, 30, 100, 365 day milestones
     */
    function _checkAndMintBadges(address user, uint256 streakDays) internal {
        if (address(gmBadgeContract) == address(0)) return;

        if (streakDays >= 365) {
            _safeMint(user, 3);
        } else if (streakDays >= 100) {
            _safeMint(user, 2);
        } else if (streakDays >= 30) {
            _safeMint(user, 1);
        } else if (streakDays >= 7) {
            _safeMint(user, 0);
        }
    }

    function _safeMint(address user, uint256 badgeId) internal {
        try gmBadgeContract.hasBadge(user, badgeId) returns (bool hasIt) {
            if (!hasIt) {
                try gmBadgeContract.mintBadge(user, badgeId) {} catch {}
            }
        } catch {}
    }

    /**
     * @dev Update the top 10 on-chain leaderboard
     */
    function _updateLeaderboard(address user) internal {
        uint256 userXP = userStreaks[user].xp;
        
        // Check if user is already on the board
        int256 userIndex = -1;
        for (uint256 i = 0; i < 10; i++) {
            if (topUsers[i] == user) {
                userIndex = int256(i);
                break;
            }
        }

        if (userIndex != -1) {
            // Sort starting from user's current index up to top
            uint256 idx = uint256(userIndex);
            while (idx > 0 && userStreaks[topUsers[idx - 1]].xp < userXP) {
                topUsers[idx] = topUsers[idx - 1];
                topUsers[idx - 1] = user;
                idx--;
            }
        } else {
            // Check if user qualifies to enter the leaderboard (has more XP than the last spot)
            address lastUser = topUsers[9];
            uint256 lastXP = lastUser == address(0) ? 0 : userStreaks[lastUser].xp;

            if (userXP > lastXP) {
                topUsers[9] = user;
                
                // Bubble up
                uint256 idx = 9;
                while (idx > 0 && (topUsers[idx - 1] == address(0) || userStreaks[topUsers[idx - 1]].xp < userXP)) {
                    topUsers[idx] = topUsers[idx - 1];
                    topUsers[idx - 1] = user;
                    idx--;
                }
            }
        }
    }

    /**
     * @dev Return the top users leaderboard
     */
    function getLeaderboard() external view returns (address[10] memory) {
        return topUsers;
    }
}
