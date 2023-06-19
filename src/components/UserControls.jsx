import { useState } from "react";
import { bpmList } from "../audio/drums";
import { chordSets } from "../audio/chords";
import { patterns } from "../audio/drums";

function UserControls({
  audioEngineIsPlaying,
  setAudioEngineIsIsPlaying,
  setAudioEngineChordSetIndex,
  audioEngineChordSetIndex,
  setAudioEngineDrumsSetIndex,
  audioEngineDrumsSetIndex,
  drumsIsPlaying,
  setDrumsIsPlaying,
  setBpm,
  isTrackingPose,
  setIsTrackingPose,
  disableCamera,
}) {
  const [selectedBpm, setSelectedBpm] = useState(1);

  return (
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
          {bpmList.map((item, index) => {
            return (
              <button
                className="bpmBtn"
                key={item.id}
                onClick={() => {
                  setBpm(item.value);
                  setSelectedBpm(index);
                }}
                style={{
                  border: selectedBpm === index ? "1px solid black" : "none",
                  fontWeight: 600,
                }}
              >
                {`${item.label} bpm`}
              </button>
            );
          })}
        </div>
      </div>
      <div className="btnSetContainer">
        <div>Chords</div>
        <div className="secondaryLabelText">
          Set: {audioEngineChordSetIndex + 1}
        </div>
        <div className="btnContainer">
          <button
            onClick={() => {
              setAudioEngineChordSetIndex(
                (old) => (old - 1 + chordSets.length) % chordSets.length
              );
            }}
          >
            -
          </button>
          <button
            onClick={() => {
              setAudioEngineChordSetIndex(
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

        <div className="secondaryLabelText">
          Pattern: {audioEngineDrumsSetIndex + 1}
        </div>
        <div className="btnContainer">
          <button
            onClick={() => {
              setAudioEngineDrumsSetIndex(
                (old) => (old - 1 + patterns.length) % patterns.length
              );
            }}
          >
            -
          </button>
          <button
            onClick={() => {
              setAudioEngineDrumsSetIndex((old) => (old + 1) % patterns.length);
            }}
          >
            +
          </button>
        </div>
      </div>

      {!disableCamera && (
        <div className="btnSetContainer">
          <div>Cam</div>
          <button
            onClick={() => {
              setIsTrackingPose(!isTrackingPose);
            }}
          >
            {isTrackingPose ? "Stop" : "Start"}
          </button>
        </div>
      )}
    </div>
  );
}

export default UserControls;
