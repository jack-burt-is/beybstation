export type TournamentStatus = "PRE" | "GENERATED" | "STARTED" | "COMPLETE";
export type MatchStatus = "PENDING" | "DONE";

export const ROUND_LABELS = ["Round 1", "Round 2", "Semi-finals", "Final"] as const;
export type RoundLabel = (typeof ROUND_LABELS)[number];

export interface Match {
  id: string;
  a: string;
  b: string;
  scoreA: number;
  scoreB: number;
  status: MatchStatus;
}

export interface Round {
  label: RoundLabel;
  started: boolean;
  matches: Match[];
}

export interface Tournament {
  id: string;
  name: string;
  date: string;
  status: TournamentStatus;
  players: string[];
  rounds: Round[];
  activeRound: number;
  createdAt: string;
  updatedAt: string;
}

export interface TournamentListItem {
  id: string;
  name: string;
  date: string;
  status: TournamentStatus;
  createdAt: string;
}

// ── API response shapes ──────────────────────────────────────

export interface ListTournamentsResponse {
  tournaments: TournamentListItem[];
}

export interface TournamentResponse {
  tournament: Tournament;
}

export interface AuthResponse {
  token: string;
}

export interface OverlayState {
  tournament: string;
  roundLabel: string;
  activeMatch: { idx: number; a: string; b: string; scoreA: number; scoreB: number } | null;
  matches: Array<{
    idx: number;
    a: string;
    b: string;
    scoreA: number;
    scoreB: number;
    done: boolean;
    active: boolean;
  }>;
}
