const chordSets = [
  //SPECIAL SET TO TEST DIFF CHORD SIZES
  [
    ["A2", "E3", "G3", "B3", "C4", "E4"],
    ["F2", "C3", "G3", "A3", "C4", "E4"],
    ["G2", "D3", "G3", "B3", "D3", "E4"],
    ["D2", "A2", "D3", "F3", "A3", "C4", "E4"],
  ],
  [
    ["F2", "C3", "F3", "A3", "C4"],
    ["C2", "G3", "E3", "G3", "C4", "E4"],
    ["A2", "E3", "A3", "C4", "D4"],
    ["G2", "B2", "D3", "G3", "B3"],
  ],
  [
    ["F2", "A3", "C3", "E3", "F3", "A3", "C4", "E4"],
    ["C2", "G2", "C3", "E3", "G3", "B3", "E4", "G4"],
  ],
  [
    ["D2", "A3", "C4", "F4", "A4"],
    ["A2", "B3", "C4", "E4", "G4"],
    ["E2", "A3", "B3", "D4", "G4"],
    ["A1", "G3", "C4", "E4", "G4"],
  ],

  [
    ["F2", "A3", "C3", "E3", "F3", "A3", "C4", "D5"],
    ["C2", "G2", "C3", "E3", "G3", "B3", "E4", "G4"],
    ["A2", "C3", "G5"],
    [],
  ],
  [
    ["C2", "E2", "C3", "E3", "G3", "C4", "C5"],
    ["F2", "A2", "F3", "A3", "C4", "F4", "F5"],
    ["G2", "B2", "G3", "B3", "D4", "G4", "G5"],
    ["A2", "C3", "A3", "C4", "E4", "A4", "A5"],
  ],
];

let chords = chordSets[0];

const changeChordSet = (i) => {
  chords = chordSets[i];
  console.log(chords);
};

const normalizedToIndex = (v, length) => {
  if (v === 1) return length - 1;

  return Math.floor(v * chords.length);
};

const getChord = (v) => chords[normalizedToIndex(v, chords.length)];

const getMinVoices = () =>
  Math.min(...chordSets.flat().map((chord) => chord.length));

const getMaxVoices = () =>
  Math.max(...chordSets.flat().map((chord) => chord.length));

export {
  getChord,
  getMinVoices,
  getMaxVoices,
  changeChordSet,
  chords,
  chordSets,
};
