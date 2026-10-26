import type { Product, VisualShape } from "@/lib/types";
import { slugify } from "@/lib/slug";

/**
 * Product imagery layer.
 *
 * The demo has no licensed photography, so every product is rendered as a
 * vector "studio" illustration derived from its own shape + colour, which keeps
 * the catalog consistent and guarantees no broken images. To use real photos:
 * set `imageUrl` on the product record (see src/lib/types.ts) and pass it here —
 * the illustration remains the fallback.
 */

type Variant = "front" | "detail" | "blueprint";

interface ProductVisualProps {
  product: Pick<Product, "visual" | "name" | "imageUrl" | "slug" | "dimensions">;
  variant?: Variant;
  className?: string;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function shade(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = Number.parseInt(full, 16);
  const r = clamp(((num >> 16) & 255) + amount);
  const g = clamp(((num >> 8) & 255) + amount);
  const b = clamp((num & 255) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

export function ProductVisual({ product, variant = "front", className }: ProductVisualProps) {
  const { body } = product.visual;
  const uid = slugify(`${product.visual.shape}-${body}-${product.slug}`).slice(0, 40);
  const light = shade(body, 26);
  const dark = shade(body, -26);
  const darker = shade(body, -52);

  if (product.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
        decoding="async"
        className={className}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
      />
    );
  }

  const gridId = `grid-${uid}`;
  const bgId = `bg-${uid}`;
  const bodyId = `body-${uid}`;

  return (
    <svg
      viewBox="0 0 200 200"
      role="img"
      aria-label={`Illustration de démonstration : ${product.name}`}
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <radialGradient id={bgId} cx="50%" cy="38%" r="72%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="62%" stopColor="#f7f8f6" />
          <stop offset="100%" stopColor="#eceeeb" />
        </radialGradient>
        <linearGradient id={bodyId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={light} />
          <stop offset="38%" stopColor={body} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
        <pattern id={gridId} width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M10 0H0v10" fill="none" stroke="#c9d3d6" strokeWidth="0.4" />
        </pattern>
      </defs>

      {variant !== "blueprint" && <rect width="200" height="200" fill={`url(#${bgId})`} />}
      {variant === "blueprint" && (
        <rect width="200" height="200" fill="#fbfcfd" stroke="#dfe6e8" strokeWidth="0.8" />
      )}
      {variant === "blueprint" && <rect width="200" height="200" fill={`url(#${gridId})`} />}

      <g
        transform={
          variant === "detail"
            ? "translate(-46 -34) scale(1.42)"
            : variant === "blueprint"
              ? "translate(0 2)"
              : undefined
        }
      >
        {variant !== "blueprint" && <ellipse cx="100" cy="177" rx="56" ry="7" fill="#0c1b2a" opacity="0.07" />}
        <Shape
          shape={product.visual.shape}
          body={variant === "blueprint" ? "#ffffff" : `url(#${bodyId})`}
          light={light}
          dark={dark}
          darker={darker}
          blueprint={variant === "blueprint"}
        />
      </g>

      {variant === "blueprint" && (
        <g stroke="#0e7c86" strokeWidth="0.9" fill="none" opacity="0.85">
          <path d="M40 188h120M40 185v6M160 185v6" />
          <text x="100" y="196" fontSize="6" textAnchor="middle" fill="#0e7c86" stroke="none">
            {product.dimensions.width} cm
          </text>
        </g>
      )}
    </svg>
  );
}

interface ShapeProps {
  shape: VisualShape;
  body: string;
  light: string;
  dark: string;
  darker: string;
  blueprint: boolean;
}

const ink = "#0c1b2a";
const steel = "#9aa7b0";
const glass = "#dfe9ec";

function Shape({ shape, body, light, dark, darker, blueprint }: ShapeProps) {
  const stroke = blueprint ? "#14505b" : ink;
  const line = blueprint ? "#14505b" : darker;
  const opacity = blueprint ? 0.55 : 0.16;
  const detail = (props: React.SVGProps<SVGRectElement | SVGCircleElement | SVGPathElement>) => ({
    fill: blueprint ? "#ffffff" : "#f7f9f9",
    stroke: line,
    strokeWidth: blueprint ? 0.8 : 0.9,
    opacity: blueprint ? 0.9 : 1,
    ...props,
  });

  switch (shape) {
    case "fridge":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <rect x="62" y="34" width="76" height="140" rx="7" fill={body} />
          <rect x="62" y="34" width="76" height="140" rx="7" fill="none" opacity="0.55" />
          <path d="M62 92h76" stroke={line} strokeWidth="1.4" opacity={blueprint ? 1 : 0.5} />
          <rect x="70" y="46" width="3.4" height="26" rx="1.7" fill={blueprint ? "#fff" : "#5b6770"} stroke="none" />
          <rect x="70" y="104" width="3.4" height="38" rx="1.7" fill={blueprint ? "#fff" : "#5b6770"} stroke="none" />
          <rect x="72" y="46" width="56" height="2" rx="1" fill={dark} stroke="none" opacity="0.4" />
          <rect x="88" y="70" width="24" height="10" rx="2" fill={blueprint ? "#fff" : "#12202f"} stroke="none" opacity="0.75" />
          <circle cx="120" cy="150" r="2" fill={blueprint ? "#fff" : "#1f8a6a"} stroke="none" />
        </g>
      );
    case "fridge-side":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <rect x="44" y="34" width="112" height="140" rx="7" fill={body} />
          <path d="M100 34v140" stroke={line} strokeWidth="1.6" opacity={blueprint ? 1 : 0.55} />
          <rect x="90" y="52" width="3.4" height="52" rx="1.7" fill={blueprint ? "#fff" : "#5b6770"} stroke="none" />
          <rect x="106" y="52" width="3.4" height="52" rx="1.7" fill={blueprint ? "#fff" : "#5b6770"} stroke="none" />
          <rect x="52" y="140" width="40" height="26" rx="3" fill={blueprint ? "#fff" : "#12202f"} stroke="none" opacity="0.7" />
          <rect x="58" y="146" width="16" height="3" rx="1.5" fill="#dbe7ea" stroke="none" />
          <circle cx="146" cy="150" r="2.2" fill={blueprint ? "#fff" : "#1f8a6a"} stroke="none" />
          <rect x="122" y="70" width="26" height="12" rx="2" fill={blueprint ? "#fff" : "#12202f"} stroke="none" opacity="0.65" />
        </g>
      );
    case "freezer":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <rect x="44" y="88" width="112" height="84" rx="9" fill={body} />
          <path d="M44 104h112" stroke={line} strokeWidth="1.4" opacity={blueprint ? 1 : 0.5} />
          <rect x="60" y="100" width="44" height="3" rx="1.5" fill={blueprint ? "#fff" : steel} stroke="none" />
          <rect x="44" y="104" width="112" height="8" fill={dark} stroke="none" opacity="0.25" />
          <circle cx="142" cy="130" r="4" fill={blueprint ? "#fff" : glass} stroke={line} strokeWidth="0.9" />
          <path d="M52 152h60" stroke={line} strokeWidth="0.9" opacity={blueprint ? 1 : 0.35} />
        </g>
      );
    case "washer":
    case "washer-dryer":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <rect x="58" y="40" width="84" height="136" rx="9" fill={body} />
          <path d="M58 72h84" stroke={line} strokeWidth="1.2" opacity={blueprint ? 1 : 0.45} />
          <circle cx="130" cy="56" r="7" fill={blueprint ? "#fff" : dark} stroke={line} strokeWidth="1" />
          <circle cx="130" cy="56" r="2.4" fill={blueprint ? "#fff" : "#f3f5f5"} stroke="none" />
          <rect x="72" y="50" width="30" height="10" rx="2.5" fill={blueprint ? "#fff" : dark} stroke={line} strokeWidth="0.8" />
          <rect x="75" y="53" width="12" height="4" rx="1" fill={blueprint ? "#fff" : "#8fd2d6"} stroke="none" />
          <circle cx="100" cy="118" r="33" fill={blueprint ? "#fff" : glass} stroke={line} strokeWidth="1.4" />
          <circle cx="100" cy="118" r="26" fill={blueprint ? "#fff" : "#eef5f6"} stroke={line} strokeWidth="1" opacity="0.85" />
          <path d="M100 92a26 26 0 0 1 22 12" stroke={blueprint ? line : "#9fc9cd"} strokeWidth="2" fill="none" />
          <circle cx="100" cy="118" r="6" fill={blueprint ? "#fff" : shade("#dfe9ec", -20)} stroke="none" opacity="0.5" />
          {shape === "washer-dryer" && (
            <text x="100" y="70" fontSize="6.5" textAnchor="middle" fill={blueprint ? line : ink} stroke="none" opacity="0.6">
              LAV + SÉCH
            </text>
          )}
        </g>
      );
    case "dishwasher":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <rect x="50" y="46" width="100" height="130" rx="8" fill={body} />
          <rect x="50" y="46" width="100" height="22" rx="8" fill={dark} stroke="none" opacity="0.35" />
          <rect x="58" y="54" width="18" height="6" rx="2" fill={blueprint ? "#fff" : glass} stroke={line} strokeWidth="0.8" />
          <circle cx="138" cy="57" r="3" fill={blueprint ? "#fff" : "#8fd2d6"} stroke={line} strokeWidth="0.8" />
          <rect x="58" y="78" width="84" height="4" rx="2" fill={blueprint ? "#fff" : steel} stroke="none" />
          <path d="M50 96h100" stroke={line} strokeWidth="1.1" opacity={blueprint ? 1 : 0.4} />
          <rect x="62" y="108" width="76" height="56" rx="4" fill={blueprint ? "#fff" : shade("#dfe9ec", 6)} stroke={line} strokeWidth="0.9" opacity={blueprint ? 1 : 0.9} />
          <path d="M62 128h76M62 146h76" stroke={line} strokeWidth="0.8" opacity={blueprint ? 1 : 0.3} />
          <circle cx="118" cy="166" r="1.6" fill={blueprint ? "#fff" : "#1f8a6a"} stroke="none" />
        </g>
      );
    case "cooker":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <rect x="54" y="36" width="92" height="140" rx="6" fill={body} />
          <rect x="54" y="36" width="92" height="26" rx="6" fill={blueprint ? "#fff" : "#2b3540"} stroke="none" opacity={blueprint ? 1 : 0.9} />
          {[74, 96, 118, 136].map((cx, i) => (
            <g key={cx}>
              <circle cx={cx} cy={i < 2 ? 44 : 54} r="6.5" fill="none" stroke={blueprint ? line : "#8e9aa3"} strokeWidth="1.1" />
              <circle cx={cx} cy={i < 2 ? 44 : 54} r="2.4" fill="none" stroke={blueprint ? line : "#8e9aa3"} strokeWidth="0.8" />
            </g>
          ))}
          <rect x="62" y="72" width="24" height="6" rx="2" fill={blueprint ? "#fff" : steel} stroke="none" />
          <rect x="118" y="72" width="20" height="6" rx="2" fill={blueprint ? "#fff" : steel} stroke="none" />
          <rect x="62" y="88" width="76" height="66" rx="4" fill={blueprint ? "#fff" : "#222b35"} stroke={line} strokeWidth="1" opacity={blueprint ? 1 : 0.95} />
          <rect x="68" y="94" width="64" height="40" rx="3" fill={blueprint ? "#fff" : "#3d4b57"} stroke="none" opacity={blueprint ? 1 : 0.9} />
          <rect x="86" y="76" width="28" height="3.4" rx="1.7" fill={blueprint ? "#fff" : steel} stroke="none" />
          <circle cx="100" cy="88" r="1.5" fill={blueprint ? "#fff" : "#c8d3d8"} stroke="none" />
        </g>
      );
    case "oven":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <rect x="44" y="52" width="112" height="108" rx="6" fill={body} />
          <rect x="44" y="52" width="112" height="18" rx="6" fill={blueprint ? "#fff" : dark} stroke="none" opacity="0.4" />
          <circle cx="60" cy="61" r="3.4" fill={blueprint ? "#fff" : "#e9eef0"} stroke={line} strokeWidth="0.8" />
          <rect x="112" y="57" width="34" height="8" rx="2" fill={blueprint ? "#fff" : "#182430"} stroke="none" opacity="0.8" />
          <rect x="52" y="78" width="96" height="16" rx="3" fill={blueprint ? "#fff" : steel} stroke={line} strokeWidth="0.9" />
          <rect x="58" y="100" width="84" height="48" rx="4" fill={blueprint ? "#fff" : "#26313c"} stroke={line} strokeWidth="1" />
          <rect x="64" y="106" width="72" height="36" rx="3" fill={blueprint ? "#fff" : "#43525f"} stroke="none" opacity="0.9" />
          <path d="M70 112l24 12" stroke={blueprint ? line : "#8fb3bd"} strokeWidth="1.1" opacity="0.7" />
        </g>
      );
    case "hob":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <rect x="42" y="76" width="116" height="52" rx="6" fill={blueprint ? "#fff" : "#212934"} />
          <circle cx="76" cy="102" r="16" fill="none" stroke={blueprint ? line : "#5d6b78"} strokeWidth="1.2" />
          <circle cx="76" cy="102" r="9" fill="none" stroke={blueprint ? line : "#5d6b78"} strokeWidth="0.9" />
          <circle cx="128" cy="102" r="16" fill="none" stroke={blueprint ? line : "#5d6b78"} strokeWidth="1.2" />
          <circle cx="128" cy="102" r="9" fill="none" stroke={blueprint ? line : "#5d6b78"} strokeWidth="0.9" />
          <circle cx="152" cy="88" r="1.6" fill={blueprint ? "#fff" : "#8fd2d6"} stroke="none" />
          <path d="M42 128h116" stroke={line} strokeWidth="0.8" opacity="0.5" />
        </g>
      );
    case "microwave":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <rect x="34" y="66" width="132" height="74" rx="7" fill={body} />
          <rect x="42" y="74" width="92" height="58" rx="5" fill={blueprint ? "#fff" : "#1e2833"} stroke={line} strokeWidth="1" />
          <rect x="48" y="80" width="80" height="46" rx="3" fill={blueprint ? "#fff" : "#334451"} stroke="none" opacity={blueprint ? 1 : 0.95} />
          <circle cx="140" cy="82" r="3" fill={blueprint ? "#fff" : "#8fd2d6"} stroke={line} strokeWidth="0.8" />
          <rect x="134" y="92" width="26" height="4" rx="2" fill={blueprint ? "#fff" : steel} stroke="none" />
          <rect x="134" y="104" width="26" height="4" rx="2" fill={blueprint ? "#fff" : steel} stroke="none" />
          <rect x="134" y="116" width="26" height="4" rx="2" fill={blueprint ? "#fff" : steel} stroke="none" />
          <rect x="34" y="140" width="132" height="5" rx="2.5" fill={dark} stroke="none" opacity="0.3" />
          <rect x="120" y="78" width="1.6" height="50" fill={blueprint ? "#fff" : steel} stroke="none" />
        </g>
      );
    case "ac":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <rect x="34" y="70" width="132" height="50" rx="16" fill={body} />
          <path d="M34 104h132" stroke={line} strokeWidth="1.1" opacity={blueprint ? 1 : 0.45} />
          <path d="M44 112c10 6 22 6 32 0M96 112c10 6 22 6 32 0" stroke={blueprint ? line : "#c3d6da"} strokeWidth="2" fill="none" />
          <circle cx="150" cy="87" r="2.2" fill={blueprint ? "#fff" : "#1f8a6a"} stroke="none" />
          <rect x="126" y="82" width="16" height="8" rx="2" fill={blueprint ? "#fff" : "#1b2a38"} stroke="none" opacity="0.5" />
          <path d="M60 70v-6h80v6" stroke={line} strokeWidth="0.9" opacity="0.5" />
        </g>
      );
    case "tv":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <rect x="26" y="50" width="148" height="90" rx="5" fill={blueprint ? "#fff" : "#161d25"} />
          <rect x="31" y="55" width="138" height="80" rx="3" fill={blueprint ? "#fff" : "#2f4657"} stroke="none" />
          <path d="M31 55h138v26L31 108z" fill={blueprint ? "#fff" : "#47677c"} stroke="none" opacity="0.45" />
          <path d="M92 140h16l4 14H88z" fill={blueprint ? "#fff" : "#1c252e"} stroke={line} strokeWidth="0.9" />
          <rect x="76" y="154" width="48" height="5" rx="2.5" fill={blueprint ? "#fff" : "#1c252e"} stroke={line} strokeWidth="0.8" />
          <circle cx="120" cy="163" r="1.4" fill={blueprint ? "#fff" : "#8fd2d6"} stroke="none" />
        </g>
      );
    case "vacuum":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <path d="M96 44h34l-6 42H102z" fill={body} />
          <circle cx="104" cy="118" r="30" fill={body} />
          <circle cx="104" cy="118" r="18" fill={blueprint ? "#fff" : glass} stroke={line} strokeWidth="1" opacity={blueprint ? 1 : 0.9} />
          <path d="M104 100v36M86 118h36" stroke={blueprint ? line : "#a9c4c9"} strokeWidth="1.2" opacity="0.7" />
          <path d="M76 96c-14 8-18 26-12 38" stroke={blueprint ? line : "#3c4a56"} strokeWidth="4" fill="none" strokeLinecap="round" />
          <rect x="52" y="132" width="44" height="9" rx="4.5" fill={blueprint ? "#fff" : "#3c4a56"} stroke="none" />
          <circle cx="132" cy="146" r="7" fill={blueprint ? "#fff" : "#2a343d"} stroke={line} strokeWidth="0.9" />
          <circle cx="76" cy="146" r="7" fill={blueprint ? "#fff" : "#2a343d"} stroke={line} strokeWidth="0.9" />
        </g>
      );
    case "coffee":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <rect x="62" y="38" width="76" height="118" rx="8" fill={body} />
          <rect x="72" y="30" width="36" height="14" rx="4" fill={blueprint ? "#fff" : "#38434e"} stroke={line} strokeWidth="0.9" />
          <rect x="70" y="52" width="44" height="16" rx="3" fill={blueprint ? "#fff" : "#1d2731"} stroke="none" opacity="0.55" />
          <rect x="118" y="54" width="12" height="6" rx="2" fill={blueprint ? "#fff" : "#8fd2d6"} stroke="none" />
          <rect x="76" y="86" width="26" height="10" rx="2" fill={blueprint ? "#fff" : "#2b3742"} stroke="none" />
          <rect x="82" y="98" width="5" height="12" fill={blueprint ? "#fff" : "#6d7a84"} stroke="none" />
          <rect x="86" y="110" width="12" height="5" rx="1.5" fill={blueprint ? "#fff" : glass} stroke="none" />
          <rect x="70" y="126" width="60" height="8" rx="3" fill={blueprint ? "#fff" : "#38434e"} stroke="none" opacity="0.8" />
          <rect x="70" y="140" width="60" height="12" rx="3" fill={blueprint ? "#fff" : "#2b3742"} stroke="none" opacity="0.6" />
          <circle cx="130" cy="70" r="4" fill={blueprint ? "#fff" : "#c9d6da"} stroke={line} strokeWidth="0.8" />
        </g>
      );
    case "mixer":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <rect x="52" y="148" width="80" height="16" rx="7" fill={body} />
          <path d="M60 148v-22c0-6 4-10 10-10h56c6 0 10-4 10-10V86" fill="none" stroke={blueprint ? line : shades(dark)} strokeWidth="16" strokeLinecap="round" />
          <path d="M60 148v-22c0-6 4-10 10-10h56c6 0 10-4 10-10V86" fill="none" stroke={blueprint ? "#fff" : body} strokeWidth="13" strokeLinecap="round" />
          <ellipse cx="136" cy="82" rx="15" ry="13" fill={blueprint ? "#fff" : dark} stroke={line} strokeWidth="1" />
          <path d="M104 100v14c0 12 6 18 16 18s16-6 16-18V98" fill={blueprint ? "#fff" : glass} stroke={line} strokeWidth="1.1" />
          <path d="M120 132v10M120 142c-6 0-9 3-9 6h18c0-3-3-6-9-6Z" fill={blueprint ? "#fff" : steel} stroke={line} strokeWidth="0.9" />
          <circle cx="70" cy="92" r="6" fill={blueprint ? "#fff" : glass} stroke={line} strokeWidth="1" />
        </g>
      );
    case "kettle":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <path d="M74 68h46c6 0 9 5 8 11l-8 62c-1 7-6 11-13 11H87c-7 0-12-4-13-11l-8-62c-1-6 2-11 8-11Z" fill={body} />
          <rect x="80" y="60" width="34" height="9" rx="4" fill={blueprint ? "#fff" : dark} stroke={line} strokeWidth="0.9" />
          <path d="M120 80c14 6 16 24 6 34" fill="none" stroke={blueprint ? line : dark} strokeWidth="5" strokeLinecap="round" />
          <rect x="66" y="152" width="62" height="10" rx="4" fill={blueprint ? "#fff" : "#2b3742"} stroke={line} strokeWidth="0.9" />
          <path d="M84 96h26" stroke={blueprint ? line : "#b9c8cd"} strokeWidth="2" opacity="0.8" />
          <circle cx="112" cy="130" r="2" fill={blueprint ? "#fff" : "#e0f0f2"} stroke="none" />
        </g>
      );
    case "toaster":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <rect x="50" y="86" width="100" height="60" rx="14" fill={body} />
          <rect x="66" y="86" width="30" height="5" rx="2.5" fill={blueprint ? "#fff" : "#3a4650"} stroke="none" />
          <rect x="104" y="86" width="30" height="5" rx="2.5" fill={blueprint ? "#fff" : "#3a4650"} stroke="none" />
          <path d="M50 118h100" stroke={line} strokeWidth="1.1" opacity={blueprint ? 1 : 0.4} />
          <rect x="134" y="126" width="8" height="14" rx="3" fill={blueprint ? "#fff" : steel} stroke={line} strokeWidth="0.9" />
          <circle cx="64" cy="134" r="3" fill={blueprint ? "#fff" : glass} stroke={line} strokeWidth="0.8" />
          <rect x="72" y="146" width="56" height="4" rx="2" fill={blueprint ? "#fff" : dark} stroke="none" opacity="0.4" />
        </g>
      );
    case "fryer":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <path d="M58 74h84c6 0 10 5 9 11l-8 68c-1 6-5 9-11 9H68c-6 0-10-3-11-9l-8-68c-1-6 3-11 9-11Z" fill={body} />
          <rect x="74" y="62" width="52" height="12" rx="6" fill={blueprint ? "#fff" : dark} stroke={line} strokeWidth="0.9" />
          <rect x="70" y="98" width="60" height="10" rx="4" fill={blueprint ? "#fff" : "#1d2731"} stroke="none" opacity="0.7" />
          <path d="M70 118h60" stroke={line} strokeWidth="1" opacity="0.5" />
          <rect x="76" y="128" width="48" height="22" rx="4" fill={blueprint ? "#fff" : glass} stroke={line} strokeWidth="0.9" opacity={blueprint ? 1 : 0.9} />
          <circle cx="132" cy="90" r="3" fill={blueprint ? "#fff" : "#8fd2d6"} stroke="none" />
          <path d="M92 112c4-6 12-6 16 0" stroke={blueprint ? line : steel} strokeWidth="2" fill="none" />
        </g>
      );
    case "iron":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <path d="M44 128c0-26 18-44 62-44h34c8 0 14 6 14 14v18c0 8-6 14-14 14H52c-5 0-8-1-8-2Z" fill={body} />
          <path d="M44 128h110" stroke={line} strokeWidth="1.4" opacity="0.6" />
          <path d="M76 88V76c0-4 3-7 7-7h30" fill="none" stroke={blueprint ? line : dark} strokeWidth="7" strokeLinecap="round" />
          <rect x="104" y="60" width="40" height="24" rx="6" fill={blueprint ? "#fff" : glass} stroke={line} strokeWidth="1" />
          <circle cx="128" cy="112" r="4" fill={blueprint ? "#fff" : "#8fd2d6"} stroke="none" />
          <path d="M60 134h72" stroke={blueprint ? line : "#c8d4d8"} strokeWidth="2" opacity="0.6" />
        </g>
      );
    case "heater":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <rect x="46" y="72" width="108" height="66" rx="10" fill={body} />
          {[58, 72, 86, 100, 114, 128, 142].map((x) => (
            <rect key={x} x={x} y="82" width="6" height="46" rx="3" fill={blueprint ? "#fff" : dark} stroke="none" opacity="0.35" />
          ))}
          <rect x="52" y="62" width="96" height="10" rx="5" fill={blueprint ? "#fff" : dark} stroke="none" opacity="0.4" />
          <circle cx="66" cy="150" r="8" fill={blueprint ? "#fff" : "#2b3742"} stroke={line} strokeWidth="0.9" />
          <circle cx="134" cy="150" r="8" fill={blueprint ? "#fff" : "#2b3742"} stroke={line} strokeWidth="0.9" />
          <circle cx="80" cy="60" r="3" fill={blueprint ? "#fff" : "#8fd2d6"} stroke="none" />
        </g>
      );
    case "fan":
      return (
        <g stroke={stroke} strokeWidth="1" strokeLinejoin="round">
          <circle cx="100" cy="72" r="40" fill={blueprint ? "#fff" : "#eef2f3"} stroke={line} strokeWidth="1.3" />
          {[0, 45, 90, 135].map((angle) => (
            <path
              key={angle}
              d="M100 72c8-10 4-24-4-26-8-2-12 12-4 26Z"
              transform={`rotate(${angle} 100 72)`}
              fill={blueprint ? "#fff" : body}
              stroke={line}
              strokeWidth="0.7"
              opacity={blueprint ? 1 : 0.95}
            />
          ))}
          <circle cx="100" cy="72" r="7" fill={blueprint ? "#fff" : steel} stroke={line} strokeWidth="0.9" />
          {[0, 30, 60, 90, 120, 150].map((angle) => (
            <path key={angle} d="M100 36v72" transform={`rotate(${angle} 100 72)`} stroke={blueprint ? line : "#c3d0d5"} strokeWidth="0.6" opacity="0.7" />
          ))}
          <rect x="96" y="112" width="8" height="44" rx="4" fill={blueprint ? "#fff" : dark} stroke="none" opacity="0.75" />
          <ellipse cx="100" cy="160" rx="30" ry="8" fill={blueprint ? "#fff" : dark} stroke={line} strokeWidth="1" opacity={blueprint ? 1 : 0.9} />
        </g>
      );
    default:
      return (
        <g stroke={stroke} strokeWidth="1">
          <rect x="56" y="56" width="88" height="96" rx="10" fill={body} />
          <path d="M56 96h88" stroke={line} strokeWidth="1.2" />
        </g>
      );
  }
}

function shades(color: string): string {
  return color;
}
