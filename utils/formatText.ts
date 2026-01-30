/**
 * Formats camelCase or PascalCase strings to readable text with spaces
 * e.g., "TermsAndConditions" -> "Terms And Conditions"
 * e.g., "ChangeProduct" -> "Change Product"
 * e.g., "runBilling" -> "Run Billing"
 */
export const formatCamelCase = (text: string | null | undefined): string => {
  if (!text) return "";

  return (
    text
      // Insert space before uppercase letters
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // Insert space before sequences of uppercase followed by lowercase
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
      // Handle snake_case
      .replace(/_/g, " ")
      // Capitalize first letter
      .replace(/^\w/, (c) => c.toUpperCase())
      .trim()
  );
};

/**
 * Formats a value for display - handles camelCase, dates, etc.
 */
export const formatDisplayValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "string") {
    // Check if it looks like camelCase or PascalCase (has mixed case without spaces)
    if (
      /^[a-zA-Z]+$/.test(value) &&
      /[a-z]/.test(value) &&
      /[A-Z]/.test(value)
    ) {
      return formatCamelCase(value);
    }
    return value;
  }

  return String(value);
};
