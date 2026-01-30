import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface JsonDisplayProps {
  data: Record<string, unknown> | unknown;
}

interface ParsedApprovalData {
  oldValue?: string;
  newValue?: string;
  referenceNumbers?: string[];
}

/**
 * Extracts specific fields from the raw JSON data:
 * - Old Value (from productNames.old)
 * - New Value (from productNames.new)
 * - Reference Numbers from Subscriptions
 */
const extractApprovalFields = (data: unknown): ParsedApprovalData | null => {
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
  if (!result.oldValue && !result.newValue && !result.referenceNumbers) {
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
 * Only shows: Old Value, New Value, Reference Numbers
 */
export const JsonDisplay: React.FC<JsonDisplayProps> = ({ data }) => {
  // Check for rawJson in extraFields
  let rawData = data;
  if (typeof data === "object" && data !== null && "rawJson" in data) {
    rawData = (data as Record<string, unknown>).rawJson;
  }

  const parsedData = extractApprovalFields(rawData);

  if (!parsedData) {
    return null;
  }

  return (
    <View style={styles.container}>
      {parsedData.oldValue !== undefined && (
        <FieldRow label="Old Value" value={parsedData.oldValue} />
      )}

      {parsedData.newValue !== undefined && (
        <FieldRow label="New Value" value={parsedData.newValue} />
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
