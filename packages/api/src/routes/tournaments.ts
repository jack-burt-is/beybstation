import { Hono, type Context } from "hono";
import { verifyAdminToken } from "../lib/auth.js";
import type { AppEnv } from "../types.js";
import {
  listTournaments,
  getTournament,
  getActiveTournament,
  getActiveTournamentId,
  setActiveTournamentId,
  createTournament,
  updateTournamentMeta,
  generateRound,
  shuffleRound1,
  reorderMatches,
  startRound,
  updateMatch,
} from "../lib/tournament.js";
import type {
  ListTournamentsResponse,
  TournamentResponse,
  OverlayState,
} from "@beybstation/shared";

const router = new Hono<AppEnv>();

async function requireAdmin(c: Context): Promise<boolean> {
  const auth = c.req.header("Authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  const payload = await verifyAdminToken(auth.slice(7));
  return payload !== null;
}

// ── Public routes ─────────────────────────────────────────────

router.get("/", async (c) => {
  const [tournaments, activeId] = await Promise.all([
    listTournaments(),
    getActiveTournamentId(),
  ]);
  return c.json<ListTournamentsResponse>({ tournaments, activeId });
});

router.get("/active", async (c) => {
  const tournament = await getActiveTournament();
  return c.json<TournamentResponse | { tournament: null }>({ tournament });
});

router.get("/overlay", async (c) => {
  const tournament = await getActiveTournament();
  if (!tournament || tournament.rounds.length === 0) {
    return c.json<OverlayState>({
      tournament: "No active tournament",
      roundLabel: "",
      activeMatch: null,
      matches: [],
    });
  }

  const round = tournament.rounds[tournament.activeRound];
  const activeIdx = round.matches.findIndex((m) => m.status !== "DONE");

  const matches = round.matches.map((m, i) => ({
    idx: i + 1,
    a: m.a,
    b: m.b,
    scoreA: m.scoreA,
    scoreB: m.scoreB,
    done: m.status === "DONE",
    active: i === activeIdx,
  }));

  const active = activeIdx >= 0 ? matches[activeIdx] : matches[matches.length - 1] ?? null;

  let winner: string | undefined;
  if (tournament.status === "COMPLETE") {
    const finalMatch = round.matches[round.matches.length - 1];
    if (finalMatch?.status === "DONE") {
      winner = finalMatch.scoreA >= 4 ? finalMatch.a : finalMatch.b;
    }
  }

  return c.json<OverlayState>({
    tournament: tournament.name,
    roundLabel: round.label,
    activeMatch: active
      ? {
          idx: active.idx,
          a: active.a,
          b: active.b,
          scoreA: active.scoreA,
          scoreB: active.scoreB,
        }
      : null,
    matches,
    winner,
  });
});

router.get("/:id", async (c) => {
  const tournament = await getTournament(c.req.param("id"));
  if (!tournament) return c.json({ error: "Not found" }, 404);
  return c.json<TournamentResponse>({ tournament });
});

// ── Admin routes ──────────────────────────────────────────────

router.post("/", async (c) => {
  if (!(await requireAdmin(c))) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.json<{ name?: string; players?: string[] }>();
  if (!body.name?.trim()) return c.json({ error: "Name required" }, 400);

  const defaultPlayers = Array.from({ length: 16 }, (_, i) => `Player ${i + 1}`);
  const players = body.players?.length === 16 ? body.players : defaultPlayers;

  const tournament = await createTournament(body.name.trim(), players);
  return c.json<TournamentResponse>({ tournament }, 201);
});

router.post("/:id/set-active", async (c) => {
  if (!(await requireAdmin(c))) return c.json({ error: "Unauthorized" }, 401);

  const tournament = await getTournament(c.req.param("id"));
  if (!tournament) return c.json({ error: "Not found" }, 404);

  await setActiveTournamentId(tournament.id);
  return c.json({ ok: true });
});

router.patch("/:id", async (c) => {
  if (!(await requireAdmin(c))) return c.json({ error: "Unauthorized" }, 401);

  const tournament = await getTournament(c.req.param("id"));
  if (!tournament) return c.json({ error: "Not found" }, 404);

  const body = await c.req.json<{ name?: string; players?: string[] }>();
  const updated = await updateTournamentMeta(tournament, body.name, body.players);
  return c.json<TournamentResponse>({ tournament: updated });
});

router.post("/:id/generate-round", async (c) => {
  if (!(await requireAdmin(c))) return c.json({ error: "Unauthorized" }, 401);

  const tournament = await getTournament(c.req.param("id"));
  if (!tournament) return c.json({ error: "Not found" }, 404);

  try {
    const updated = await generateRound(tournament);
    return c.json<TournamentResponse>({ tournament: updated });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});

router.post("/:id/shuffle", async (c) => {
  if (!(await requireAdmin(c))) return c.json({ error: "Unauthorized" }, 401);

  const tournament = await getTournament(c.req.param("id"));
  if (!tournament) return c.json({ error: "Not found" }, 404);

  try {
    const updated = await shuffleRound1(tournament);
    return c.json<TournamentResponse>({ tournament: updated });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});

router.post("/:id/start-round", async (c) => {
  if (!(await requireAdmin(c))) return c.json({ error: "Unauthorized" }, 401);

  const tournament = await getTournament(c.req.param("id"));
  if (!tournament) return c.json({ error: "Not found" }, 404);

  if (tournament.rounds.length === 0) return c.json({ error: "No round to start" }, 400);
  if (tournament.rounds[tournament.activeRound].started) {
    return c.json({ error: "Round already started" }, 400);
  }

  const updated = await startRound(tournament);
  return c.json<TournamentResponse>({ tournament: updated });
});

router.post("/:id/reorder", async (c) => {
  if (!(await requireAdmin(c))) return c.json({ error: "Unauthorized" }, 401);

  const tournament = await getTournament(c.req.param("id"));
  if (!tournament) return c.json({ error: "Not found" }, 404);

  const body = await c.req.json<{ roundIdx: number; from: number; to: number }>();
  try {
    const updated = await reorderMatches(
      tournament,
      body.roundIdx,
      body.from,
      body.to,
    );
    return c.json<TournamentResponse>({ tournament: updated });
  } catch (e) {
    return c.json({ error: (e as Error).message }, 400);
  }
});

router.patch("/:id/rounds/:roundIdx/matches/:matchIdx", async (c) => {
  if (!(await requireAdmin(c))) return c.json({ error: "Unauthorized" }, 401);

  const tournament = await getTournament(c.req.param("id"));
  if (!tournament) return c.json({ error: "Not found" }, 404);

  const roundIdx = parseInt(c.req.param("roundIdx"), 10);
  const matchIdx = parseInt(c.req.param("matchIdx"), 10);

  if (
    isNaN(roundIdx) ||
    isNaN(matchIdx) ||
    roundIdx < 0 ||
    roundIdx >= tournament.rounds.length ||
    matchIdx < 0 ||
    matchIdx >= tournament.rounds[roundIdx].matches.length
  ) {
    return c.json({ error: "Invalid round or match index" }, 400);
  }

  const body = await c.req.json<{
    scoreA: number;
    scoreB: number;
    finish?: boolean;
  }>();

  const updated = await updateMatch(
    tournament,
    roundIdx,
    matchIdx,
    body.scoreA ?? 0,
    body.scoreB ?? 0,
    body.finish ?? false,
  );
  return c.json<TournamentResponse>({ tournament: updated });
});

export default router;
