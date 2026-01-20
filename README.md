# KloudLenz Mobile - Approval Management App

A React Native Expo application for managing and reviewing approval requests. Built with TypeScript and Expo Router for navigation, this app provides a clean UI-first implementation with mock data and simulated APIs.

## About This Project

KloudLenz Mobile is a proof-of-concept approval management system designed for Android devices. The app allows users to:

- Login with mock credentials
- View a list of pending approval requests
- Review detailed approval information
- Approve or reject requests with reasons

This is a **UI-first, mock-only implementation** - no real backend, no real authentication, no real data persistence. Perfect for prototyping and demonstrating user flows.

## Pages & Features

### 1. **Login Screen** (`app/(auth)/login.tsx`)

- Simple username and password input
- Login button with loading state
- Error handling with alerts
- Mock authentication (accepts any credentials)
- Navigates to approval dashboard after login

### 2. **Approval List / Dashboard** (`app/(dashboard)/index.tsx`)

- Displays all pending approval requests
- Each item shows:
  - Customer name
  - Customer ID
  - Approval amount (in currency)
  - Current status (pending/approved/rejected)
  - Request date
  - Description
- Click any approval to view full details
- Loading and error state handling

### 3. **Approval Details** (`app/(dashboard)/[id].tsx`)

- Full approval information organized in sections:
  - **Customer Information**: Name, ID
  - **Request Details**: Amount, status, description
  - **Terms & Conditions**: Credit limit, payment terms, dates
  - **Attachments**: Associated documents
- Two action buttons:
  - **Approve**: Marks request as approved
  - **Reject**: Opens modal to enter rejection reason
- Scrollable layout for all content
- Returns to list after action

### 4. **Reject Modal** (`components/RejectModal.tsx`)

- Modal dialog for rejection reason
- Text input field (required)
- Submit and Cancel buttons
- Submit button disabled until reason is entered
- Closes after submission

## APIs

The app uses a **mock API layer** (`services/mockApi.ts`) with simulated network delays (800ms):

| Function                    | Purpose                         | Returns                      |
| --------------------------- | ------------------------------- | ---------------------------- |
| `login(username, password)` | Authenticate user               | User object                  |
| `getApprovals()`            | Fetch all pending approvals     | Approval[]                   |
| `getApprovalById(id)`       | Fetch specific approval details | Approval                     |
| `approveRequest(id)`        | Mark approval as approved       | Updated Approval             |
| `rejectRequest(id, reason)` | Reject with reason              | Updated Approval with reason |

All API calls include **800ms delay** to simulate real network behavior.

**Mock Data** (`constants/mockData.ts`) includes:

- 5 sample approval requests with varying amounts
- 1 mock user account for login

## Tech Stack

| Category       | Technology      | Version  |
| -------------- | --------------- | -------- |
| **Framework**  | React Native    | 0.81.5   |
| **Platform**   | Expo            | ~54.0.31 |
| **Navigation** | Expo Router     | ~6.0.21  |
| **Language**   | TypeScript      | ~5.9.2   |
| **React**      | React           | 19.1.0   |
| **Status Bar** | expo-status-bar | ~3.0.9   |
| **Constants**  | expo-constants  | ~18.0.13 |
| **Linting**    | ESLint          | ^9.25.0  |

## Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Android emulator or physical device with Expo Go app
- Git (optional)

### Install Dependencies

```bash
cd kloudlenz-mobile
npm install
```

### Run the App

**Option 1: Development Server (Recommended)**

```bash
npm start
```

Then press:

- `a` - Open on Android emulator
- `w` - Open in web browser
- Scan QR code with Expo Go app (physical device)

**Option 2: Direct Android Build**

```bash
npm run android
```

**Available Commands:**

```bash
npm start        # Start development server
npm run android  # Build and run on Android
npm run ios      # Build and run on iOS
npm run web      # Run in web browser
npm run lint     # Run ESLint
```

### Reload During Development

- Press `r` in terminal to reload app
- Changes will appear immediately

## Project Structure

```
kloudlenz-mobile/
│
├── 📁 app/                              # Navigation & Screen Routes
│   ├── _layout.tsx                      # Root navigation layout
│   ├── 📁 (auth)/                       # Authentication group
│   │   ├── _layout.tsx                  # Auth stack layout
│   │   └── login.tsx                    # Login screen
│   └── 📁 (dashboard)/                  # Dashboard group
│       ├── _layout.tsx                  # Dashboard stack layout
│       ├── index.tsx                    # Approval list screen
│       └── [id].tsx                     # Approval details (dynamic route)
│
├── 📁 components/                       # Reusable UI Components
│   ├── ApprovalCard.tsx                 # Approval card for list display
│   └── RejectModal.tsx                  # Modal for rejection reason
│
├── 📁 services/                         # Business Logic Layer
│   └── mockApi.ts                       # Mock API functions
│
├── 📁 constants/                        # Static Data
│   └── mockData.ts                      # Sample approvals & user
│
├── 📁 types/                            # TypeScript Definitions
│   ├── approval.ts                      # Approval interface
│   ├── user.ts                          # User interface
│   └── index.ts                         # Type exports
│
├── 📁 assets/                           # Images, icons, splash screens
│
├── ⚙️ Configuration Files
│   ├── package.json                     # Project dependencies & scripts
│   ├── app.json                         # Expo configuration
│   ├── tsconfig.json                    # TypeScript configuration
│   ├── eslint.config.js                 # ESLint rules
│   └── expo-env.d.ts                    # Expo type definitions
│
└── 📚 Documentation
    └── README.md                        # This file
```

## App Flow

```
Login Screen
    ↓ (any username/password)
Dashboard / Approval List
    ↓ (click approval)
Approval Details
    ↓ (click Approve or Reject)
    ├─→ Approve → Success → Back to List
    └─→ Reject → Modal → Enter Reason → Success → Back to List
```

## Key Features

✅ **Type Safe** - 100% TypeScript coverage  
✅ **Clean Navigation** - File-based Expo Router routing  
✅ **Mock API** - Realistic delays and error handling  
✅ **Responsive UI** - Works on various screen sizes  
✅ **Loading States** - Activity indicators and disabled buttons  
✅ **Error Handling** - Try-catch blocks and user alerts  
✅ **Form Validation** - Required fields enforced  
✅ **Console Logging** - Debugging-friendly logs

## Sample Data

The app includes 5 mock approval requests:

1. **Acme Corporation** - $50,000 (30-day terms)
2. **Tech Innovations Ltd** - $75,000 (45-day terms)
3. **Global Trading Inc** - $125,000 (60-day terms)
4. **Premium Supplies Co** - $35,000 (90-day terms)
5. **Metropolitan Services** - $95,000 (30-day terms)

Each has customer info, description, credit limit, and attachment list.

## Development Notes

- **No Real Authentication**: Any username/password works
- **No Real Backend**: All data is mock
- **No Data Persistence**: Data resets on app reload
- **Safe for Development**: Perfect for UI testing and prototyping

## Testing the App

1. **Open app**: Press `a` in terminal or scan QR code
2. **Login**: Enter any username and password
3. **View approvals**: See list of 5 sample requests
4. **View details**: Click any approval
5. **Approve**: Click Approve button
6. **Reject**: Click Reject, enter reason, submit
7. **Navigate**: Use back button to return to list

## Next Steps

When ready to move forward:

1. **Connect Real Backend**: Replace `mockApi.ts` with real API calls
2. **Add Authentication**: Implement proper login with tokens
3. **State Management**: Add Redux or Context API for global state
4. **Data Persistence**: Add AsyncStorage or database
5. **Deploy**: Build APK and upload to Play Store

---

**Status**: ✅ Complete & Ready to Use  
**Created**: January 19, 2026  
**Version**: 1.0.0
