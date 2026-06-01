import type { Tournament, Match } from "@beybstation/shared";
import { ROUND_LABELS } from "@beybstation/shared";

const BRACKET_H = 880;
const SLOT_H = BRACKET_H / 8; // 110px per round-1 slot
const COL_GAP = 28; // must match CSS .bracket { gap: 28px }
const LINE = "#847C92"; // var(--fg3)

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

// Y center of card at (colIdx, cardIdx) within the BRACKET_H area
function cardCenterY(colIdx: number, cardIdx: number): number {
  const slotsPerCard = Math.pow(2, colIdx);
  return (cardIdx * slotsPerCard + slotsPerCard / 2) * SLOT_H;
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

      {/* Column headers */}
      <div className="bracket-heads">
        {cols.map((_, ci) => (
          <div
            key={ci}
            className={["col-head", ci === activeRound && "is-active"].filter(Boolean).join(" ")}
          >
            {ROUND_LABELS[ci]}
          </div>
        ))}
      </div>

      {/* Match columns */}
      <div className="bracket">
        {cols.map((col, ci) => {
          const isLast = ci === cols.length - 1;
          const slotFlex = Math.pow(2, ci);
          const xMid = COL_GAP / 2;

          return (
            <div key={ci} className="bracket-col">
              {/* Vertically-distributed slots */}
              <div style={{ display: "flex", flexDirection: "column", height: BRACKET_H }}>
                {col.map((m, i) => (
                  <div key={m.id} className="bracket-slot" style={{ flex: slotFlex }}>
                    <BracketMatchCard match={m} />
                  </div>
                ))}
              </div>

              {/* SVG connector lines to next column */}
              {!isLast && (
                <svg
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "100%",
                    width: COL_GAP,
                    height: BRACKET_H,
                    pointerEvents: "none",
                    overflow: "visible",
                  }}
                  width={COL_GAP}
                  height={BRACKET_H}
                >
                  {col.map((_, i) => {
                    if (i % 2 !== 0) return null;
                    const ya = cardCenterY(ci, i);
                    const yb = cardCenterY(ci, i + 1);
                    const yn = cardCenterY(ci + 1, i / 2);
                    return (
                      <g key={i}>
                        <line x1={0} y1={ya} x2={xMid} y2={ya} stroke={LINE} strokeWidth={1} />
                        <line x1={0} y1={yb} x2={xMid} y2={yb} stroke={LINE} strokeWidth={1} />
                        <line x1={xMid} y1={ya} x2={xMid} y2={yb} stroke={LINE} strokeWidth={1} />
                        <line x1={xMid} y1={yn} x2={COL_GAP} y2={yn} stroke={LINE} strokeWidth={1} />
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
