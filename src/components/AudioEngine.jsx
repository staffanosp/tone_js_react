import { useEffect, useState, useRef } from "react";
import { createAudioEngine } from "../audio/audioEngine";
import { getChord, getMaxVoices, changeChordSet } from "../audio/chords";

function AudioEngine({
  initTrig,
  isPlaying,
  modX,
  modY,
  analyserNodeRef,
  audioEngineChordSetIndex,
  audioEngineDrumsSetIndex,
  drumsIsPlaying,
  bpm,
}) {
  const [oscGains, setOscGains] = useState([]);

  const audioEngineRef = useRef();

  let isDebug = false;

  //create the audio engine on mount
  useEffect(() => {
    if (!audioEngineRef.current) {
      //create engine + init
      audioEngineRef.current = createAudioEngine(getMaxVoices());
      analyserNodeRef.current = audioEngineRef.current.nodes.analyserNode;

      audioEngineRef.current.setChord(getChord(0), 0);

      //set gains and catch in oscGains state
      setOscGains(
        audioEngineRef.current.setOscillatorGainsFromNormalizedValue(0, 0.5)
      );
    }
  }, []);

  //Init Trig (must happen from a user interaction)
  useEffect(() => {
    const init = async () => {
      if (initTrig) {
        //init the audio engine
        await audioEngineRef.current.init();
      }
    };

    init();
  }, [initTrig]);

  //Handle Start/Stop

  useEffect(() => {
    if (isPlaying) {
      audioEngineRef.current.start();
    } else {
      audioEngineRef.current.stop();
    }
  }, [isPlaying]);

  //Handle Random Chord Set Trig

  useEffect(() => {
    changeChordSet(audioEngineChordSetIndex);
    audioEngineRef.current.setChord(getChord(modX), 0.2);
  }, [audioEngineChordSetIndex]);

  useEffect(() => {
    audioEngineRef.current.changeDrumPattern(audioEngineDrumsSetIndex);
  }, [audioEngineDrumsSetIndex]);

  //"Modulation"
  useEffect(() => {
    if (audioEngineRef.current) {
      //chord
      audioEngineRef.current.setChord(getChord(modX), 0.1);
      //set gains and catch in oscGains state
      setOscGains(
        audioEngineRef.current.setOscillatorGainsFromNormalizedValue(modY)
      );

      //filter freq
      audioEngineRef.current.setFilterFreqFromNormalizedValue(modY);
    }
  }, [modX, modY]);

  //Start stop drums
  useEffect(() => {
    if (drumsIsPlaying) {
      audioEngineRef.current.startLoop();
    } else {
      audioEngineRef.current.stopLoop();
    }
  }, [drumsIsPlaying]);

  useEffect(() => {
    if (bpm) {
      audioEngineRef.current.setBpmValue(bpm);
    }
  }, [bpm]);

  if (!isDebug) {
    return;
  } else {
    return (
      <div style={{ outline: "#555 solid 1px", padding: "24px" }}>
        <div>
          <strong>AUDIO ENGINE DEBUG STUFF.</strong> The Audio Engine component
          should <strong>not</strong> have any dom elements. This is just dev
          stuff.
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
      </div>
    );
  }
}

export default AudioEngine;
