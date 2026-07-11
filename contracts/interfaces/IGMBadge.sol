// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IGMBadge {
    function mintBadge(address user, uint256 tokenId) external;
    function hasBadge(address user, uint256 tokenId) external view returns (bool);
}
