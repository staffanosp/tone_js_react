import { bpmList } from "../audio/drums";
import { chordSets } from "../audio/chords";
import { patterns } from "../audio/drums";

function UserControls({
  audioEngineIsPlaying,
  setAudioEngineIsIsPlaying,
  setAudioEngineChordSetTrig,
  audioEngineChordSetTrig,
  setAudioEngineDrumsSetTrig,
  audioEngineDrumsSetTrig,
  drumsIsPlaying,
  setDrumsIsPlaying,
  setBpm,
  bpm,
}) {
  return (
    <div style={{ outline: "#555 solid 1px", padding: "24px", margin: "24px" }}>
      <div>
        <strong>USER CONTROLS.</strong> TO KEEP! This is where ALL user controls
        should go. This should be some sort of floating panel.
      </div>

      <button
        onClick={() => {
          setAudioEngineIsIsPlaying(!audioEngineIsPlaying);
        }}
      >
        {!audioEngineIsPlaying ? "PLAY" : "PAUSE"}
      </button>
      <div className="chordSetPickerContainer">
        <button
          onClick={() => {
            if (audioEngineChordSetTrig > 0) {
              setAudioEngineChordSetTrig((old) => --old);
            }
          }}
        >
          -
        </button>
        <div>Chord Set: {audioEngineChordSetTrig + 1}</div>
        <button
          onClick={() => {
            if (audioEngineChordSetTrig < chordSets.length - 1) {
              setAudioEngineChordSetTrig((old) => ++old);
            }
          }}
        >
          +
        </button>
      </div>
      <div className="chordSetPickerContainer">
        <button
          onClick={() => {
            if (audioEngineDrumsSetTrig > 0) {
              setAudioEngineDrumsSetTrig((old) => --old);
            }
          }}
        >
          -
        </button>

        <div>Beat Set: {audioEngineDrumsSetTrig}</div>
        <button
          onClick={() => {
            if (audioEngineDrumsSetTrig < patterns.length - 1) {
              setAudioEngineDrumsSetTrig((old) => ++old);
            }
          }}
        >
          +
        </button>
        <button
          onClick={() => {
            setDrumsIsPlaying(!drumsIsPlaying);
          }}
        >
          {!drumsIsPlaying ? "Drums: PLAY" : "Drums: PAUSE"}
        </button>
      </div>
      <div className="chordSetPickerContainer">
        {bpmList.map((item) => {
          return (
            <button key={item.id} onClick={() => setBpm(item.value)}>
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default UserControls;
