import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, strokeWidth = 1.6, ...props }: IconProps, children: React.ReactNode) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return base(props, <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></>);
}

export function IconCart(props: IconProps) {
  return base(
    props,
    <>
      <path d="M3 4h2.2l2.3 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.55L21 8H6" />
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="17.5" cy="20" r="1.4" />
    </>,
  );
}

export function IconHeart(props: IconProps) {
  return base(
    props,
    <path d="M12 20s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.5 3C19.5 15.4 12 20 12 20Z" />,
  );
}

export function IconUser(props: IconProps) {
  return base(props, <><circle cx="12" cy="8.5" r="3.6" /><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" /></>);
}

export function IconMenu(props: IconProps) {
  return base(props, <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>);
}

export function IconClose(props: IconProps) {
  return base(props, <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>);
}

export function IconChevronDown(props: IconProps) {
  return base(props, <path d="m6 9 6 6 6-6" />);
}

export function IconChevronRight(props: IconProps) {
  return base(props, <path d="m9 6 6 6-6 6" />);
}

export function IconChevronLeft(props: IconProps) {
  return base(props, <path d="m15 6-6 6 6 6" />);
}

export function IconArrowRight(props: IconProps) {
  return base(props, <><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></>);
}

export function IconPlus(props: IconProps) {
  return base(props, <><path d="M12 5v14" /><path d="M5 12h14" /></>);
}

export function IconMinus(props: IconProps) {
  return base(props, <path d="M5 12h14" />);
}

export function IconCheck(props: IconProps) {
  return base(props, <path d="m5 13 4.5 4.5L19 7" />);
}

export function IconStar({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg
      width={props.size ?? 14}
      height={props.size ?? 14}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={props.className}
    >
      <path d="M12 3.6l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.8l5.9-.9z" />
    </svg>
  );
}

export function IconTruck(props: IconProps) {
  return base(
    props,
    <>
      <path d="M3 6h10v10H3z" />
      <path d="M13 9h4.2l3 3.2V16H13z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </>,
  );
}

export function IconWallet(props: IconProps) {
  return base(
    props,
    <>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18" />
      <circle cx="17" cy="14.5" r="1.1" />
    </>,
  );
}

export function IconShield(props: IconProps) {
  return base(
    props,
    <>
      <path d="M12 3.5 19 6v5.4c0 4.3-3 7.4-7 9.1-4-1.7-7-4.8-7-9.1V6z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>,
  );
}

export function IconHeadset(props: IconProps) {
  return base(
    props,
    <>
      <path d="M4.5 13v-1a7.5 7.5 0 0 1 15 0v1" />
      <rect x="3" y="13" width="3.4" height="5.5" rx="1.4" />
      <rect x="17.6" y="13" width="3.4" height="5.5" rx="1.4" />
      <path d="M19.3 18.5v.6a2.4 2.4 0 0 1-2.4 2.4H13" />
    </>,
  );
}

export function IconLock(props: IconProps) {
  return base(
    props,
    <>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>,
  );
}

export function IconTag(props: IconProps) {
  return base(
    props,
    <>
      <path d="M12.6 3.6H20V11l-8.6 8.6a1.8 1.8 0 0 1-2.5 0l-5-5a1.8 1.8 0 0 1 0-2.5z" />
      <circle cx="16.4" cy="7.4" r="1.2" />
    </>,
  );
}

export function IconSpinner(props: IconProps) {
  return (
    <svg
      width={props.size ?? 18}
      height={props.size ?? 18}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`animate-spin ${props.className ?? ""}`}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconTrash(props: IconProps) {
  return base(
    props,
    <>
      <path d="M4 7h16" />
      <path d="M9.5 4.5h5" />
      <path d="M6.5 7l.9 12.1A1.9 1.9 0 0 0 9.3 21h5.4a1.9 1.9 0 0 0 1.9-1.9L17.5 7" />
      <path d="M10.5 11v6M13.5 11v6" />
    </>,
  );
}

export function IconPencil(props: IconProps) {
  return base(
    props,
    <>
      <path d="M4 20h4l10.2-10.2a2.3 2.3 0 0 0-3.2-3.2L4.8 16.8 4 20z" />
      <path d="M14.5 6.5l3 3" />
    </>,
  );
}

export function IconSliders(props: IconProps) {
  return base(
    props,
    <>
      <path d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h12M20 17h0" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="18" cy="17" r="2" />
    </>,
  );
}

export function IconScale(props: IconProps) {
  return base(
    props,
    <>
      <path d="M12 4v16" />
      <path d="M7 20h10" />
      <path d="M4 8h16" />
      <path d="M7 8 4 14h6z" />
      <path d="M17 8l-3 6h6z" />
    </>,
  );
}

export function IconZoom(props: IconProps) {
  return base(
    props,
    <>
      <circle cx="11" cy="11" r="6.4" />
      <path d="M11 8.6v4.8M8.6 11h4.8" />
      <path d="m20 20-4.4-4.4" />
    </>,
  );
}

export function IconPhone(props: IconProps) {
  return base(
    props,
    <path d="M6.4 3.5h2.6l1.5 4-2 1.3a10.6 10.6 0 0 0 6.7 6.7l1.3-2 4 1.5v2.6a2.4 2.4 0 0 1-2.6 2.4C11.4 19.4 4.6 12.6 4 5.9A2.4 2.4 0 0 1 6.4 3.5Z" />,
  );
}

export function IconMail(props: IconProps) {
  return base(
    props,
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.4" />
      <path d="m4 7 8 6 8-6" />
    </>,
  );
}

export function IconPin(props: IconProps) {
  return base(
    props,
    <>
      <path d="M12 21s6.5-6.1 6.5-10.6A6.5 6.5 0 0 0 5.5 10.4C5.5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="10.2" r="2.4" />
    </>,
  );
}

export function IconClock(props: IconProps) {
  return base(props, <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 1.8" /></>);
}

export function IconBox(props: IconProps) {
  return base(
    props,
    <>
      <path d="M12 3 4.5 6.6v10.8L12 21l7.5-3.6V6.6z" />
      <path d="M4.5 6.6 12 10.2l7.5-3.6M12 10.2V21" />
    </>,
  );
}

export function IconInfo(props: IconProps) {
  return base(props, <><circle cx="12" cy="12" r="8.6" /><path d="M12 11v5.5" /><circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" /></>);
}

export function IconAlert(props: IconProps) {
  return base(props, <><path d="M12 4.5 21 20H3z" /><path d="M12 10v4.4" /><circle cx="12" cy="17.3" r="0.9" fill="currentColor" stroke="none" /></>);
}

export function IconGrid(props: IconProps) {
  return base(props, <><rect x="4" y="4" width="7" height="7" rx="1.4" /><rect x="13" y="4" width="7" height="7" rx="1.4" /><rect x="4" y="13" width="7" height="7" rx="1.4" /><rect x="13" y="13" width="7" height="7" rx="1.4" /></>);
}

export function IconHeadphones(props: IconProps) {
  return base(props, <><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><rect x="3" y="14" width="4" height="6" rx="1.6" /><rect x="17" y="14" width="4" height="6" rx="1.6" /></>);
}

export function IconHome(props: IconProps) {
  return base(props, <><path d="m4 11 8-6.5 8 6.5" /><path d="M6 10v9.5h12V10" /></>);
}

export function IconChart(props: IconProps) {
  return base(props, <><path d="M4 20h16" /><rect x="6" y="12" width="3.4" height="6" /><rect x="11.3" y="8" width="3.4" height="10" /><rect x="16.6" y="4.5" width="3.4" height="13.5" /></>);
}

export function IconUsers(props: IconProps) {
  return base(props, <><circle cx="9.5" cy="8.5" r="3.2" /><path d="M3 19a6.5 6.5 0 0 1 13 0" /><path d="M16 6.2a3 3 0 0 1 0 5.6" /><path d="M17.6 19a6 6 0 0 0-1.4-3.9" /></>);
}

export function IconSettings(props: IconProps) {
  return base(props, <><circle cx="12" cy="12" r="3.1" /><path d="M4.6 14.2 3.5 12l1.1-2.2 2.3-.5.9-1.9-.7-2.2L9 4l1.9.9L12.8 4l.9 1.2 2.3.5 1.1 2.2-1.1 2.2.7 2.2 2.3.5L20.5 15l-1.1 2.2-2.3.5" /><path d="M9.2 19.3 12 20.5l2.8-1.2" /></>);
}

export function IconLogout(props: IconProps) {
  return base(props, <><path d="M9 4.5H5.5A1.5 1.5 0 0 0 4 6v12a1.5 1.5 0 0 0 1.5 1.5H9" /><path d="M15 8l4 4-4 4" /><path d="M19 12H9" /></>);
}

export function IconEye(props: IconProps) {
  return base(props, <><path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.6" /></>);
}

export function IconCopy(props: IconProps) {
  return base(props, <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M15 5.5A1.5 1.5 0 0 0 13.5 4H6a2 2 0 0 0-2 2v7.5A1.5 1.5 0 0 0 5.5 15" /></>);
}

export function IconBolt(props: IconProps) {
  return base(props, <path d="M13 3 5.5 13.5H11L10 21l7.5-10.5H12z" />);
}

export function IconFacebook(props: IconProps) {
  return base(props, <><path d="M14.5 8.5H17V5.4h-2.6c-2.3 0-3.7 1.4-3.7 3.8v1.6H8.4v3.1h2.3V21h3.2v-7.1h2.5l.4-3.1h-2.9V9.6c0-.7.3-1.1 1.1-1.1Z" /></>);
}

export function IconInstagram(props: IconProps) {
  return base(props, <><rect x="4" y="4" width="16" height="16" rx="5" /><circle cx="12" cy="12" r="3.6" /><circle cx="16.8" cy="7.4" r="0.9" fill="currentColor" stroke="none" /></>);
}

export function IconTikTok(props: IconProps) {
  return base(props, <><path d="M15 4v9.2a3.4 3.4 0 1 1-3-3.4" /><path d="M15 4c.4 2.2 1.8 3.6 4 3.8" /></>);
}

export function IconSparkle(props: IconProps) {
  return base(props, <><path d="M12 4.5 13.6 9l4.4 1.6-4.4 1.6L12 16.7l-1.6-4.5L6 10.6 10.4 9z" /><path d="M18.5 16.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" /></>);
}

export function IconGift(props: IconProps) {
  return base(props, <><rect x="4" y="9" width="16" height="11" rx="1.8" /><path d="M4 13h16M12 9v11" /><path d="M12 9C10.5 6.5 8.5 6 7.5 7.2S8 9 12 9Zm0 0c1.5-2.5 3.5-3 4.5-1.8S16 9 12 9Z" /></>);
}

export function IconRefresh(props: IconProps) {
  return base(props, <><path d="M20 11a8 8 0 0 0-13.7-5L4 8" /><path d="M4 4.5V8h3.5" /><path d="M4 13a8 8 0 0 0 13.7 5L20 16" /><path d="M20 19.5V16h-3.5" /></>);
}

export function IconStarBadge(props: IconProps) {
  return base(props, <><circle cx="12" cy="12" r="8.6" /><path d="m12 7.5 1.5 3.1 3.4.5-2.5 2.4.6 3.4-3-1.6-3 1.6.6-3.4L7.1 11l3.4-.5z" /></>);
}
