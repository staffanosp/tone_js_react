import { useEffect, useState } from "react";
import AudioEngine from "./components/AudioEngine";
import { changeChordSet } from "./audio/chords";

import "./App.css";

function App() {
	const [audioModX, setAudioModX] = useState(0);
	const [audioModY, setAudioModY] = useState(0);

	const [isTrackingMouse, setIsTrackingMouse] = useState(false);

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

	return (
		<>
			<AudioEngine modX={audioModX} modY={audioModY} />
			<div>
				<button
					onClick={() => {
						setIsTrackingMouse((old) => !old);
					}}
				>
					{isTrackingMouse ? "Mouse: STOP" : "Mouse: START"}
				</button>
				<div className="chordSetPickerContainer">
					<button onClick={() => changeChordSet()}>Chord Set: RANDOM</button>
				</div>
			</div>
		</>
	);
}

export default App;
