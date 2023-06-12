import { useEffect, useState, useRef } from "react";

import AudioEngine from "./components/AudioEngine";
import Visualizer from "./components/Visualizer";
import UserControls from "./components/UserControls";
import PoseNet from "./components/PoseNet";

import bidenSound from "../public/sounds/world-of-sound.mp3";
import "./App.css";
import StartScreen from "./components/StartScreen";

function App() {
  const [showStartScreen, setShowStartScreen] = useState(true);

  //user controls
  const [audioEngineInitTrig, setAudioEngineInitTrig] = useState(0);
  const [audioEngineIsPlaying, setAudioEngineIsIsPlaying] = useState(true);
  const [audioEngineChordSetTrig, setAudioEngineChordSetTrig] = useState(0);
  const [audioEngineDrumsSetTrig, setAudioEngineDrumsSetTrig] = useState(0);
  const [drumsIsPlaying, setDrumsIsPlaying] = useState(false);

  const [isTrackingPose, setIsTrackingPose] = useState(false);
  const [isTrackingMouse, setIsTrackingMouse] = useState(); //will be set in an useEffect based on isTrackingPose

  const [audioModX, setAudioModX] = useState(0);
  const [audioModY, setAudioModY] = useState(0);

  const analyserNodeRef = useRef();

  const [bpm, setBpm] = useState();

  //Mouse Tracking listeners

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

  //Fallback to mouse tracking when webcam is disabled
  useEffect(() => {
    setIsTrackingMouse(!isTrackingPose);
  }, [isTrackingPose]);

  const handleClickStart = () => {
    setAudioEngineInitTrig((old) => ++old); //Initializes/starts the audio after user interaction
    var audio = new Audio(bidenSound);
    audio.play();
    setShowStartScreen(false);
  };

  // //The start screen
  // if (showStartScreen) {
  //   return (
  //     <>
  //       <h1>Welcome to The World of Sound</h1>
  //       <button onClick={handleClickStart}>Start</button>
  //     </>
  //   );
  // }

  //The actual app
  return (
    <>
      <StartScreen handleClickStart={handleClickStart} showStartScreen={showStartScreen} />
      <UserControls
        {...{
          audioEngineIsPlaying,
          setAudioEngineIsIsPlaying,
          setAudioEngineChordSetTrig,
          audioEngineChordSetTrig,
          setAudioEngineDrumsSetTrig,
          audioEngineDrumsSetTrig,
          drumsIsPlaying,
          setDrumsIsPlaying,
          bpm,
          setBpm,
          isTrackingPose,
          setIsTrackingPose,
        }}
      />
      <Visualizer
        analyserNodeRef={analyserNodeRef}
        modX={audioModX}
        modY={audioModY}
      />
      <AudioEngine
        rndChordSetTrig={audioEngineChordSetTrig}
        audioEngineDrumsSetTrig={audioEngineDrumsSetTrig}
        initTrig={audioEngineInitTrig}
        isPlaying={audioEngineIsPlaying}
        drumsIsPlaying={drumsIsPlaying}
        modX={audioModX}
        modY={audioModY}
        analyserNodeRef={analyserNodeRef}
        bpm={bpm}
      />
      <PoseNet
        isTrackingPose={isTrackingPose}
        setModX={setAudioModX}
        setModY={setAudioModY}
      />
    </>
  );
}

export default App;
