import { ProfileResponseDto } from '../dto/profile-response.dto';

export function ProfileMapper(profile: any): ProfileResponseDto {
  return {
    uid: profile.uid,
    userUid: profile.user?.uid,
    bio: profile.bio,
    phone: profile.phone,
    location: profile.location,
    timezone: profile.timezone,
    preferences: profile.preferences,
    createdAt: typeof profile.createdAt === 'string' ? profile.createdAt : profile.createdAt.toISOString(),
    updatedAt: typeof profile.updatedAt === 'string' ? profile.updatedAt : profile.updatedAt.toISOString(),
  };
}
