import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs.js";

describe("GMStreak & GMBadge System", function () {
  async function deployFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // 1. Deploy GMBadge
    const GMBadge = await ethers.getContractFactory("GMBadge");
    const gmBadge = await GMBadge.deploy();

    // 2. Deploy GMStreak
    const GMStreak = await ethers.getContractFactory("GMStreak");
    const gmStreak = await GMStreak.deploy(await gmBadge.getAddress());

    // 3. Configure GMStreak in GMBadge
    await gmBadge.setGMStreakContract(await gmStreak.getAddress());

    return { gmBadge, gmStreak, owner, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set the correct owners", async function () {
      const { gmBadge, gmStreak, owner } = await deployFixture();
      expect(await gmBadge.owner()).to.equal(owner.address);
      expect(await gmStreak.owner()).to.equal(owner.address);
    });

    it("Should link contracts correctly", async function () {
      const { gmBadge, gmStreak } = await deployFixture();
      expect(await gmBadge.gmStreakContract()).to.equal(await gmStreak.getAddress());
      expect(await gmStreak.gmBadgeContract()).to.equal(await gmBadge.getAddress());
    });
  });

  describe("GM Streak & XP Mechanics", function () {
    it("Should allow a user to say GM for the first time", async function () {
      const { gmStreak, user1 } = await deployFixture();

      await expect(gmStreak.connect(user1).sayGM())
        .to.emit(gmStreak, "GMEvent")
        .withArgs(user1.address, 1, 15, anyValue); // streak=1, xp = 10 + min(1*5, 100) = 15

      const [currentStreak, longestStreak, lastGMTime, totalGMs, xp] = 
        await gmStreak.getStreak(user1.address);

      expect(currentStreak).to.equal(1);
      expect(longestStreak).to.equal(1);
      expect(totalGMs).to.equal(1);
      expect(xp).to.equal(15);
      expect(lastGMTime).to.be.gt(0);
    });

    it("Should prevent saying GM again before 23 hours pass", async function () {
      const { gmStreak, user1 } = await deployFixture();

      await gmStreak.connect(user1).sayGM();

      // Try saying GM immediately again
      await expect(gmStreak.connect(user1).sayGM())
        .to.be.revertedWith("GM: Cooldown active (23 hours)");

      // Increase time by 22 hours
      await time.increase(22 * 60 * 60);
      await expect(gmStreak.connect(user1).sayGM())
        .to.be.revertedWith("GM: Cooldown active (23 hours)");
    });

    it("Should allow saying GM after 23 hours and increment streak", async function () {
      const { gmStreak, user1 } = await deployFixture();

      await gmStreak.connect(user1).sayGM();

      // Increase time by 24 hours
      await time.increase(24 * 60 * 60);

      await expect(gmStreak.connect(user1).sayGM())
        .to.emit(gmStreak, "GMEvent")
        .withArgs(user1.address, 2, 35, anyValue); // newStreak=2, newXP = 15 + (10 + 2*5) = 15 + 20 = 35

      const [currentStreak, longestStreak] = await gmStreak.getStreak(user1.address);
      expect(currentStreak).to.equal(2);
      expect(longestStreak).to.equal(2);
    });

    it("Should reset streak to 1 if user waits longer than 48 hours", async function () {
      const { gmStreak, user1 } = await deployFixture();

      await gmStreak.connect(user1).sayGM(); // Day 1: streak=1

      await time.increase(24 * 60 * 60);
      await gmStreak.connect(user1).sayGM(); // Day 2: streak=2

      // Wait 49 hours (streak broken!)
      await time.increase(49 * 60 * 60);

      await expect(gmStreak.connect(user1).sayGM())
        .to.emit(gmStreak, "GMEvent")
        .withArgs(user1.address, 1, 50, anyValue); // resets streak to 1, newXP = 35 + (10 + 1*5) = 35 + 15 = 50

      const [currentStreak, longestStreak] = await gmStreak.getStreak(user1.address);
      expect(currentStreak).to.equal(1);
      expect(longestStreak).to.equal(2); // longest streak remains 2
    });
  });

  describe("GMBadge & Soulbound rules", function () {
    it("Should auto-mint Bronze Badge at 7 day streak", async function () {
      const { gmBadge, gmStreak, user1 } = await deployFixture();

      // Say GM 7 times with 24 hours increments
      for (let i = 0; i < 7; i++) {
        await gmStreak.connect(user1).sayGM();
        await time.increase(24 * 60 * 60);
      }

      // Check if user has Bronze Badge (ID 0)
      expect(await gmBadge.hasBadge(user1.address, 0)).to.be.true;
      expect(await gmBadge.hasBadge(user1.address, 1)).to.be.false;

      // Check uri output (on-chain JSON metadata)
      const tokenUri = await gmBadge.uri(0);
      expect(tokenUri).to.include("data:application/json;base64,");
    });

    it("Should enforce Soulbound transfer restrictions", async function () {
      const { gmBadge, gmStreak, user1, user2 } = await deployFixture();

      // Get user1 a badge
      for (let i = 0; i < 7; i++) {
        await gmStreak.connect(user1).sayGM();
        await time.increase(24 * 60 * 60);
      }

      expect(await gmBadge.balanceOf(user1.address, 0)).to.equal(1);

      // Attempt to transfer badge to user2
      await expect(
        gmBadge.connect(user1).safeTransferFrom(user1.address, user2.address, 0, 1, "0x")
      ).to.be.revertedWith("Soulbound: Badges are non-transferable");
    });
  });

  describe("Leaderboard", function () {
    it("Should correctly track top users onchain", async function () {
      const { gmStreak, user1, user2 } = await deployFixture();

      // User 1 says GM
      await gmStreak.connect(user1).sayGM(); // XP = 15

      let leaderboard = await gmStreak.getLeaderboard();
      expect(leaderboard[0]).to.equal(user1.address);

      // User 2 says GM twice to get more XP
      await gmStreak.connect(user2).sayGM(); // XP = 15
      await time.increase(24 * 60 * 60);
      await gmStreak.connect(user2).sayGM(); // XP = 35

      leaderboard = await gmStreak.getLeaderboard();
      expect(leaderboard[0]).to.equal(user2.address);
      expect(leaderboard[1]).to.equal(user1.address);
    });
  });
});
