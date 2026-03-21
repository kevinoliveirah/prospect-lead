const envBase = process.env.NEXT_PUBLIC_API_BASE_URL;

const API_BASE_URL =
  typeof window === "undefined"
    ? envBase ?? "http://localhost:4000"
    : (function() {
        // No navegador, verificamos se a URL está configurada ou se estamos em localhost
        const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        const isNetlify = window.location.hostname.includes("netlify.app");
        
        // Se a variável estiver vazia ou apontar para localhost, mas o site estiver no Netlify
        if ((!envBase || envBase.includes("localhost")) && isNetlify) {
          console.error("[API] Erro: NEXT_PUBLIC_API_BASE_URL não está configurada corretamente no Netlify.");
          return "/error-api-url-not-set"; 
        }

        // Se estivermos em localhost e não houver envBase, usamos o padrão local
        if (!envBase && isLocalHost) {
          return "http://localhost:4000";
        }

        return envBase ?? "http://localhost:4000";
      })();

console.log(`[API] Base URL: ${API_BASE_URL}`);

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
