import { LogoMark } from "./Logo";

export function AuthSplitLayout({
  children,
  headline,
  sub,
  points,
}: {
  children: React.ReactNode;
  headline: string;
  sub: string;
  points: string[];
}) {
  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(440px, 1fr))",
        minHeight: 760,
      }}
    >
      <div
        className="mx-auto w-full"
        style={{ maxWidth: 560, padding: "72px 64px" }}
      >
        {children}
      </div>
      <div
        className="text-white flex flex-col justify-center"
        style={{ background: "#16302a", padding: "72px 56px" }}
      >
        <LogoMark variant="dark" size={64} />
        <h2
          className="font-extrabold mt-8"
          style={{ fontSize: 34, letterSpacing: "-0.01em", lineHeight: 1.25 }}
        >
          {headline}
        </h2>
        <p className="mt-4" style={{ color: "#b9cfc4", fontSize: 16, lineHeight: 1.9, maxWidth: 440 }}>
          {sub}
        </p>
        <ul className="mt-10 space-y-4">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3" style={{ fontSize: 14 }}>
              <span
                className="grid place-items-center flex-none"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: "rgba(201,162,74,.2)",
                  color: "#e6c982",
                  fontWeight: 800,
                }}
              >
                ✓
              </span>
              <span style={{ color: "#dfe7e3" }}>{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
