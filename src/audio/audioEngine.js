import * as Tone from "tone";
import { clamp } from "../utils/utils";

function createAudioEngine(numOscillators = 5) {
  console.log("—— AUDIO ENGINE: CREATE ——");

  //create oscillator + gain nodes
  const oscillatorNodes = [];
  const oscillatorGainNodes = [];

  for (let i = 0; i < numOscillators; i++) {
    const oscillatorNode = new Tone.OmniOscillator("A4", "pwm").start();
    // const oscillatorNode = new Tone.Oscillator("A4", "square").start();
    oscillatorNode.volume.value = -24;
    oscillatorNodes.push(oscillatorNode);

    const oscillatorGainNode = new Tone.Gain(0);
    oscillatorGainNodes.push(oscillatorGainNode);
  }

  // create other nodes
  const oscillatorsSumGainNode = new Tone.Gain(1);
  const filterNode = new Tone.Filter(4000, "lowpass");

  //connections
  oscillatorNodes.forEach((oscillatorNode, i) => {
    oscillatorNode.chain(oscillatorGainNodes[i], oscillatorsSumGainNode);
  });

  oscillatorsSumGainNode.connect(filterNode);

  filterNode.toDestination();

  return {
    //References to nodes, can be nodes, arrays of nodes or objects with nodes as values
    nodes: {
      oscillatorNodes,
      oscillatorGainNodes,
      oscillatorsSumGainNode,
      filterNode,
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
