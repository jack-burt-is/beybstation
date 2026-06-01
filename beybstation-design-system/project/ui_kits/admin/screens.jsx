// Beybstation Admin — top-level app + screens
// Components and data are loaded onto window from earlier scripts.

const { useState, useEffect, useMemo } = React;

// ============================================================
// SCREEN: Landing (public)
// ============================================================
function LandingScreen({ goLiveResults, goAdminLogin }) {
  return (
    <div className="app">
      <Header kicker="Sheffield · 8pm" />
      <main className="app-main">
        <div className="landing-hero">
          <img src="../../assets/logo-original.png" alt="Beybstation"/>
          <p>Live tournament · admin</p>
        </div>
        <div className="landing-stage">
          <div className="landing-card" onClick={goLiveResults}>
            <div className="ico">▣</div>
            <h2>Live Results</h2>
            <p>Watch the bracket update in real time.</p>
          </div>
          <div className="landing-card is-admin" onClick={goAdminLogin}>
            <div className="ico">✦</div>
            <h2>Admin only</h2>
            <p>Password up. Operators only.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================
// SCREEN: Login
// ============================================================
function LoginScreen({ goBack, onLogin }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  function submit(e) {
    e.preventDefault();
    if (!pw) { setErr('Password required.'); return; }
    onLogin();
  }
  return (
    <div className="app">
      <Header kicker="Admin · log in"
        right={<Button variant="ghost" size="sm" icon="arrow-left" onClick={goBack}>BACK</Button>}/>
      <main className="login-stage">
        <form className="login-form" onSubmit={submit}>
          <h1>Admin only</h1>
          <div className="sub">Password up</div>
          <div style={{ marginBottom: 24 }}>
            <Input label="Password" type="password" placeholder="Enter password..."
              value={pw} onChange={e => { setPw(e.target.value); setErr(''); }} autoFocus/>
            {err && <div style={{ color: 'var(--bey-red)', fontSize: 12, marginTop: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>{err}</div>}
          </div>
          <Button block type="submit" icon="log-in">Login</Button>
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--fg3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
            (hint: type anything)
          </div>
        </form>
      </main>
    </div>
  );
}

// ============================================================
// SCREEN: Home — pick tournament
// ============================================================
function HomeScreen({ tournaments, goCreate, openTournament, goLanding }) {
  return (
    <div className="app">
      <Header kicker="Admin · tournaments" onHome={goLanding}
        right={<Button variant="ghost" size="sm" icon="log-out" onClick={goLanding}>SIGN OUT</Button>}/>
      <main className="app-main">
        <div className="toolbar">
          <div>
            <div className="kicker">admin only</div>
            <h1>Beybstation Tournaments</h1>
          </div>
        </div>
        <div className="tourn-list">
          {tournaments.map(t => (
            <div key={t.id} className="tourn-card" onClick={() => openTournament(t.id)}>
              <div className="date">Tournament · {t.date.slice(5)}</div>
              <div className="name">{t.name}</div>
            </div>
          ))}
          <div className="tourn-card is-new" onClick={goCreate}>
            <Icon name="plus" size={20}/> Create new
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================
// SCREEN: Create new tournament
// ============================================================
function CreateScreen({ onCancel, onSave, goHome }) {
  const [name, setName] = useState('');
  const [players, setPlayers] = useState(DEFAULT_PLAYERS.map((_, i) => `Player ${i+1}`));
  function setPlayer(i, v) {
    setPlayers(prev => prev.map((p, idx) => idx === i ? v : p));
  }
  function save() {
    if (!name.trim()) return;
    onSave(name.trim(), players.map((p,i) => p || `Player ${i+1}`));
  }
  return (
    <div className="app">
      <Header kicker="Create new" onHome={goHome}/>
      <main className="app-main">
        <div className="toolbar">
          <div>
            <div className="kicker">admin · setup</div>
            <h1>New Tournament</h1>
          </div>
          <div className="toolbar-actions">
            <Button variant="secondary" size="sm" onClick={onCancel}>CANCEL</Button>
            <Button size="sm" icon="save" onClick={save} disabled={!name.trim()}>SAVE</Button>
          </div>
        </div>
        <div style={{ maxWidth: 520, marginBottom: 32 }}>
          <Input label="Tournament name" placeholder="Enter name..." value={name} onChange={e => setName(e.target.value)}/>
        </div>
        <div style={{ marginBottom: 12 }} className="kicker">Edit player names · 16 spinners</div>
        <div className="player-grid">
          {players.map((p, i) => (
            <PlayerSlot key={i} idx={i} value={p} editable onChange={v => setPlayer(i, v)}/>
          ))}
        </div>
      </main>
    </div>
  );
}

// ============================================================
// SCREEN: Tournament view (all 3 states)
// ============================================================
function TournamentScreen({ tournament, setTournament, goHome, openMatch }) {
  const [activeRound, setActiveRound] = useState(tournament.activeRound);
  const round = tournament.rounds[activeRound];
  const isFirstRoundPre = tournament.state === 'PRE';
  const isPreStart = round && !round.started;
  const isStarted  = round && round.started;
  const maxRoundIdx = tournament.rounds.length - 1;

  function generateRound1() {
    const r = makeRound('Round 1', tournament.players);
    setTournament({ ...tournament, rounds: [r], activeRound: 0, state: 'GENERATED' });
    setActiveRound(0);
  }

  function shuffleR1() {
    if (activeRound !== 0) return;
    const r = makeRound('Round 1', tournament.players, true);
    const rounds = [r];
    setTournament({ ...tournament, rounds, activeRound: 0 });
  }

  function moveMatch(i, dir) {
    const r = { ...round };
    const m = r.matches.slice();
    const j = i + dir;
    if (j < 0 || j >= m.length) return;
    [m[i], m[j]] = [m[j], m[i]];
    r.matches = m;
    const newRounds = tournament.rounds.slice();
    newRounds[activeRound] = r;
    setTournament({ ...tournament, rounds: newRounds });
  }

  function startRound() {
    const r = { ...round, started: true };
    const newRounds = tournament.rounds.slice();
    newRounds[activeRound] = r;
    setTournament({ ...tournament, rounds: newRounds, state: 'STARTED' });
  }

  function setPlayerName(originalName, newName) {
    if (originalName === newName) return;
    setTournament(t => {
      // replace in players list (for round 0) and match labels in current round
      const players = t.players.map(p => p === originalName ? newName : p);
      const rounds = t.rounds.map(r => ({
        ...r,
        matches: r.matches.map(m => ({
          ...m,
          a: m.a === originalName ? newName : m.a,
          b: m.b === originalName ? newName : m.b,
        }))
      }));
      return { ...t, players, rounds };
    });
  }

  function generateNextRound() {
    if (!round || !isRoundComplete(round)) return;
    const winners = winnersOfRound(round);
    const nextIdx = activeRound + 1;
    const r = makeRound(nextRoundLabel(nextIdx), winners);
    const newRounds = [...tournament.rounds, r];
    setTournament({ ...tournament, rounds: newRounds, activeRound: nextIdx, state: 'GENERATED' });
    setActiveRound(nextIdx);
  }

  // STATE 0: Pre Round-1 generation
  if (isFirstRoundPre) {
    return (
      <div className="app">
        <Header onHome={goHome}/>
        <main className="app-main">
          <div className="toolbar">
            <div>
              <div className="kicker">admin · pre-round 1</div>
              <h1>{tournament.name}</h1>
            </div>
            <Button onClick={generateRound1} icon="zap">Generate Round 1</Button>
          </div>
          <div className="kicker" style={{ marginBottom: 10 }}>Players · edit any name</div>
          <div className="player-grid">
            {tournament.players.map((p, i) => (
              <PlayerSlot key={i} idx={i} value={p} editable
                onChange={v => setPlayerName(p, v)}/>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // STATE 1/2 — tournament with rounds
  return (
    <div className="app">
      <Header onHome={goHome}/>
      <main className="app-main">
        <div className="toolbar">
          <div>
            <div className="kicker">{isPreStart ? 'pre-round start' : 'round in progress'}</div>
            <h1>{tournament.name}</h1>
          </div>
          <div className="toolbar-actions">
            {isPreStart && activeRound === 0 && (
              <Button variant="secondary" size="sm" icon="shuffle" onClick={shuffleR1}>Shuffle match-up</Button>
            )}
            {isPreStart && (
              <Button size="sm" icon="play" onClick={startRound}>Start {round.label}</Button>
            )}
            {isStarted && isRoundComplete(round) && activeRound < 3 && (
              <Button variant="cyan" size="sm" icon="arrow-right" onClick={generateNextRound}>
                Generate {nextRoundLabel(activeRound + 1)}
              </Button>
            )}
            {isStarted && isRoundComplete(round) && activeRound === 3 && (
              <Badge kind="win">Tournament Complete</Badge>
            )}
          </div>
        </div>

        <RoundTabs activeIdx={activeRound} maxIdx={maxRoundIdx}
          onSelect={i => i <= maxRoundIdx && setActiveRound(i)}/>

        <div>
          {round.matches.map((m, i) => {
            const isDone = m.status === 'DONE';
            const canEnter = canStartScoreEntry(round, i);
            let status = 'PENDING';
            if (isDone) status = 'DONE';
            else if (round.started && canEnter) status = 'ACTIVE';
            return (
              <MatchRow key={m.id}
                idx={i} match={m}
                canReorder={isPreStart || (isStarted && !isDone)}
                onMoveUp={() => moveMatch(i, -1)}
                onMoveDown={() => moveMatch(i, 1)}
                isFirst={i === 0} isLast={i === round.matches.length - 1}
                status={status}
                showScore
                onAddScore={() => openMatch(activeRound, i)}
                onEdit={() => openMatch(activeRound, i)}
              />
            );
          })}
        </div>

        {isPreStart && activeRound === 0 && (
          <div style={{ marginTop: 24 }}>
            <Button variant="ghost" size="sm" icon="edit-3" onClick={goHome}>EDIT NAMES</Button>
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================================
// SCREEN: Match score entry
// ============================================================
function MatchScreen({ tournament, setTournament, roundIdx, matchIdx, goBack }) {
  const round = tournament.rounds[roundIdx];
  const match = round.matches[matchIdx];
  const wasDone = match.status === 'DONE';

  const [a, setA] = useState(match.scoreA);
  const [b, setB] = useState(match.scoreB);

  function commitFinish() {
    if (a < 4 && b < 4) return;
    const newMatch = { ...match, scoreA: a, scoreB: b, status: 'DONE' };
    const newRound = { ...round, matches: round.matches.slice() };
    newRound.matches[matchIdx] = newMatch;
    const newRounds = tournament.rounds.slice();
    newRounds[roundIdx] = newRound;
    setTournament({ ...tournament, rounds: newRounds });
    goBack();
  }

  function commitSave() {
    const newMatch = { ...match, scoreA: a, scoreB: b };
    if (a >= 4 || b >= 4) newMatch.status = 'DONE';
    const newRound = { ...round, matches: round.matches.slice() };
    newRound.matches[matchIdx] = newMatch;
    const newRounds = tournament.rounds.slice();
    newRounds[roundIdx] = newRound;
    setTournament({ ...tournament, rounds: newRounds });
    goBack();
  }

  function manualEdit(side) {
    const v = prompt(`Score for ${side === 'a' ? match.a : match.b} (0–4):`, side === 'a' ? a : b);
    if (v == null) return;
    const n = Math.max(0, Math.min(4, parseInt(v) || 0));
    if (side === 'a') setA(n); else setB(n);
  }

  const aWin = a >= 4;
  const bWin = b >= 4;
  const finished = aWin || bWin;

  return (
    <div className="app">
      <Header kicker={`${round.label} · Match ${matchIdx+1}`}
        right={<Button variant="ghost" size="sm" icon="arrow-left" onClick={goBack}>BACK</Button>}/>
      <main className="score-stage">
        <div className="top">
          <span style={{ color: 'var(--fg3)', letterSpacing: '0.04em' }}>{tournament.name}</span>
          <span style={{ color: 'var(--bey-pink)' }}>{round.label} · Match {matchIdx+1}</span>
        </div>
        <div className="score-board">
          <div className={['score-side', aWin && 'is-winner'].filter(Boolean).join(' ')}>
            <div className="pname">{match.a}</div>
            <div className="score-num" onClick={() => manualEdit('a')} title="Tap to edit">{a}</div>
            <ScoreStepper value={a} onChange={setA} disabledInc={a >= 4} disabledDec={a <= 0}/>
          </div>
          <div className="score-vs">×</div>
          <div className={['score-side', bWin && 'is-winner'].filter(Boolean).join(' ')}>
            <div className="pname">{match.b}</div>
            <div className="score-num" onClick={() => manualEdit('b')} title="Tap to edit">{b}</div>
            <ScoreStepper value={b} onChange={setB} disabledInc={b >= 4} disabledDec={b <= 0}/>
          </div>
        </div>
        <div className="score-actions">
          {wasDone ? (
            <React.Fragment>
              <Button variant="secondary" onClick={goBack}>Cancel</Button>
              <Button onClick={commitSave} icon="save">Save changes</Button>
            </React.Fragment>
          ) : (
            <Button onClick={commitFinish} disabled={!finished} icon="flag">Finish match</Button>
          )}
        </div>
      </main>
    </div>
  );
}

// ============================================================
// SCREEN: Public live results — has Bracket / List / Projector views
// ============================================================
function LiveResultsScreen({ tournament, goHome }) {
  const [view, setView] = useState('bracket'); // 'bracket' | 'list' | 'projector'

  if (view === 'projector') {
    return <ProjectorScreen tournament={tournament} onExit={() => setView('bracket')}/>;
  }

  return (
    <div className="app">
      <Header kicker="Live results · public" onHome={goHome}
        right={<Badge kind="live">LIVE</Badge>}/>
      <main className="app-main">
        <div className="bracket-header">
          <div>
            <div className="kicker">now playing</div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px,4vw,44px)', textTransform: 'uppercase', lineHeight: 0.95 }}>
              {tournament ? tournament.name : 'No active tournament'}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="view-switch" role="tablist">
              <button className={view === 'bracket' ? 'is-on' : ''} onClick={() => setView('bracket')}>Bracket</button>
              <button className={view === 'list' ? 'is-on' : ''} onClick={() => setView('list')}>List</button>
            </div>
            <Button size="sm" variant="cyan" icon="monitor" onClick={() => setView('projector')}>Projector mode</Button>
          </div>
        </div>

        {!tournament || tournament.rounds.length === 0 ? (
          <div className="bey-card" style={{ textAlign: 'center', padding: '48px' }}>
            <div className="kicker" style={{ marginBottom: 8 }}>standby</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, textTransform: 'uppercase' }}>
              Waiting for Round 1
            </div>
          </div>
        ) : view === 'bracket' ? (
          <BracketTree tournament={tournament}/>
        ) : (
          <BracketList tournament={tournament}/>
        )}
      </main>
    </div>
  );
}

// ------------------------------------------------------------
// Build a 4-column bracket structure (R1 8m / R2 4m / SF 2m / F 1m)
// pulling real matches from tournament.rounds, falling back to TBD slots.
// ------------------------------------------------------------
function buildBracket(tournament) {
  const rounds = tournament.rounds || [];
  const cols = [];
  const r1 = rounds[0];
  cols.push(
    Array.from({ length: 8 }, (_, i) => {
      const m = r1 ? r1.matches[i] : null;
      return m ? { ...m, label: `M${i+1}` } : { id: 'tbd-r1-' + i, a: 'TBD', b: 'TBD', scoreA: 0, scoreB: 0, status: 'PENDING', label: `M${i+1}`, isTBD: true };
    })
  );
  cols.push(buildNextCol(cols[0], rounds[1], 4));
  cols.push(buildNextCol(cols[1], rounds[2], 2));
  cols.push(buildNextCol(cols[2], rounds[3], 1));
  return cols;
}

function buildNextCol(prevMatches, realRound, count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    if (realRound && realRound.matches[i]) {
      const m = realRound.matches[i];
      out.push({ ...m, label: `M${i+1}` });
    } else {
      const pA = prevMatches[i*2];
      const pB = prevMatches[i*2 + 1];
      const aName = matchWinner(pA) || `Winner ${pA.label}`;
      const bName = matchWinner(pB) || `Winner ${pB.label}`;
      out.push({
        id: `tbd-${i}-${Math.random().toString(36).slice(2,5)}`,
        a: aName, b: bName,
        scoreA: 0, scoreB: 0,
        status: 'PENDING',
        label: `M${i+1}`,
        isTBD: true,
      });
    }
  }
  return out;
}

function matchWinner(m) {
  if (!m) return null;
  if (m.status === 'DONE') {
    if (m.scoreA >= 4) return m.a;
    if (m.scoreB >= 4) return m.b;
  }
  return null;
}

function BracketTree({ tournament }) {
  const cols = buildBracket(tournament);
  const activeRound = tournament.activeRound ?? 0;
  return (
    <div className="bracket-wrap">
      <div className="bracket-legend" style={{ marginBottom: 16 }}>
        <span><span className="dot dot--pink"/>Active round</span>
        <span><span className="dot dot--cyan"/>Winner advanced</span>
        <span><span className="dot dot--mute"/>Pending</span>
      </div>
      <div className="bracket">
        {cols.map((col, ci) => (
          <div key={ci}
               className={['bracket-col', ci === activeRound && 'is-active'].filter(Boolean).join(' ')}
               data-round={ci}>
            <div className="col-head">{ROUND_LABELS[ci]}</div>
            {col.map((m) => <BracketMatch key={m.id} match={m} isTBD={m.isTBD}/>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketMatch({ match, isTBD }) {
  const isDone = match.status === 'DONE';
  const aWin = isDone && match.scoreA >= 4;
  const bWin = isDone && match.scoreB >= 4;
  const cls = ['bx'];
  if (isDone) cls.push('is-done');
  else if (isTBD) cls.push('is-pending');
  return (
    <div className={cls.join(' ')}>
      <div className="bx-num">{match.label || ''}{isTBD ? ' · TBD' : ''}</div>
      <div className={['bx-row', aWin && 'is-winner', bWin && 'is-loser'].filter(Boolean).join(' ')}>
        <span className="bx-name">{match.a}</span>
        {isDone
          ? <span className="bx-score">{match.scoreA}</span>
          : <span className="bx-score--pending">—</span>}
      </div>
      <div className={['bx-row', bWin && 'is-winner', aWin && 'is-loser'].filter(Boolean).join(' ')}>
        <span className="bx-name">{match.b}</span>
        {isDone
          ? <span className="bx-score">{match.scoreB}</span>
          : <span className="bx-score--pending">—</span>}
      </div>
    </div>
  );
}

// Vertical list view — kept as the "List" option (matches the public live-results reference)
function BracketList({ tournament }) {
  const activeRoundIdx = tournament.activeRound ?? 0;
  const round = tournament.rounds[activeRoundIdx];
  if (!round) return null;
  return (
    <div>
      <div className="kicker" style={{ marginBottom: 10 }}>{round.label}</div>
      <div>
        {round.matches.map((m, i) => {
          const isDone = m.status === 'DONE';
          const aWin = isDone && m.scoreA >= 4;
          const bWin = isDone && m.scoreB >= 4;
          return (
            <div key={m.id} className={['match-row', isDone && 'is-done'].filter(Boolean).join(' ')}>
              <div className="match-num">Match {i+1}</div>
              <div className={['player', aWin && 'is-winner', bWin && 'is-loser'].filter(Boolean).join(' ')}>{m.a}</div>
              {isDone
                ? <div className="score">{m.scoreA} - {m.scoreB}</div>
                : <div className="score--pending">vs</div>}
              <div className={['player', 'r', bWin && 'is-winner', aWin && 'is-loser'].filter(Boolean).join(' ')}>{m.b}</div>
              <div></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// SCREEN: Projector / Score counter — full-bleed live display
// ============================================================
function ProjectorScreen({ tournament, onExit }) {
  const round = tournament.rounds[tournament.activeRound ?? 0] || tournament.rounds[0];
  if (!round) return null;

  const activeIdx = round.matches.findIndex(m => m.status !== 'DONE');
  const focal = activeIdx >= 0 ? round.matches[activeIdx] : round.matches[round.matches.length - 1];
  const focalIdx = activeIdx >= 0 ? activeIdx : round.matches.length - 1;

  return (
    <div className="projector" data-screen-label="Projector · Score counter">
      <button className="projector-exit" onClick={onExit}>← back</button>

      <div className="proj-top">
        <div className="proj-brand">
          <img src="../../assets/logo-original.png" alt=""/>
          <span>{tournament.name}</span>
        </div>
        <div className="proj-tag">Sheffield · Live</div>
        <div className="proj-live">LIVE</div>
      </div>

      <div className="proj-title">
        <div className="kicker">now playing</div>
        <h1><span className="round">{round.label}</span> · Match {focalIdx + 1}</h1>
      </div>

      <ProjectorHero match={focal}/>

      <div className="proj-roster">
        <div className="kicker roster-kicker">All matches · {round.label}</div>
        <div className="roster-grid">
          {round.matches.map((m, i) => {
            const isDone = m.status === 'DONE';
            const isActive = i === focalIdx && activeIdx >= 0;
            const aWin = isDone && m.scoreA >= 4;
            const bWin = isDone && m.scoreB >= 4;
            return (
              <div key={m.id} className={['proj-mrow', isDone && 'is-done', isActive && 'is-active'].filter(Boolean).join(' ')}>
                <div>
                  <span className="mnum">M{i+1}</span>
                  <span className={['pn', aWin && 'is-winner', bWin && 'is-loser'].filter(Boolean).join(' ')}>{m.a}</span>
                </div>
                <div className={['sc', isDone ? (aWin ? 'is-winner' : '') : 'dash'].filter(Boolean).join(' ')}>{isDone ? m.scoreA : '—'}</div>
                <div className="vs-dot">vs</div>
                <div className={['sc', isDone ? (bWin ? 'is-winner' : '') : 'dash'].filter(Boolean).join(' ')}>{isDone ? m.scoreB : '—'}</div>
                <div className={['pn', 'r', bWin && 'is-winner', aWin && 'is-loser'].filter(Boolean).join(' ')}>{m.b}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProjectorHero({ match }) {
  if (!match) return null;
  const isDone = match.status === 'DONE';
  const aWin = isDone && match.scoreA >= 4;
  const bWin = isDone && match.scoreB >= 4;
  return (
    <div className="proj-hero">
      <div className="hero-kicker">Current Match</div>
      <div className={['side', aWin && 'is-winner'].filter(Boolean).join(' ')}>
        <div className="pname">{match.a}</div>
        <div className="pscore">{match.scoreA}</div>
      </div>
      <div className="vs">×</div>
      <div className={['side', 'r', bWin && 'is-winner'].filter(Boolean).join(' ')}>
        <div className="pname">{match.b}</div>
        <div className="pscore">{match.scoreB}</div>
      </div>
    </div>
  );
}

Object.assign(window, {
  LandingScreen, LoginScreen, HomeScreen, CreateScreen,
  TournamentScreen, MatchScreen, LiveResultsScreen,
  BracketTree, BracketList, BracketMatch, ProjectorScreen, ProjectorHero,
});
