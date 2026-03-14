const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ApiError = { error?: string };

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${path}`;
  console.log(`[DEBUG] apiFetch calling URL: ${url}`);

  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store"
  });

  if (!response.ok) {
    let payload: ApiError | null = null;
    try {
      payload = (await response.json()) as ApiError;
    } catch {
      payload = null;
    }
    const message = payload?.error ?? `request_failed_${response.status}`;
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export { API_BASE_URL };
