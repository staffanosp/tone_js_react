const chords = [
  // ["C2"],
  ["C3", "E3", "G3", "C4", "C5"],
  ["F3", "A3", "C4", "F4", "F5"],
  ["G3", "B3", "D4", "G4", "G5"],
  ["A3", "C4", "E4", "A4", "A5"],
];

const normalizedToIndex = (v, length) => {
  if (v === 1) return length - 1;

  return Math.floor(v * chords.length);
};

const getChord = (v) => chords[normalizedToIndex(v, chords.length)];

const getMinVoices = () => Math.min(...chords.map((chord) => chord.length));

export { getChord, getMinVoices };
