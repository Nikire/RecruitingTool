import { adminKeys } from "./queryKeys";
import { useQuery } from "@tanstack/react-query";
import api from "./axios";

export interface RecentBounce {
  uid: string;
  recipientEmail: string;
  subject: string;
  bouncedAt: string | null;
  bounceType: string | null;
  emailType: string;
}

export interface EmailDeliverabilityStats {
  totalSent: number;
  delivered: number;
  opened: number;
  bounced: number;
  spam: number;
  failed: number;
  deliveryRate: number;
  openRate: number;
  bounceRate: number;
  recentBounces: RecentBounce[];
}

export interface EmailDeliverabilityPerTypeItem {
  emailType: string;
  total: number;
  delivered: number;
  opened: number;
  bounced: number;
  bounceRate: number;
}

export interface EmailDeliverabilityPerType {
  perType: EmailDeliverabilityPerTypeItem[];
}

const fetchEmailDeliverabilityStats =
  async (): Promise<EmailDeliverabilityStats> => {
    const response = await api.get<EmailDeliverabilityStats>(
      "/admin/email/deliverability",
    );
    return response.data;
  };

const fetchEmailDeliverabilityPerType =
  async (): Promise<EmailDeliverabilityPerType> => {
    const response = await api.get<EmailDeliverabilityPerType>(
      "/admin/email/deliverability/per-type",
    );
    return response.data;
  };

export function useEmailDeliverabilityStats() {
  return useQuery<EmailDeliverabilityStats>({
    queryKey: adminKeys.emailDeliverabilityStats(),
    queryFn: fetchEmailDeliverabilityStats,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useEmailDeliverabilityPerType() {
  return useQuery<EmailDeliverabilityPerType>({
    queryKey: adminKeys.emailDeliverabilityPerType(),
    queryFn: fetchEmailDeliverabilityPerType,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
