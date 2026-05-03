export type OutreachLeadChannel = "EMAIL" | "LINKEDIN";
export type OutreachLeadStatus = "PENDING" | "SENT" | "REPLIED" | "CONVERTED";

export interface CampaignLeadCounts {
  total: number;
  pending: number;
  sent: number;
  replied: number;
  converted: number;
}

export interface OutreachCampaign {
  uid: string;
  name: string;
  description?: string;
  leadCounts: CampaignLeadCounts;
  createdAt: string;
  updatedAt: string;
}

export interface OutreachLead {
  uid: string;
  name: string;
  company: string;
  email?: string;
  linkedinUrl?: string;
  channel: OutreachLeadChannel;
  status: OutreachLeadStatus;
  notes?: string;
  convertedToProspectAt?: string;
  prospectUid?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignPayload {
  name: string;
  description?: string;
}

export interface UpdateLeadPayload {
  channel?: OutreachLeadChannel;
  status?: OutreachLeadStatus;
  notes?: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
}

export interface ConvertResult {
  prospectUid: string;
}

export interface SendLeadEmailPayload {
  templateUid?: string;
}

export interface SendLeadEmailResult {
  success: boolean;
  emailLogUid: string;
}
