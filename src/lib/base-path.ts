/**
 * The app is normally served from the domain root, but it is also deployed
 * behind the Apache reverse proxy at https://modali.powerpme.com/maisontech.
 * In that case NEXT_PUBLIC_BASE_PATH is baked in at build time and every
 * hand-written absolute URL (fetch, window.location) must carry the prefix.
 *
 * next/link and next/navigation already apply the basePath themselves.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

/** Prefixes an app-absolute path ("/api/cart") with the deployment base path. */
export function api(path: string): string {
  return `${BASE_PATH}${path}`;
}

/** Absolute URL for the browser to call the same app. */
export function appUrl(path: string): string {
  return `${window.location.origin}${BASE_PATH}${path}`;
}
