import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Checkbox,
  Button,
  Skeleton,
  Tooltip,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { User } from "../../types/user.types";
import { getOrganizerColor } from "./calendarUtils";

interface MemberFilterPanelProps {
  users: User[];
  isLoading: boolean;
  // null = show all; [] = nobody selected; string[] = show these members
  selectedUids: string[] | null;
  currentUserUid: string;
  onToggleMember: (uid: string) => void;
  onMyMeetingsOnly: () => void;
  onShowAll: () => void;
}

const MemberFilterPanel: React.FC<MemberFilterPanelProps> = ({
  users,
  isLoading,
  selectedUids,
  currentUserUid,
  onToggleMember,
  onMyMeetingsOnly,
  onShowAll,
}) => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        minWidth: 200,
        maxWidth: 240,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        p: 2,
        bgcolor: "background.paper",
        height: "fit-content",
      }}
    >
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        {t("calendar.members")}
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        <Button
          size="small"
          variant="contained"
          onClick={onMyMeetingsOnly}
          sx={{ fontSize: "0.7rem", py: 0.25, px: 1 }}
        >
          {t("calendar.my_meetings_only")}
        </Button>
        <Button
          size="small"
          variant="text"
          onClick={onShowAll}
          sx={{ fontSize: "0.7rem", py: 0.25, px: 1 }}
        >
          {t("calendar.show_all")}
        </Button>
      </Stack>

      {isLoading ? (
        <Stack spacing={1}>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Skeleton variant="circular" width={28} height={28} />
              <Skeleton variant="text" width={100} />
            </Box>
          ))}
        </Stack>
      ) : (
        <Stack spacing={0.5}>
          {users.map((user) => {
            const color = getOrganizerColor(user.uid);
            const isSelected =
              selectedUids === null || selectedUids.includes(user.uid);
            return (
              <Box
                key={user.uid}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  borderRadius: 1,
                  px: 0.5,
                  py: 0.25,
                  "&:hover": { bgcolor: "action.hover" },
                }}
                onClick={() => onToggleMember(user.uid)}
              >
                <Checkbox
                  size="small"
                  checked={isSelected}
                  sx={{
                    color: color,
                    "&.Mui-checked": { color },
                    p: 0,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMember(user.uid);
                  }}
                />
                <Tooltip title={user.email ?? user.name} placement="right">
                  <Avatar
                    src={user.profilePicture}
                    alt={user.name}
                    sx={{
                      width: 24,
                      height: 24,
                      fontSize: "0.7rem",
                      bgcolor: color,
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
                <Typography
                  variant="body2"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                    fontSize: "0.8rem",
                    fontWeight: user.uid === currentUserUid ? 600 : 400,
                  }}
                >
                  {user.name}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default MemberFilterPanel;
