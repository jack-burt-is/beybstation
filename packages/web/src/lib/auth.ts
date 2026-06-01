const TOKEN_KEY = "beybstation_admin_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  const token = getToken();
  if (!token) return false;
  try {
    const [, payload] = token.split(".");
    const data = JSON.parse(atob(payload)) as { exp?: number };
    if (data.exp && data.exp * 1000 < Date.now()) {
      clearToken();
      return false;
    }
    return true;
  } catch {
    clearToken();
    return false;
  }
}
