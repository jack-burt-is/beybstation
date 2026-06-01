// Beybstation OBS Overlay — view components
const { useState, useEffect } = React;

function BrandTag() {
  return (
    <div className="overlay-brand">
      <img src="../../assets/logo-original.png" alt=""/>
      <span className="name">Beybstation</span>
      <span className="live">LIVE</span>
    </div>
  );
}

function RightRail({ state }) {
  const active = state.matches.find(m => m.active) || state.matches[0];
  const aWin = active.scoreA >= 4;
  const bWin = active.scoreB >= 4;
  return (
    <div className="right-rail">
      <div className="kicker">Now playing</div>
      <div className="round-title">{state.roundLabel}</div>
      <div className="active-label">Match {active.idx}</div>
      <div className="active-card">
        <div className="row">
          <div className="pname">{active.a}</div>
          <div className={`pscore ${aWin ? 'is-winner' : ''}`}>{active.scoreA}</div>
        </div>
        <div className="divider"></div>
        <div className="row">
          <div className="pname">{active.b}</div>
          <div className={`pscore ${bWin ? 'is-winner' : ''}`}>{active.scoreB}</div>
        </div>
      </div>
    </div>
  );
}

function BottomBanner({ state }) {
  return (
    <div className="bottom-banner">
      <div className="banner-header">
        <div className="tournament">{state.tournament}</div>
        <div className="round">{state.roundLabel}</div>
      </div>
      <div className="banner-matches">
        {state.matches.map(m => {
          const aWin = m.done && m.scoreA >= 4;
          const bWin = m.done && m.scoreB >= 4;
          const cls = ['bm'];
          if (m.active) cls.push('is-active');
          if (m.done) cls.push('is-done');
          return (
            <div key={m.idx} className={cls.join(' ')}>
              <div className="idx">Match {m.idx}</div>
              <div className={`player ${aWin ? 'is-winner' : ''}`}>
                <span className="nm">{m.a}</span>
                {m.done || m.active
                  ? <span className="sc">{m.scoreA}</span>
                  : <span className="sc pending">–</span>}
              </div>
              <div className={`player ${bWin ? 'is-winner' : ''}`}>
                <span className="nm">{m.b}</span>
                {m.done || m.active
                  ? <span className="sc">{m.scoreB}</span>
                  : <span className="sc pending">–</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DemoControls({ state, setState }) {
  function bumpActive(side) {
    setState(s => {
      const matches = s.matches.slice();
      const idx = matches.findIndex(m => m.active);
      if (idx < 0) return s;
      const m = { ...matches[idx] };
      if (side === 'a' && m.scoreA < 4) m.scoreA++;
      if (side === 'b' && m.scoreB < 4) m.scoreB++;
      if (m.scoreA >= 4 || m.scoreB >= 4) {
        m.done = true; m.active = false;
        matches[idx] = m;
        // promote next match to active
        if (matches[idx+1]) matches[idx+1] = { ...matches[idx+1], active: true };
      } else {
        matches[idx] = m;
      }
      return { ...s, matches };
    });
  }
  function reset() { setState(makeFakeState()); }
  return (
    <div className="demo-controls">
      <span>DEMO ONLY ·</span>
      <button onClick={() => bumpActive('a')}>+1 LEFT</button>
      <button onClick={() => bumpActive('b')}>+1 RIGHT</button>
      <button onClick={reset}>RESET</button>
    </div>
  );
}

function Overlay() {
  const [state, setState] = useState(makeFakeState());
  return (
    <React.Fragment>
      <div className="fake-cam"/>
      <BrandTag/>
      <RightRail state={state}/>
      <BottomBanner state={state}/>
      <DemoControls state={state} setState={setState}/>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Overlay/>);
