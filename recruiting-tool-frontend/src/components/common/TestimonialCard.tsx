import {
  Card,
  CardContent,
  Typography,
  Box,
  alpha,
  useTheme,
} from "@mui/material";

/**
 * TestimonialCard Component
 *
 * Displays a customer testimonial with quote, author information, and avatar.
 * Used in marketing/landing pages to showcase customer success stories.
 *
 * @example
 * ```tsx
 * <TestimonialCard
 *   quote={t('landing.testimonials.testimonial_1.quote')}
 *   author={t('landing.testimonials.testimonial_1.author')}
 *   role={t('landing.testimonials.testimonial_1.role')}
 *   company={t('landing.testimonials.testimonial_1.company')}
 * />
 * ```
 */

export interface TestimonialCardProps {
  /** The testimonial quote text (should use i18n) */
  quote: string;
  /** Name of the person giving the testimonial (should use i18n) */
  author: string;
  /** Job role/title of the author (should use i18n) */
  role: string;
  /** Company name where the author works (should use i18n) */
  company: string;
  /** Optional: URL to author's avatar/profile image */
  avatarUrl?: string;
  /** Optional: Custom background color for avatar (hex or theme color) */
  avatarColor?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  quote,
  author,
  role,
  company,
  avatarUrl,
  avatarColor,
}) => {
  const theme = useTheme();
  const defaultAvatarColor = avatarColor || theme.palette.primary.main;

  return (
    <Card sx={{ height: "100%", p: 3 }}>
      <CardContent>
        {/* Quote */}
        <Typography variant="body1" sx={{ mb: 3, fontStyle: "italic" }}>
          "{quote}"
        </Typography>

        {/* Author Info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Avatar */}
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              bgcolor: avatarUrl
                ? "transparent"
                : alpha(defaultAvatarColor, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              color: avatarUrl ? "transparent" : defaultAvatarColor,
              backgroundImage: avatarUrl ? `url(${avatarUrl})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!avatarUrl && author.charAt(0)}
          </Box>

          {/* Author Details */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {author}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {role}, {company}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;
