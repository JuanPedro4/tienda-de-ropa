/**
 * Medusa.js GraphQL Storefront API client.
 *
 * Architecture: Next.js → GraphQL → Medusa.js v2 (headless)
 */

const MEDUSA_BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL ?? "http://localhost:9000";
const MEDUSA_STORE_API = `${MEDUSA_BACKEND_URL}/store`;

export interface MedusaError {
  message: string;
  code?: string;
}

export interface MedusaResponse<T> {
  data?: T;
  errors?: MedusaError[];
}

/**
 * Execute a GraphQL query against Medusa Storefront API.
 */
export async function medusaQuery<T>(
  query: string,
  variables?: Record<string, unknown>,
  options?: { cache?: RequestInit["cache"]; next?: { revalidate?: number; tags?: string[] } },
): Promise<MedusaResponse<T>> {
  const res = await fetch(`${MEDUSA_STORE_API}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
    cache: options?.cache,
    next: options?.next,
  });

  if (!res.ok) {
    return {
      errors: [{ message: `HTTP ${res.status}: ${res.statusText}` }],
    };
  }

  const json = await res.json();

  if (json.errors) {
    return { errors: json.errors };
  }

  return { data: json.data as T };
}

/**
 * Execute a REST GET request against Medusa Storefront API.
 */
export async function medusaGet<T>(
  path: string,
  options?: { cache?: RequestInit["cache"]; next?: { revalidate?: number; tags?: string[] } },
): Promise<MedusaResponse<T>> {
  const res = await fetch(`${MEDUSA_STORE_API}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: options?.cache,
    next: options?.next,
  });

  if (!res.ok) {
    return {
      errors: [{ message: `HTTP ${res.status}: ${res.statusText}` }],
    };
  }

  const json = await res.json();
  return { data: json as T };
}

/**
 * Execute a REST POST request against Medusa Storefront API.
 */
export async function medusaPost<T>(
  path: string,
  body: Record<string, unknown>,
): Promise<MedusaResponse<T>> {
  const res = await fetch(`${MEDUSA_STORE_API}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return {
      errors: [{ message: `HTTP ${res.status}: ${res.statusText}` }],
    };
  }

  const json = await res.json();
  return { data: json as T };
}
