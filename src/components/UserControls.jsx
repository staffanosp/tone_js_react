function UserControls({
	audioEngineIsPlaying,
	setAudioEngineIsIsPlaying,
	setAudioEngineRndChordSetTrig,
	isTrackingPose,
	setIsTrackingPose,
}) {
	return (
		<div style={{ outline: "#555 solid 1px", padding: "24px", margin: "24px" }}>
			<div>
				<strong>USER CONTROLS.</strong> TO KEEP! This is where ALL user controls should
				go. This should be some sort of floating panel.
			</div>

			<button
				onClick={() => {
					setAudioEngineIsIsPlaying(!audioEngineIsPlaying);
				}}
			>
				{!audioEngineIsPlaying ? "PLAY" : "PAUSE"}
			</button>
			<button
				onClick={() => {
					setAudioEngineRndChordSetTrig((old) => ++old);
				}}
			>
				Chord Set: RANDOM
			</button>
			<button
				onClick={() => {
					setIsTrackingPose(!isTrackingPose);
				}}
			>
				{isTrackingPose ? "POSE: Stop" : "POSE: Start"}
			</button>
		</div>
	);
}

export default UserControls;
