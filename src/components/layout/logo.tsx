import Link from "next/link";

/** Wordmark. Kept as text so it stays crisp and needs no image asset. */
export function Logo({
  href = "/",
  className = "",
  size = "md",
  tone = "default",
}: {
  href?: string;
  className?: string;
  size?: "sm" | "md";
  tone?: "default" | "light";
}) {
  const text = size === "sm" ? "text-[19px]" : "text-[22px]";
  const first = tone === "light" ? "text-white" : "text-navy";
  const second = tone === "light" ? "text-accent-line" : "text-accent";
  return (
    <Link
      href={href}
      aria-label="MaisonTech — accueil"
      className={`group inline-flex shrink-0 items-baseline gap-[1px] ${className}`}
    >
      <span className={`${text} font-extrabold tracking-[-0.035em] ${first}`}>Maison</span>
      <span className={`${text} font-extrabold tracking-[-0.035em] ${second}`}>Tech</span>
      <span className="mb-[3px] ml-[3px] h-[5px] w-[5px] rounded-full bg-promo transition-transform group-hover:scale-125" />
    </Link>
  );
}
