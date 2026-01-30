/**
 * Centralized Modal Components
 *
 * This module exports all modal components for use across the application.
 * Import modals from this index file for cleaner imports.
 *
 * @example
 * import { RejectReasonModal, ConfirmationModal, AlertModal } from '../../modals';
 */

// Base modal component (for creating custom modals)
export { BaseModal } from "./BaseModal";
export type { BaseModalProps } from "./BaseModal";

// Confirmation modal (auto-dismiss, no buttons)
export { ConfirmationModal } from "./ConfirmationModal";
export type { ConfirmationModalProps } from "./ConfirmationModal";

// Reject reason modal (text input with submit/cancel)
export { RejectReasonModal } from "./RejectReasonModal";
export type { RejectReasonModalProps } from "./RejectReasonModal";

// Alert modal (configurable alert/confirmation dialog)
export { AlertModal } from "./AlertModal";
export type { AlertModalProps } from "./AlertModal";
