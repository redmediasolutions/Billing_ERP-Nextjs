export type Theme = "light" | "dark";

export const THEME_COOKIE = "theme";

export function parseTheme(value?: string | null): Theme {
  return value === "dark" ? "dark" : "light";
}

export function themeCookieValue(theme: Theme) {
  return `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
}
