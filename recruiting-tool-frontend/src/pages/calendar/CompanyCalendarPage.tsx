import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Button,
  Skeleton,
  Chip,
  Tooltip,
  Avatar,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTranslation } from "react-i18next";
import {
  CalendarInterview,
  useCompanyCalendarInterviews,
} from "../../hooks/api/useCalendarInterviews";
import { useListUsers } from "../../hooks/api/useUsers";
import { useUserAtom } from "../../hooks/api/state/useUserAtom";
import MemberFilterPanel from "../../components/calendar/MemberFilterPanel";
import InterviewDetailPopover from "../../components/calendar/InterviewDetailPopover";
import {
  toDateString,
  getMonthGridDays,
  getWeekDays,
  getOrganizerColor,
  HOUR_START,
  HOUR_END,
  timeToMinutes,
} from "../../components/calendar/calendarUtils";

type CalendarView = "month" | "week" | "day";

const HOURS = Array.from(
  { length: HOUR_END - HOUR_START },
  (_, i) => HOUR_START + i,
);

// Short day labels Mon-Sun
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CompanyCalendarPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useUserAtom();

  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [selectedInterview, setSelectedInterview] =
    useState<CalendarInterview | null>(null);

  // ─── Date range computation ───────────────────────────────────────────────
  const { startDate, endDate } = useMemo(() => {
    if (view === "month") {
      const days = getMonthGridDays(
        currentDate.getFullYear(),
        currentDate.getMonth(),
      );
      return {
        startDate: toDateString(days[0]),
        endDate: toDateString(days[days.length - 1]),
      };
    }
    if (view === "week") {
      const days = getWeekDays(currentDate);
      return {
        startDate: toDateString(days[0]),
        endDate: toDateString(days[6]),
      };
    }
    // day view
    const ds = toDateString(currentDate);
    return { startDate: ds, endDate: ds };
  }, [view, currentDate]);

  // ─── Data fetching ────────────────────────────────────────────────────────
  const memberUidsParam = selectedUids.length > 0 ? selectedUids : undefined;

  const { data: interviews = [], isLoading: interviewsLoading } =
    useCompanyCalendarInterviews(startDate, endDate, memberUidsParam);

  const { data: usersResponse, isLoading: usersLoading } = useListUsers({
    page: 1,
    limit: 200,
  });
  const usersData = useMemo(() => usersResponse?.data ?? [], [usersResponse]);

  // ─── Navigation ───────────────────────────────────────────────────────────
  const navigate = useCallback(
    (direction: -1 | 1) => {
      setCurrentDate((prev) => {
        const d = new Date(prev);
        if (view === "month") d.setMonth(d.getMonth() + direction);
        else if (view === "week") d.setDate(d.getDate() + direction * 7);
        else d.setDate(d.getDate() + direction);
        return d;
      });
    },
    [view],
  );

  const goToToday = useCallback(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    setCurrentDate(d);
  }, []);

  // ─── Member filter handlers ───────────────────────────────────────────────
  const handleToggleMember = useCallback(
    (uid: string) => {
      setSelectedUids((prev) => {
        if (prev.length === 0) {
          // currently "show all" — switch to showing everyone EXCEPT this one
          return usersData.map((u) => u.uid).filter((id) => id !== uid);
        }
        if (prev.includes(uid)) {
          const next = prev.filter((id) => id !== uid);
          return next.length === 0 ? [] : next;
        }
        return [...prev, uid];
      });
    },
    [usersData],
  );

  const handleMyMeetingsOnly = useCallback(() => {
    if (user?.uid) setSelectedUids([user.uid]);
  }, [user]);

  const handleShowAll = useCallback(() => {
    setSelectedUids([]);
  }, []);

  // ─── Interview chip click ─────────────────────────────────────────────────
  const handleInterviewClick = useCallback(
    (event: React.MouseEvent<HTMLElement>, interview: CalendarInterview) => {
      event.stopPropagation();
      setSelectedInterview(interview);
      setPopoverAnchor(event.currentTarget);
    },
    [],
  );

  const handlePopoverClose = useCallback(() => {
    setPopoverAnchor(null);
    setSelectedInterview(null);
  }, []);

  // ─── Interviews indexed by date string ────────────────────────────────────
  const interviewsByDate = useMemo(() => {
    const map: Record<string, CalendarInterview[]> = {};
    for (const iv of interviews) {
      if (!iv.scheduledDate) continue;
      // Normalize ISO date string (e.g. "2026-03-14T00:00:00.000Z") to "2026-03-14"
      const key = iv.scheduledDate.substring(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(iv);
    }
    return map;
  }, [interviews]);

  // ─── Title label ─────────────────────────────────────────────────────────
  const titleLabel = useMemo(() => {
    if (view === "month") {
      return currentDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
      });
    }
    if (view === "week") {
      const days = getWeekDays(currentDate);
      const first = days[0].toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      const last = days[6].toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${first} – ${last}`;
    }
    return currentDate.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [view, currentDate]);

  const todayStr = toDateString(new Date());

  // ─── Render helpers ───────────────────────────────────────────────────────
  const renderEventChip = (iv: CalendarInterview, compact = false) => {
    const color = iv.candidate?.uid
      ? getOrganizerColor(iv.candidate.uid)
      : "#757575";
    return (
      <Tooltip
        key={iv.uid}
        title={`${iv.candidate?.name ?? ""} · ${iv.jobPosition?.title ?? ""} · ${iv.scheduledTime ?? ""}`}
        placement="top"
      >
        <Chip
          label={
            compact
              ? (iv.candidate?.name?.split(" ")[0] ?? "—")
              : `${iv.scheduledTime ? iv.scheduledTime + " " : ""}${iv.candidate?.name ?? "—"}`
          }
          size="small"
          onClick={(e) => handleInterviewClick(e, iv)}
          sx={{
            bgcolor: color,
            color: "#fff",
            fontSize: "0.68rem",
            height: 20,
            maxWidth: "100%",
            cursor: "pointer",
            "& .MuiChip-label": {
              overflow: "hidden",
              textOverflow: "ellipsis",
              px: 0.75,
            },
            "&:hover": { opacity: 0.85 },
          }}
        />
      </Tooltip>
    );
  };

  // ─── Month view ───────────────────────────────────────────────────────────
  const renderMonthView = () => {
    const days = getMonthGridDays(
      currentDate.getFullYear(),
      currentDate.getMonth(),
    );
    const currentMonth = currentDate.getMonth();

    return (
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {/* Weekday headers */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          {DAY_LABELS.map((d) => (
            <Box key={d} sx={{ textAlign: "center", py: 0.75 }}>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
              >
                {d}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Day cells */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gridTemplateRows: "repeat(6, minmax(90px, 1fr))",
            border: 0,
          }}
        >
          {interviewsLoading
            ? days.map((_day, i) => (
                <Box
                  key={i}
                  sx={{
                    borderRight: 1,
                    borderBottom: 1,
                    borderColor: "divider",
                    p: 0.5,
                    minHeight: 90,
                  }}
                >
                  <Skeleton variant="text" width={20} height={20} />
                  <Skeleton
                    variant="rectangular"
                    height={16}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              ))
            : days.map((day, i) => {
                const ds = toDateString(day);
                const dayInterviews = interviewsByDate[ds] ?? [];
                const isCurrentMonth = day.getMonth() === currentMonth;
                const isToday = ds === todayStr;
                return (
                  <Box
                    key={i}
                    sx={{
                      borderRight: 1,
                      borderBottom: 1,
                      borderColor: "divider",
                      p: 0.5,
                      minHeight: 90,
                      bgcolor: isToday
                        ? "primary.50"
                        : isCurrentMonth
                          ? "background.paper"
                          : "action.hover",
                      opacity: isCurrentMonth ? 1 : 0.6,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mb: 0.25,
                      }}
                    >
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: isToday ? "primary.main" : "transparent",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: isToday ? 700 : 400,
                            color: isToday ? "primary.contrastText" : "inherit",
                            lineHeight: 1,
                          }}
                        >
                          {day.getDate()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.25,
                        overflow: "hidden",
                      }}
                    >
                      {dayInterviews
                        .slice(0, 3)
                        .map((iv) => renderEventChip(iv, true))}
                      {dayInterviews.length > 3 && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: "0.65rem" }}
                        >
                          +{dayInterviews.length - 3}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
        </Box>
      </Box>
    );
  };

  // ─── Week view ────────────────────────────────────────────────────────────
  const renderWeekView = () => {
    const days = getWeekDays(currentDate);
    const SLOT_HEIGHT = 48; // px per hour slot

    return (
      <Box sx={{ flex: 1, overflow: "auto" }}>
        {/* Day headers */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "56px repeat(7, 1fr)",
            borderBottom: 1,
            borderColor: "divider",
            position: "sticky",
            top: 0,
            bgcolor: "background.paper",
            zIndex: 1,
          }}
        >
          <Box />
          {days.map((day, i) => {
            const ds = toDateString(day);
            const isToday = ds === todayStr;
            return (
              <Box
                key={i}
                sx={{ textAlign: "center", py: 0.75, position: "relative" }}
              >
                <Typography variant="caption" color="text.secondary">
                  {DAY_LABELS[i]}
                </Typography>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    bgcolor: isToday ? "primary.main" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={isToday ? 700 : 400}
                    sx={{
                      color: isToday ? "primary.contrastText" : "inherit",
                    }}
                  >
                    {day.getDate()}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Time grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "56px repeat(7, 1fr)",
          }}
        >
          {/* Hour labels column */}
          <Box>
            {HOURS.map((h) => (
              <Box
                key={h}
                sx={{
                  height: SLOT_HEIGHT,
                  borderBottom: 1,
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "flex-end",
                  pr: 0.75,
                  pt: 0.25,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {String(h).padStart(2, "0")}:00
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Day columns */}
          {days.map((day, di) => {
            const ds = toDateString(day);
            const dayInterviews = interviewsByDate[ds] ?? [];

            return (
              <Box
                key={di}
                sx={{
                  borderLeft: 1,
                  borderColor: "divider",
                  position: "relative",
                }}
              >
                {HOURS.map((h) => (
                  <Box
                    key={h}
                    sx={{
                      height: SLOT_HEIGHT,
                      borderBottom: 1,
                      borderColor: "divider",
                    }}
                  />
                ))}
                {/* Overlay events */}
                {interviewsLoading ? (
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 2,
                      right: 2,
                      height: 20,
                    }}
                  />
                ) : (
                  dayInterviews.map((iv) => {
                    const time = iv.scheduledTime ?? `${HOUR_START}:00`;
                    const mins = timeToMinutes(time);
                    const startMins = HOUR_START * 60;
                    const endMins = HOUR_END * 60;
                    const clampedMins = Math.max(
                      startMins,
                      Math.min(endMins - 30, mins),
                    );
                    const topPx =
                      ((clampedMins - startMins) / 60) * SLOT_HEIGHT;
                    const heightPx = ((iv.duration ?? 30) / 60) * SLOT_HEIGHT;
                    const color = iv.candidate?.uid
                      ? getOrganizerColor(iv.candidate.uid)
                      : "#757575";

                    return (
                      <Tooltip
                        key={iv.uid}
                        title={`${iv.candidate?.name ?? ""} · ${iv.jobPosition?.title ?? ""}`}
                        placement="top"
                      >
                        <Box
                          onClick={(e) => handleInterviewClick(e, iv)}
                          sx={{
                            position: "absolute",
                            top: topPx,
                            left: 2,
                            right: 2,
                            height: Math.max(heightPx, 20),
                            bgcolor: color,
                            borderRadius: 0.75,
                            px: 0.5,
                            py: 0.25,
                            cursor: "pointer",
                            overflow: "hidden",
                            "&:hover": { opacity: 0.85 },
                            zIndex: 0,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#fff",
                              fontSize: "0.65rem",
                              lineHeight: 1.2,
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {iv.scheduledTime} {iv.candidate?.name ?? "—"}
                          </Typography>
                        </Box>
                      </Tooltip>
                    );
                  })
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  // ─── Day view ─────────────────────────────────────────────────────────────
  const renderDayView = () => {
    const ds = toDateString(currentDate);
    const dayInterviews = interviewsByDate[ds] ?? [];
    const SLOT_HEIGHT = 56;

    return (
      <Box sx={{ flex: 1, overflow: "auto" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "56px 1fr",
          }}
        >
          {/* Hour labels */}
          <Box>
            {HOURS.map((h) => (
              <Box
                key={h}
                sx={{
                  height: SLOT_HEIGHT,
                  borderBottom: 1,
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "flex-end",
                  pr: 0.75,
                  pt: 0.25,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {String(h).padStart(2, "0")}:00
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Events column */}
          <Box
            sx={{
              borderLeft: 1,
              borderColor: "divider",
              position: "relative",
            }}
          >
            {HOURS.map((h) => (
              <Box
                key={h}
                sx={{
                  height: SLOT_HEIGHT,
                  borderBottom: 1,
                  borderColor: "divider",
                }}
              />
            ))}
            {interviewsLoading ? (
              <Skeleton
                variant="rectangular"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 4,
                  right: 4,
                  height: 28,
                }}
              />
            ) : (
              dayInterviews.map((iv) => {
                const time = iv.scheduledTime ?? `${HOUR_START}:00`;
                const mins = timeToMinutes(time);
                const startMins = HOUR_START * 60;
                const endMins = HOUR_END * 60;
                const clampedMins = Math.max(
                  startMins,
                  Math.min(endMins - 30, mins),
                );
                const topPx = ((clampedMins - startMins) / 60) * SLOT_HEIGHT;
                const heightPx = ((iv.duration ?? 30) / 60) * SLOT_HEIGHT;
                const color = iv.candidate?.uid
                  ? getOrganizerColor(iv.candidate.uid)
                  : "#757575";

                return (
                  <Box
                    key={iv.uid}
                    onClick={(e) => handleInterviewClick(e, iv)}
                    sx={{
                      position: "absolute",
                      top: topPx,
                      left: 4,
                      right: 4,
                      height: Math.max(heightPx, 28),
                      bgcolor: color,
                      borderRadius: 1,
                      px: 1,
                      py: 0.5,
                      cursor: "pointer",
                      overflow: "hidden",
                      "&:hover": { opacity: 0.85 },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#fff",
                        fontWeight: 500,
                        fontSize: "0.8rem",
                      }}
                    >
                      {iv.scheduledTime} · {iv.candidate?.name ?? "—"}
                    </Typography>
                    {iv.jobPosition && (
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255,255,255,0.85)" }}
                      >
                        {iv.jobPosition.title}
                      </Typography>
                    )}
                    {iv.organizer && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mt: 0.25,
                        }}
                      >
                        <Avatar
                          src={iv.organizer.profilePicture}
                          alt={iv.organizer.name}
                          sx={{ width: 16, height: 16, fontSize: "0.6rem" }}
                        >
                          {iv.organizer.name.charAt(0)}
                        </Avatar>
                        <Typography
                          variant="caption"
                          sx={{ color: "rgba(255,255,255,0.85)" }}
                        >
                          {iv.organizer.name}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  // ─── Empty state ──────────────────────────────────────────────────────────
  const isEmpty = !interviewsLoading && interviews.length === 0;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {t("calendar.title")}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton size="small" onClick={() => navigate(-1)}>
            <ChevronLeftIcon />
          </IconButton>
          <Button variant="text" size="small" onClick={goToToday}>
            {t("calendar.today")}
          </Button>
          <IconButton size="small" onClick={() => navigate(1)}>
            <ChevronRightIcon />
          </IconButton>
        </Box>

        <Typography variant="subtitle1" fontWeight={500} sx={{ flex: 1 }}>
          {titleLabel}
        </Typography>

        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, v) => {
            if (v) setView(v as CalendarView);
          }}
          size="small"
        >
          <ToggleButton value="month">{t("calendar.month")}</ToggleButton>
          <ToggleButton value="week">{t("calendar.week")}</ToggleButton>
          <ToggleButton value="day">{t("calendar.day")}</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Body */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <Box
          sx={{
            p: 2,
            borderRight: 1,
            borderColor: "divider",
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <MemberFilterPanel
            users={usersData}
            isLoading={usersLoading}
            selectedUids={selectedUids}
            currentUserUid={user?.uid ?? ""}
            onToggleMember={handleToggleMember}
            onMyMeetingsOnly={handleMyMeetingsOnly}
            onShowAll={handleShowAll}
          />
        </Box>

        {/* Calendar grid area */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {isEmpty ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body1" color="text.secondary">
                {t("calendar.no_interviews")}
              </Typography>
            </Box>
          ) : (
            <>
              {view === "month" && renderMonthView()}
              {view === "week" && renderWeekView()}
              {view === "day" && renderDayView()}
            </>
          )}
        </Box>
      </Box>

      {/* Interview detail popover */}
      <InterviewDetailPopover
        interview={selectedInterview}
        anchorEl={popoverAnchor}
        onClose={handlePopoverClose}
      />
    </Box>
  );
};

export default CompanyCalendarPage;
