import type { Tournament, Match } from "@beybstation/shared";
import { ROUND_LABELS } from "@beybstation/shared";

function matchWinner(m: Match): string | null {
  if (m.status === "DONE") {
    if (m.scoreA >= 4) return m.a;
    if (m.scoreB >= 4) return m.b;
  }
  return null;
}

interface BracketMatch extends Match {
  label: string;
  isTBD?: boolean;
}

function buildBracket(tournament: Tournament): BracketMatch[][] {
  const rounds = tournament.rounds;
  const cols: BracketMatch[][] = [];

  const r1 = rounds[0];
  cols.push(
    Array.from({ length: 8 }, (_, i) => {
      const m = r1?.matches[i];
      return m
        ? { ...m, label: `M${i + 1}` }
        : {
            id: `tbd-r1-${i}`,
            a: "TBD",
            b: "TBD",
            scoreA: 0,
            scoreB: 0,
            status: "PENDING" as const,
            label: `M${i + 1}`,
            isTBD: true,
          };
    }),
  );

  const counts = [4, 2, 1];
  for (let ci = 0; ci < 3; ci++) {
    const prev = cols[ci];
    const realRound = rounds[ci + 1];
    const out: BracketMatch[] = [];
    for (let i = 0; i < counts[ci]; i++) {
      if (realRound?.matches[i]) {
        out.push({ ...realRound.matches[i], label: `M${i + 1}` });
      } else {
        const pA = prev[i * 2];
        const pB = prev[i * 2 + 1];
        out.push({
          id: `tbd-${ci}-${i}`,
          a: matchWinner(pA) ?? `W ${pA.label}`,
          b: matchWinner(pB) ?? `W ${pB.label}`,
          scoreA: 0,
          scoreB: 0,
          status: "PENDING",
          label: `M${i + 1}`,
          isTBD: true,
        });
      }
    }
    cols.push(out);
  }

  return cols;
}

function BracketMatchCard({ match }: { match: BracketMatch }) {
  const isDone = match.status === "DONE";
  const aWin = isDone && match.scoreA >= 4;
  const bWin = isDone && match.scoreB >= 4;

  return (
    <div className={["bx", isDone && "is-done", match.isTBD && "is-pending"].filter(Boolean).join(" ")}>
      <div className="bx-num">{match.label}{match.isTBD ? " · TBD" : ""}</div>
      <div className={["bx-row", aWin && "is-winner", !aWin && isDone && "is-loser"].filter(Boolean).join(" ")}>
        <span className="bx-name">{match.a}</span>
        {isDone ? (
          <span className="bx-score">{match.scoreA}</span>
        ) : (
          <span className="bx-score--pending">—</span>
        )}
      </div>
      <div className={["bx-row", bWin && "is-winner", !bWin && isDone && "is-loser"].filter(Boolean).join(" ")}>
        <span className="bx-name">{match.b}</span>
        {isDone ? (
          <span className="bx-score">{match.scoreB}</span>
        ) : (
          <span className="bx-score--pending">—</span>
        )}
      </div>
    </div>
  );
}

export default function BracketTree({ tournament }: { tournament: Tournament }) {
  const cols = buildBracket(tournament);
  const activeRound = tournament.activeRound ?? 0;

  return (
    <div className="bracket-wrap">
      <div className="bracket-legend" style={{ marginBottom: 16 }}>
        <span><span className="dot dot--pink" />Active round</span>
        <span><span className="dot dot--cyan" />Winner</span>
        <span><span className="dot dot--mute" />Pending</span>
      </div>
      <div className="bracket">
        {cols.map((col, ci) => (
          <div
            key={ci}
            className={["bracket-col", ci === activeRound && "is-active"].filter(Boolean).join(" ")}
          >
            <div className="col-head">{ROUND_LABELS[ci]}</div>
            {col.map((m) => (
              <BracketMatchCard key={m.id} match={m} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
