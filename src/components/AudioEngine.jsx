import { useEffect, useState, useRef } from "react";
import * as Tone from "tone";
import { createAudioEngine } from "../audio/audioEngine";
import { getChord, getMaxVoices } from "../audio/chords";

function AudioEngine({ modX, modY, analyserNodeRef }) {
  const [toneIsActive, setToneIsActive] = useState(false);

  const [drumsIsPlaying, setDrumsIsPlaying] = useState(false);

  const [oscGains, setOscGains] = useState([]);

  const audioEngineRef = useRef();

  //"Modulation"
  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setChord(getChord(modX), 0.2);
      //set gains and catch in oscGains state
      setOscGains(
        audioEngineRef.current.setOscillatorGainsFromNormalizedValue(modY)
      );
    }
  }, [modX, modY]);

  function handleClick() {
    if (!audioEngineRef.current) {
      console.log("click");

      //create engine + init
      audioEngineRef.current = createAudioEngine(getMaxVoices());
      analyserNodeRef.current = audioEngineRef.current.nodes.analyserNode;

      audioEngineRef.current.setChord(getChord(0), 0);

      //set gains and catch in oscGains state
      setOscGains(
        audioEngineRef.current.setOscillatorGainsFromNormalizedValue(0, 0.5)
      );

      Tone.start();
      setToneIsActive(true);
    } else {
      audioEngineRef.current.dispose();
      audioEngineRef.current = undefined;
      setToneIsActive(false);
    }

    // Tone.Transport.toggle();
  }

  const handleClickDrums = () => {
    setDrumsIsPlaying(!drumsIsPlaying);
    audioEngineRef.current.startLoop();
  };

  const handleRandomDrumsClick = () => {
    audioEngineRef.current.getRandomPatternIndex();
  };

  return (
    <>
      <div>
        <button onClick={handleClick}>
          {!toneIsActive ? "Tone: START" : "Tone: STOP"}
        </button>
      </div>

      <p>X:{modX}</p>
      <p>Y:{modY}</p>
      <div className="oscDebugContainer">
        {oscGains.map((v) => (
          <div className="oscDebugContainer--item">
            {Math.round(v * 100) / 100}
          </div>
        ))}
      </div>
      <button onClick={handleClickDrums}>
        {!drumsIsPlaying ? "Drums START" : "Drums: STOP"}
      </button>
      <button onClick={handleRandomDrumsClick}>Pattern: RANDOM</button>
    </>
  );
}

export default AudioEngine;
