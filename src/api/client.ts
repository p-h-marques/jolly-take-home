const BASE_URL = "https://api.tvmaze.com";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type QueryParams = Record<string, string | number | boolean | undefined>;

function buildQueryString(params?: QueryParams): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    searchParams.set(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

// No retry/backoff here by design — TVMaze rate-limit mitigation is a
// debounce on the search input (see docs/04_tech_decisions.md), not a
// client-level concern.
export async function get<T>(
  path: string,
  params?: QueryParams,
  signal?: AbortSignal,
): Promise<T> {
  const url = `${BASE_URL}${path}${buildQueryString(params)}`;
  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new ApiError(
      response.status,
      `TVMaze request failed: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}
