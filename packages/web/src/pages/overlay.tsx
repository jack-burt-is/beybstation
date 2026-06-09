import { useQuery } from "@tanstack/react-query";
import { tournaments } from "../api/tournaments";
import type { OverlayState } from "@beybstation/shared";

function BrandTag() {
  return (
    <div className="overlay-brand">
      <img src="/logo.png" alt="" />
      <span className="name">Beybstation</span>
      <span className="live">LIVE</span>
    </div>
  );
}

function VictoryCard({ winner }: { winner: string }) {
  return (
    <div className="overlay-victory">
      <div className="victory-crown">♔</div>
      <div className="victory-name">{winner}</div>
      <div className="victory-label">Winner</div>
    </div>
  );
}

function RightRail({ state }: { state: OverlayState }) {
  const active = state.activeMatch ?? (state.matches[0] || null);
  if (!active) return null;
  const aWin = active.scoreA >= 4;
  const bWin = active.scoreB >= 4;

  return (
    <div className="overlay-right-rail">
      <div className="kicker">Now playing</div>
      <div className="round-title">{state.roundLabel}</div>
      <div className="active-label">Match {active.idx}</div>
      <div className="overlay-active-card">
        <div className="orow">
          <div className="pname">{active.a}</div>
          <div className={`pscore${aWin ? " is-winner" : ""}`}>{active.scoreA}</div>
        </div>
        <div className="divider" />
        <div className="orow">
          <div className="pname">{active.b}</div>
          <div className={`pscore${bWin ? " is-winner" : ""}`}>{active.scoreB}</div>
        </div>
      </div>
    </div>
  );
}

function BottomBanner({ state }: { state: OverlayState }) {
  return (
    <div className="overlay-bottom-banner">
      <div className="banner-header">
        <div className="tournament">{state.tournament}</div>
        <div className="round">{state.roundLabel}</div>
      </div>
      {state.winner ? (
        <div className="banner-winner">
          <span className="banner-winner-crown">♔</span>
          <span className="banner-winner-name">{state.winner}</span>
          <span className="banner-winner-label">Champion</span>
        </div>
      ) : (
        <div className="banner-matches">
          {state.matches.map((m) => {
            const aWin = m.done && m.scoreA >= 4;
            const bWin = m.done && m.scoreB >= 4;
            return (
              <div key={m.idx} className={["bm", m.active && "is-active", m.done && "is-done"].filter(Boolean).join(" ")}>
                <div className="idx">Match {m.idx}</div>
                <div className={`player${aWin ? " is-winner" : ""}`}>
                  <span className="nm">{m.a}</span>
                  {m.done || m.active ? (
                    <span className="sc">{m.scoreA}</span>
                  ) : (
                    <span className="sc pending">–</span>
                  )}
                </div>
                <div className={`player${bWin ? " is-winner" : ""}`}>
                  <span className="nm">{m.b}</span>
                  {m.done || m.active ? (
                    <span className="sc">{m.scoreB}</span>
                  ) : (
                    <span className="sc pending">–</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function OverlayPage() {
  const { data } = useQuery<OverlayState>({
    queryKey: ["overlay"],
    queryFn: () => tournaments.getOverlay(),
    refetchInterval: 3_000,
  });

  if (!data) return null;

  return (
    <div className="overlay-root">
      <BrandTag />
      {data.winner ? (
        <VictoryCard winner={data.winner} />
      ) : (
        <RightRail state={data} />
      )}
      <BottomBanner state={data} />
    </div>
  );
}
