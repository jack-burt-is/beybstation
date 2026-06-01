import { ROUND_LABELS } from "@beybstation/shared";

interface RoundTabsProps {
  activeIdx: number;
  maxIdx: number;
  onSelect: (idx: number) => void;
}

export default function RoundTabs({ activeIdx, maxIdx, onSelect }: RoundTabsProps) {
  return (
    <nav className="round-tabs" role="tablist">
      {ROUND_LABELS.map((label, i) => {
        const unlocked = i <= maxIdx;
        const active = i === activeIdx;
        return (
          <button
            key={label}
            role="tab"
            className={[
              "round-tab",
              active && "is-active",
              !active && unlocked && "is-unlocked",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={!unlocked}
            onClick={() => onSelect(i)}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );
}
