import { useState } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Home, Monitor } from "lucide-react";
import { tournaments } from "../api/tournaments";
import type { Tournament } from "@beybstation/shared";
import Header from "../components/header";
import Badge from "../components/badge";
import Button from "../components/button";
import BracketTree from "../components/bracket";

function BracketList({ tournament }: { tournament: Tournament }) {
  const round = tournament.rounds[tournament.activeRound];
  if (!round) return null;

  return (
    <div>
      <div className="kicker" style={{ marginBottom: 10 }}>{round.label}</div>
      {round.matches.map((m, i) => {
        const isDone = m.status === "DONE";
        const aWin = isDone && m.scoreA >= 4;
        const bWin = isDone && m.scoreB >= 4;
        return (
          <div key={m.id} className={["match-row", isDone && "is-done"].filter(Boolean).join(" ")}>
            <div className="match-num">Match {i + 1}</div>
            <div className={["player", aWin && "is-winner", !aWin && isDone && "is-loser"].filter(Boolean).join(" ")}>{m.a}</div>
            {isDone ? (
              <div className="score">{m.scoreA} - {m.scoreB}</div>
            ) : (
              <div className="score--pending">vs</div>
            )}
            <div className={["player r", bWin && "is-winner", !bWin && isDone && "is-loser"].filter(Boolean).join(" ")}>{m.b}</div>
            <div />
          </div>
        );
      })}
    </div>
  );
}

function ProjectorScreen({ tournament, onExit }: { tournament: Tournament; onExit: () => void }) {
  const round = tournament.rounds[tournament.activeRound] ?? tournament.rounds[0];
  if (!round) return null;

  const activeIdx = round.matches.findIndex((m) => m.status !== "DONE");
  const focalIdx = activeIdx >= 0 ? activeIdx : round.matches.length - 1;
  const focal = round.matches[focalIdx];

  if (!focal) return null;

  const isDone = focal.status === "DONE";
  const aWin = isDone && focal.scoreA >= 4;
  const bWin = isDone && focal.scoreB >= 4;

  return (
    <div className="projector">
      <button className="projector-exit" onClick={onExit}>← back</button>
      <div className="proj-top">
        <div className="proj-brand">
          <img src="/logo.png" alt="" />
          <span>{tournament.name}</span>
        </div>
        <div className="proj-tag">Sheffield · Live</div>
        <div className="proj-live">LIVE</div>
      </div>
      <div className="proj-title">
        <div className="kicker">now playing</div>
        <h1><span className="round">{round.label}</span> · Match {focalIdx + 1}</h1>
      </div>
      <div className="proj-hero">
        <div className={["side", aWin && "is-winner"].filter(Boolean).join(" ")}>
          <div className="hero-kicker">Current Match</div>
          <div className="pname">{focal.a}</div>
          <div className="pscore">{focal.scoreA}</div>
        </div>
        <div className="vs">×</div>
        <div className={["side r", bWin && "is-winner"].filter(Boolean).join(" ")}>
          <div className="hero-kicker">&nbsp;</div>
          <div className="pname">{focal.b}</div>
          <div className="pscore">{focal.scoreB}</div>
        </div>
      </div>
      <div className="proj-roster">
        <div className="kicker roster-kicker">All matches · {round.label}</div>
        <div className="roster-grid">
          {round.matches.map((m, i) => {
            const done = m.status === "DONE";
            const active = i === focalIdx && activeIdx >= 0;
            const mAWin = done && m.scoreA >= 4;
            const mBWin = done && m.scoreB >= 4;
            return (
              <div key={m.id} className={["proj-mrow", done && "is-done", active && "is-active"].filter(Boolean).join(" ")}>
                <div>
                  <span className="mnum">M{i + 1}</span>
                  <span className={["pn", mAWin && "is-winner", !mAWin && done && "is-loser"].filter(Boolean).join(" ")}>{m.a}</span>
                </div>
                <div className={["sc", done ? (mAWin ? "is-winner" : "") : "dash"].filter(Boolean).join(" ")}>{done ? m.scoreA : "—"}</div>
                <div className="vs-dot">vs</div>
                <div className={["sc", done ? (mBWin ? "is-winner" : "") : "dash"].filter(Boolean).join(" ")}>{done ? m.scoreB : "—"}</div>
                <div className={["pn r", mBWin && "is-winner", !mBWin && done && "is-loser"].filter(Boolean).join(" ")}>{m.b}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function LiveResultsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"bracket" | "list" | "projector">("bracket");

  const { data, isLoading } = useQuery({
    queryKey: ["active-tournament"],
    queryFn: () => tournaments.getActive(),
    refetchInterval: 5_000,
  });

  const tournament = data?.tournament ?? null;

  if (view === "projector" && tournament) {
    return <ProjectorScreen tournament={tournament} onExit={() => setView("bracket")} />;
  }

  return (
    <div className="app">
      <Header
        kicker="Live results · public"
        onHome={() => navigate("/")}
        right={<Badge kind="live">LIVE</Badge>}
      />
      <main className="app-main">
        <div className="bracket-header">
          <div>
            <div className="kicker">now playing</div>
            <h1 className="display">
              {isLoading ? "Loading…" : tournament ? tournament.name : "No active tournament"}
            </h1>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div className="view-switch" role="tablist">
              <button className={view === "bracket" ? "is-on" : ""} onClick={() => setView("bracket")}>Bracket</button>
              <button className={view === "list" ? "is-on" : ""} onClick={() => setView("list")}>List</button>
            </div>
            {tournament && (
              <Button size="sm" variant="cyan" icon={Monitor} onClick={() => setView("projector")}>
                Projector mode
              </Button>
            )}
            <Button size="sm" variant="ghost" icon={Home} onClick={() => navigate("/")}>
              Home
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="empty-state">
            <div className="spin">◈</div>
          </div>
        ) : !tournament || tournament.rounds.length === 0 ? (
          <div className="bey-card" style={{ textAlign: "center", padding: 48 }}>
            <div className="kicker" style={{ marginBottom: 8 }}>standby</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, textTransform: "uppercase" }}>
              Waiting for Round 1
            </div>
          </div>
        ) : view === "bracket" ? (
          <BracketTree tournament={tournament} />
        ) : (
          <BracketList tournament={tournament} />
        )}
      </main>
    </div>
  );
}
