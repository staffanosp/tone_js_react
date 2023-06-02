import { useEffect, useState, useRef } from "react";
import * as Tone from "tone";
import { createAudioEngine } from "../audio/audioEngine";
import { curvefit3 } from "../utils/utils";
import { getChord, getMinVoices } from "../audio/chords";

function AudioEngine({ modX, modY }) {
  const [toneIsActive, setToneIsActive] = useState(false);
  const audioEngineRef = useRef();

  //MODULATION. This is pretty hacky right now, and should probably be moved somehere else.
  useEffect(() => {
    if (audioEngineRef.current) {
      console.log("MOD");

      audioEngineRef.current.setChord(getChord(modX));

      //volume part
      //TODO: create some method in the engine that handles it
      function scaler(mainParam, numberOfParams, i) {
        let unnormalized = mainParam * numberOfParams;

        if (i < Math.floor(unnormalized)) return 1;
        if (i >= Math.floor(unnormalized) + 1) return 0;

        return unnormalized - Math.floor(unnormalized);
      }

      const rampTime = 0.1;

      audioEngineRef.current.nodes.oscillatorGainNodes.forEach(
        (gainNode, i) => {
          gainNode.gain.rampTo(
            curvefit3(
              scaler(modY, audioEngineRef.current.numOscillators, i),
              0,
              0.1,
              1
            ),
            rampTime
          );
        }
      );
    }
  }, [modX, modY]);

  function handleClick() {
    if (!audioEngineRef.current) {
      console.log("click");
      // audioEngineRef.current = new Tone.Synth().toDestination();
      audioEngineRef.current = createAudioEngine(getMinVoices());
      Tone.start();
      setToneIsActive(true);
    } else {
      audioEngineRef.current.dispose();
      audioEngineRef.current = undefined;
      setToneIsActive(false);
    }

    // Tone.Transport.toggle();
  }

  return (
    <>
      <div>
        <button onClick={handleClick}>
          {!toneIsActive ? "Tone: START" : "Tone: STOP"}
        </button>
      </div>

      <p>X:{modX}</p>
      <p>Y:{modY}</p>
    </>
  );
}

export default AudioEngine;
