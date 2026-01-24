export interface Approval {
  id: string; // Request ID
  userId: string;
  username: string;
  description: string;
  category?: string;
  suspensionPolicy: string;
  executionDate: string;
  status: "pending" | "approved" | "rejected";
  timestamp: string;
  rejectionReason?: string;
  subscriptionNumber?: string;
  // Additional, request-specific fields (temporary per request)
  extraFields?: Record<string, string>;
}
