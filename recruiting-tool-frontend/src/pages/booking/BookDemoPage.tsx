import React, { useState, useRef, useMemo, useEffect } from "react";
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
  Select,
  MenuItem,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { format, addDays } from "date-fns";
import { formatDate } from "../../utils/dateFormatters";
import {
  useDemoSlots,
  useDemoSettings,
  useConfirmDemoSlot,
} from "../../hooks/api/useDemoBooking";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PublicIcon from "@mui/icons-material/Public";

// ─── Timezone list ────────────────────────────────────────────────────────────

const COMMON_TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "New York (ET)" },
  { value: "America/Chicago", label: "Chicago (CT)" },
  { value: "America/Denver", label: "Denver (MT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PT)" },
  { value: "America/Sao_Paulo", label: "São Paulo (BRT)" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (ART)" },
  { value: "America/Bogota", label: "Bogotá (COT)" },
  { value: "America/Mexico_City", label: "Mexico City (CST)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Europe/Moscow", label: "Moscow (MSK)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Kolkata", label: "Mumbai/Delhi (IST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
  { value: "Pacific/Auckland", label: "Auckland (NZST)" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** ISO string → "YYYY-MM-DD" in the given timezone */
const getSlotDateInTZ = (isoStr: string, tz: string): string => {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(
    new Date(isoStr),
  );
};

/** Format slot time range in the given timezone */
const formatSlotTime = (
  startStr: string,
  endStr: string,
  tz: string,
): string => {
  try {
    const opts: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: tz,
    };
    const fmt = new Intl.DateTimeFormat("en-US", opts);
    return `${fmt.format(new Date(startStr))} – ${fmt.format(new Date(endStr))}`;
  } catch {
    return `${startStr} – ${endStr}`;
  }
};

const toDateStr = (date: Date): string => format(date, "yyyy-MM-dd");

const getDurationMinutes = (startStr: string, endStr: string): number => {
  try {
    return (new Date(endStr).getTime() - new Date(startStr).getTime()) / 60000;
  } catch {
    return 0;
  }
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

// ─── Accessibility helpers ────────────────────────────────────────────────────

/** Hides content visually while keeping it available to screen readers. */
const srOnly = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

/** Consistent, always-visible keyboard focus ring for the card-style options. */
const focusRing = {
  "&:focus-visible": {
    outline: "3px solid",
    outlineColor: "primary.main",
    outlineOffset: "2px",
  },
} as const;

// ─── Day card ─────────────────────────────────────────────────────────────────

interface DayCardProps {
  date: Date;
  dateStr: string;
  isSelected: boolean;
  isDisabled: boolean;
  /** Roving tabindex: only one day card is in the tab order at a time. */
  isTabStop: boolean;
  onClick: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  registerRef: (element: HTMLButtonElement | null) => void;
}

const DayCard: React.FC<DayCardProps> = ({
  date,
  isSelected,
  isDisabled,
  isTabStop,
  onClick,
  onKeyDown,
  registerRef,
}) => {
  const { t, i18n } = useTranslation();
  const dayName = formatDate(date, "EEE", i18n.language);
  const dayNum = formatDate(date, "d", i18n.language);
  const month = formatDate(date, "MMM", i18n.language);
  const fullDate = formatDate(date, "EEEE, MMMM d, yyyy", i18n.language);

  return (
    <Paper
      component="button"
      type="button"
      ref={registerRef}
      elevation={isSelected ? 4 : 1}
      onClick={onClick}
      onKeyDown={onKeyDown}
      disabled={isDisabled}
      tabIndex={isTabStop ? 0 : -1}
      aria-pressed={isSelected}
      aria-label={
        isDisabled
          ? t("booking.date_option_unavailable", { date: fullDate })
          : fullDate
      }
      sx={{
        minWidth: 64,
        width: "auto",
        py: 1.5,
        px: 1.25,
        scrollSnapAlign: "start",
        display: "block",
        fontFamily: "inherit",
        textAlign: "center",
        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: isDisabled ? 0.4 : 1,
        border: isSelected ? 2 : 1,
        borderStyle: "solid",
        borderColor: isSelected ? "primary.main" : "divider",
        bgcolor: isSelected ? "primary.50" : "background.paper",
        transition: "all 0.2s",
        flexShrink: 0,
        ...focusRing,
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

const BookDemoPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const timeSectionRef = useRef<HTMLDivElement>(null);
  /** Set when the user picks a date, so focus only advances on a real interaction. */
  const shouldFocusTimesRef = useRef(false);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotUid, setSelectedSlotUid] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string>(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
  );

  const tzOptions = useMemo(() => {
    const inList = COMMON_TIMEZONES.some((tz) => tz.value === timezone);
    return inList
      ? COMMON_TIMEZONES
      : [{ value: timezone, label: timezone }, ...COMMON_TIMEZONES];
  }, [timezone]);

  const {
    data: availableSlots,
    isLoading: slotsLoading,
    isError,
  } = useDemoSlots(token || null);

  const { data: calendarSettings, isLoading: settingsLoading } =
    useDemoSettings(token || null);

  const {
    mutate: confirmSlot,
    isPending: isConfirming,
    isError: isConfirmError,
  } = useConfirmDemoSlot();

  const isLoading = slotsLoading || settingsLoading;

  const advanceDays = calendarSettings?.advanceBookingDays ?? 30;
  const workingDays: number[] = calendarSettings?.workingDays ?? [
    1, 2, 3, 4, 5,
  ];
  const blockedDates: string[] = calendarSettings?.blockedDates ?? [];

  // Build date range anchored to "today" in the selected timezone
  const dateRange: Date[] = useMemo(() => {
    const todayStr = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
    }).format(new Date());
    const todayInTZ = new Date(todayStr + "T00:00:00");
    return Array.from({ length: advanceDays }, (_, i) => addDays(todayInTZ, i));
  }, [advanceDays, timezone]);

  const isDateDisabled = (dateStr: string, dayOfWeek: number): boolean => {
    if (!workingDays.includes(dayOfWeek)) return true;
    if (blockedDates.includes(dateStr)) return true;
    const hasSlots = availableSlots?.some(
      (s) => getSlotDateInTZ(s.startTime, timezone) === dateStr,
    );
    return !hasSlots;
  };

  const slotsForSelectedDate = selectedDate
    ? (availableSlots?.filter(
        (s) => getSlotDateInTZ(s.startTime, timezone) === selectedDate,
      ) ?? [])
    : [];

  /** Days a keyboard user can actually land on — drives the roving tabindex. */
  const enabledDateStrs = dateRange
    .map((date) => toDateStr(date))
    .filter(
      (dateStr, index) => !isDateDisabled(dateStr, dateRange[index].getDay()),
    );

  const tabStopDate =
    selectedDate && enabledDateStrs.includes(selectedDate)
      ? selectedDate
      : enabledDateStrs[0];

  const selectedSlot = slotsForSelectedDate.find(
    (slot) => slot.uid === selectedSlotUid,
  );

  /** Politely announced to screen readers as the funnel progresses. */
  const liveAnnouncement = selectedSlot
    ? t("booking.slot_selected_announcement", {
        time: formatSlotTime(
          selectedSlot.startTime,
          selectedSlot.endTime,
          timezone,
        ),
        date: selectedDate,
      })
    : selectedDate
      ? t("booking.times_available_for_date", {
          total: slotsForSelectedDate.length,
          date: selectedDate,
        })
      : "";

  // Move focus into the time-slot step once the visitor picks a day.
  useEffect(() => {
    if (selectedDate && shouldFocusTimesRef.current) {
      shouldFocusTimesRef.current = false;
      timeSectionRef.current?.focus();
    }
  }, [selectedDate]);

  const handleConfirm = () => {
    if (!selectedSlotUid || !token) return;
    confirmSlot(
      { token, slotUid: selectedSlotUid },
      {
        onSuccess: () => {
          navigate(`/booking-confirmed-demo/${token}`);
        },
      },
    );
  };

  const handleDateClick = (dateStr: string) => {
    shouldFocusTimesRef.current = true;
    setSelectedDate(dateStr);
    setSelectedSlotUid(null);
  };

  const focusDay = (dateStr: string) => {
    const element = dayRefs.current[dateStr];
    if (!element) return;
    element.focus();
    element.scrollIntoView({ block: "nearest", inline: "nearest" });
  };

  /** Arrow / Home / End move focus across the day strip without selecting. */
  const handleDayKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    dateStr: string,
  ) => {
    const index = enabledDateStrs.indexOf(dateStr);
    if (index === -1) return;

    let target: string | undefined;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        target = enabledDateStrs[index + 1];
        break;
      case "ArrowLeft":
      case "ArrowUp":
        target = enabledDateStrs[index - 1];
        break;
      case "Home":
        target = enabledDateStrs[0];
        break;
      case "End":
        target = enabledDateStrs[enabledDateStrs.length - 1];
        break;
      default:
        return;
    }

    event.preventDefault();
    if (target) focusDay(target);
  };

  const scrollDates = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 64 * 3 + 8 * 3;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <Container
        maxWidth="md"
        sx={{ mt: 8, textAlign: "center" }}
        role="status"
        aria-live="polite"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {t("booking.loading_slots")}
        </Typography>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Alert severity="error">
          <Typography variant="h6">{t("booking.error_title")}</Typography>
          <Typography>{t("booking.error_invalid_token")}</Typography>
        </Alert>
      </Container>
    );
  }

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

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <EventAvailableIcon
          aria-hidden="true"
          sx={{ fontSize: 56, color: "primary.main", mb: 1.5 }}
        />
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          {t("contact.book_demo_page_title")}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t("contact.book_demo_page_subtitle")}
        </Typography>
      </Box>

      {/* Timezone selector */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 3,
          p: 1.5,
          borderRadius: 1,
          bgcolor: "action.hover",
        }}
      >
        <PublicIcon fontSize="small" color="action" aria-hidden="true" />
        <Typography
          id="booking-timezone-label"
          variant="body2"
          color="text.secondary"
          sx={{ flexShrink: 0 }}
        >
          {t("booking.timezone_label")}:
        </Typography>
        <Select
          value={timezone}
          onChange={(e) => {
            setTimezone(e.target.value);
            setSelectedDate(null);
            setSelectedSlotUid(null);
          }}
          size="small"
          variant="standard"
          disableUnderline
          inputProps={{ "aria-labelledby": "booking-timezone-label" }}
          sx={{ fontSize: "0.875rem", flex: 1, maxWidth: 320, ...focusRing }}
        >
          {tzOptions.map((tz) => (
            <MenuItem
              key={tz.value}
              value={tz.value}
              sx={{ fontSize: "0.875rem" }}
            >
              {tz.label}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {/* Date selector */}
      <Typography
        id="booking-date-heading"
        variant="subtitle1"
        component="h2"
        fontWeight={600}
        sx={{ mb: 1.5 }}
      >
        {t("booking.select_date")}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 3 }}>
        <IconButton
          size="small"
          onClick={() => scrollDates("left")}
          aria-label={t("booking.scroll_dates_back")}
        >
          <ChevronLeftIcon />
        </IconButton>

        <Box
          ref={scrollRef}
          role="group"
          aria-labelledby="booking-date-heading"
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            flex: 1,
            scrollBehavior: "smooth",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            p: "3px",
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
                const dayOfWeek = date.getDay();
                const disabled = isDateDisabled(dateStr, dayOfWeek);
                return (
                  <DayCard
                    key={dateStr}
                    date={date}
                    dateStr={dateStr}
                    isSelected={selectedDate === dateStr}
                    isDisabled={disabled}
                    isTabStop={dateStr === tabStopDate}
                    onClick={() => handleDateClick(dateStr)}
                    onKeyDown={(event) => handleDayKeyDown(event, dateStr)}
                    registerRef={(element) => {
                      dayRefs.current[dateStr] = element;
                    }}
                  />
                );
              })}
        </Box>

        <IconButton
          size="small"
          onClick={() => scrollDates("right")}
          aria-label={t("booking.scroll_dates_forward")}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Screen-reader announcement of funnel progress */}
      <Box aria-live="polite" sx={srOnly}>
        {liveAnnouncement}
      </Box>

      {/* Time slots */}
      {selectedDate ? (
        <>
          <Typography
            id="booking-time-heading"
            ref={timeSectionRef}
            tabIndex={-1}
            variant="subtitle1"
            component="h2"
            fontWeight={600}
            sx={{ mb: 1.5, ...focusRing }}
          >
            {t("booking.select_time")}
          </Typography>

          {slotsForSelectedDate.length === 0 ? (
            <Alert severity="info" sx={{ mb: 3 }}>
              {t("booking.no_slots_this_day")}
            </Alert>
          ) : (
            <Grid
              container
              spacing={2}
              sx={{ mb: 4 }}
              role="group"
              aria-labelledby="booking-time-heading"
            >
              {slotsForSelectedDate.map((slot) => {
                const isSelected = selectedSlotUid === slot.uid;
                const duration = getDurationMinutes(
                  slot.startTime,
                  slot.endTime,
                );
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={slot.uid}>
                    <Paper
                      component="button"
                      type="button"
                      elevation={isSelected ? 6 : 1}
                      onClick={() => setSelectedSlotUid(slot.uid)}
                      aria-pressed={isSelected}
                      sx={{
                        p: 2,
                        width: "100%",
                        display: "block",
                        fontFamily: "inherit",
                        cursor: "pointer",
                        border: isSelected ? 2 : 1,
                        borderStyle: "solid",
                        borderColor: isSelected ? "primary.main" : "divider",
                        bgcolor: isSelected ? "primary.50" : "background.paper",
                        transition: "all 0.2s",
                        textAlign: "center",
                        ...focusRing,
                        "&:hover": {
                          borderColor: "primary.main",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      {isSelected && (
                        <CheckCircleIcon
                          aria-hidden="true"
                          sx={{ color: "primary.main", mb: 0.5 }}
                        />
                      )}
                      <AccessTimeIcon
                        aria-hidden="true"
                        sx={{
                          color: isSelected ? "primary.main" : "text.secondary",
                          display: "block",
                          mx: "auto",
                          mb: 0.5,
                        }}
                      />
                      <Typography variant="h6" fontWeight={600}>
                        {formatSlotTime(slot.startTime, slot.endTime, timezone)}
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
        {isConfirmError && (
          <Alert severity="error" sx={{ mb: 2, width: "100%" }}>
            {t("booking.confirm_error_message")}
          </Alert>
        )}
        <Button
          variant="contained"
          size="large"
          onClick={handleConfirm}
          disabled={!selectedSlotUid || isConfirming}
          aria-busy={isConfirming}
          endIcon={
            isConfirming ? undefined : <CheckCircleIcon aria-hidden="true" />
          }
          sx={{ px: 6, py: 1.5, minWidth: 220 }}
        >
          {isConfirming ? (
            <>
              <CircularProgress
                size={20}
                aria-hidden="true"
                sx={{ mr: 1, color: "inherit" }}
              />
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

export default BookDemoPage;
