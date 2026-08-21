/**
 * Loads the Markdown articles in `src/content/blog/` at build time.
 *
 * ## Why there is no MDX pipeline here
 *
 * The articles are plain Markdown with YAML front matter and no embedded JSX,
 * and `react-markdown` + `remark-gfm` are already dependencies (the job detail
 * page renders posting descriptions through them). Adding `@mdx-js/rollup` for
 * six static documents would mean a new build plugin, a new Vite config branch
 * and a second Markdown renderer in the bundle, in exchange for a capability
 * nothing in the content actually uses.
 *
 * `import.meta.glob(..., { eager: true })` inlines the files into the chunk, so
 * there is no runtime fetch and no loading state on an article page. All blog
 * routes are lazy in `App.tsx`, so those ~76 KB never reach the landing page.
 *
 * ## Why the front matter parser is hand-written
 *
 * `gray-matter` is a Node-oriented package that pulls in a full YAML engine.
 * The front matter in these files is a flat map of scalars plus one string
 * list, which is a dozen lines to parse and one fewer dependency to audit on a
 * public, unauthenticated surface.
 */

/** Front matter fields the blog pages rely on. */
export interface BlogPostFrontmatter {
  title: string;
  slug: string;
  description: string;
  /** Base language tag of the article body: `"en"` or `"es"`. */
  lang: string;
  /** ISO date, `YYYY-MM-DD`. */
  publishedAt: string;
  updatedAt?: string;
  keywords: string[];
  /** Absolute canonical URL declared by the author. */
  canonical?: string;
  author?: string;
  /** Editorial grouping: `guide`, `comparison`, `technical`, … */
  category?: string;
  readingTimeMinutes?: number;
  /**
   * Unpublished draft. Two of the shipped articles are drafts carrying
   * "VERIFY BEFORE PUBLISHING" notes about competitor pricing claims, so this
   * flag is a publication gate, not a hint — see {@link getPostBySlug}.
   */
  draft: boolean;
}

export interface BlogPost extends BlogPostFrontmatter {
  /** Markdown body with the front matter block removed. */
  body: string;
}

/** Matches the leading `---` … `---` front matter block. */
const FRONTMATTER_PATTERN = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** `key: value` at the start of a line. */
const KEY_VALUE_PATTERN = /^([A-Za-z][A-Za-z0-9_]*):\s*(.*)$/;

/** `  - value` list item. */
const LIST_ITEM_PATTERN = /^\s+-\s+(.*)$/;

/** Strips matching single or double quotes from a scalar. */
const unquote = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if ((first === '"' || first === "'") && last === first) {
      return trimmed.slice(1, -1);
    }
  }
  return trimmed;
};

type FrontmatterValue = string | string[] | number | boolean;

/**
 * Parses the flat-scalar / string-list subset of YAML these articles use.
 *
 * Anything more exotic (nested maps, anchors, multi-line blocks) is not
 * supported on purpose: if an article ever needs it, that is the moment to
 * reach for a real YAML parser rather than to grow this one.
 */
function parseFrontmatter(block: string): Record<string, FrontmatterValue> {
  const result: Record<string, FrontmatterValue> = {};
  let currentListKey: string | null = null;

  for (const rawLine of block.split(/\r?\n/)) {
    if (!rawLine.trim() || rawLine.trim().startsWith("#")) continue;

    const listItem = LIST_ITEM_PATTERN.exec(rawLine);
    if (listItem && currentListKey) {
      (result[currentListKey] as string[]).push(unquote(listItem[1]));
      continue;
    }

    const pair = KEY_VALUE_PATTERN.exec(rawLine);
    if (!pair) continue;

    const [, key, rawValue] = pair;

    if (rawValue.trim() === "") {
      // `keywords:` followed by indented `- item` lines.
      currentListKey = key;
      result[key] = [];
      continue;
    }

    currentListKey = null;
    const value = unquote(rawValue);

    if (value === "true" || value === "false") {
      result[key] = value === "true";
    } else if (/^-?\d+(\.\d+)?$/.test(value)) {
      result[key] = Number(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

const asString = (value: FrontmatterValue | undefined): string =>
  typeof value === "string" ? value : "";

/** Turns a raw file into a post, or `null` when the front matter is unusable. */
function toBlogPost(filePath: string, raw: string): BlogPost | null {
  const match = FRONTMATTER_PATTERN.exec(raw);
  if (!match) return null;

  const data = parseFrontmatter(match[1]);
  const body = raw.slice(match[0].length).trim();

  // Fall back to the filename so a post with a malformed `slug:` is still
  // reachable at the URL its filename implies.
  const fileSlug = filePath.split("/").pop()?.replace(/\.md$/, "") ?? "";
  const slug = asString(data.slug) || fileSlug;
  const title = asString(data.title);

  if (!slug || !title) return null;

  return {
    slug,
    title,
    body,
    description: asString(data.description),
    lang: asString(data.lang) || "en",
    publishedAt: asString(data.publishedAt),
    updatedAt: asString(data.updatedAt) || undefined,
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    canonical: asString(data.canonical) || undefined,
    author: asString(data.author) || undefined,
    category: asString(data.category) || undefined,
    readingTimeMinutes:
      typeof data.readingTimeMinutes === "number"
        ? data.readingTimeMinutes
        : undefined,
    draft: data.draft === true,
  };
}

const RAW_POSTS = import.meta.glob("../../content/blog/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/** Newest first. Articles with no date sort last rather than crashing. */
const byPublishedDesc = (a: BlogPost, b: BlogPost): number =>
  (b.publishedAt || "").localeCompare(a.publishedAt || "");

const ALL_POSTS: BlogPost[] = Object.entries(RAW_POSTS)
  .map(([filePath, raw]) => toBlogPost(filePath, raw))
  .filter((post): post is BlogPost => post !== null)
  .sort(byPublishedDesc);

const POSTS_BY_SLUG = new Map(ALL_POSTS.map((post) => [post.slug, post]));

/** Every publishable article, newest first. Drafts are excluded. */
export function getPublishedPosts(): BlogPost[] {
  return ALL_POSTS.filter((post) => !post.draft);
}

/**
 * One article by slug.
 *
 * Drafts resolve only in development. In production they are treated as
 * missing, because the two drafts in this repo contain unverified competitor
 * pricing claims flagged by their own authors — a public page is the wrong
 * place to find that out.
 */
export function getPostBySlug(slug: string | undefined): BlogPost | null {
  if (!slug) return null;
  const post = POSTS_BY_SLUG.get(slug) ?? null;
  if (!post) return null;
  if (post.draft && !import.meta.env.DEV) return null;
  return post;
}

/** Path builder, so links, canonicals and the sitemap cannot drift apart. */
export function buildBlogPostPath(post: Pick<BlogPost, "slug">): string {
  return `/blog/${post.slug}`;
}
