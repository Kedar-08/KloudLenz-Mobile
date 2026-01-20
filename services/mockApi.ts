import { mockApprovals, mockCurrentUser } from "../constants/mockData";
import { Approval } from "../types/approval";
import { User } from "../types/user";
import { API_CONFIG } from "./apiConfig";
import { backendApi } from "./backendApi";
import { getDeviceType } from "./fcmTokenManager";

const API_DELAY = 800; // Simulate network delay in ms

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock API Implementation
 *
 * This service acts as a wrapper that can switch between:
 * 1. Mock data (for development/testing)
 * 2. Real backend API (for production)
 *
 * Set API_CONFIG.USE_MOCK = false to use real backend
 * Set API_CONFIG.USE_MOCK = true to use mock data
 */

// Mock implementations
const mockImplementation = {
  login: async (username: string, password: string): Promise<User> => {
    await delay(API_DELAY);
    // Simulate login - accept any username/password
    if (username && password) {
      return mockCurrentUser;
    }
    throw new Error("Invalid credentials");
  },

  getApprovals: async (): Promise<Approval[]> => {
    await delay(API_DELAY);
    // Return all approvals (pending, approved, rejected)
    return mockApprovals;
  },

  getApprovalById: async (id: string): Promise<Approval> => {
    await delay(API_DELAY);
    const approval = mockApprovals.find((a) => a.id === id);
    if (!approval) {
      throw new Error(`Approval ${id} not found`);
    }
    return approval;
  },

  approveRequest: async (id: string): Promise<Approval> => {
    await delay(API_DELAY);
    const approval = mockApprovals.find((a) => a.id === id);
    if (!approval) {
      throw new Error(`Approval ${id} not found`);
    }
    approval.status = "approved";
    console.log(`Approval ${id} approved`);
    return approval;
  },

  rejectRequest: async (id: string, reason: string): Promise<Approval> => {
    await delay(API_DELAY);
    const approval = mockApprovals.find((a) => a.id === id);
    if (!approval) {
      throw new Error(`Approval ${id} not found`);
    }
    approval.status = "rejected";
    approval.rejectionReason = reason;
    console.log(`Approval ${id} rejected with reason: ${reason}`);
    return approval;
  },

  registerDeviceToken: async (userId: string, token: string): Promise<void> => {
    await delay(API_DELAY);
    const deviceType = getDeviceType();
    console.log(`📤 Device Token registered (mock)`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Token: ${token.substring(0, 50)}...`);
    console.log(`   Device Type: ${deviceType}`);
    // Mock: just log the registration, no actual backend call
  },
};

// Export API - switches between mock and real backend based on config
export const mockApi = {
  login: (username: string, password: string): Promise<User> => {
    if (API_CONFIG.USE_MOCK) {
      return mockImplementation.login(username, password);
    }
    return backendApi.login(username, password);
  },

  getApprovals: (): Promise<Approval[]> => {
    if (API_CONFIG.USE_MOCK) {
      return mockImplementation.getApprovals();
    }
    return backendApi.getApprovals();
  },

  getApprovalById: (id: string): Promise<Approval> => {
    if (API_CONFIG.USE_MOCK) {
      return mockImplementation.getApprovalById(id);
    }
    return backendApi.getApprovalById(id);
  },

  approveRequest: (id: string): Promise<Approval> => {
    if (API_CONFIG.USE_MOCK) {
      return mockImplementation.approveRequest(id);
    }
    return backendApi.approveRequest(id);
  },

  rejectRequest: (id: string, reason: string): Promise<Approval> => {
    if (API_CONFIG.USE_MOCK) {
      return mockImplementation.rejectRequest(id, reason);
    }
    return backendApi.rejectRequest(id, reason);
  },

  registerDeviceToken: (userId: string, token: string): Promise<void> => {
    if (API_CONFIG.USE_MOCK) {
      return mockImplementation.registerDeviceToken(userId, token);
    }
    return backendApi.registerDeviceToken(userId, token);
  },
};
