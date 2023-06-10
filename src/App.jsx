import { useEffect, useState, useRef } from "react";

import AudioEngine from "./components/AudioEngine";
import Visualizer from "./components/Visualizer";
import UserControls from "./components/UserControls";
import PoseNet from "./components/PoseNet";

import "./App.css";

function App() {
	const [showStartScreen, setShowStartScreen] = useState(true);

	//user controls
	const [audioEngineInitTrig, setAudioEngineInitTrig] = useState(0);
	const [audioEngineIsPlaying, setAudioEngineIsIsPlaying] = useState(false);
	const [audioEngineRndChordSetTrig, setAudioEngineRndChordSetTrig] = useState(0);
	const [isTrackingPose, setIsTrackingPose] = useState(false);

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
			<PoseNet
				isTrackingPose={isTrackingPose}
				setModX={setAudioModX}
				setModY={setAudioModY}
			/>
			<UserControls
				{...{
					audioEngineIsPlaying,
					setAudioEngineIsIsPlaying,
					setAudioEngineRndChordSetTrig,
					isTrackingPose,
					setIsTrackingPose,
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

			<div>
				<button
					onClick={() => {
						setIsTrackingMouse((old) => !old);
					}}
				>
					{isTrackingMouse ? "Mouse: STOP" : "Mouse: START"}
				</button>
			</div>
		</>
	);
}

export default App;
