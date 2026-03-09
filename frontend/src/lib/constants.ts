export const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  active: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  valid: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-500",
  },
  expiring_soon: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  expired: {
    bg: "bg-red-50 dark:bg-red-950/30",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
  },
  perpetual: {
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    text: "text-indigo-700 dark:text-indigo-400",
    dot: "bg-indigo-500",
  },
  unknown: {
    bg: "bg-gray-50 dark:bg-gray-900/30",
    text: "text-gray-600 dark:text-gray-400",
    dot: "bg-gray-400",
  },
  on_hold: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    text: "text-orange-700 dark:text-orange-400",
    dot: "bg-orange-500",
  },
  archived: {
    bg: "bg-gray-50 dark:bg-gray-900/30",
    text: "text-gray-600 dark:text-gray-400",
    dot: "bg-gray-400",
  },
};

export const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  valid: "Valid",
  expiring_soon: "Expiring Soon",
  expired: "Expired",
  perpetual: "Perpetual",
  unknown: "Unknown",
  on_hold: "On Hold",
  archived: "Archived",
};

export const LICENSE_TYPES = [
  "Per Seat",
  "Per Device",
  "Site License",
  "Enterprise",
  "Subscription",
  "Perpetual",
  "Trial",
  "Open Source",
  "Other",
] as const;

export const CERT_TYPES = [
  "SSL/TLS",
  "Code Signing",
  "Client Auth",
  "S/MIME",
  "CA",
  "Intermediate CA",
  "Self-Signed",
  "Wildcard",
  "Other",
] as const;

export const PROJECT_STATUSES = [
  "active",
  "on_hold",
  "archived",
] as const;

export const EXPORT_FORMATS: readonly { value: string; label: string; description: string; warning?: boolean }[] = [
  { value: "pem", label: "PEM Certificate", description: "Standard PEM-encoded certificate" },
  { value: "private_key", label: "PEM Private Key", description: "PEM-encoded private key", warning: true },
  { value: "der", label: "DER Binary", description: "DER-encoded binary certificate" },
  { value: "pkcs12", label: "PKCS#12 / PFX", description: "Certificate + key bundle" },
  { value: "pem_bundle", label: "PEM Bundle", description: "Full chain including certificate, key, and CA certs" },
];
