import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Skeleton,
  Stack,
  Grid,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { format, parseISO, addDays, startOfDay } from "date-fns";
import {
  useAvailableSlots,
  useSelectTimeSlot,
  useCalendarSettingsByToken,
} from "../../hooks/api/useTimeSlots";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format ISO string to "YYYY-MM-DD" */
const toDateStr = (date: Date): string => format(date, "yyyy-MM-dd");

/** Format slot time range */
const formatSlotTime = (startStr: string, endStr: string): string => {
  try {
    const start = format(parseISO(startStr), "HH:mm");
    const end = format(parseISO(endStr), "HH:mm");
    return `${start} – ${end}`;
  } catch {
    return `${startStr} – ${endStr}`;
  }
};

/** Calculate duration in minutes between two ISO strings */
const getDurationMinutes = (startStr: string, endStr: string): number => {
  try {
    return (new Date(endStr).getTime() - new Date(startStr).getTime()) / 60000;
  } catch {
    return 0;
  }
};

/** Format duration minutes to "Xh Ym" */
const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

// ─── Date selector day card ───────────────────────────────────────────────────

interface DayCardProps {
  date: Date;
  dateStr: string;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

const DayCard: React.FC<DayCardProps> = ({
  date,
  isSelected,
  isDisabled,
  onClick,
}) => {
  const dayName = format(date, "EEE");
  const dayNum = format(date, "d");
  const month = format(date, "MMM");

  return (
    <Paper
      elevation={isSelected ? 4 : 1}
      onClick={isDisabled ? undefined : onClick}
      sx={{
        minWidth: 64,
        width: 64,
        py: 1.5,
        px: 1,
        textAlign: "center",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.4 : 1,
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? "primary.main" : "divider",
        bgcolor: isSelected ? "primary.50" : "background.paper",
        transition: "all 0.2s",
        flexShrink: 0,
        "&:hover": isDisabled
          ? {}
          : {
              borderColor: "primary.main",
              bgcolor: isSelected ? "primary.50" : "action.hover",
            },
      }}
    >
      <Typography
        variant="caption"
        display="block"
        color={isSelected ? "primary.main" : "text.secondary"}
        sx={{ fontWeight: 600, lineHeight: 1.2 }}
      >
        {dayName}
      </Typography>
      <Typography
        variant="h6"
        color={isSelected ? "primary.main" : "text.primary"}
        sx={{ lineHeight: 1.3, fontWeight: isSelected ? 700 : 400 }}
      >
        {dayNum}
      </Typography>
      <Typography
        variant="caption"
        display="block"
        color={isSelected ? "primary.main" : "text.secondary"}
        sx={{ lineHeight: 1.2 }}
      >
        {month}
      </Typography>
    </Paper>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const BookInterviewPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotUid, setSelectedSlotUid] = useState<string | null>(null);

  const {
    data: availableSlots,
    isLoading: slotsLoading,
    isError,
    error,
  } = useAvailableSlots(token || null);

  const { data: calendarSettings, isLoading: settingsLoading } =
    useCalendarSettingsByToken(token || null);

  const { mutate: selectSlot, isPending: isSelecting } = useSelectTimeSlot();

  const isLoading = slotsLoading || settingsLoading;

  // Build the list of dates to show
  const advanceDays = calendarSettings?.advanceBookingDays ?? 30;
  const workingDays: number[] = calendarSettings?.workingDays ?? [
    1, 2, 3, 4, 5,
  ];
  const blockedDates: string[] = calendarSettings?.blockedDates ?? [];

  const dateRange: Date[] = Array.from({ length: advanceDays }, (_, i) =>
    addDays(startOfDay(new Date()), i),
  );

  const isDateDisabled = (dateStr: string, dayOfWeek: number): boolean => {
    if (!workingDays.includes(dayOfWeek)) return true;
    if (blockedDates.includes(dateStr)) return true;
    const hasSlots = availableSlots?.some((s) =>
      s.startTime.startsWith(dateStr),
    );
    return !hasSlots;
  };

  const slotsForSelectedDate = selectedDate
    ? (availableSlots?.filter((s) => s.startTime.startsWith(selectedDate)) ??
      [])
    : [];

  const handleSelectSlot = () => {
    if (!selectedSlotUid || !token) return;
    selectSlot(
      { token, data: { slotUid: selectedSlotUid } },
      {
        onSuccess: () => {
          navigate(`/booking-confirmed/${token}`);
        },
      },
    );
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlotUid(null);
  };

  const scrollDates = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 64 * 3 + 8 * 3; // 3 cards + gaps
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // ─── Loading state ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {t("booking.loading_slots")}
        </Typography>
      </Container>
    );
  }

  // ─── Error state ────────────────────────────────────────────────────────────

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error">
          <Typography variant="h6">{t("booking.error_title")}</Typography>
          <Typography>
            {error?.message || t("booking.error_invalid_token")}
          </Typography>
        </Alert>
      </Container>
    );
  }

  // ─── No slots state ─────────────────────────────────────────────────────────

  if (!availableSlots || availableSlots.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="info">
          <Typography variant="h6">{t("booking.no_slots_title")}</Typography>
          <Typography>{t("booking.no_slots_message")}</Typography>
        </Alert>
      </Container>
    );
  }

  // ─── Main layout ────────────────────────────────────────────────────────────

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <EventAvailableIcon
          sx={{ fontSize: 56, color: "primary.main", mb: 1.5 }}
        />
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          {t("booking.title")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("booking.subtitle")}
        </Typography>
      </Box>

      {/* Date selector section */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
        {t("booking.select_date")}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 3 }}>
        <IconButton
          size="small"
          onClick={() => scrollDates("left")}
          aria-label={t("common.back")}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Box
          ref={scrollRef}
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "hidden",
            flex: 1,
            scrollBehavior: "smooth",
          }}
        >
          {isLoading
            ? Array.from({ length: 7 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rounded"
                  width={64}
                  height={80}
                  sx={{ flexShrink: 0 }}
                />
              ))
            : dateRange.map((date) => {
                const dateStr = toDateStr(date);
                // getDay() returns 0=Sun,1=Mon,...,6=Sat
                const dayOfWeek = date.getDay();
                const disabled = isDateDisabled(dateStr, dayOfWeek);
                return (
                  <DayCard
                    key={dateStr}
                    date={date}
                    dateStr={dateStr}
                    isSelected={selectedDate === dateStr}
                    isDisabled={disabled}
                    onClick={() => handleDateClick(dateStr)}
                  />
                );
              })}
        </Box>

        <IconButton
          size="small"
          onClick={() => scrollDates("right")}
          aria-label={t("common.next")}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Time slots section */}
      {selectedDate ? (
        <>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
            {t("booking.select_time")}
          </Typography>

          {slotsForSelectedDate.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              {t("booking.no_slots_this_day")}
            </Alert>
          ) : (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {slotsForSelectedDate.map((slot) => {
                const isSelected = selectedSlotUid === slot.uid;
                const duration = getDurationMinutes(
                  slot.startTime,
                  slot.endTime,
                );
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={slot.uid}>
                    <Paper
                      elevation={isSelected ? 6 : 1}
                      onClick={() => setSelectedSlotUid(slot.uid)}
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        border: isSelected ? 2 : 1,
                        borderColor: isSelected ? "primary.main" : "divider",
                        bgcolor: isSelected ? "primary.50" : "background.paper",
                        transition: "all 0.2s",
                        textAlign: "center",
                        "&:hover": {
                          borderColor: "primary.main",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      {isSelected && (
                        <CheckCircleIcon
                          sx={{ color: "primary.main", mb: 0.5 }}
                        />
                      )}
                      <AccessTimeIcon
                        sx={{
                          color: isSelected ? "primary.main" : "text.secondary",
                          display: "block",
                          mx: "auto",
                          mb: 0.5,
                        }}
                      />
                      <Typography variant="h6" fontWeight={600}>
                        {formatSlotTime(slot.startTime, slot.endTime)}
                      </Typography>
                      {duration > 0 && (
                        <Chip
                          label={formatDuration(duration)}
                          size="small"
                          color={isSelected ? "primary" : "default"}
                          sx={{ mt: 0.5 }}
                        />
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </>
      ) : (
        <Box
          sx={{
            py: 4,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 1,
            mb: 4,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            {t("booking.select_date")}
          </Typography>
        </Box>
      )}

      {/* Confirm button */}
      <Stack alignItems="center">
        <Button
          variant="contained"
          size="large"
          onClick={handleSelectSlot}
          disabled={!selectedSlotUid || isSelecting}
          endIcon={isSelecting ? undefined : <CheckCircleIcon />}
          sx={{ px: 6, py: 1.5, minWidth: 220 }}
        >
          {isSelecting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: "inherit" }} />
              {t("booking.confirming")}
            </>
          ) : (
            t("booking.confirm_selection")
          )}
        </Button>
      </Stack>
    </Container>
  );
};

export default BookInterviewPage;
