/**
 * Test Push Notification Script
 *
 * This script sends a test FCM notification to your device
 *
 * Prerequisites:
 * 1. Get your Service Account JSON key from Firebase Console:
 *    - Go to Project Settings > Service Accounts
 *    - Click "Generate new private key"
 *    - Save as service-account.json in this directory
 *
 * 2. Install dependencies:
 *    npm install googleapis
 *
 * 3. Get your FCM token from app logs and paste below
 *
 * 4. Run:
 *    node test-notification.js
 */

const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================

// Your FCM device token (from app console logs)
const FCM_TOKEN = "PASTE_YOUR_FCM_TOKEN_HERE";

// Your Firebase project ID (from Firebase Console > Project Settings)
const PROJECT_ID = "PASTE_YOUR_PROJECT_ID_HERE";

// ============================================

const SERVICE_ACCOUNT_PATH = path.join(__dirname, "service-account.json");

/**
 * Get OAuth2 access token using service account
 */
async function getAccessToken() {
  try {
    const serviceAccount = JSON.parse(
      fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"),
    );

    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ["https://www.googleapis.com/auth/firebase.messaging"],
      null,
    );

    const tokens = await jwtClient.authorize();
    return tokens.access_token;
  } catch (error) {
    console.error("❌ Error getting access token:", error.message);
    if (error.message.includes("ENOENT")) {
      console.error(
        "\n📝 Please download service-account.json from Firebase Console:",
      );
      console.error("   1. Go to Project Settings > Service Accounts");
      console.error('   2. Click "Generate new private key"');
      console.error("   3. Save as service-account.json in this directory\n");
    }
    process.exit(1);
  }
}

/**
 * Send FCM notification using V1 API
 */
async function sendTestNotification() {
  console.log("🚀 Sending test notification...\n");

  // Validate configuration
  if (FCM_TOKEN === "PASTE_YOUR_FCM_TOKEN_HERE") {
    console.error(
      "❌ Please update FCM_TOKEN in the script with your actual token",
    );
    console.error(
      '   Get it from app console logs: "📋 Token: <YOUR_TOKEN>"\n',
    );
    process.exit(1);
  }

  if (PROJECT_ID === "PASTE_YOUR_PROJECT_ID_HERE") {
    console.error("❌ Please update PROJECT_ID in the script");
    console.error("   Get it from Firebase Console > Project Settings\n");
    process.exit(1);
  }

  try {
    // Get access token
    const accessToken = await getAccessToken();
    console.log("✅ Access token obtained\n");

    // Prepare notification payload (FCM V1 format)
    const message = {
      message: {
        token: FCM_TOKEN,
        notification: {
          title: "Test Notification",
          body: "This is a test notification from your backend!",
        },
        data: {
          approvalId: "123",
          type: "test",
          timestamp: new Date().toISOString(),
        },
        android: {
          priority: "high",
          notification: {
            sound: "default",
            channelId: "default",
          },
        },
      },
    };

    // Send notification using FCM V1 API
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      },
    );

    const result = await response.json();

    if (response.ok) {
      console.log("✅ Notification sent successfully!\n");
      console.log("📱 Check your phone for the notification\n");
      console.log("Response:", JSON.stringify(result, null, 2));
    } else {
      console.error("❌ Failed to send notification\n");
      console.error("Status:", response.status);
      console.error("Error:", JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error("❌ Error sending notification:", error.message);
    process.exit(1);
  }
}

// Run the script
sendTestNotification();
