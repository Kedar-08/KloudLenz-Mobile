import { Approval } from "../types/approval";
import { User } from "../types/user";

export const mockApprovals: Approval[] = [
  {
    id: "REQ001",
    userId: "USR001",
    username: "John Davis",
    description: "Temporarily pause service operations and billing cycles.",
    category: "Service suspension",
    suspensionPolicy: "Scheduled Date",
    executionDate: "2026-01-25",
    status: "pending",
    timestamp: "2026-01-19T10:30:00Z",
  },
];

export const mockCurrentUser: User = {
  id: "ADMIN001",
  username: "admin",
  email: "admin@company.com",
  name: "Admin User",
  role: "approver",
};
