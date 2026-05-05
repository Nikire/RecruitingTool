export type ProspectSource =
  | "CLUTCH"
  | "GOODFIRMS"
  | "LINKEDIN"
  | "SALES_NAVIGATOR"
  | "UPWORK"
  | "TOPTAL"
  | "GOOGLE_MAPS"
  | "REFERRAL"
  | "DIRECT"
  | "OTHER"
  | "APOLLO_CAMPAIGN";

export type ProspectStatus =
  | "NEW"
  | "CONTACTED"
  | "FOLLOW_UP_1"
  | "FOLLOW_UP_2"
  | "RESPONDED"
  | "DEMO_SCHEDULED"
  | "DEMO_DONE"
  | "PROPOSAL_SENT"
  | "CONVERTED"
  | "LOST"
  | "ARCHIVED";

export type OutreachActivityType =
  | "NOTE"
  | "MESSAGE_SENT"
  | "RESPONSE_RECEIVED"
  | "FOLLOW_UP"
  | "DEMO_SCHEDULED"
  | "DEMO_COMPLETED"
  | "PROPOSAL_SENT"
  | "STATUS_CHANGED"
  | "CONTACT_ADDED";

export type OutreachChannel =
  | "LINKEDIN"
  | "EMAIL"
  | "WHATSAPP"
  | "PHONE"
  | "IN_PERSON"
  | "OTHER";

export interface ProspectContact {
  uid: string;
  name: string;
  role?: string;
  email?: string;
  linkedinUrl?: string;
  phone?: string;
  isPrimary: boolean;
}

export interface ProspectActivity {
  uid: string;
  type: OutreachActivityType;
  channel?: OutreachChannel;
  notes?: string;
  templateUsed?: string;
  previousStatus?: ProspectStatus;
  newStatus?: ProspectStatus;
  createdAt: string;
  createdBy?: { uid: string; name: string };
}

export interface ProspectCompany {
  uid: string;
  name: string;
  website?: string;
  industry?: string;
  companySize?: string;
  country?: string;
  city?: string;
  source: ProspectSource;
  status: ProspectStatus;
  campaignRef?: string;
  notes?: string;
  tags: string[];
  isFeatured: boolean;
  contacts?: ProspectContact[];
  activities?: ProspectActivity[];
  createdAt: string;
  updatedAt: string;
  lastActivityAt?: string | null;
}

export interface ProspectStats {
  total: number;
  contacted: number;
  demoScheduled: number;
  converted: number;
}

export interface ProspectListResponse {
  data: ProspectCompany[];
  total: number;
  page: number;
  limit: number;
}

export interface ProspectListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProspectStatus | "";
  source?: ProspectSource | "";
  tag?: string;
  featured?: boolean;
}

export interface CreateProspectDto {
  name: string;
  website?: string;
  industry?: string;
  companySize?: string;
  country?: string;
  city?: string;
  source?: ProspectSource;
  status?: ProspectStatus;
  notes?: string;
  tags?: string[];
  isFeatured?: boolean;
}

export type UpdateProspectDto = Partial<CreateProspectDto>;

export interface CreateOutreachContactDto {
  name: string;
  role?: string;
  email?: string;
  linkedinUrl?: string;
  phone?: string;
  isPrimary?: boolean;
}

export interface CreateOutreachActivityDto {
  type: OutreachActivityType;
  channel?: OutreachChannel;
  notes?: string;
  templateUsed?: string;
  newStatus?: ProspectStatus;
}
