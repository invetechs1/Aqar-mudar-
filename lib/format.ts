export function formatSAR(n: number): string {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export const PROPERTY_TYPE_AR: Record<string, string> = {
  APARTMENT: "شقة",
  VILLA: "فيلا",
  LAND: "أرض",
  COMMERCIAL: "تجاري",
  BUILDING: "مبنى",
};

export const LISTING_AR: Record<string, string> = {
  SALE: "للبيع",
  PARTIAL_SALE: "بيع جزئي",
  INVESTMENT: "استثمار",
};

export const CONDITION_AR: Record<string, string> = {
  EXCELLENT: "ممتاز",
  GOOD: "جيد",
  FAIR: "مقبول",
  POOR: "ضعيف",
};

export const RISK_AR: Record<string, string> = {
  LOW: "منخفض",
  MEDIUM: "متوسط",
  HIGH: "مرتفع",
};

export const STATUS_AR: Record<string, string> = {
  PENDING_REVIEW: "قيد المراجعة",
  CERTIFIED: "معتمد",
  REJECTED: "مرفوض",
  SOLD: "مباع",
};
