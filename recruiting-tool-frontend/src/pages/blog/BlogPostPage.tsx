import { useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import Seo from "../../components/common/Seo";
import { wrapLongText } from "../../utils/textOverflow";
import {
  SITE_NAME,
  SITE_URL,
  type JsonLdObject,
} from "../../utils/structuredData";
import { buildBlogPostPath, getPostBySlug, type BlogPost } from "./blogContent";

/**
 * `BlogPosting` markup for one article.
 *
 * Built here rather than in `utils/structuredData.ts` because the blog is the
 * only consumer; the rule that module enforces — never emit a property with no
 * value — is respected by assembling the node conditionally.
 */
function buildBlogPostingLd(post: BlogPost): JsonLdObject {
  const url = post.canonical ?? `${SITE_URL}${buildBlogPostPath(post)}`;

  const node: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    inLanguage: post.lang,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  if (post.description) node.description = post.description;
  if (post.publishedAt) node.datePublished = post.publishedAt;
  if (post.updatedAt) node.dateModified = post.updatedAt;
  if (post.author) node.author = { "@type": "Organization", name: post.author };
  if (post.keywords.length > 0) node.keywords = post.keywords.join(", ");

  return node;
}

/**
 * Markdown tables scroll inside their own container instead of squeezing
 * every column into a phone-width viewport and breaking words mid-token.
 */
const markdownComponents: Components = {
  table: ({ node, ...props }) => {
    void node; // hast node is not a valid DOM attribute
    return (
      <Box sx={{ overflowX: "auto", mb: 3 }}>
        <table {...props} />
      </Box>
    );
  },
};

/** Locale-aware date, falling back to the raw ISO string if it will not parse. */
const formatDate = (iso: string, locale: string): string => {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleDateString(locale);
};

/**
 * A single article at `/blog/:slug`.
 *
 * The body is rendered with the `react-markdown` + `remark-gfm` pair already in
 * the bundle. Raw HTML in the source is NOT rendered (no `rehype-raw`), which
 * is deliberate: the articles carry `<!-- VERIFY BEFORE PUBLISHING -->` editor
 * notes that must never reach a reader, and it keeps a Markdown file from
 * becoming an injection vector on a public page.
 *
 * `<h1>` is the article title rendered by this component, so Markdown `##`
 * headings land at `<h2>` and the document keeps one top-level heading.
 */
const BlogPostPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();

  const post = useMemo(() => getPostBySlug(slug), [slug]);

  // `<Seo>` keys its head entry on `jsonLd` by reference — memoise or the head
  // is rewritten on every render.
  const jsonLd = useMemo(
    () => (post ? buildBlogPostingLd(post) : undefined),
    [post],
  );

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: "center" }}>
        <Seo
          title={t("seo.blog.not_found_title")}
          description={t("seo.blog.not_found_description")}
          noindex
        />
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          {t("blog.not_found_title")}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {t("blog.not_found_body")}
        </Typography>
        <Button component={RouterLink} to="/blog" variant="contained">
          {t("blog.back_to_index")}
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 6 }}>
      <Seo
        title={t("seo.blog.post_title", { title: post.title })}
        description={post.description}
        canonical={post.canonical ?? buildBlogPostPath(post)}
        ogType="article"
        jsonLd={jsonLd}
        // A draft only ever resolves in development, but if that ever changes,
        // it must not be indexable.
        noindex={post.draft}
      />

      <Container maxWidth="md">
        <Button
          component={RouterLink}
          to="/blog"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 3 }}
        >
          {t("blog.back_to_index")}
        </Button>

        <Typography
          variant="h3"
          component="h1"
          sx={{ fontWeight: 800, mb: 2, ...wrapLongText }}
        >
          {post.title}
        </Typography>

        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ mb: 3, flexWrap: "wrap", rowGap: 1 }}
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
          {post.author && (
            <Typography variant="caption" color="text.secondary">
              {post.author}
            </Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            {formatDate(post.publishedAt, i18n.language)}
          </Typography>
          {post.readingTimeMinutes ? (
            <Typography variant="caption" color="text.secondary">
              {t("blog.reading_time", { minutes: post.readingTimeMinutes })}
            </Typography>
          ) : null}
          {post.draft && (
            <Chip size="small" color="warning" label={t("blog.draft_badge")} />
          )}
        </Stack>

        <Divider sx={{ mb: 4 }} />

        <Box
          // `lang` on the article wrapper: the site chrome follows the UI
          // language, but a Spanish article stays Spanish inside an English UI.
          lang={post.lang}
          sx={{
            ...wrapLongText,
            "& h2": {
              fontSize: { xs: "1.375rem", sm: "1.6rem" },
              fontWeight: 700,
              mt: 5,
              mb: 1.5,
            },
            "& h3": {
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              fontWeight: 700,
              mt: 3.5,
              mb: 1,
            },
            "& p": { lineHeight: 1.8, mb: 2, color: "text.secondary" },
            "& ul, & ol": { pl: 3, mb: 2, color: "text.secondary" },
            "& li": { mb: 0.75, lineHeight: 1.7 },
            "& a": { color: "primary.main" },
            "& blockquote": {
              borderLeft: 3,
              borderColor: "divider",
              pl: 2,
              ml: 0,
              color: "text.secondary",
              fontStyle: "italic",
            },
            "& code": {
              bgcolor: "action.hover",
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              fontSize: "0.9em",
            },
            "& pre": {
              bgcolor: "action.hover",
              p: 2,
              borderRadius: 2,
              overflowX: "auto",
            },
            "& table": {
              width: "100%",
              minWidth: 560,
              borderCollapse: "collapse",
            },
            "& th": { whiteSpace: "nowrap" },
            "& th, & td": {
              border: 1,
              borderColor: "divider",
              p: 1.25,
              textAlign: "left",
              fontSize: "0.9rem",
            },
            "& img": { maxWidth: "100%", height: "auto" },
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {post.body}
          </ReactMarkdown>
        </Box>

        <Divider sx={{ my: 5 }} />

        <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
          <Button component={RouterLink} to="/blog" variant="outlined">
            {t("blog.back_to_index")}
          </Button>
          <Button component={RouterLink} to="/register" variant="contained">
            {t("blog.cta_start_free")}
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default BlogPostPage;
