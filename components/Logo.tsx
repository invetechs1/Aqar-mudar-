import Link from "next/link";

type Variant = "dark" | "light" | "mono";

/**
 * Aqar Mudar logo mark.
 *
 * Concept: a gold roof arc over three descending columns — the tallest at the
 * RTL reading start (right in AR), representing the engineering-certified
 * value uplift a property receives on the platform.
 *
 * The three column opacities are prescribed in the design tokens and must not
 * be tuned freely; use the `variant` to switch palette.
 */
export function LogoMark({
  variant = "dark",
  size = 38,
  className = "",
}: {
  variant?: Variant;
  size?: number;
  className?: string;
}) {
  const roof =
    variant === "mono" ? "#16211d" : "#c9a24a";
  const col =
    variant === "dark"
      ? "#ffffff"
      : variant === "light"
      ? "#2f6a53"
      : "#16211d";
  const opacities =
    variant === "light"
      ? [1, 0.7, 0.42]
      : variant === "mono"
      ? [1, 0.65, 0.38]
      : [1, 0.75, 0.5];
  return (
    <svg
      width={size}
      height={size * (35 / 38)}
      viewBox="0 0 48 44"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 22 L24 5.5 L43 22"
        stroke={roof}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="9" y="21" width="7" height="18" rx="1.5" fill={col} opacity={opacities[0]} />
      <rect x="20.5" y="26" width="7" height="13" rx="1.5" fill={col} opacity={opacities[1]} />
      <rect x="32" y="30" width="7" height="9" rx="1.5" fill={col} opacity={opacities[2]} />
    </svg>
  );
}

/**
 * Full logo signature: mark + Arabic name + English roman name.
 * `on` picks the palette; the wordmark text colours follow.
 */
export function LogoSignature({
  on = "dark",
  size = 40,
  href = "/",
  className = "",
}: {
  on?: Variant;
  size?: number;
  href?: string | null;
  className?: string;
}) {
  const nameColor = on === "dark" ? "#ffffff" : "#16211d";
  const romanColor = on === "dark" ? "rgba(255,255,255,.55)" : "#7d8a85";
  const content = (
    <>
      <LogoMark variant={on} size={size} />
      <span className="flex flex-col leading-none">
        <span
          style={{ color: nameColor, fontWeight: 700, fontSize: 17, letterSpacing: "-0.005em" }}
        >
          عقار مدر
        </span>
        <span
          style={{
            color: romanColor,
            fontSize: 9,
            letterSpacing: "0.22em",
            marginTop: 4,
          }}
        >
          AQAR MUDAR
        </span>
      </span>
    </>
  );
  const inner = (
    <span className={`inline-flex items-center gap-3 ${className}`}>{content}</span>
  );
  if (href === null) return inner;
  return (
    <Link href={href} className="inline-flex" aria-label="Aqar Mudar — home">
      {inner}
    </Link>
  );
}
