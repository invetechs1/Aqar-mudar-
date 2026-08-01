import { describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: () => ({ get: () => undefined }),
}));

import { getDictionary } from "@/lib/i18n";

describe("i18n dictionary", () => {
  it("returns Arabic by default", () => {
    const dict = getDictionary();
    expect(dict.dir).toBe("rtl");
    expect(dict.nav.home).toBe("الرئيسية");
  });

  it("returns English when asked", () => {
    const dict = getDictionary("en");
    expect(dict.dir).toBe("ltr");
    expect(dict.nav.home).toBe("Home");
  });
});
