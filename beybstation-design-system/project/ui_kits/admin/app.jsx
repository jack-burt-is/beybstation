// Beybstation Admin — top-level router
const { useState: _useState } = React;

function App() {
  const [route, setRoute] = _useState({ name: 'landing' });
  const [authed, setAuthed] = _useState(false);
  const [tournaments, setTournaments] = _useState([
    makeTournament('Beybstation #1', DEFAULT_PLAYERS),
  ]);
  const [activeId, setActiveId] = _useState(null);

  // attach a fully-played sample tournament for demo continuity
  React.useEffect(() => {
    setTournaments(prev => {
      if (prev[0].rounds.length) return prev;
      const t = { ...prev[0] };
      t.date = '2026-04-10';
      const r1 = makeRound('Round 1', t.players);
      const scores = [[4,1],[4,3],[3,4],[4,0],[1,4],[4,2],[4,1],[0,4]];
      r1.matches = r1.matches.map((m, i) => ({ ...m, scoreA: scores[i][0], scoreB: scores[i][1], status: 'DONE' }));
      r1.started = true;
      t.rounds = [r1];
      t.activeRound = 0;
      t.state = 'STARTED';
      return [t];
    });
  }, []);

  const activeT = tournaments.find(t => t.id === activeId);
  function setActiveT(updater) {
    setTournaments(prev => prev.map(t => {
      if (t.id !== activeId) return t;
      return typeof updater === 'function' ? updater(t) : updater;
    }));
  }

  // routing helpers
  const goLanding   = () => { setRoute({ name: 'landing' }); setAuthed(false); };
  const goLive      = () => setRoute({ name: 'live' });
  const goAdminLogin= () => setRoute({ name: 'login' });
  const goHome      = () => setRoute({ name: 'home' });
  const onLogin     = () => { setAuthed(true); goHome(); };
  const goCreate    = () => setRoute({ name: 'create' });
  const openT       = (id) => { setActiveId(id); setRoute({ name: 'tournament' }); };
  const openMatch   = (r, m) => setRoute({ name: 'match', r, m });
  const backToT     = () => setRoute({ name: 'tournament' });

  function onSaveNew(name, players) {
    const t = makeTournament(name, players);
    setTournaments(prev => [...prev, t]);
    setActiveId(t.id);
    setRoute({ name: 'tournament' });
  }

  // public live
  const liveTournament = tournaments.find(t => t.rounds.length > 0) || tournaments[0];

  switch (route.name) {
    case 'landing':
      return <LandingScreen goLiveResults={goLive} goAdminLogin={goAdminLogin}/>;
    case 'live':
      return <LiveResultsScreen tournament={liveTournament} goHome={goLanding}/>;
    case 'login':
      return <LoginScreen goBack={goLanding} onLogin={onLogin}/>;
    case 'home':
      return <HomeScreen tournaments={tournaments} goCreate={goCreate} openTournament={openT} goLanding={goLanding}/>;
    case 'create':
      return <CreateScreen onCancel={goHome} onSave={onSaveNew} goHome={goHome}/>;
    case 'tournament':
      if (!activeT) { goHome(); return null; }
      return <TournamentScreen tournament={activeT} setTournament={setActiveT} goHome={goHome} openMatch={openMatch}/>;
    case 'match':
      if (!activeT) { goHome(); return null; }
      return <MatchScreen tournament={activeT} setTournament={setActiveT}
        roundIdx={route.r} matchIdx={route.m} goBack={backToT}/>;
    default:
      return <LandingScreen goLiveResults={goLive} goAdminLogin={goAdminLogin}/>;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);

// Icons are managed locally by the <Icon> component — no global observer
// (the previous observer + per-icon effect formed a feedback loop with
// React reconciliation and caused tab freezes on navigation).
