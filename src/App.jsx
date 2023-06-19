import { useEffect, useState, useRef } from "react";

import AudioEngine from "./components/AudioEngine";
import Visualizer from "./components/Visualizer";
import UserControls from "./components/UserControls";
import PoseNet from "./components/PoseNet";

import "./App.css";

//debug params stuff
const params = new URLSearchParams(window.location.search);
const disableCamera = !!params.get("camera");

console.log({ disableCamera });

function App() {
  const [showStartScreen, setShowStartScreen] = useState(true);

  //user controls
  const [audioEngineInitTrig, setAudioEngineInitTrig] = useState(0);

  const [audioEngineIsPlaying, setAudioEngineIsIsPlaying] = useState(true);
  const [audioEngineChordSetIndex, setAudioEngineChordSetIndex] = useState(0);
  const [audioEngineDrumsSetIndex, setAudioEngineDrumsSetIndex] = useState(0);
  const [
    audioEngineCurrentChordSetLength,
    setAudioEngineCurrentChordSetLength,
  ] = useState(0);
  const [audioEngineCurrentChordIndex, setAudioEngineCurrentChordIndex] =
    useState(2);

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

    setShowStartScreen(false);
  };

  //The start screen
  if (showStartScreen) {
    return (
      <>
        <div className="startScrenContainer">
          <Visualizer
            analyserNodeRef={analyserNodeRef}
            modX={audioModX}
            modY={audioModY}
          />
          <div>STEP INTO A WORLD OF SOUND AND MOVEMENT</div>
          <button className="enterBtn" onClick={handleClickStart}>
            ENTER
          </button>
        </div>
      </>
    );
  }

  //The actual app
  return (
    <>
      <Visualizer
        analyserNodeRef={analyserNodeRef}
        modX={audioModX}
        modY={audioModY}
      />

      <AudioEngine
        audioEngineChordSetIndex={audioEngineChordSetIndex}
        audioEngineDrumsSetIndex={audioEngineDrumsSetIndex}
        initTrig={audioEngineInitTrig}
        isPlaying={audioEngineIsPlaying}
        drumsIsPlaying={drumsIsPlaying}
        modX={audioModX}
        modY={audioModY}
        analyserNodeRef={analyserNodeRef}
        bpm={bpm}
        setCurrentChordSetLength={setAudioEngineCurrentChordSetLength}
        setCurrentChordIndex={setAudioEngineCurrentChordIndex}
      />

      <div className="overlay-container">
        {!disableCamera && (
          <PoseNet
            isTrackingPose={isTrackingPose}
            setModX={setAudioModX}
            setModY={setAudioModY}
            modY={audioModY}
            gridCols={audioEngineCurrentChordSetLength}
            gridSelectedCol={audioEngineCurrentChordIndex}
          />
        )}

        <UserControls
          {...{
            audioEngineIsPlaying,
            setAudioEngineIsIsPlaying,
            setAudioEngineChordSetIndex,
            audioEngineChordSetIndex,
            setAudioEngineDrumsSetIndex,
            audioEngineDrumsSetIndex,
            drumsIsPlaying,
            setDrumsIsPlaying,
            bpm,
            setBpm,
            setIsTrackingPose,

            isTrackingPose,
            disableCamera,
          }}
        />
      </div>
    </>
  );
}

export default App;
