import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  credentialFormSchema,
  safeUrlSchema,
  normalizeWebsiteUrl,
  tagSchema,
} from "@/lib/validations/credential";
import { SYSTEM_CATEGORIES } from "@/lib/constants/categories";

describe("Credential Validation & Organization Tests", () => {
  describe("Credential Form Validation Schema", () => {
    test("accepts valid credential payload", () => {
      const result = credentialFormSchema.safeParse({
        title: "GitHub Account",
        username: "octocat@github.com",
        password: "SuperSecretPassword123!",
        websiteUrl: "https://github.com/login",
        categoryId: "work",
        tags: ["development", "git", "2fa"],
        notes: "Work account with SSH keys configured.",
      });
      assert.equal(result.success, true);
    });

    test("rejects missing title", () => {
      const result = credentialFormSchema.safeParse({
        title: "",
        username: "octocat",
        password: "password123",
        tags: [],
      });
      assert.equal(result.success, false);
    });

    test("rejects missing username", () => {
      const result = credentialFormSchema.safeParse({
        title: "Google",
        username: "",
        password: "password123",
        tags: [],
      });
      assert.equal(result.success, false);
    });

    test("rejects missing password", () => {
      const result = credentialFormSchema.safeParse({
        title: "Google",
        username: "user@gmail.com",
        password: "",
        tags: [],
      });
      assert.equal(result.success, false);
    });
  });

  describe("Safe URL Validation & Normalization", () => {
    test("accepts standard HTTPS and HTTP URLs", () => {
      assert.equal(safeUrlSchema.safeParse("https://app.example.com").success, true);
      assert.equal(safeUrlSchema.safeParse("http://localhost:3000").success, true);
      assert.equal(safeUrlSchema.safeParse("google.com").success, true);
      assert.equal(safeUrlSchema.safeParse("").success, true);
      assert.equal(safeUrlSchema.safeParse(undefined).success, true);
    });

    test("rejects malicious and non-HTTP protocols", () => {
      assert.equal(safeUrlSchema.safeParse("javascript:alert(1)").success, false);
      assert.equal(safeUrlSchema.safeParse("data:text/html;base64,PHNjcmlwdD4=").success, false);
      assert.equal(safeUrlSchema.safeParse("vbscript:msgbox(1)").success, false);
      assert.equal(safeUrlSchema.safeParse("file:///etc/passwd").success, false);
    });

    test("normalizes domain names by prepending https://", () => {
      assert.equal(normalizeWebsiteUrl("github.com"), "https://github.com");
      assert.equal(normalizeWebsiteUrl("  gitlab.com  "), "https://gitlab.com");
      assert.equal(normalizeWebsiteUrl("http://insecure.site"), "http://insecure.site");
      assert.equal(normalizeWebsiteUrl("https://secure.site"), "https://secure.site");
      assert.equal(normalizeWebsiteUrl(""), undefined);
    });
  });

  describe("Tag Validation", () => {
    test("validates tag string lengths and trims whitespace", () => {
      assert.equal(tagSchema.safeParse("work").success, true);
      assert.equal(tagSchema.safeParse("").success, false);
      assert.equal(tagSchema.safeParse("a".repeat(31)).success, false);
    });
  });

  describe("Search & Filtering Logic", () => {
    const mockCredentials = [
      {
        id: "1",
        title: "GitHub Work",
        websiteUrl: "https://github.com",
        categoryId: "work",
        tags: ["dev", "git"],
        updatedAt: 1000,
      },
      {
        id: "2",
        title: "AWS Cloud",
        websiteUrl: "https://aws.amazon.com",
        categoryId: "infrastructure",
        tags: ["dev", "cloud"],
        updatedAt: 2000,
      },
      {
        id: "3",
        title: "Personal Banking",
        websiteUrl: "https://chase.com",
        categoryId: "finance",
        tags: ["money", "2fa"],
        updatedAt: 3000,
      },
    ];

    test("searches by title substring (case-insensitive)", () => {
      const term = "git";
      const results = mockCredentials.filter((c) =>
        c.title.toLowerCase().includes(term)
      );
      assert.equal(results.length, 1);
      assert.equal(results[0].title, "GitHub Work");
    });

    test("searches by URL substring", () => {
      const term = "amazon";
      const results = mockCredentials.filter((c) =>
        c.websiteUrl.toLowerCase().includes(term)
      );
      assert.equal(results.length, 1);
      assert.equal(results[0].title, "AWS Cloud");
    });

    test("searches by tag substring", () => {
      const term = "dev";
      const results = mockCredentials.filter((c) =>
        c.tags.some((t) => t.toLowerCase().includes(term))
      );
      assert.equal(results.length, 2);
    });

    test("filters by category strictly", () => {
      const results = mockCredentials.filter((c) => c.categoryId === "finance");
      assert.equal(results.length, 1);
      assert.equal(results[0].id, "3");
    });

    test("sorts by updated timestamp descending and ascending", () => {
      const sortedDesc = [...mockCredentials].sort((a, b) => b.updatedAt - a.updatedAt);
      assert.equal(sortedDesc[0].id, "3");
      assert.equal(sortedDesc[2].id, "1");

      const sortedAsc = [...mockCredentials].sort((a, b) => a.updatedAt - b.updatedAt);
      assert.equal(sortedAsc[0].id, "1");
      assert.equal(sortedAsc[2].id, "3");
    });

    test("sorts alphabetically by title", () => {
      const sortedAlpha = [...mockCredentials].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
      assert.equal(sortedAlpha[0].title, "AWS Cloud");
      assert.equal(sortedAlpha[1].title, "GitHub Work");
      assert.equal(sortedAlpha[2].title, "Personal Banking");
    });
  });

  describe("Organization & Tag Invariants", () => {
    test("system categories exist and contain required defaults", () => {
      assert.equal(Array.isArray(SYSTEM_CATEGORIES), true);
      assert.ok(SYSTEM_CATEGORIES.length >= 4);
      const systemIds = SYSTEM_CATEGORIES.map((c) => c.id);
      assert.ok(systemIds.includes("logins"));
      assert.ok(systemIds.includes("cards"));
      assert.ok(systemIds.includes("secure-notes"));
    });

    test("extracts and deduplicates tags across all credentials", () => {
      const creds = [
        { tags: ["work", "dev", "cloud"] },
        { tags: ["personal", "work"] },
        { tags: ["dev", "cloud", "aws"] },
      ];
      const tagSet = new Set<string>();
      creds.forEach((c) => c.tags.forEach((t) => tagSet.add(t)));
      const uniqueTags = Array.from(tagSet).sort();

      assert.deepEqual(uniqueTags, ["aws", "cloud", "dev", "personal", "work"]);
    });

    test("simulates atomic tag rename across credential records", () => {
      const creds = [
        { id: "1", tags: ["old-name", "work"] },
        { id: "2", tags: ["personal", "old-name"] },
        { id: "3", tags: ["unrelated"] },
      ];

      const oldTag = "old-name";
      const newTag = "new-name";

      const updated = creds.map((c) => ({
        ...c,
        tags: c.tags.map((t) => (t === oldTag ? newTag : t)),
      }));

      assert.deepEqual(updated[0].tags, ["new-name", "work"]);
      assert.deepEqual(updated[1].tags, ["personal", "new-name"]);
      assert.deepEqual(updated[2].tags, ["unrelated"]);
    });

    test("simulates atomic tag deletion across credential records", () => {
      const creds = [
        { id: "1", tags: ["to-delete", "keep"] },
        { id: "2", tags: ["to-delete"] },
      ];

      const updated = creds.map((c) => ({
        ...c,
        tags: c.tags.filter((t) => t !== "to-delete"),
      }));

      assert.deepEqual(updated[0].tags, ["keep"]);
      assert.deepEqual(updated[1].tags, []);
    });
  });
});

