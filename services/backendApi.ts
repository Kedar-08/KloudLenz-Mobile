import { Approval } from "../types/approval";
import { User } from "../types/user";
import { API_CONFIG, apiClient } from "./apiConfig";
import { getDeviceType } from "./fcmTokenManager";

/**
 * Backend API Service
 * All API calls to the backend server using axios
 *
 * API Endpoints:
 * - POST /admin/login - User authentication
 * - GET /approval/allDetails - Get all approvals
 * - GET /approvals/:id - Get approval by ID
 * - POST /approvals/:id/approve - Approve a request
 * - POST /approvals/:id/reject - Reject a request
 */

export const backendApi = {
  /**
   * Login user
   * @param username - User's username/email
   * @param password - User's password
   * @returns User object with auth token
   *
   * API: POST /admin/login (full: BASE_URL + /admin/login)
   * Request: { username: string, password: string }
   * Response: { message: string, statusCode: 200, data: { email, firstName, id, lastName }, timestamp }
   */
  login: async (username: string, password: string): Promise<User> => {
    const requestBody = {
      email: username, // Backend expects 'email', not 'username'
      password,
    };

    console.log("📤 Login Request:");
    console.log("   URL:", `${API_CONFIG.BASE_URL}/admin/login`);
    console.log("   Body:", JSON.stringify(requestBody, null, 2));

    const response = await apiClient.post("/admin/login", requestBody);

    // Backend response structure: response.data.data contains user info
    const userData = response.data.data;

    // Transform backend response to User type
    const user: User = {
      id: String(userData.id), // Convert number to string
      username: userData.email.split("@")[0], // Extract username from email
      email: userData.email,
      name: `${userData.firstName} ${userData.lastName}`,
      role: "approver", // Default role
    };

    // Store token if needed
    // await SecureStore.setItemAsync('authToken', response.data.token);

    return user;
  },

  /**
   * Get all approvals
   * @returns Array of approval objects
   *
   * API: GET /approval/allDetails
   * Query params: ?status=pending (optional)
   * Response: { message, statusCode, data: [...], timestamp }
   */
  getApprovals: async (): Promise<Approval[]> => {
    const response = await apiClient.get("/approval/allDetails");

    console.log("📥 Get Approvals Response:");
    console.log("   Status:", response.status);
    console.log("   Data:", JSON.stringify(response.data, null, 2));

    // Backend returns data in response.data.data array
    const approvalsData = response.data.data || [];

    // Transform backend response to Approval type
    return approvalsData.map((item: any) => ({
      id: String(item.id),
      userId: String(item.id), // Using id as userId for now
      username: "System", // Default username
      description: item.reason || "No description",
      category: item.type || "general",
      suspensionPolicy: item.type || "none",
      executionDate: new Date().toISOString(),
      status:
        item.status === "APPROVED" || item.status === "Success"
          ? ("approved" as const)
          : item.status === "PENDING" || item.status === "Pending"
            ? ("pending" as const)
            : item.status === "REJECTED" || item.status === "Rejected"
              ? ("rejected" as const)
              : ("pending" as const),
      timestamp: new Date().toISOString(),
      rejectionReason: item.reason || undefined,
      extraFields: {
        subscriptionNumber:
          item.subscriptionNumber || item.referenceNumber || "",
        rawJson: item.rawJson || null,
      },
    }));
  },

  /**
   * Get approval by ID
   * @param id - Approval ID
   * @returns Single approval object
   *
   * API: GET /approval/getDetails/:id
   * Response: { approval: Approval }
   */
  getApprovalById: async (id: string): Promise<Approval> => {
    console.log("📤 Fetching approval by ID:", id);
    console.log("   URL:", `${API_CONFIG.BASE_URL}/approval/getDetails/${id}`);

    const response = await apiClient.get(`/approval/getDetails/${id}`);

    console.log("📥 getApprovalById response:");
    console.log("   Status:", response.status);
    console.log("   Data:", JSON.stringify(response.data, null, 2));

    const item = response.data.data || response.data.approval || response.data;

    // Extract account number from rawJson
    const accountNumber = item.rawJson?.existingAccountNumber || "";

    // Transform backend response to Approval type (same as getApprovals)
    const approval: Approval = {
      id: String(item.id),
      userId: String(item.id),
      username: accountNumber,
      description: item.reason || "No description",
      category: item.type || "general",
      suspensionPolicy: item.type || "none",
      executionDate: new Date().toISOString(),
      status:
        item.status === "APPROVED" || item.status === "Success"
          ? ("approved" as const)
          : item.status === "PENDING" || item.status === "Pending"
            ? ("pending" as const)
            : item.status === "REJECTED" || item.status === "Rejected"
              ? ("rejected" as const)
              : ("pending" as const),
      timestamp: new Date().toISOString(),
      rejectionReason: item.reason || undefined,
      extraFields: {
        subscriptionNumber:
          item.subscriptionNumber || item.referenceNumber || "",
        rawJson: item.rawJson || null,
      },
    };

    console.log("📥 Transformed approval:", JSON.stringify(approval, null, 2));
    return approval;
  },

  /**
   * Approve a request
   * @param id - Approval ID
   * @returns Updated approval object
   *
   * API: POST /approval/modifyStatus
   * Request: { id: number, reason: null, status: "APPROVED" }
   * Response: { approval: Approval, message: string }
   */
  approveRequest: async (id: string): Promise<Approval> => {
    console.log("📤 Approving request:", id);
    console.log("   URL:", `${API_CONFIG.BASE_URL}/approval/modifyStatus`);

    const response = await apiClient.post("/approval/modifyStatus", {
      id: parseInt(id),
      reason: null,
      status: "APPROVED",
    });

    console.log("📥 Approve response:");
    console.log("   Status:", response.status);
    console.log("   Data:", JSON.stringify(response.data, null, 2));

    return response.data.approval || response.data;
  },

  /**
   * Reject a request
   * @param id - Approval ID
   * @param reason - Rejection reason
   * @returns Updated approval object
   *
   * API: POST /approval/modifyStatus
   * Request: { id: number, reason: string, status: "REJECTED" }
   * Response: { approval: Approval, message: string }
   */
  rejectRequest: async (id: string, reason: string): Promise<Approval> => {
    console.log("📤 Rejecting request:", id);
    console.log("   URL:", `${API_CONFIG.BASE_URL}/approval/modifyStatus`);
    console.log("   Reason:", reason);

    const response = await apiClient.post("/approval/modifyStatus", {
      id: parseInt(id),
      reason: reason,
      status: "REJECTED",
    });

    console.log("📥 Reject response:");
    console.log("   Status:", response.status);
    console.log("   Data:", JSON.stringify(response.data, null, 2));

    return response.data.approval || response.data;
  },

  /**
   * Register FCM device token for push notifications
   * @param userId - User ID
   * @param token - FCM device token
   * @returns Success response
   *
   * API: POST /user/device-token (full: BASE_URL + /user/device-token)
   * Request: { userId: string, token: string, deviceType: "ANDROID" | "IOS" }
   * Response: { message: string, success: boolean }
   */
  registerDeviceToken: async (userId: string, token: string): Promise<void> => {
    const deviceType = getDeviceType();
    const response = await apiClient.post("/user/device-token", {
      userId,
      token,
      deviceType,
    });
    console.log(
      "📤 FCM Device Token registered:",
      response.data.message || "Success",
    );
    console.log("   Device Type:", deviceType);
  },
};
