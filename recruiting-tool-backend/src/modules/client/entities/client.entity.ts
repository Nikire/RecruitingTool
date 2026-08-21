import { Client, Prisma } from '@prisma/client';
import { ClientResponseDto } from '../dto/client.dto';

/**
 * Include used whenever the caller wants the "how many open roles for this client?"
 * number alongside the record. Counting only non-deleted postings keeps the number
 * consistent with what the job positions list actually shows.
 */
export const includeClientCounts = {
  _count: {
    select: {
      jobPositions: { where: { deletedAt: null } },
    },
  },
} satisfies Prisma.ClientInclude;

type ClientWithCounts = Prisma.ClientGetPayload<{ include: typeof includeClientCounts }>;

/**
 * Maps a Client row to its external representation.
 *
 * Deliberately drops `id` and `companyId`: numeric ids never leave the API, and the
 * owning agency is implicit (it is always the caller's own company).
 */
export function ClientMapper(client: Client | ClientWithCounts): ClientResponseDto {
  const counts = (client as ClientWithCounts)._count;

  return {
    uid: client.uid,
    name: client.name,
    slug: client.slug,
    logoUrl: client.logoUrl,
    contactName: client.contactName,
    contactEmail: client.contactEmail,
    notes: client.notes,
    status: client.status,
    jobPositionCount: counts ? counts.jobPositions : undefined,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  };
}
