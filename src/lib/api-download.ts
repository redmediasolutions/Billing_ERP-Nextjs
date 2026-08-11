import { auth } from "@/firebase/config";
import { ApiError } from "@/lib/api";
import { waitForAuthUser } from "@/lib/wait-for-auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Authenticated binary/text download (CSV, PDF streams, etc.).
 * Does not expect a JSON { success, data } envelope.
 */
export async function apiDownload(
  path: string,
  filename: string
): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is missing in .env.local");
  }

  const user = (await waitForAuthUser()) ?? auth.currentUser;

  if (!user) {
    throw new ApiError("Please sign in again.", 401);
  }

  const token = await user.getIdToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "text/csv,application/octet-stream,*/*",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Download failed.";

    try {
      const body = (await response.json()) as { message?: string };
      if (body?.message) message = body.message;
    } catch {
      // non-JSON error body
    }

    throw new ApiError(message, response.status);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function buildExportQuery(from?: string, to?: string) {
  const params = new URLSearchParams();

  if (from?.trim()) params.set("from", from.trim());
  if (to?.trim()) params.set("to", to.trim());

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}
