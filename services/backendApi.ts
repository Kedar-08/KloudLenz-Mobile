import { Approval } from "../types/approval";
import { User } from "../types/user";
import { apiClient } from "./apiConfig";
import { getDeviceType } from "./fcmTokenManager";

/**
 * Backend API Service
 * All API calls to the backend server using axios
 *
 * API Endpoints:
 * - POST /auth/login - User authentication
 * - GET /approvals - Get all approvals
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
   * API: POST /auth/login
   * Request: { username: string, password: string }
   * Response: { user: User, token: string }
   */
  login: async (username: string, password: string): Promise<User> => {
    const response = await apiClient.post("/auth/login", {
      username,
      password,
    });

    // Store token if needed
    // await SecureStore.setItemAsync('authToken', response.data.token);

    return response.data.user;
  },

  /**
   * Get all approvals
   * @returns Array of approval objects
   *
   * API: GET /approvals
   * Query params: ?status=pending (optional)
   * Response: { approvals: Approval[] }
   */
  getApprovals: async (): Promise<Approval[]> => {
    const response = await apiClient.get("/approvals");
    return response.data.approvals || response.data;
  },

  /**
   * Get approval by ID
   * @param id - Approval ID
   * @returns Single approval object
   *
   * API: GET /approvals/:id
   * Response: { approval: Approval }
   */
  getApprovalById: async (id: string): Promise<Approval> => {
    const response = await apiClient.get(`/approvals/${id}`);
    return response.data.approval || response.data;
  },

  /**
   * Approve a request
   * @param id - Approval ID
   * @returns Updated approval object
   *
   * API: POST /approvals/:id/approve
   * Request: {} (empty body or { comment: string } optional)
   * Response: { approval: Approval, message: string }
   */
  approveRequest: async (id: string): Promise<Approval> => {
    const response = await apiClient.post(`/approvals/${id}/approve`);
    return response.data.approval || response.data;
  },

  /**
   * Reject a request
   * @param id - Approval ID
   * @param reason - Rejection reason
   * @returns Updated approval object
   *
   * API: POST /approvals/:id/reject
   * Request: { reason: string }
   * Response: { approval: Approval, message: string }
   */
  rejectRequest: async (id: string, reason: string): Promise<Approval> => {
    const response = await apiClient.post(`/approvals/${id}/reject`, {
      reason,
    });
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
