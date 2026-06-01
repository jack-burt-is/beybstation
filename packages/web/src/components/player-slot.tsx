interface PlayerSlotProps {
  idx: number;
  value: string;
  editable?: boolean;
  onChange?: (value: string) => void;
}

export default function PlayerSlot({ idx, value, editable, onChange }: PlayerSlotProps) {
  return (
    <div className="player-slot">
      <span className="num">{String(idx + 1).padStart(2, "0")}</span>
      <input
        value={value}
        readOnly={!editable}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={`Player ${idx + 1}`}
      />
    </div>
  );
}
