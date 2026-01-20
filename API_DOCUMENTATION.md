# Backend API Documentation

This document lists all the API endpoints required for the KloudLenz Mobile application.

## Base URL

```
https://api.kloudlenz.com/v1
```

## Configuration

The API mode can be switched between mock and real backend by updating `USE_MOCK` in [services/apiConfig.ts](services/apiConfig.ts):

- `USE_MOCK: true` - Uses local mock data (current)
- `USE_MOCK: false` - Uses real backend APIs

---

## Authentication

### 1. Login

**Endpoint:** `POST /auth/login`

**Description:** Authenticates a user and returns user information with auth token

**Request Body:**

```json
{
  "username": "string", // User's email or username
  "password": "string" // User's password
}
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "name": "string",
    "role": "approver" | "admin"
  },
  "token": "string"  // JWT authentication token
}
```

**Error Responses:**

- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing required fields

---

## Approvals

### 2. Get All Approvals

**Endpoint:** `GET /approvals`

**Description:** Retrieves all approval requests (pending, approved, rejected)

**Query Parameters (Optional):**

- `status` - Filter by status: "pending", "approved", "rejected"
- `limit` - Number of results per page
- `offset` - Pagination offset

**Headers:**

```
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "approvals": [
    {
      "id": "string",
      "userId": "string",
      "username": "string",
      "description": "string",
      "category": "string",
      "suspensionPolicy": "string",
      "executionDate": "string",  // ISO 8601 date
      "status": "pending" | "approved" | "rejected",
      "timestamp": "string",  // ISO 8601 datetime
      "rejectionReason": "string",  // Optional, only if rejected
      "extraFields": {
        // Additional dynamic fields
      }
    }
  ]
}
```

**Error Responses:**

- `401 Unauthorized` - Invalid or missing token
- `500 Internal Server Error` - Server error

---

### 3. Get Approval by ID

**Endpoint:** `GET /approvals/:id`

**Description:** Retrieves a specific approval request by ID

**URL Parameters:**

- `id` - Approval request ID

**Headers:**

```
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "approval": {
    "id": "string",
    "userId": "string",
    "username": "string",
    "description": "string",
    "category": "string",
    "suspensionPolicy": "string",
    "executionDate": "string",
    "status": "pending" | "approved" | "rejected",
    "timestamp": "string",
    "rejectionReason": "string",
    "extraFields": {}
  }
}
```

**Error Responses:**

- `404 Not Found` - Approval not found
- `401 Unauthorized` - Invalid or missing token

---

### 4. Approve Request

**Endpoint:** `POST /approvals/:id/approve`

**Description:** Approves a pending approval request

**URL Parameters:**

- `id` - Approval request ID

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body (Optional):**

```json
{
  "comment": "string" // Optional approval comment
}
```

**Response (200 OK):**

```json
{
  "approval": {
    "id": "string",
    "status": "approved"
    // ... other approval fields
  },
  "message": "Approval successfully approved"
}
```

**Error Responses:**

- `404 Not Found` - Approval not found
- `400 Bad Request` - Approval already processed
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User doesn't have permission to approve

---

### 5. Reject Request

**Endpoint:** `POST /approvals/:id/reject`

**Description:** Rejects a pending approval request with a reason

**URL Parameters:**

- `id` - Approval request ID

**Headers:**

```
Authorization: Bearer {token}
```

**Request Body:**

```json
{
  "reason": "string" // Required - reason for rejection
}
```

**Response (200 OK):**

```json
{
  "approval": {
    "id": "string",
    "status": "rejected",
    "rejectionReason": "string"
    // ... other approval fields
  },
  "message": "Approval successfully rejected"
}
```

**Error Responses:**

- `404 Not Found` - Approval not found
- `400 Bad Request` - Missing reason or approval already processed
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User doesn't have permission to reject

---

## Data Types

### User Type

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: "approver" | "admin";
}
```

### Approval Type

```typescript
interface Approval {
  id: string;
  userId: string;
  username: string;
  description: string;
  category?: string;
  suspensionPolicy: string;
  executionDate: string; // ISO 8601 date
  status: "pending" | "approved" | "rejected";
  timestamp: string; // ISO 8601 datetime
  rejectionReason?: string; // Only present if rejected
  extraFields?: Record<string, string>; // Dynamic fields
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": {
    "code": "string", // Error code
    "message": "string", // Human-readable error message
    "details": {} // Optional additional error details
  }
}
```

---

## Implementation Notes

1. **Authentication:** Store the JWT token from login response securely (use expo-secure-store)
2. **Token Management:** Include the token in Authorization header for all authenticated requests
3. **Error Handling:** All errors are handled by axios interceptors in [services/apiConfig.ts](services/apiConfig.ts)
4. **Network Errors:** The app shows appropriate error messages for network failures
5. **Optimistic Updates:** UI updates optimistically and rolls back on error

---

## Testing

To test with mock data:

1. Keep `USE_MOCK: true` in [services/apiConfig.ts](services/apiConfig.ts)
2. The app will use local mock data from [constants/mockData.ts](constants/mockData.ts)

To test with real backend:

1. Update `BASE_URL` in [services/apiConfig.ts](services/apiConfig.ts) with your actual API URL
2. Set `USE_MOCK: false` in [services/apiConfig.ts](services/apiConfig.ts)
3. Ensure your backend implements all the endpoints listed above

---

## Files Modified/Created

- [services/apiConfig.ts](services/apiConfig.ts) - Axios configuration and interceptors
- [services/backendApi.ts](services/backendApi.ts) - Backend API service with axios
- [services/mockApi.ts](services/mockApi.ts) - Updated to switch between mock and real API
