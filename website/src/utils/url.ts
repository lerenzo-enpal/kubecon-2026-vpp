/** Prefix an internal path with the Astro base URL. Works in both dev and production. */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL;
  // BASE_URL is "/" in dev, "/kubecon-2026-vpp" (no trailing slash) in prod
  if (base === '/' || base === '') return path;
  // Avoid double slashes
  return `${base.replace(/\/$/, '')}${path}`;
}
