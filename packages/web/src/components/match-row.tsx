import type { Match } from "@beybstation/shared";
import Button from "./button";
import { ChevronUp, ChevronDown, Edit3, Plus } from "lucide-react";

interface MatchRowProps {
  idx: number;
  match: Match;
  status: "PENDING" | "ACTIVE" | "DONE";
  canReorder?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onAddScore?: () => void;
  onEdit?: () => void;
}

export default function MatchRow({
  idx,
  match,
  status,
  canReorder,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onAddScore,
  onEdit,
}: MatchRowProps) {
  const isDone = status === "DONE";
  const isActive = status === "ACTIVE";
  const winnerA = isDone && match.scoreA >= 4;
  const winnerB = isDone && match.scoreB >= 4;

  const cls = [
    "match-row",
    isDone && "is-done",
    isActive && "is-active",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls}>
      <div className="match-num">
        {canReorder && (
          <span className="row-reorder">
            <button onClick={onMoveUp} disabled={isFirst} aria-label="Move up">
              <ChevronUp size={14} />
            </button>
            <button onClick={onMoveDown} disabled={isLast} aria-label="Move down">
              <ChevronDown size={14} />
            </button>
          </span>
        )}
        Match {idx + 1}
      </div>

      <div className={["player", isDone && winnerA ? "is-winner" : isDone ? "is-loser" : ""].filter(Boolean).join(" ")}>
        {match.a}
      </div>

      {isDone ? (
        <div className="score">
          {match.scoreA} - {match.scoreB}
        </div>
      ) : isActive ? (
        <Button variant="primary" size="sm" icon={Plus} onClick={onAddScore}>
          Add score
        </Button>
      ) : (
        <div className="score--pending">vs</div>
      )}

      <div className={["player r", isDone && winnerB ? "is-winner" : isDone ? "is-loser" : ""].filter(Boolean).join(" ")}>
        {match.b}
      </div>

      <div className="row-action">
        {isDone && (
          <Button variant="ghost" size="sm" icon={Edit3} onClick={onEdit}>
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}
