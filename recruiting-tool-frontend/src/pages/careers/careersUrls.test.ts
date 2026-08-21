import { describe, expect, it } from "vitest";

import {
  buildCompanyCareersPath,
  buildJobPath,
  extractJobUid,
  resolveCompanyBySlug,
  slugify,
} from "./careersUrls";
import { buildFacetPath, findFacet, resolveFacetPath } from "./jobFacets";

const UID = "3f8c1a2b-9d4e-4f21-b8c7-2a5e6d9f0011";

describe("slugify", () => {
  it("strips accents instead of dropping the letters", () => {
    expect(slugify("Diseñador Gráfico Señor")).toBe("disenador-grafico-senor");
  });

  it("collapses punctuation and trims separators", () => {
    expect(slugify("  Senior React / Node.js Engineer!  ")).toBe(
      "senior-react-node-js-engineer",
    );
  });

  it("returns an empty string for input that slugifies to nothing", () => {
    expect(slugify("***")).toBe("");
    expect(slugify(undefined)).toBe("");
  });

  it("never leaves a trailing separator after truncation", () => {
    const slug = slugify(`${"a".repeat(69)} tail`);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("buildJobPath / extractJobUid", () => {
  it("puts the keywords in front of the UID", () => {
    expect(
      buildJobPath({
        uid: UID,
        title: "Senior React Engineer",
        companyName: "Acme Corp",
      }),
    ).toBe(`/jobs/acme-corp/senior-react-engineer-${UID}`);
  });

  it("falls back rather than emitting an empty path segment", () => {
    expect(buildJobPath({ uid: UID, title: "***", companyName: "" })).toBe(
      `/jobs/company/job-${UID}`,
    );
  });

  it("round-trips the UID out of the slug it built", () => {
    const path = buildJobPath({
      uid: UID,
      title: "Ingeniero de Datos",
      companyName: "Ñandú SA",
    });
    expect(extractJobUid(path.split("/").pop())).toBe(UID);
  });

  it("ignores a rewritten slug and still resolves the same posting", () => {
    expect(extractJobUid(`anything-a-visitor-typed-${UID}`)).toBe(UID);
  });

  it("returns null when there is no UID, which is how facet URLs are told apart", () => {
    expect(extractJobUid("colombia")).toBeNull();
    expect(extractJobUid(undefined)).toBeNull();
    // A UID in the middle is not the canonical tail shape.
    expect(extractJobUid(`${UID}-trailing-words`)).toBeNull();
  });
});

describe("resolveCompanyBySlug", () => {
  const companies = [
    { uid: "11111111-1111-4111-8111-111111111111", name: "Acme Corp" },
    { uid: "22222222-2222-4222-8222-222222222222", name: "Ñandú SA" },
  ];

  it("resolves the name slug it emits", () => {
    const path = buildCompanyCareersPath(companies[1]);
    expect(path).toBe("/careers/company/nandu-sa");
    expect(resolveCompanyBySlug(companies, "nandu-sa")).toBe(companies[1]);
  });

  it("accepts a raw UID as the unambiguous escape hatch", () => {
    expect(resolveCompanyBySlug(companies, companies[0].uid)).toBe(
      companies[0],
    );
  });

  it("returns null for an unknown slug rather than guessing", () => {
    expect(resolveCompanyBySlug(companies, "some-other-company")).toBeNull();
    expect(resolveCompanyBySlug([], "acme-corp")).toBeNull();
  });
});

describe("facet resolution", () => {
  it("resolves a single facet", () => {
    const facets = resolveFacetPath("remote");
    expect(facets).not.toBeNull();
    expect(facets?.[0].dimension).toBe("workLocation");
    expect(facets?.[0].value).toBe("REMOTE");
  });

  it("resolves a role + country pair", () => {
    const facets = resolveFacetPath("engineering", "colombia");
    expect(facets?.map((f) => f.value)).toEqual(["Engineering", "Colombia"]);
    expect(buildFacetPath(facets!)).toBe("/jobs/engineering/colombia");
  });

  it("rejects the reversed pair so it cannot duplicate the canonical one", () => {
    expect(resolveFacetPath("colombia", "engineering")).toBeNull();
  });

  it("rejects anything outside the registry, keeping the URL space closed", () => {
    expect(resolveFacetPath("blockchain-ninja")).toBeNull();
    expect(resolveFacetPath("engineering", "atlantis")).toBeNull();
    expect(findFacet(undefined)).toBeNull();
  });

  it("keeps every facet slug unique across dimensions", () => {
    // The registry is a flat slug -> facet map, so a collision would silently
    // make one dimension unreachable.
    const slugs = [
      "remote",
      "hybrid",
      "onsite",
      "engineering",
      "design",
      "marketing",
      "sales",
      "product",
      "argentina",
      "brazil",
      "chile",
      "colombia",
      "mexico",
      "peru",
      "uruguay",
      "united-states",
      "full-time",
      "part-time",
      "contract",
      "internship",
      "temporary",
    ];
    for (const slug of slugs) {
      expect(findFacet(slug)?.slug).toBe(slug);
    }
  });
});
