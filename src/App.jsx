<<<<<<< HEAD
import { useEffect, useState } from "react";

import AudioEngine from "./components/AudioEngine";
import PoseNet from "./components/PoseNet";
import { changeChordSet } from "./audio/chords";
=======
import { useEffect, useState, useRef } from "react";
import AudioEngine from "./components/AudioEngine";
import Visualizer from "./components/Visualizer";
import UserControls from "./components/UserControls";
>>>>>>> master

import "./App.css";

function App() {
<<<<<<< HEAD
  const [audioModX, setAudioModX] = useState(0);
  const [audioModY, setAudioModY] = useState(0);

  const [isTrackingMouse, setIsTrackingMouse] = useState(false);

  const [chordSetIndex, setChordSetIndex] = useState(0);

  //Track mouse
  useEffect(() => {
    const _listener = (e) => {
      setAudioModX(e.clientX / window.innerWidth);
      setAudioModY(1 - e.clientY / window.innerHeight);
    };

    if (isTrackingMouse) {
      addEventListener("mousemove", _listener);
    } else {
      removeEventListener("mousemove", _listener);
    }

    return () => {
      removeEventListener("mousemove", _listener);
    }; //cleanup
  }, [isTrackingMouse]);

  // Change chord set when chordSetIndex is updated
  useEffect(() => {
    changeChordSet(chordSetIndex);
  }, [chordSetIndex]);

  return (
    <>
      <PoseNet setModX={setAudioModX} setModY={setAudioModY} />
      <AudioEngine modX={audioModX} modY={audioModY} />
=======
  const [showStartScreen, setShowStartScreen] = useState(true);

  const [audioEngineInitTrig, setAudioEngineInitTrig] = useState(0);
  const [audioEngineIsPlaying, setAudioEngineIsIsPlaying] = useState(false);
  const [audioEngineRndChordSetTrig, setAudioEngineRndChordSetTrig] =
    useState(0);

  const [audioModX, setAudioModX] = useState(0);
  const [audioModY, setAudioModY] = useState(0);

  const [isTrackingMouse, setIsTrackingMouse] = useState(false);

  const analyserNodeRef = useRef();

  //Track mouse
  useEffect(() => {
    const _listener = (e) => {
      setAudioModX(e.clientX / window.innerWidth);
      setAudioModY(1 - e.clientY / window.innerHeight);
    };

    if (isTrackingMouse) {
      addEventListener("mousemove", _listener);
    } else {
      removeEventListener("mousemove", _listener);
    }

    return () => {
      removeEventListener("mousemove", _listener);
    }; //cleanup
  }, [isTrackingMouse]);

  const handleClickStart = () => {
    setAudioEngineInitTrig((old) => ++old); //Initializes/starts the audio after user interaction

    setShowStartScreen(false);
  };

  //The start screen
  if (showStartScreen) {
    return (
      <>
        <div>WELCOME.. BLAH BLAAH BLAAAH</div>
        <button onClick={handleClickStart}>Start</button>
      </>
    );
  }

  //The actual app
  return (
    <>
      <UserControls
        {...{
          audioEngineIsPlaying,
          setAudioEngineIsIsPlaying,
          setAudioEngineRndChordSetTrig,
        }}
      />
      <Visualizer analyserNodeRef={analyserNodeRef} />
      <AudioEngine
        rndChordSetTrig={audioEngineRndChordSetTrig}
        initTrig={audioEngineInitTrig}
        isPlaying={audioEngineIsPlaying}
        modX={audioModX}
        modY={audioModY}
        analyserNodeRef={analyserNodeRef}
      />

>>>>>>> master
      <div>
        <button
          onClick={() => {
            setIsTrackingMouse((old) => !old);
          }}
        >
          {isTrackingMouse ? "Mouse: STOP" : "Mouse: START"}
        </button>
<<<<<<< HEAD
        <div className="chordSetPickerContainer">
          <button
            onClick={() => setChordSetIndex((prevIndex) => prevIndex - 1)}
          >
            -
          </button>
          <div>Chord Set: {chordSetIndex}</div>
          <button
            onClick={() => setChordSetIndex((prevIndex) => prevIndex + 1)}
          >
            +
          </button>
        </div>
=======
>>>>>>> master
      </div>
    </>
  );
}

export default App;
