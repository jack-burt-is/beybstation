interface ScoreStepperProps {
  value: number;
  onChange: (value: number) => void;
  disabledInc?: boolean;
  disabledDec?: boolean;
}

export default function ScoreStepper({ value, onChange, disabledInc, disabledDec }: ScoreStepperProps) {
  return (
    <div className="score-steppers">
      <button
        className="score-step"
        onClick={() => onChange(value - 1)}
        disabled={disabledDec || value <= 0}
        aria-label="Decrease score"
      >
        −
      </button>
      <button
        className="score-step"
        onClick={() => onChange(value + 1)}
        disabled={disabledInc || value >= 4}
        aria-label="Increase score"
      >
        +
      </button>
    </div>
  );
}
