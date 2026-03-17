import { Avatar } from "@mui/material";
import { useTranslation } from "react-i18next";

const stringAvatar = (name: string) => {
  return {
    children: `${name.split(" ")[0][0]}${name.split(" ")[1]?.[0] || ""}`,
  };
};

/**
 * Resolves a profile picture value to a full URL.
 * The backend stores either a file UID or a full URL in `profilePicture`.
 * A file UID must be resolved to `{VITE_API_URL}/files/{uid}/view`.
 */
function resolveAvatarUrl(avatarUrl?: string): string | undefined {
  if (!avatarUrl) return undefined;
  if (avatarUrl.startsWith("http")) return avatarUrl;
  return `${import.meta.env.VITE_API_URL}/files/${avatarUrl}/view`;
}

type UserAvatarType = {
  avatarUrl?: string;
  name?: string;
};

const UserAvatar: React.FC<UserAvatarType> = ({ avatarUrl, name }) => {
  const { t } = useTranslation();
  const userName = name || t("common.unknown_user");
  const resolvedUrl = resolveAvatarUrl(avatarUrl);

  return (
    <Avatar
      sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
      {...stringAvatar(userName)}
      src={resolvedUrl}
      alt={t("aria.avatar", { name: userName })}
      aria-label={t("aria.avatar", { name: userName })}
    />
  );
};
export default UserAvatar;
