import { describe, expect, it } from "vitest";
import { generateSecret, totp, verifyTotp, otpauthUrl } from "@/lib/totp";

describe("totp", () => {
  it("generates a base32 secret", () => {
    const s = generateSecret();
    expect(s).toMatch(/^[A-Z2-7]+$/);
    expect(s.length).toBeGreaterThanOrEqual(30);
  });

  it("verifies its own code", () => {
    const s = generateSecret();
    const code = totp(s);
    expect(verifyTotp(s, code)).toBe(true);
  });

  it("rejects wrong codes", () => {
    const s = generateSecret();
    expect(verifyTotp(s, "000000")).toBe(false);
  });

  it("builds an otpauth URI", () => {
    const s = generateSecret();
    const uri = otpauthUrl("Aqar Mudar", "user@example.com", s);
    expect(uri).toMatch(/^otpauth:\/\/totp\//);
    expect(uri).toContain("issuer=Aqar+Mudar");
    expect(uri).toContain(`secret=${s}`);
  });
});
