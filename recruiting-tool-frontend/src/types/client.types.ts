/**
 * Clients are an agency's END CLIENTS — the companies a role is actually being filled for.
 *
 * `Company` is the tenant (the agency itself); `Client` is one of its accounts. Only UIDs
 * cross the API boundary, so there is deliberately no numeric `id` here.
 */

export type ClientStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface Client {
  uid: string;
  name: string;
  slug: string | null;
  logoUrl: string | null;
  contactName: string | null;
  contactEmail: string | null;
  notes: string | null;
  status: ClientStatus;
  /** Non-deleted job positions currently attributed to this client. */
  jobPositionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  name: string;
  slug?: string;
  logoUrl?: string;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
  status?: ClientStatus;
}

export type UpdateClientDto = Partial<CreateClientDto>;
