import webpush from "web-push";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env.local");

console.log("Generating VAPID keys for push notifications...");

try {
  const vapidKeys = webpush.generateVAPIDKeys();
  
  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  const lines = envContent.split("\n");
  const newLines = [];
  
  const keys = {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: vapidKeys.publicKey,
    VAPID_PRIVATE_KEY: vapidKeys.privateKey,
    NEXT_PUBLIC_GM_STREAK_ADDRESS: "0x0000000000000000000000000000000000000000",
    NEXT_PUBLIC_GM_BADGE_ADDRESS: "0x0000000000000000000000000000000000000000"
  };

  // Keep existing variables, overwrite/add only keys that are not already filled
  for (const [key, val] of Object.entries(keys)) {
    const regex = new RegExp(`^${key}=`);
    const exists = lines.some(line => regex.test(line));
    if (!exists) {
      newLines.push(`${key}=${val}`);
      console.log(`Added ${key} to .env.local`);
    } else {
      console.log(`${key} already exists in .env.local`);
    }
  }

  if (newLines.length > 0) {
    fs.appendFileSync(envPath, "\n" + newLines.join("\n") + "\n", "utf8");
    console.log(".env.local updated successfully!");
  } else {
    console.log(".env.local is already configured.");
  }
} catch (error) {
  console.error("Failed to generate VAPID keys:", error);
  process.exit(1);
}
