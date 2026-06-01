import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Flag, Save } from "lucide-react";
import { tournaments } from "../../api/tournaments";
import Header from "../../components/header";
import Button from "../../components/button";
import ScoreStepper from "../../components/score-stepper";

export default function AdminMatch() {
  const { id, roundIdx: roundIdxStr, matchIdx: matchIdxStr } = useParams<{
    id: string;
    roundIdx: string;
    matchIdx: string;
  }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const roundIdx = parseInt(roundIdxStr ?? "0", 10);
  const matchIdx = parseInt(matchIdxStr ?? "0", 10);

  const { data } = useQuery({
    queryKey: ["tournament", id],
    queryFn: () => tournaments.get(id!),
    enabled: !!id,
  });

  const t = data?.tournament;
  const round = t?.rounds[roundIdx];
  const match = round?.matches[matchIdx];

  const [scoreA, setScoreA] = useState(match?.scoreA ?? 0);
  const [scoreB, setScoreB] = useState(match?.scoreB ?? 0);
  const dirty = useRef(false);

  function handleSetScoreA(v: number) {
    dirty.current = true;
    setScoreA(v);
  }
  function handleSetScoreB(v: number) {
    dirty.current = true;
    setScoreB(v);
  }

  // Auto-save scores so overlay/projector stay live
  useEffect(() => {
    if (!dirty.current || !id) return;
    const timer = setTimeout(() => {
      tournaments.updateMatch(id, roundIdx, matchIdx, { scoreA, scoreB, finish: false });
    }, 400);
    return () => clearTimeout(timer);
  }, [scoreA, scoreB, id, roundIdx, matchIdx]);

  const wasDone = match?.status === "DONE";

  const save = useMutation({
    mutationFn: (finish: boolean) =>
      tournaments.updateMatch(id!, roundIdx, matchIdx, {
        scoreA,
        scoreB,
        finish,
      }),
    onSuccess: ({ tournament: updated }) => {
      qc.setQueryData(["tournament", id], { tournament: updated });
      navigate(`/admin/tournament/${id}`);
    },
  });

  if (!t || !round || !match) {
    return (
      <div className="app">
        <Header />
        <main className="app-main">
          <div className="empty-state"><div className="spin">◈</div></div>
        </main>
      </div>
    );
  }

  const aWin = scoreA >= 4;
  const bWin = scoreB >= 4;
  const canFinish = aWin || bWin;

  return (
    <div className="app">
      <Header
        kicker={`${round.label} · Match ${matchIdx + 1}`}
        right={
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate(`/admin/tournament/${id}`)}
          >
            Back
          </Button>
        }
      />
      <main className="score-stage">
        <div className="top">
          <span style={{ color: "var(--fg3)" }}>{t.name}</span>
          <span style={{ color: "var(--bey-pink)" }}>
            {round.label} · Match {matchIdx + 1}
          </span>
        </div>

        <div className="score-board">
          <div className={["score-side", aWin && "is-winner"].filter(Boolean).join(" ")}>
            <div className="pname">{match.a}</div>
            <div
              className="score-num"
              title="Tap to edit"
              onClick={() => {
                const v = prompt(`Score for ${match.a} (0–4):`, String(scoreA));
                if (v == null) return;
                handleSetScoreA(Math.max(0, Math.min(4, parseInt(v) || 0)));
              }}
            >
              {scoreA}
            </div>
            <ScoreStepper
              value={scoreA}
              onChange={handleSetScoreA}
              disabledInc={scoreA >= 4}
              disabledDec={scoreA <= 0}
            />
          </div>

          <div className="score-vs">×</div>

          <div className={["score-side", bWin && "is-winner"].filter(Boolean).join(" ")}>
            <div className="pname">{match.b}</div>
            <div
              className="score-num"
              title="Tap to edit"
              onClick={() => {
                const v = prompt(`Score for ${match.b} (0–4):`, String(scoreB));
                if (v == null) return;
                handleSetScoreB(Math.max(0, Math.min(4, parseInt(v) || 0)));
              }}
            >
              {scoreB}
            </div>
            <ScoreStepper
              value={scoreB}
              onChange={handleSetScoreB}
              disabledInc={scoreB >= 4}
              disabledDec={scoreB <= 0}
            />
          </div>
        </div>

        <div className="score-actions">
          {wasDone ? (
            <>
              <Button
                variant="secondary"
                onClick={() => navigate(`/admin/tournament/${id}`)}
              >
                Cancel
              </Button>
              <Button
                icon={Save}
                onClick={() => save.mutate(false)}
                disabled={save.isPending}
              >
                Save changes
              </Button>
            </>
          ) : (
            <Button
              icon={Flag}
              onClick={() => save.mutate(true)}
              disabled={!canFinish || save.isPending}
            >
              Finish match
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
