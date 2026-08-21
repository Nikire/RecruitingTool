import { useMemo } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Seo from "../../components/common/Seo";
import { wrapLongText } from "../../utils/textOverflow";
import { buildBlogPostPath, getPublishedPosts } from "./blogContent";

/** Locale-aware date, falling back to the raw ISO string if it will not parse. */
const formatDate = (iso: string, locale: string): string => {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString(locale);
};

/**
 * The article index at `/blog`.
 *
 * This is the hub that makes the individual articles crawlable — every card is
 * a real `<a href>` through `CardActionArea`, not an onClick handler, so link
 * equity actually flows from here to each post.
 */
const BlogIndexPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const posts = useMemo(() => getPublishedPosts(), []);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6 }}>
      <Seo
        title={t("seo.blog.title")}
        description={t("seo.blog.description")}
      />

      <Container maxWidth="md">
        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: 800, mb: 1.5, ...wrapLongText }}
          >
            {t("blog.index_title")}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t("blog.index_subtitle")}
          </Typography>
        </Box>

        {posts.length === 0 ? (
          <Typography color="text.secondary">{t("blog.empty")}</Typography>
        ) : (
          <Stack
            spacing={2.5}
            component="ul"
            sx={{ listStyle: "none", p: 0, m: 0 }}
          >
            {posts.map((post) => (
              <Card key={post.slug} component="li" variant="outlined">
                <CardActionArea
                  component={RouterLink}
                  to={buildBlogPostPath(post)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1.25, flexWrap: "wrap", rowGap: 1 }}
                    >
                      {post.category && (
                        <Chip
                          size="small"
                          variant="filled"
                          label={t(`blog.category.${post.category}`, {
                            defaultValue: post.category,
                          })}
                        />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(post.publishedAt, i18n.language)}
                      </Typography>
                      {post.readingTimeMinutes ? (
                        <Typography variant="caption" color="text.secondary">
                          {t("blog.reading_time", {
                            minutes: post.readingTimeMinutes,
                          })}
                        </Typography>
                      ) : null}
                      <Chip
                        size="small"
                        variant="filled"
                        label={t(`blog.lang.${post.lang}`, {
                          defaultValue: post.lang.toUpperCase(),
                        })}
                      />
                    </Stack>

                    <Typography
                      variant="h5"
                      component="h2"
                      sx={{ fontWeight: 700, mb: 1, ...wrapLongText }}
                    >
                      {post.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={wrapLongText}
                    >
                      {post.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default BlogIndexPage;
