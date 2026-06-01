import { api } from "./client";
import type { AuthResponse } from "@beybstation/shared";

export async function login(password: string): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/login", { password });
}
