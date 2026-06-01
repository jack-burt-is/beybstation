// Beybstation OBS Overlay — fake live data + tick simulator
const FAKE_PLAYERS = [
  'Beysus', 'Sheff Spinner', 'DJ Whirlpool', 'Voltbreaker',
  'Pink Mamba', 'Lazerback', 'The Burst', 'Spinmaster',
  'Klaxon', 'Cryo', 'Nebula', 'Phantom Top',
  'Static Cat', 'Hex Rider', 'Vortex', 'Glitter Wreck',
];

function makeFakeState() {
  // 8 matches; first three finished, fourth in progress, rest pending.
  const matches = [];
  const finals = [[4,1],[2,4],[4,3]];
  for (let i = 0; i < 8; i++) {
    const a = FAKE_PLAYERS[i*2], b = FAKE_PLAYERS[i*2+1];
    if (i < 3) {
      matches.push({ idx: i+1, a, b, scoreA: finals[i][0], scoreB: finals[i][1], done: true });
    } else if (i === 3) {
      matches.push({ idx: i+1, a, b, scoreA: 2, scoreB: 1, done: false, active: true });
    } else {
      matches.push({ idx: i+1, a, b, scoreA: 0, scoreB: 0, done: false });
    }
  }
  return {
    tournament: 'Beybstation #2',
    roundLabel: 'Round 1',
    matches,
  };
}

window.makeFakeState = makeFakeState;
