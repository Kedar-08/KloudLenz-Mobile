# FCM Token Generation Setup

This document explains how FCM (Firebase Cloud Messaging) token generation is implemented in the KloudLenz Mobile app.

## ✅ Implementation Complete

### What's Included:

1. **FCM Token Service** ([services/fcmTokenService.ts](services/fcmTokenService.ts))
   - Generates native FCM device token on Android
   - Validates device type (physical device only)
   - Handles notification permissions
   - Reusable service with clear error handling

2. **Integration** ([app/(auth)/login.tsx](<app/(auth)/login.tsx>))
   - FCM token generated automatically after successful login
   - Token logged to console for verification
   - Ready to send to backend API

3. **Configuration** ([app.json](app.json))
   - expo-notifications plugin configured
   - google-services.json linked
   - Notification settings configured

---

## 🚀 How It Works

### After Login:

1. User logs in successfully
2. App requests notification permissions
3. FCM token is generated using `Notifications.getDevicePushTokenAsync()`
4. Token is logged to console
5. Token ready to be sent to backend

### Device Requirements:

- ✅ Physical Android device (not emulator)
- ✅ EAS build (not Expo Go)
- ✅ Notification permissions granted
- ✅ google-services.json configured

---

## 📋 Usage

### Automatic (Current Implementation):

Token is generated automatically after login. Check the console/logs:

```
🔔 Generating FCM token...
📱 Requesting notification permissions...
🔑 Generating FCM token...
✅ FCM Token generated successfully
📋 Token: <YOUR_FCM_TOKEN>
```

### Manual Generation:

You can also call the service manually anywhere in your app:

```typescript
import { generateFCMToken } from "../../services/fcmTokenService";

const result = await generateFCMToken();
if (result.success) {
  console.log("FCM Token:", result.token);
  // Send to backend
  await backendApi.registerFCMToken(result.token);
} else {
  console.error("Error:", result.error);
}
```

---

## 🔧 Testing

### Test on Physical Device:

1. Build app with EAS:

   ```bash
   eas build --platform android --profile development
   ```

2. Install APK on your phone

3. Run the app:

   ```bash
   npx expo start --dev-client
   ```

4. Login to the app

5. Check Metro bundler console for FCM token output

### Expected Output:

```
🔔 Generating FCM token...
📱 Requesting notification permissions...
🔑 Generating FCM token...
✅ FCM Token generated successfully
📋 Token: <FCM_TOKEN_STRING>
```

---

## 🔗 Backend Integration

To send the token to your backend, update [app/(auth)/login.tsx](<app/(auth)/login.tsx#L54>):

```typescript
if (fcmResult.success && fcmResult.token) {
  // Send token to backend
  await backendApi.registerFCMToken(fcmResult.token);
}
```

Then add the endpoint in [services/backendApi.ts](services/backendApi.ts):

```typescript
/**
 * Register FCM token for push notifications
 * @param token - FCM device token
 *
 * API: POST /users/fcm-token
 * Request: { token: string }
 */
registerFCMToken: async (token: string): Promise<void> => {
  await apiClient.post("/users/fcm-token", { token });
},
```

---

## 🛠️ API Functions

### Main Function:

```typescript
generateFCMToken(): Promise<FCMTokenResult>
```

- Generates FCM token
- Returns: `{ success: boolean, token?: string, error?: string }`

### Helper Functions:

```typescript
setupNotificationHandler(): void
```

- Configure how notifications are displayed
- Call once at app startup

```typescript
getNotificationPermissionStatus(): Promise<string>
```

- Check current permission status
- Returns: "granted" | "denied" | "undetermined"

---

## ❌ Common Errors & Solutions

### Error: "FCM token can only be generated on a physical Android device"

- **Solution:** Use a real Android phone, not an emulator

### Error: "FCM token requires a standalone build (not Expo Go)"

- **Solution:** Build with EAS and install APK on device

### Error: "Notification permissions denied"

- **Solution:** Grant notification permissions when prompted, or enable in device settings

### Error: "Failed to retrieve FCM token from device"

- **Solution:** Ensure google-services.json is correctly configured

---

## 🔄 Rebuild Required

After making changes to `app.json` or adding the expo-notifications plugin, you need to rebuild:

```bash
eas build --platform android --profile development
```

Then reinstall the new APK on your device.

---

## 📝 Files Modified/Created

- ✅ [services/fcmTokenService.ts](services/fcmTokenService.ts) - FCM token generation service
- ✅ [app/(auth)/login.tsx](<app/(auth)/login.tsx>) - Integrated FCM token generation after login
- ✅ [app.json](app.json) - Added expo-notifications plugin configuration
- ✅ [FCM_SETUP.md](FCM_SETUP.md) - This documentation

---

## 🎯 Next Steps

1. **Rebuild app** with updated configuration
2. **Test** FCM token generation on physical device
3. **Implement backend endpoint** to receive FCM tokens
4. **Update login flow** to send token to backend
5. **Test push notifications** from Firebase Console or backend
