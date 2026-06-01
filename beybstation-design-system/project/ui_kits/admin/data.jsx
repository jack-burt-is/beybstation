// Beybstation Admin — fake data + bracket helpers
// Loaded into window scope via <script type="text/babel">.

const DEFAULT_PLAYERS = [
  'Beysus', 'Sheff Spinner', 'DJ Whirlpool', 'Voltbreaker',
  'Pink Mamba', 'Lazerback', 'The Burst', 'Spinmaster',
  'Klaxon', 'Cryo', 'Nebula', 'Phantom Top',
  'Static Cat', 'Hex Rider', 'Vortex', 'Glitter Wreck',
];

function makeTournament(name = 'BEYBSTATION #2', players = DEFAULT_PLAYERS) {
  return {
    id: 't_' + Math.random().toString(36).slice(2, 8),
    name,
    date: new Date().toISOString().slice(0,10),
    players: players.slice(),
    // rounds: array of round objects. round 0 = pending generation.
    rounds: [],
    activeRound: 0,
    state: 'PRE',  // 'PRE' | 'GENERATED' | 'STARTED' | 'COMPLETE'
  };
}

// Round shape: { id, label, matches: [{ id, a, b, scoreA, scoreB, status }], started, finished }
// status: 'PENDING' | 'LIVE' | 'DONE'
function makeRound(label, players, shuffle = false) {
  const ps = players.slice();
  if (shuffle) {
    for (let i = ps.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [ps[i], ps[j]] = [ps[j], ps[i]];
    }
  }
  const matches = [];
  for (let i = 0; i < ps.length; i += 2) {
    matches.push({
      id: 'm_' + Math.random().toString(36).slice(2,8),
      a: ps[i], b: ps[i+1],
      scoreA: 0, scoreB: 0,
      status: 'PENDING',
    });
  }
  return { id: 'r_' + Math.random().toString(36).slice(2,6), label, matches, started: false };
}

const ROUND_LABELS = ['Round 1', 'Round 2', 'Semi-finals', 'Final'];

function nextRoundLabel(idx) { return ROUND_LABELS[idx] || `Round ${idx+1}`; }

function winnersOfRound(round) {
  return round.matches.map(m => {
    if (m.scoreA >= 4) return m.a;
    if (m.scoreB >= 4) return m.b;
    return null;
  });
}

function isRoundComplete(round) {
  return round.matches.every(m => m.status === 'DONE');
}

function canStartScoreEntry(round, matchIdx) {
  if (!round.started) return false;
  if (round.matches[matchIdx].status === 'DONE') return true;
  // can be active if previous match has finished (or this is match 0)
  if (matchIdx === 0) return true;
  return round.matches[matchIdx - 1].status === 'DONE';
}

Object.assign(window, {
  DEFAULT_PLAYERS,
  makeTournament,
  makeRound,
  ROUND_LABELS,
  nextRoundLabel,
  winnersOfRound,
  isRoundComplete,
  canStartScoreEntry,
});
