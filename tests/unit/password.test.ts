import { describe, expect, it } from "vitest";
import { passwordSchema, hashPassword, verifyPassword } from "@/lib/password";

describe("passwordSchema", () => {
  it("rejects short passwords", () => {
    expect(passwordSchema.safeParse("Ab1!").success).toBe(false);
  });
  it("rejects passwords missing complexity", () => {
    expect(passwordSchema.safeParse("aaaaaaaaaa").success).toBe(false);
    expect(passwordSchema.safeParse("aaaaaaaaAa").success).toBe(false);
    expect(passwordSchema.safeParse("aaaaaaaaA1").success).toBe(false);
  });
  it("rejects common weak passwords", () => {
    expect(passwordSchema.safeParse("Password123").success).toBe(false);
  });
  it("accepts a strong password", () => {
    expect(passwordSchema.safeParse("Str0ng!Pass!").success).toBe(true);
  });
});

describe("hash/verify", () => {
  it("roundtrips", async () => {
    const hash = await hashPassword("Str0ng!Pass!");
    expect(await verifyPassword("Str0ng!Pass!", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });
});
