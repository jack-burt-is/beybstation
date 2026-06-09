import { api } from "./client";
import type {
  ListTournamentsResponse,
  TournamentResponse,
  OverlayState,
  Tournament,
} from "@beybstation/shared";

export const tournaments = {
  list: () => api.get<ListTournamentsResponse>("/tournaments"),
  get: (id: string) => api.get<TournamentResponse>(`/tournaments/${id}`),
  getActive: () =>
    api.get<TournamentResponse | { tournament: null }>("/tournaments/active"),
  getOverlay: () => api.get<OverlayState>("/tournaments/overlay"),

  create: (name: string, players: string[]) =>
    api.post<TournamentResponse>("/tournaments", { name, players }),

  setActive: (id: string) =>
    api.post<{ ok: boolean }>(`/tournaments/${id}/set-active`),

  update: (id: string, data: { name?: string; players?: string[] }) =>
    api.patch<TournamentResponse>(`/tournaments/${id}`, data),

  generateRound: (id: string) =>
    api.post<TournamentResponse>(`/tournaments/${id}/generate-round`),

  shuffle: (id: string) =>
    api.post<TournamentResponse>(`/tournaments/${id}/shuffle`),

  startRound: (id: string) =>
    api.post<TournamentResponse>(`/tournaments/${id}/start-round`),

  reorder: (id: string, roundIdx: number, from: number, to: number) =>
    api.post<TournamentResponse>(`/tournaments/${id}/reorder`, {
      roundIdx,
      from,
      to,
    }),

  updateMatch: (
    id: string,
    roundIdx: number,
    matchIdx: number,
    data: { scoreA: number; scoreB: number; finish?: boolean },
  ) =>
    api.patch<TournamentResponse>(
      `/tournaments/${id}/rounds/${roundIdx}/matches/${matchIdx}`,
      data,
    ),
};
