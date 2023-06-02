import * as Tone from "tone";
import { clamp } from "../utils/utils";

import kickSample from "../../public/sounds/kick.wav";

function createAudioEngine(numOscillators = 5) {
	console.log("—— AUDIO ENGINE: CREATE ——");

	// Create the kick player
	const kickPlayer = new Tone.Player(kickSample).toDestination();

	// Set the BPM to 120
	Tone.Transport.bpm.value = 120;

	//create oscillator + gain nodes
	const oscillatorNodes = [];
	const oscillatorGainNodes = [];
	const panners = [];

	// Adjust the panning spread
	const panSpread = 0.5;

	for (let i = 0; i < numOscillators; i++) {
		const oscillatorNode = new Tone.OmniOscillator("A4", "pwm").start();
		// const oscillatorNode = new Tone.Oscillator("A4", "square").start();

		oscillatorNode.volume.value = -24;
		oscillatorNodes.push(oscillatorNode);

		const oscillatorGainNode = new Tone.Gain(0);
		oscillatorGainNodes.push(oscillatorGainNode);

		const panner = new Tone.Panner(0);

		let panning;
		if (i === 0) {
			panning = 0; // Center the first osc
		} else {
			const panStep = panSpread / (numOscillators - 1);
			panning = i * panStep - panSpread / 2;
		}

		// const panning = (i / (numOscillators - 1)) * 2 - 1; // Range from -1 to 1
		panner.pan.value = panning;

		panners.push(panner);
	}

	// create other nodes
	const oscillatorsSumGainNode = new Tone.Gain(1);
	const delayNode = new Tone.PingPongDelay("16n", 0.2);
	const filterNode = new Tone.Filter(1000, "lowpass");

	//connections
	oscillatorNodes.forEach((oscillatorNode, i) => {
		oscillatorNode.chain(
			oscillatorGainNodes[i],
			panners[i],
			oscillatorsSumGainNode
		);
	});

	oscillatorsSumGainNode.connect(delayNode);
	delayNode.connect(filterNode);

	filterNode.toDestination();

	// Kick pattern
	const kickPattern = new Tone.Pattern(
		(time, note) => {
			kickPlayer.start(time); // Trigger the kick sample
		},
		["C1"], // The kick sample will always play at C1
		"up" // Set the pattern direction
	);

	// Set the kick pattern to play on every quarter note
	kickPattern.interval = "4n";
	kickPattern.start();

	// Start the kick pattern when the transport starts
	Tone.Transport.start();

	return {
		//References to nodes, can be nodes, arrays of nodes or objects with nodes as values
		nodes: {
			oscillatorNodes,
			oscillatorGainNodes,
			oscillatorsSumGainNode,
			filterNode,
			panners,
			delayNode,
			kickPlayer,
			kickPattern,
		},

		numOscillators,

		setOscillatorGainsFromNormalizedValue(v, rampTime = 0.1) {
			console.log("setOscillatorGainsFromNormalizedValue");

			this.nodes.oscillatorGainNodes.forEach((gainNode, i) => {
				//the first oscGain is always 1
				let gain = 1;

				if (i > 0) {
					let unnormalized = 1 + v * (this.numOscillators - 1);
					gain = clamp(unnormalized - i);
				}

				gainNode.gain.rampTo(gain, rampTime);
			});
		},

		setChord(notes, rampTime = 0.1) {
			const rndDetuneRange = 10;

			console.log("setChord");

			for (const [i, note] of notes.entries()) {
				if (i > this.numOscillators - 1) break;

				this.nodes.oscillatorNodes[i].frequency.rampTo(note, rampTime);
				this.nodes.oscillatorNodes[i].detune.rampTo(
					Math.random() * rndDetuneRange,
					rampTime
				);
			}
		},

		//Dispose ALL nodes
		dispose() {
			const _dispose = (arr) => {
				arr.forEach((node) => {
					if ("dispose" in node) {
						node.dispose();
					} else {
						_dispose(Array.isArray(node) ? node : Object.values(node));
					}
				});
			};

			_dispose(Object.values(this.nodes));

			console.log("—— AUDIO ENGINE: DISPOSED ——");
		},
	};
}

export { createAudioEngine };
