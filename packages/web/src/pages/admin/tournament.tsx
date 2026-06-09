import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, Shuffle, Play, ArrowRight } from "lucide-react";
import { tournaments } from "../../api/tournaments";
import type { Tournament, Round } from "@beybstation/shared";
import { ROUND_LABELS } from "@beybstation/shared";
import Header from "../../components/header";
import Button from "../../components/button";
import Badge from "../../components/badge";
import PlayerSlot from "../../components/player-slot";
import MatchRow from "../../components/match-row";
import RoundTabs from "../../components/round-tabs";

function nextRoundLabel(idx: number): string {
  return ROUND_LABELS[idx] ?? `Round ${idx + 1}`;
}

function isRoundComplete(round: Round): boolean {
  return round.matches.every((m) => m.status === "DONE");
}

function canEnterScore(round: Round, matchIdx: number): boolean {
  if (!round.started) return false;
  if (round.matches[matchIdx].status === "DONE") return true;
  if (matchIdx === 0) return true;
  return round.matches[matchIdx - 1].status === "DONE";
}

export default function AdminTournament() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["tournament", id],
    queryFn: () => tournaments.get(id!),
    enabled: !!id,
    refetchInterval: 10_000,
  });

  const t = data?.tournament;
  const [activeRound, setActiveRound] = useState(0);
  const didInit = useRef(false);
  useEffect(() => {
    if (t && !didInit.current) {
      didInit.current = true;
      setActiveRound(t.activeRound);
    }
  }, [t]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["tournament", id] });

  const generateRound = useMutation({
    mutationFn: () => tournaments.generateRound(id!),
    onSuccess: ({ tournament: updated }) => {
      qc.setQueryData(["tournament", id], { tournament: updated });
      setActiveRound(updated.activeRound);
    },
  });

  const shuffle = useMutation({
    mutationFn: () => tournaments.shuffle(id!),
    onSuccess: ({ tournament: updated }) =>
      qc.setQueryData(["tournament", id], { tournament: updated }),
  });

  const startRound = useMutation({
    mutationFn: () => tournaments.startRound(id!),
    onSuccess: ({ tournament: updated }) =>
      qc.setQueryData(["tournament", id], { tournament: updated }),
  });

  const reorder = useMutation({
    mutationFn: ({ from, to }: { from: number; to: number }) =>
      tournaments.reorder(id!, activeRound, from, to),
    onSuccess: ({ tournament: updated }) =>
      qc.setQueryData(["tournament", id], { tournament: updated }),
  });

  const updatePlayers = useMutation({
    mutationFn: (players: string[]) => tournaments.update(id!, { players }),
    onSuccess: ({ tournament: updated }) =>
      qc.setQueryData(["tournament", id], { tournament: updated }),
  });

  if (isLoading || !t) {
    return (
      <div className="app">
        <Header onHome={() => navigate("/admin/home")} />
        <main className="app-main">
          <div className="empty-state"><div className="spin">◈</div></div>
        </main>
      </div>
    );
  }

  const round = t.rounds[activeRound];
  const maxRoundIdx = t.rounds.length - 1;
  const isPreRound1 = t.status === "PRE";
  const isPreStart = round && !round.started;
  const isStarted = round && round.started;
  const roundComplete = round ? isRoundComplete(round) : false;
  const isFinal = activeRound === 3;

  function handlePlayerChange(i: number, name: string) {
    const updated = t!.players.slice();
    updated[i] = name;
    updatePlayers.mutate(updated);
  }

  // STATE 0: Pre Round 1 generation
  if (isPreRound1) {
    return (
      <div className="app">
        <Header onHome={() => navigate("/admin/home")} />
        <main className="app-main">
          <div className="toolbar">
            <div>
              <div className="kicker">admin · pre-round 1</div>
              <h1 className="display">{t.name}</h1>
            </div>
            <Button
              icon={Zap}
              onClick={() => generateRound.mutate()}
              disabled={generateRound.isPending}
            >
              Generate Round 1
            </Button>
          </div>
          <div className="kicker" style={{ marginBottom: 10 }}>Players · edit any name</div>
          <div className="player-grid">
            {t.players.map((p, i) => (
              <PlayerSlot
                key={i}
                idx={i}
                value={p}
                editable
                onChange={(v) => handlePlayerChange(i, v)}
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // STATE 1 & 2: Round generated or in progress
  return (
    <div className="app">
      <Header onHome={() => navigate("/admin/home")} />
      <main className="app-main">
        <div className="toolbar">
          <div>
            <div className="kicker">
              {isPreStart ? "pre-round start" : "round in progress"}
            </div>
            <h1 className="display">{t.name}</h1>
          </div>
          <div className="toolbar-actions">
            {isPreStart && activeRound === 0 && (
              <Button
                variant="secondary"
                size="sm"
                icon={Shuffle}
                onClick={() => shuffle.mutate()}
                disabled={shuffle.isPending}
              >
                Shuffle match-up
              </Button>
            )}
            {isPreStart && (
              <Button
                size="sm"
                icon={Play}
                onClick={() => startRound.mutate()}
                disabled={startRound.isPending}
              >
                Start {round.label}
              </Button>
            )}
            {isStarted && roundComplete && !isFinal && (
              <Button
                variant="cyan"
                size="sm"
                icon={ArrowRight}
                onClick={() => generateRound.mutate()}
                disabled={generateRound.isPending}
              >
                Generate {nextRoundLabel(activeRound + 1)}
              </Button>
            )}
            {isStarted && roundComplete && isFinal && (
              <Badge kind="win">Tournament Complete</Badge>
            )}
          </div>
        </div>

        <RoundTabs
          activeIdx={activeRound}
          maxIdx={maxRoundIdx}
          onSelect={(i) => { if (i <= maxRoundIdx) setActiveRound(i); }}
        />

        {round && (
          <div>
            {round.matches.map((m, i) => {
              const isDone = m.status === "DONE";
              const canScore = canEnterScore(round, i);
              const status = isDone ? "DONE" : (isStarted && canScore ? "ACTIVE" : "PENDING");
              return (
                <MatchRow
                  key={m.id}
                  idx={i}
                  match={m}
                  status={status}
                  canReorder={isPreStart || (isStarted && !isDone)}
                  isFirst={i === 0}
                  isLast={i === round.matches.length - 1}
                  onMoveUp={() => reorder.mutate({ from: i, to: i - 1 })}
                  onMoveDown={() => reorder.mutate({ from: i, to: i + 1 })}
                  onAddScore={() =>
                    navigate(`/admin/tournament/${id}/match/${activeRound}/${i}`)
                  }
                  onEdit={() =>
                    navigate(`/admin/tournament/${id}/match/${activeRound}/${i}`)
                  }
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
