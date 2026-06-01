import {
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { getDb, tableName } from "./db.js";
import type {
  Tournament,
  TournamentListItem,
  Match,
  Round,
  RoundLabel,
} from "@beybstation/shared";
import { ROUND_LABELS } from "@beybstation/shared";

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function now(): string {
  return new Date().toISOString();
}

export async function listTournaments(): Promise<TournamentListItem[]> {
  const db = getDb();
  const result = await db.send(
    new QueryCommand({
      TableName: tableName(),
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: { ":pk": "LIST" },
    }),
  );
  const items = (result.Items ?? []) as TournamentListItem[];
  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getTournament(id: string): Promise<Tournament | null> {
  const db = getDb();
  const result = await db.send(
    new GetCommand({
      TableName: tableName(),
      Key: { pk: `TOURNAMENT#${id}`, sk: "STATE" },
    }),
  );
  if (!result.Item) return null;
  const { pk: _pk, sk: _sk, ...tournament } = result.Item;
  return tournament as Tournament;
}

export async function getActiveTournament(): Promise<Tournament | null> {
  const list = await listTournaments();
  const active = list.find(
    (t) => t.status === "STARTED" || t.status === "GENERATED",
  );
  if (!active) {
    // Fall back to most recently created
    if (!list.length) return null;
    return getTournament(list[0].id);
  }
  return getTournament(active.id);
}

async function saveTournament(tournament: Tournament): Promise<void> {
  const db = getDb();
  const ts = tableName();

  await Promise.all([
    db.send(
      new PutCommand({
        TableName: ts,
        Item: {
          pk: `TOURNAMENT#${tournament.id}`,
          sk: "STATE",
          ...tournament,
        },
      }),
    ),
    db.send(
      new PutCommand({
        TableName: ts,
        Item: {
          pk: "LIST",
          sk: `TOURNAMENT#${tournament.id}`,
          id: tournament.id,
          name: tournament.name,
          date: tournament.date,
          status: tournament.status,
          createdAt: tournament.createdAt,
        },
      }),
    ),
  ]);
}

export async function createTournament(
  name: string,
  players: string[],
): Promise<Tournament> {
  const tournament: Tournament = {
    id: uid(),
    name,
    date: new Date().toISOString().slice(0, 10),
    status: "PRE",
    players: players.slice(0, 16),
    rounds: [],
    activeRound: 0,
    createdAt: now(),
    updatedAt: now(),
  };
  await saveTournament(tournament);
  return tournament;
}

export async function updateTournamentMeta(
  tournament: Tournament,
  name?: string,
  players?: string[],
): Promise<Tournament> {
  const updated: Tournament = {
    ...tournament,
    name: name ?? tournament.name,
    players: players ?? tournament.players,
    updatedAt: now(),
  };
  await saveTournament(updated);
  return updated;
}

function makeRound(label: RoundLabel, players: string[], shuffle = false): Round {
  const ps = players.slice();
  if (shuffle) {
    for (let i = ps.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ps[i], ps[j]] = [ps[j], ps[i]];
    }
  }
  const matches: Match[] = [];
  for (let i = 0; i < ps.length; i += 2) {
    matches.push({
      id: "m_" + uid(),
      a: ps[i],
      b: ps[i + 1] ?? "TBD",
      scoreA: 0,
      scoreB: 0,
      status: "PENDING",
    });
  }
  return { label, started: false, matches };
}

export async function generateRound(tournament: Tournament): Promise<Tournament> {
  const nextIdx = tournament.rounds.length;
  if (nextIdx > 3) throw new Error("Tournament already has 4 rounds");

  let players: string[];
  if (nextIdx === 0) {
    players = tournament.players;
  } else {
    const prevRound = tournament.rounds[nextIdx - 1];
    if (!prevRound.matches.every((m) => m.status === "DONE")) {
      throw new Error("Current round is not complete");
    }
    players = prevRound.matches.map((m) =>
      m.scoreA >= 4 ? m.a : m.b,
    );
  }

  const label = ROUND_LABELS[nextIdx] as RoundLabel;
  const round = makeRound(label, players);
  const updated: Tournament = {
    ...tournament,
    rounds: [...tournament.rounds, round],
    activeRound: nextIdx,
    status: "GENERATED",
    updatedAt: now(),
  };
  await saveTournament(updated);
  return updated;
}

export async function shuffleRound1(tournament: Tournament): Promise<Tournament> {
  if (tournament.rounds.length === 0 || tournament.rounds[0].started) {
    throw new Error("Cannot shuffle");
  }
  const round = makeRound("Round 1", tournament.players, true);
  const updated: Tournament = {
    ...tournament,
    rounds: [round, ...tournament.rounds.slice(1)],
    updatedAt: now(),
  };
  await saveTournament(updated);
  return updated;
}

export async function reorderMatches(
  tournament: Tournament,
  roundIdx: number,
  from: number,
  to: number,
): Promise<Tournament> {
  const rounds = tournament.rounds.slice();
  const round = { ...rounds[roundIdx], matches: rounds[roundIdx].matches.slice() };
  const [moved] = round.matches.splice(from, 1);
  round.matches.splice(to, 0, moved);
  rounds[roundIdx] = round;
  const updated: Tournament = { ...tournament, rounds, updatedAt: now() };
  await saveTournament(updated);
  return updated;
}

export async function startRound(tournament: Tournament): Promise<Tournament> {
  const rounds = tournament.rounds.slice();
  const roundIdx = tournament.activeRound;
  rounds[roundIdx] = { ...rounds[roundIdx], started: true };
  const updated: Tournament = {
    ...tournament,
    rounds,
    status: "STARTED",
    updatedAt: now(),
  };
  await saveTournament(updated);
  return updated;
}

export async function updateMatch(
  tournament: Tournament,
  roundIdx: number,
  matchIdx: number,
  scoreA: number,
  scoreB: number,
  finish: boolean,
): Promise<Tournament> {
  const rounds = tournament.rounds.slice();
  const round = { ...rounds[roundIdx], matches: rounds[roundIdx].matches.slice() };
  const match = { ...round.matches[matchIdx] };

  match.scoreA = Math.max(0, Math.min(4, scoreA));
  match.scoreB = Math.max(0, Math.min(4, scoreB));
  if (finish || match.scoreA >= 4 || match.scoreB >= 4) {
    match.status = "DONE";
  }

  round.matches[matchIdx] = match;
  rounds[roundIdx] = round;

  const isComplete = round.matches.every((m) => m.status === "DONE");
  const isFinalRound = roundIdx === 3;
  const updated: Tournament = {
    ...tournament,
    rounds,
    status:
      isComplete && isFinalRound ? "COMPLETE" : tournament.status,
    updatedAt: now(),
  };
  await saveTournament(updated);
  return updated;
}
