// Subscription Plans
export enum SubscriptionPlan {
  FREE = "FREE",
  PROFESSIONAL = "PROFESSIONAL",
  ENTERPRISE = "ENTERPRISE",
}

// Subscription Status
export enum SubscriptionStatus {
  TRIALING = "TRIALING",
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELED = "CANCELED",
  UNPAID = "UNPAID",
  EXPIRED = "EXPIRED",
}

// Subscription Response DTO
export interface Subscription {
  uid: string;
  companyUid: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
  gracePeriodEndsAt: string | null;
  subscriptionEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Quota Usage Item (from backend)
export interface QuotaUsageItem {
  resource: string;
  used: number;
  limit: number;
  percentageUsed: number;
  isExceeded: boolean;
}

// Feature Access Item (from backend)
export interface FeatureAccessItem {
  feature: string;
  enabled: boolean;
}

// Quota Status Response (matches backend format)
export interface QuotaStatus {
  companyUid: string;
  plan: SubscriptionPlan;
  quotas: QuotaUsageItem[];
  features: FeatureAccessItem[];
}

// Helper to get quota by resource name
export const getQuotaByResource = (
  quotas: QuotaUsageItem[],
  resource: string,
): QuotaUsageItem | undefined => {
  return quotas.find((q) => q.resource === resource);
};

// Helper to check if feature is enabled
export const isFeatureEnabled = (
  features: FeatureAccessItem[],
  featureName: string,
): boolean => {
  const feature = features.find((f) => f.feature === featureName);
  return feature?.enabled ?? false;
};

// Create Checkout Session DTO
export interface CreateCheckoutSessionDto {
  plan: SubscriptionPlan;
  interval?: "monthly" | "annual";
  successUrl: string;
  cancelUrl: string;
}

// Checkout Session Response
export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

// Billing Portal Response
export interface BillingPortalResponse {
  url: string;
}

// Cancel Subscription Response
export interface CancelSubscriptionResponse {
  message: string;
  cancelAt: string;
}

// Invoice Response DTO
export interface Invoice {
  id: string;
  invoiceNumber: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: string;
  createdAt: string;
  dueDate?: string;
  pdfUrl: string;
  hostedInvoiceUrl: string;
}

// Invoices Response
export interface InvoicesResponse {
  invoices: Invoice[];
  total: number;
}

// Admin Subscriptions Management Types (for admin list view with pagination)
export interface SubscriptionWithCompany extends Subscription {
  companyName: string;
  userCount: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  billingInterval?: string;
}

export interface SubscriptionsListResponse {
  subscriptions: SubscriptionWithCompany[];
  total: number;
  page: number;
  limit: number;
  stats: {
    totalActive: number;
    totalTrialing: number;
    totalCanceled: number;
    totalPastDue: number;
    totalMonthlyRevenue: number;
    totalYearlyRevenue: number;
  };
}

export interface ListSubscriptionsQuery {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus;
  plan?: SubscriptionPlan;
  search?: string;
}

// Admin Subscription Item (for admin subscriptions management - simpler view)
export interface AdminSubscriptionItem {
  subscriptionUid: string;
  companyUid: string;
  companyName: string;
  ownerUid?: string;
  ownerName?: string;
  ownerEmail?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  mrr?: number;
  createdAt: string;
  updatedAt: string;
}

// Admin Subscriptions Response (for admin subscriptions management - simpler view)
export interface AdminSubscriptionsResponse {
  subscriptions: AdminSubscriptionItem[];
  total: number;
  totalActive: number;
  totalTrialing: number;
  totalPastDue: number;
  totalMrr: number;
}
