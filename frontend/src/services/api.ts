import { getSession } from "next-auth/react";

const API_URL = "http://127.0.0.1:8000";

async function getToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const session = await getSession();
  const token = (session as any)?.accessToken;
  return token || null;
}

async function request(method: string, endpoint: string, body?: any, isUrlEncoded = false) {
  const token = await getToken();
  const headers: Record<string, string> = {};

  if (token) headers["Authorization"] = `Bearer ${token}`;

  let reqBody: string | undefined;
  if (body !== undefined) {
    if (isUrlEncoded) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      reqBody = new URLSearchParams(body).toString();
    } else {
      headers["Content-Type"] = "application/json";
      reqBody = JSON.stringify(body);
    }
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: reqBody,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API ${method} ${endpoint} failed (${res.status}): ${errText}`);
  }
  return res.json();
}

export const api = {
  get:    (endpoint: string)              => request("GET",    endpoint),
  post:   (endpoint: string, body: any, isUrlEncoded = false) => request("POST", endpoint, body, isUrlEncoded),
  put:    (endpoint: string, body?: any)  => request("PUT",    endpoint, body),
  delete: (endpoint: string)             => request("DELETE", endpoint),
};

/** Public fetch (no auth header) */
export async function publicGet(endpoint: string) {
  const res = await fetch(`${API_URL}${endpoint}`);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}
