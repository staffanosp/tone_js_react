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
}) {
  console.log(audioEngineDrumsSetTrig);
  return (
    <div className="center">
      <div className="userControlContainer">
        <div className="btnSetContainer">
          <div>Synth</div>
          <button
            onClick={() => {
              setAudioEngineIsIsPlaying(!audioEngineIsPlaying);
            }}
          >
            {!audioEngineIsPlaying ? "PLAY" : "PAUSE"}
          </button>
        </div>
        <div className="btnSetContainer">
          <div>Tempo:</div>
          <div className="btnContainer">
            {bpmList.map((item) => {
              return (
                <button key={item.id} onClick={() => setBpm(item.value)}>
                  {`${item.label} bpm`}
                </button>
              );
            })}
          </div>
        </div>
        <div className="btnSetContainer">
          <div>Chords</div>
          <div>Chord Set: {audioEngineChordSetTrig + 1}</div>
          <div className="btnContainer">
            <button
              onClick={() => {
                setAudioEngineChordSetTrig(
                  (old) => (old - 1 + chordSets.length) % chordSets.length
                );
              }}
            >
              -
            </button>
            <button
              onClick={() => {
                setAudioEngineChordSetTrig(
                  (old) => (old + 1) % chordSets.length
                );
              }}
            >
              +
            </button>
          </div>
        </div>
        <div className="btnSetContainer">
          <div>Beat</div>
          <button
            onClick={() => {
              setDrumsIsPlaying(!drumsIsPlaying);
            }}
          >
            {!drumsIsPlaying ? "PLAY" : "PAUSE"}
          </button>

          <div>Pattern: {audioEngineDrumsSetTrig + 1}</div>
          <div className="btnContainer">
            <button
              onClick={() => {
                setAudioEngineDrumsSetTrig(
                  (old) => (old - 1 + patterns.length) % patterns.length
                );
              }}
            >
              -
            </button>
            <button
              onClick={() => {
                setAudioEngineDrumsSetTrig(
                  (old) => (old + 1) % patterns.length
                );
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserControls;
