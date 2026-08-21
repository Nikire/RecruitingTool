import { describe, expect, it } from "vitest";

import {
  buildBlogPostPath,
  getPostBySlug,
  getPublishedPosts,
} from "./blogContent";

/**
 * These run against the real files in `src/content/blog/`, which is the point:
 * the hand-written front matter parser is only correct if it is correct for the
 * articles actually shipped.
 */
describe("blogContent", () => {
  const posts = getPublishedPosts();

  it("loads the published articles and none of the drafts", () => {
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.every((post) => !post.draft)).toBe(true);
  });

  it("parses every front matter field the SEO tags depend on", () => {
    for (const post of posts) {
      expect(post.title).not.toBe("");
      expect(post.description).not.toBe("");
      expect(post.slug).toMatch(/^[a-z0-9-]+$/);
      expect(["en", "es"]).toContain(post.lang);
      expect(post.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(post.keywords.length).toBeGreaterThan(0);
      // Quotes must be stripped, not carried into the rendered page.
      expect(post.title.startsWith('"')).toBe(false);
      expect(post.keywords.some((k) => k.startsWith('"'))).toBe(false);
    }
  });

  it("strips the front matter block from the body", () => {
    for (const post of posts) {
      expect(post.body.startsWith("---")).toBe(false);
      expect(post.body.length).toBeGreaterThan(500);
    }
  });

  it("sorts newest first", () => {
    const dates = posts.map((post) => post.publishedAt);
    expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates);
  });

  it("resolves each published post by its slug", () => {
    for (const post of posts) {
      expect(getPostBySlug(post.slug)?.title).toBe(post.title);
      expect(buildBlogPostPath(post)).toBe(`/blog/${post.slug}`);
    }
  });

  it("returns null for an unknown slug", () => {
    expect(getPostBySlug("no-such-article")).toBeNull();
    expect(getPostBySlug(undefined)).toBeNull();
  });
});
