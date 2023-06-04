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

  console.log(`Created: ${numOscillators} oscillators`);

  // create other nodes
  const oscillatorsSumGainNode = new Tone.Gain(1);
  const delayNode = new Tone.PingPongDelay("16n", 0.2);
  const filterNode = new Tone.Filter(1000, "lowpass");

  const sidechainGainNode = new Tone.Gain(1);

  const sidechainEnvelopeNode = new Tone.Envelope({
    attack: 0,
    decay: 0.2,
    sustain: 1,
    release: 1,
  });

  const sidechainEnvelopeMultiplyNode = new Tone.Multiply(1); //The depth of the sidechain
  const sidechainEnvelopeInvertNode = new Tone.Subtract(1); //Use a subtract to be able to do "1 - the envelope value"

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

  filterNode.connect(sidechainGainNode);

  sidechainGainNode.toDestination();

  sidechainEnvelopeNode.chain(
    sidechainEnvelopeMultiplyNode,
    sidechainEnvelopeInvertNode
  );

  sidechainEnvelopeInvertNode.connect(sidechainGainNode.gain);

  //Loop

  const loop = new Tone.Loop((time) => {
    console.log("loop1");

    //This note length is like the "hold" time for the sidechain (?)
    sidechainEnvelopeNode.triggerAttackRelease("8n", time);

    kickPlayer.start(time);
  }, "4n").start(0);

  // Start the transport
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
      //sidechain stuff
      sidechainGainNode,
      sidechainEnvelopeNode,
      sidechainEnvelopeMultiplyNode,
      sidechainEnvelopeInvertNode,

      kickPlayer,
      loop, //is this really a "node"?
    },

    numOscillators,
    currentChord: [],

    getOscillatorGains() {
      return this.nodes.oscillatorGainNodes.map(
        (gainNode) => gainNode.gain.value
      );
    },

    setOscillatorGainsFromNormalizedValue(v, rampTime = 0.1) {
      console.log("setOscillatorGainsFromNormalizedValue");

      const gains = []; //this is just to be able to return the gains, mostly for debug purposes

      this.nodes.oscillatorGainNodes.forEach((gainNode, i) => {
        let thisGain;
        let thisRampTime = rampTime;

        if (i > this.currentChord.length || this.currentChord.length === 0) {
          thisGain = 0;
          thisRampTime *= 2; //longer fade time when fading to 0
        } else {
          let unnormalized = 1 + v * (this.currentChord.length - 1);
          thisGain = clamp(unnormalized - i);
        }

        gainNode.gain.rampTo(thisGain, thisRampTime);

        gains.push(thisGain);
      });

      //Compensate vol
      const totalGain = gains.reduce((prev, curr) => prev + curr, 0);
      const compFactor = 0.05;
      const oscillatorsSumGainNodeGain = 1 - totalGain * compFactor;

      this.nodes.oscillatorsSumGainNode.gain.rampTo(
        oscillatorsSumGainNodeGain,
        rampTime
      );

      return gains;
    },

    setChord(chord, rampTime = 0.1) {
      this.currentChord = chord;

      const rndDetuneRange = 10;

      console.log("setChord");

      for (const [i, note] of chord.entries()) {
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
