import { auth } from "../firebase";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000";

export async function apiRequest(
  path,
  options = {}
) {
  const currentUser = auth.currentUser;

  const token = currentUser
    ? await currentUser.getIdToken()
    : null;

  const headers = new Headers(
    options.headers || {}
  );

  if (
    options.body &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers,
    }
  );

  const data =
    await response.json().catch(
      () => ({})
    );

  if (!response.ok) {
    throw new Error(
      data.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
}