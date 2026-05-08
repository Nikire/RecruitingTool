export type OutreachLeadChannel = "EMAIL" | "LINKEDIN";
export type OutreachLeadStatus = "PENDING" | "CONVERTED";

export interface CampaignLeadCounts {
  total: number;
  pending: number;
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
  // Apollo enrichment fields
  firstName?: string;
  lastName?: string;
  title?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  website?: string;
  industry?: string;
  seniority?: string;
  apolloContactId?: string;
  apolloAccountId?: string;
  secondaryEmail?: string;
  apolloData?: Record<string, unknown>;
  // Email tracking
  openCount?: number;
  clickCount?: number;
  openedAt?: string;
  clickedAt?: string;
  lastOpenedAt?: string;
  lastClickedAt?: string;
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

export interface ConvertLeadPayload {
  tags?: string[];
}

export interface SendLeadEmailPayload {
  templateUid?: string;
}

export interface SendLeadEmailResult {
  success: boolean;
  emailLogUid: string;
}

export interface PreviewEmailResult {
  subject: string;
  body: string;
  templateName: string;
}

export interface SendTestEmailPayload {
  templateUid?: string;
  dummyName?: string;
  dummyCompany?: string;
}

export interface SendTestEmailResult {
  success: boolean;
  sentTo: string;
}

export interface DailyCheckResult {
  alreadyRanToday: boolean;
  count: number;
}
