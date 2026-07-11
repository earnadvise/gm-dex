// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./interfaces/IGMBadge.sol";

contract GMBadge is ERC1155, Ownable, IGMBadge {
    using Strings for uint256;

    // Badge types
    uint256 public constant BRONZE_STREAK = 0; // 7 days
    uint256 public constant SILVER_STREAK = 1; // 30 days
    uint256 public constant GOLD_STREAK = 2;   // 100 days
    uint256 public constant DIAMOND_STREAK = 3;// 365 days

    // Authorized GMStreak contract address
    address public gmStreakContract;

    // Names of the badges
    string[4] private _badgeNames = [
        "GM Bronze Streak (7 Days)",
        "GM Silver Streak (30 Days)",
        "GM Gold Streak (100 Days)",
        "GM Diamond Streak (365 Days)"
    ];

    // Colors for the badges
    string[4] private _badgeColors = [
        "#CD7F32", // Bronze
        "#C0C0C0", // Silver
        "#FFD700", // Gold
        "#E0F7FA"  // Diamond (Cyan Glow)
    ];

    modifier onlyGMStreak() {
        require(msg.sender == gmStreakContract, "Only GMStreak contract can call");
        _;
    }

    constructor() ERC1155("") Ownable(msg.sender) {}

    function setGMStreakContract(address _gmStreak) external onlyOwner {
        gmStreakContract = _gmStreak;
    }

    function mintBadge(address user, uint256 tokenId) external override onlyGMStreak {
        require(tokenId <= DIAMOND_STREAK, "Invalid badge ID");
        require(balanceOf(user, tokenId) == 0, "Badge already minted");
        _mint(user, tokenId, 1, "");
    }

    function hasBadge(address user, uint256 tokenId) external view override returns (bool) {
        return balanceOf(user, tokenId) > 0;
    }

    // Overrides to make badges Soulbound (non-transferable)
    function safeTransferFrom(
        address /*from*/,
        address /*to*/,
        uint256 /*id*/,
        uint256 /*value*/,
        bytes memory /*data*/
    ) public override pure {
        revert("Soulbound: Badges are non-transferable");
    }

    function safeBatchTransferFrom(
        address /*from*/,
        address /*to*/,
        uint256[] memory /*ids*/,
        uint256[] memory /*values*/,
        bytes memory /*data*/
    ) public override pure {
        revert("Soulbound: Badges are non-transferable");
    }

    // Fully on-chain metadata URI generation
    function uri(uint256 id) public view override returns (string memory) {
        require(id <= DIAMOND_STREAK, "Invalid badge ID");

        string memory name = _badgeNames[id];
        string memory color = _badgeColors[id];
        string memory streakDays;

        if (id == BRONZE_STREAK) streakDays = "7";
        else if (id == SILVER_STREAK) streakDays = "30";
        else if (id == GOLD_STREAK) streakDays = "100";
        else streakDays = "365";

        string memory svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">',
                '<defs>',
                '<radialGradient id="glow" cx="50%" cy="50%" r="50%">',
                '<stop offset="0%" stop-color="', color, '" stop-opacity="0.3"/>',
                '<stop offset="100%" stop-color="#000000" stop-opacity="0"/>',
                '</radialGradient>',
                '<linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.6"/>',
                '<stop offset="50%" stop-color="', color, '"/>',
                '<stop offset="100%" stop-color="#000000" stop-opacity="0.8"/>',
                '</linearGradient>',
                '</defs>',
                '<rect width="100%" height="100%" fill="#0A0B10"/>',
                '<circle cx="200" cy="200" r="180" fill="url(#glow)"/>',
                '<circle cx="200" cy="200" r="120" fill="none" stroke="url(#metal)" stroke-width="8"/>',
                '<text x="200" y="160" font-family="System-UI, sans-serif" font-size="64" font-weight="900" fill="', color, '" text-anchor="middle">GM</text>',
                '<text x="200" y="220" font-family="System-UI, sans-serif" font-size="20" font-weight="bold" fill="#A0A5B5" text-anchor="middle">STREAK</text>',
                '<text x="200" y="260" font-family="System-UI, sans-serif" font-size="32" font-weight="900" fill="#FFFFFF" text-anchor="middle">', streakDays, ' DAYS</text>',
                '<circle cx="200" cy="200" r="135" fill="none" stroke="#252835" stroke-dasharray="10 15" stroke-width="2"/>',
                '</svg>'
            )
        );

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "', name, '", ',
                        '"description": "Awarded for keeping a ', streakDays, '-day GM streak on GM DEX.", ',
                        '"image": "data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '"}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }
}
