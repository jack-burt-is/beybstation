// Beybstation Admin — reusable primitives
// Exposes components to window for cross-script use.

function Icon({ name, size = 18, color }) {
  // Owns a wrapper <span>; lucide only ever mutates the inner <i>/<svg>.
  // This prevents React vs. lucide reconciliation loops + global DOM thrash.
  const ref = React.useRef(null);
  React.useEffect(() => {
    const host = ref.current;
    if (!host || !window.lucide) return;
    host.innerHTML = '<i data-lucide="' + name + '"></i>';
    try {
      window.lucide.createIcons({
        nameAttr: 'data-lucide',
        attrs: { width: size, height: size, stroke: color || 'currentColor' },
        root: host,
      });
    } catch (e) { /* lucide bundle race — ignore */ }
  }, [name, size, color]);
  return (
    <span
      ref={ref}
      className="icon"
      style={{ width: size, height: size, color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}
    />
  );
}

function Button({ children, variant = 'primary', size = 'md', icon, ...rest }) {
  const cls = ['btn'];
  if (variant === 'secondary') cls.push('btn--secondary');
  if (variant === 'ghost')     cls.push('btn--ghost');
  if (variant === 'cyan')      cls.push('btn--cyan');
  if (size === 'sm')           cls.push('btn--small');
  if (rest.block)              cls.push('btn--block');
  const { block, ...buttonProps } = rest;
  return (
    <button className={cls.join(' ')} {...buttonProps}>
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 18} />}
      {children}
    </button>
  );
}

function Input({ label, ...rest }) {
  return (
    <div>
      {label && <label className="bey-label">{label}</label>}
      <input className="bey-input" {...rest} />
    </div>
  );
}

function Header({ title, kicker, onHome, right }) {
  return (
    <header className="app-header">
      <div className="brand" onClick={onHome} style={{ cursor: onHome ? 'pointer' : 'default' }}>
        <img src="../../assets/logo-original.png" alt="BEYBSTATION" />
        {title && <span>{title}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        {kicker && <span className="meta">{kicker}</span>}
        {right}
      </div>
    </header>
  );
}

function RoundTabs({ rounds, activeIdx, maxIdx, onSelect }) {
  // rounds = ROUND_LABELS
  return (
    <nav className="round-tabs" role="tablist">
      {ROUND_LABELS.map((label, i) => {
        const unlocked = i <= maxIdx;
        const active = i === activeIdx;
        return (
          <button
            key={label}
            role="tab"
            className={['round-tab', active && 'is-active', unlocked && !active && 'is-unlocked'].filter(Boolean).join(' ')}
            disabled={!unlocked}
            onClick={() => onSelect && onSelect(i)}
          >{label}</button>
        );
      })}
    </nav>
  );
}

function Badge({ kind = 'wait', children }) {
  return <span className={`bey-badge bey-badge--${kind}`}>{children}</span>;
}

function MatchRow({
  idx, match, canReorder, onMoveUp, onMoveDown, isFirst, isLast,
  status,   // 'PENDING' | 'ACTIVE' | 'LIVE' | 'DONE'
  onAddScore, onEdit,
  showScore,
}) {
  const winnerA = match.scoreA >= 4;
  const winnerB = match.scoreB >= 4;
  const isDone  = status === 'DONE';
  const cls = ['match-row'];
  if (status === 'LIVE')  cls.push('is-live');
  if (status === 'ACTIVE') cls.push('is-active');
  if (status === 'DONE') cls.push('is-done');

  return (
    <div className={cls.join(' ')}>
      <div className="match-num">
        {canReorder && (
          <span className="row-reorder" style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: 8 }}>
            <button onClick={onMoveUp} disabled={isFirst} aria-label="Move up"><Icon name="chevron-up" size={14}/></button>
            <button onClick={onMoveDown} disabled={isLast} aria-label="Move down"><Icon name="chevron-down" size={14}/></button>
          </span>
        )}
        Match {idx+1}
      </div>
      <div className={['player', isDone && winnerA ? 'is-winner' : isDone ? 'is-loser' : ''].join(' ')}>{match.a}</div>
      {showScore && isDone ? (
        <div className="score">{match.scoreA} - {match.scoreB}</div>
      ) : status === 'ACTIVE' || status === 'LIVE' ? (
        <Button variant="primary" size="sm" onClick={onAddScore} icon="plus">Add score</Button>
      ) : (
        <div className="score--pending">vs</div>
      )}
      <div className={['player', 'r', isDone && winnerB ? 'is-winner' : isDone ? 'is-loser' : ''].join(' ')}>{match.b}</div>
      <div className="row-action">
        {isDone && <Button variant="ghost" size="sm" icon="edit-3" onClick={onEdit}>Edit</Button>}
      </div>
    </div>
  );
}

function PlayerSlot({ idx, value, editable, onChange }) {
  return (
    <div className="player-slot">
      <span className="num">{String(idx + 1).padStart(2, '0')}</span>
      <input
        value={value}
        readOnly={!editable}
        onChange={e => onChange && onChange(e.target.value)}
        placeholder={`Player ${idx + 1}`}
      />
    </div>
  );
}

function ScoreStepper({ value, onChange, disabledInc, disabledDec }) {
  return (
    <div className="score-steppers">
      <button className="score-step" onClick={() => onChange(value - 1)} disabled={disabledDec || value <= 0}>−</button>
      <button className="score-step" onClick={() => onChange(value + 1)} disabled={disabledInc || value >= 4}>+</button>
    </div>
  );
}

Object.assign(window, {
  Icon, Button, Input, Header, RoundTabs, Badge,
  MatchRow, PlayerSlot, ScoreStepper,
});
