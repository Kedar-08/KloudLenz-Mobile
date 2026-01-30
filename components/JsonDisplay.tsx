import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface JsonDisplayProps {
  data: Record<string, unknown> | unknown;
  category?: string;
}

interface ParsedApprovalData {
  oldValue?: string;
  newValue?: string;
  referenceNumbers?: string[];
  // Refund-specific fields
  paymentId?: string;
  refundAmount?: string;
  refundType?: string;
  // Terms and Conditions fields
  subscriptionId?: string;
  initialTerm?: string;
  renewalTerm?: string;
  autoRenew?: string;
  // Suspend fields
  suspendSubscriptionId?: string;
  suspensionPolicy?: string;
  // Cancel Subscription fields
  cancelSubscriptionId?: string;
  cancellationPolicy?: string;
}

/**
 * Extracts specific fields from the raw JSON data:
 * - Old Value (from productNames.old)
 * - New Value (from productNames.new)
 * - Reference Numbers from Subscriptions
 * - Refund fields (paymentId, totalAmount, type)
 */
const extractApprovalFields = (
  data: unknown,
  fullData?: unknown,
): ParsedApprovalData | null => {
  if (!data) return null;

  let jsonData: any = data;

  // If data is a string, try to parse it
  if (typeof data === "string") {
    try {
      jsonData = JSON.parse(data);
    } catch {
      return null;
    }
  }

  // If it's not an object, return null
  if (typeof jsonData !== "object" || jsonData === null) {
    return null;
  }

  const result: ParsedApprovalData = {};

  // Extract Refund-specific fields
  // Payment ID comes from referenceNumber (could be in fullData or jsonData)
  const fullDataObj = fullData as Record<string, unknown> | undefined;
  const paymentIdKeys = [
    "referenceNumber",
    "ReferenceNumber",
    "reference_number",
    "paymentKey",
    "PaymentKey",
  ];
  for (const key of paymentIdKeys) {
    // Check fullData first (top-level referenceNumber)
    if (fullDataObj && fullDataObj[key]) {
      result.paymentId = String(fullDataObj[key]);
      break;
    }
    // Then check rawJson
    if (jsonData[key]) {
      result.paymentId = String(jsonData[key]);
      break;
    }
  }

  // Refund Amount from totalAmount in rawJson
  const amountKeys = [
    "totalAmount",
    "TotalAmount",
    "total_amount",
    "amount",
    "Amount",
  ];
  for (const key of amountKeys) {
    if (jsonData[key] !== undefined && jsonData[key] !== null) {
      const amount = Number(jsonData[key]);
      result.refundAmount = isNaN(amount)
        ? String(jsonData[key])
        : `$${amount.toFixed(2)}`;
      break;
    }
  }

  // Refund Type from type in rawJson
  const typeKeys = ["type", "Type", "refundType", "RefundType"];
  for (const key of typeKeys) {
    if (jsonData[key] !== undefined && jsonData[key] !== null) {
      result.refundType = String(jsonData[key]);
      break;
    }
  }

  // Extract Terms and Conditions fields
  // Subscription ID from referenceNumber - check multiple locations
  const refNumKeys = ["referenceNumber", "subscriptionNumber"];
  for (const key of refNumKeys) {
    if (fullDataObj && fullDataObj[key]) {
      result.subscriptionId = String(fullDataObj[key]);
      break;
    }
    if (jsonData && jsonData[key]) {
      result.subscriptionId = String(jsonData[key]);
      break;
    }
  }

  // Terms and Conditions object - check multiple nested locations
  const termsKeys = [
    "termsAndConditions",
    "TermsAndConditions",
    "terms_and_conditions",
  ];
  let termsData: any = null;

  // First check at top level of rawJson
  for (const key of termsKeys) {
    if (jsonData[key] && typeof jsonData[key] === "object") {
      termsData = jsonData[key];
      break;
    }
  }

  // If not found, check inside subscriptions[].orderActions[].termsAndConditions
  if (!termsData) {
    const subscriptionKeys = ["subscriptions", "Subscriptions", "subscription"];
    for (const subKey of subscriptionKeys) {
      if (jsonData[subKey] && Array.isArray(jsonData[subKey])) {
        const subs = jsonData[subKey];
        for (const sub of subs) {
          // Check inside orderActions array
          const orderActions =
            sub.orderActions || sub.OrderActions || sub.order_actions;
          if (orderActions && Array.isArray(orderActions)) {
            for (const action of orderActions) {
              for (const key of termsKeys) {
                if (action[key] && typeof action[key] === "object") {
                  termsData = action[key];
                  break;
                }
              }
              if (termsData) break;
            }
          }
          // Also check directly inside subscription
          if (!termsData) {
            for (const key of termsKeys) {
              if (sub[key] && typeof sub[key] === "object") {
                termsData = sub[key];
                break;
              }
            }
          }
          if (termsData) break;
        }
      }
      if (termsData) break;
    }
  }

  // Extract terms data if found
  if (termsData) {
    // Initial Term from lastTerm
    if (termsData.lastTerm && typeof termsData.lastTerm === "object") {
      const period = termsData.lastTerm.period;
      const periodType = termsData.lastTerm.periodType;
      if (period && periodType) {
        result.initialTerm = `${period} ${periodType}`;
      }
    }

    // Renewal Term from renewalTerms array
    if (
      termsData.renewalTerms &&
      Array.isArray(termsData.renewalTerms) &&
      termsData.renewalTerms.length > 0
    ) {
      const renewalTerm = termsData.renewalTerms[0];
      if (renewalTerm.period && renewalTerm.periodType) {
        result.renewalTerm = `${renewalTerm.period} ${renewalTerm.periodType}`;
      }
    }

    // Auto Renew
    if (termsData.autoRenew !== undefined) {
      result.autoRenew = termsData.autoRenew ? "Yes" : "No";
    }
  }

  // Extract Suspend fields from subscriptions[].orderActions[].suspend
  const suspendSubscriptionKeys = [
    "subscriptions",
    "Subscriptions",
    "subscription",
  ];
  for (const subKey of suspendSubscriptionKeys) {
    if (jsonData[subKey] && Array.isArray(jsonData[subKey])) {
      const subs = jsonData[subKey];
      for (const sub of subs) {
        // Get subscription number for suspend
        const subNum =
          sub.subscriptionNumber ||
          sub.SubscriptionNumber ||
          sub.referenceNumber;
        if (subNum && !result.suspendSubscriptionId) {
          result.suspendSubscriptionId = String(subNum);
        }

        // Check inside orderActions array for suspend data
        const orderActions =
          sub.orderActions || sub.OrderActions || sub.order_actions;
        if (orderActions && Array.isArray(orderActions)) {
          for (const action of orderActions) {
            const suspendData = action.suspend || action.Suspend;
            if (suspendData && typeof suspendData === "object") {
              const policy =
                suspendData.suspendPolicy ||
                suspendData.SuspendPolicy ||
                suspendData.suspend_policy;
              if (policy) {
                result.suspensionPolicy = String(policy);
              }
              break;
            }
          }
        }
        if (result.suspensionPolicy) break;
      }
    }
    if (result.suspensionPolicy) break;
  }

  // Extract Cancel Subscription fields from subscriptions[].orderActions[].cancelSubscription
  for (const subKey of suspendSubscriptionKeys) {
    if (jsonData[subKey] && Array.isArray(jsonData[subKey])) {
      const subs = jsonData[subKey];
      for (const sub of subs) {
        // Get subscription number for cancel
        const subNum =
          sub.subscriptionNumber ||
          sub.SubscriptionNumber ||
          sub.referenceNumber;
        if (subNum && !result.cancelSubscriptionId) {
          result.cancelSubscriptionId = String(subNum);
        }

        // Check inside orderActions array for cancelSubscription data
        const orderActions =
          sub.orderActions || sub.OrderActions || sub.order_actions;
        if (orderActions && Array.isArray(orderActions)) {
          for (const action of orderActions) {
            const cancelData =
              action.cancelSubscription || action.CancelSubscription;
            if (cancelData && typeof cancelData === "object") {
              const policy =
                cancelData.cancellationPolicy ||
                cancelData.CancellationPolicy ||
                cancelData.cancellation_policy;
              if (policy) {
                result.cancellationPolicy = String(policy);
              }
              break;
            }
          }
        }
        if (result.cancellationPolicy) break;
      }
    }
    if (result.cancellationPolicy) break;
  }

  // Extract Product Names (old and new values)
  const productNamesKeys = ["productNames", "ProductNames", "product_names"];
  for (const key of productNamesKeys) {
    if (jsonData[key] && typeof jsonData[key] === "object") {
      const productNames = jsonData[key];
      if (productNames.old !== undefined && productNames.old !== null) {
        result.oldValue = String(productNames.old);
      }
      if (productNames.new !== undefined && productNames.new !== null) {
        result.newValue = String(productNames.new);
      }
      break;
    }
  }

  // Fallback: check for direct oldValue/newValue fields
  if (!result.oldValue) {
    const oldValueKeys = ["oldValue", "OldValue", "old_value", "previousValue"];
    for (const key of oldValueKeys) {
      if (jsonData[key] !== undefined && jsonData[key] !== null) {
        result.oldValue = String(jsonData[key]);
        break;
      }
    }
  }

  if (!result.newValue) {
    const newValueKeys = ["newValue", "NewValue", "new_value", "currentValue"];
    for (const key of newValueKeys) {
      if (jsonData[key] !== undefined && jsonData[key] !== null) {
        result.newValue = String(jsonData[key]);
        break;
      }
    }
  }

  // Extract Reference Numbers from Subscriptions
  const subscriptionKeys = [
    "subscriptions",
    "Subscriptions",
    "subscription",
    "Subscription",
  ];
  for (const key of subscriptionKeys) {
    if (jsonData[key]) {
      const subscriptions = jsonData[key];
      const refNumbers: string[] = [];

      if (Array.isArray(subscriptions)) {
        for (const sub of subscriptions) {
          const refNum = extractReferenceNumber(sub);
          if (refNum) refNumbers.push(refNum);
        }
      } else if (typeof subscriptions === "object") {
        const refNum = extractReferenceNumber(subscriptions);
        if (refNum) refNumbers.push(refNum);
      }

      if (refNumbers.length > 0) {
        result.referenceNumbers = refNumbers;
      }
      break;
    }
  }

  // Return null if no relevant data was extracted
  if (
    !result.oldValue &&
    !result.newValue &&
    !result.referenceNumbers &&
    !result.paymentId &&
    !result.refundAmount &&
    !result.refundType &&
    !result.subscriptionId &&
    !result.initialTerm &&
    !result.renewalTerm &&
    !result.autoRenew &&
    !result.suspendSubscriptionId &&
    !result.suspensionPolicy &&
    !result.cancelSubscriptionId &&
    !result.cancellationPolicy
  ) {
    return null;
  }

  return result;
};

/**
 * Extracts reference number from a subscription object
 */
const extractReferenceNumber = (subscription: any): string | null => {
  if (!subscription || typeof subscription !== "object") return null;

  const refKeys = [
    "referenceNumber",
    "ReferenceNumber",
    "reference_number",
    "refNumber",
    "RefNumber",
    "ref_number",
    "reference",
    "Reference",
    "refNo",
    "RefNo",
  ];

  for (const key of refKeys) {
    if (subscription[key]) {
      return String(subscription[key]);
    }
  }

  return null;
};

/**
 * Component to display a single field row
 */
const FieldRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value}</Text>
  </View>
);

/**
 * JsonDisplay component - displays selected fields from approval data
 * Only shows: Old Value, New Value, Reference Numbers (or Refund fields for Refund category)
 */
export const JsonDisplay: React.FC<JsonDisplayProps> = ({ data, category }) => {
  // Check for rawJson in extraFields
  let rawData = data;
  let fullData = data; // Keep reference to full data for top-level fields
  if (typeof data === "object" && data !== null && "rawJson" in data) {
    rawData = (data as Record<string, unknown>).rawJson;
  }

  const parsedData = extractApprovalFields(rawData, fullData);

  if (!parsedData) {
    return null;
  }

  // Check if this is a refund category
  const isRefund = category?.toLowerCase() === "refund";

  // Determine labels based on category
  const isChangeProduct =
    category?.toLowerCase().includes("changeproduct") ||
    category?.toLowerCase().includes("change product");
  const oldLabel = isChangeProduct ? "Existing Product" : "Old Value";
  const newLabel = isChangeProduct ? "New Product" : "New Value";

  // For Refund category, show refund-specific fields
  if (isRefund) {
    return (
      <View style={styles.container}>
        {parsedData.paymentId && (
          <FieldRow label="Payment ID" value={parsedData.paymentId} />
        )}
        {parsedData.refundAmount && (
          <FieldRow label="Refund Amount" value={parsedData.refundAmount} />
        )}
        {parsedData.refundType && (
          <FieldRow label="Refund Type" value={parsedData.refundType} />
        )}
      </View>
    );
  }

  // Check if this is a Terms and Conditions category
  const isTermsAndConditions =
    category?.toLowerCase().includes("termsandconditions") ||
    category?.toLowerCase().includes("terms and conditions");

  // For Terms and Conditions category, show specific fields
  if (isTermsAndConditions) {
    return (
      <View style={styles.container}>
        {parsedData.subscriptionId && (
          <FieldRow label="Subscription ID" value={parsedData.subscriptionId} />
        )}
        {parsedData.initialTerm && (
          <FieldRow label="Initial Term" value={parsedData.initialTerm} />
        )}
        {parsedData.renewalTerm && (
          <FieldRow label="Renewal Term" value={parsedData.renewalTerm} />
        )}
        {parsedData.autoRenew && (
          <FieldRow label="Auto Renew" value={parsedData.autoRenew} />
        )}
      </View>
    );
  }

  // Check if this is a Suspend category
  const isSuspend = category?.toLowerCase() === "suspend";

  // For Suspend category, show specific fields
  if (isSuspend) {
    return (
      <View style={styles.container}>
        {parsedData.suspendSubscriptionId && (
          <FieldRow
            label="Subscription ID"
            value={parsedData.suspendSubscriptionId}
          />
        )}
        {parsedData.suspensionPolicy && (
          <FieldRow
            label="Suspension Policy"
            value={parsedData.suspensionPolicy}
          />
        )}
      </View>
    );
  }

  // Check if this is a Cancel Subscription category
  const isCancelSubscription =
    category?.toLowerCase().includes("cancelsubscription") ||
    category?.toLowerCase().includes("cancel subscription");

  // For Cancel Subscription category, show specific fields
  if (isCancelSubscription) {
    return (
      <View style={styles.container}>
        {parsedData.cancelSubscriptionId && (
          <FieldRow
            label="Subscription ID"
            value={parsedData.cancelSubscriptionId}
          />
        )}
        {parsedData.cancellationPolicy && (
          <FieldRow
            label="Cancellation Policy"
            value={parsedData.cancellationPolicy}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {parsedData.oldValue !== undefined && (
        <FieldRow label={oldLabel} value={parsedData.oldValue} />
      )}

      {parsedData.newValue !== undefined && (
        <FieldRow label={newLabel} value={parsedData.newValue} />
      )}

      {parsedData.referenceNumbers &&
        parsedData.referenceNumbers.length > 0 &&
        parsedData.referenceNumbers.map((refNum, index) => (
          <FieldRow
            key={index}
            label={
              parsedData.referenceNumbers!.length > 1
                ? `Subscription ID ${index + 1}`
                : "Subscription ID"
            }
            value={refNum}
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  fieldRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  fieldLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  fieldValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flex: 1.5,
    textAlign: "right",
  },
});

export default JsonDisplay;
