import { useEffect, useState, useRef } from "react";
import * as Tone from "tone";
import { createAudioEngine } from "../audio/audioEngine";
import { getChord, getMinVoices } from "../audio/chords";

function AudioEngine({ modX, modY }) {
  const [toneIsActive, setToneIsActive] = useState(false);
  const audioEngineRef = useRef();

  //"Modulation"
  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setChord(getChord(modX), 0.2);
      audioEngineRef.current.setOscillatorGainsFromNormalizedValue(modY);
    }
  }, [modX, modY]);

  function handleClick() {
    if (!audioEngineRef.current) {
      console.log("click");

      //create engine + init
      audioEngineRef.current = createAudioEngine(getMinVoices());
      audioEngineRef.current.setChord(getChord(0), 0);
      audioEngineRef.current.setOscillatorGainsFromNormalizedValue(0, 0.5);

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
