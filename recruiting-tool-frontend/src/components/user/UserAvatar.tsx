import { Avatar } from "@mui/material";
import { useTranslation } from "react-i18next";

const stringAvatar = (name: string) => {
  return {
    children: `${name.split(" ")[0][0]}${name.split(" ")[1]?.[0] || ""}`,
  };
};
type UserAvatarType = {
  avatarUrl?: string;
  name?: string;
};

const UserAvatar: React.FC<UserAvatarType> = ({ avatarUrl, name }) => {
  const { t } = useTranslation();
  const userName = name || t("common.unknown_user");

  return (
    <Avatar
      sx={(theme) => ({ bgcolor: theme.palette.primary.main })}
      {...stringAvatar(userName)}
      src={avatarUrl}
      alt={t("aria.avatar", { name: userName })}
      aria-label={t("aria.avatar", { name: userName })}
    />
  );
};
export default UserAvatar;
