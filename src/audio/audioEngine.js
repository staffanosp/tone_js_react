import * as Tone from "tone";
import { clamp, curvefit3 } from "../utils/utils";

import { patterns } from "./drums";

import kickSample from "../../public/sounds/kick.wav";
import snareSample from "../../public/sounds/snare.wav";

function createAudioEngine(numOscillators = 5) {
  console.log("—— AUDIO ENGINE: CREATE ——");
  // Create the kick player
  const kickPlayerNode = new Tone.Player(kickSample);

  const snarePlayerNode = new Tone.Player(snareSample);

  //create oscillator + gain nodes
  const oscillatorNodes = [];
  const oscillatorGainNodes = [];
  const panners = [];

  // Adjust the panning spread
  const panSpread = 0.5;

  for (let i = 0; i < numOscillators; i++) {
    const type = i === 0 ? "sine" : "pwm";

    const oscillatorNode = new Tone.OmniOscillator("A4", type);

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

    panner.pan.value = panning;

    panners.push(panner);
  }

  console.log(`Created: ${numOscillators} oscillators`);

  // create other nodes
  const oscillatorsSumGainNode = new Tone.Gain(1);
  const delayNode = new Tone.PingPongDelay("16n", 0.5);
  const filterNode = new Tone.Filter(10000, "lowpass");
  filterNode.Q.value = 1;

  const sidechainGainNode = new Tone.Gain(1);

  const sidechainEnvelopeNode = new Tone.Envelope({
    attack: 0,
    decay: 0.2,
    sustain: 1,
    release: 1,
  });

  const sidechainEnvelopeMultiplyNode = new Tone.Multiply(0.9); //The depth of the sidechain
  const sidechainEnvelopeInvertNode = new Tone.Subtract(1); //Use a subtract to be able to do "1 - the envelope value"

  const masterSumGainNode = new Tone.Gain(1);
  const masterLimiterNode = new Tone.Limiter(-0.2);
  const masterVolumeNode = new Tone.Volume(-Infinity);

  const analyserNode = new Tone.Analyser("fft");
  // analyserNode.smoothing = 0;

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
  sidechainGainNode.connect(masterSumGainNode);

  kickPlayerNode.connect(masterSumGainNode);
  snarePlayerNode.connect(masterSumGainNode);

  masterSumGainNode.connect(masterLimiterNode);

  masterLimiterNode.connect(masterVolumeNode);

  masterVolumeNode.connect(analyserNode);
  masterVolumeNode.toDestination();

  //connect modulation
  sidechainEnvelopeNode.chain(
    sidechainEnvelopeMultiplyNode,
    sidechainEnvelopeInvertNode
  );

  sidechainEnvelopeInvertNode.connect(sidechainGainNode.gain);

  //Loop

  let currentDrumPattern = 0;

  // Set the BPM to 120

  let currentBpm = 125; // Initial BPM
  Tone.Transport.bpm.value = currentBpm;

  const changeDrumPattern = (i) => {
    currentDrumPattern = i;
  };

  const loopCallback = (time) => {
    const sixteenthNote = Tone.Time("16n").toSeconds();
    let currentPattern = patterns[currentDrumPattern % patterns.length];
    const beatIndex = Math.floor(time / sixteenthNote) % 16;

    console.log(sixteenthNote);

    const kickStep = currentPattern.kickPattern[beatIndex];
    const snareStep = currentPattern.snarePattern[beatIndex];

    // Tone.Transport.bpm.value = patterns[currentDrumPattern].bpm;

    if (kickStep === 1) {
      kickPlayerNode.start(time);

      //sidechain trig
      sidechainEnvelopeNode.triggerAttackRelease("8n", time);
    }
    if (snareStep === 1) {
      snarePlayerNode.start(time);
    }
  };

  const loop = new Tone.Loop((time) => {
    loopCallback(time);
  }, "16n");

  let loopIsStarted = false;

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

      analyserNode,

      masterSumGainNode,
      masterLimiterNode,
      masterVolumeNode,

      kickPlayerNode,
      snarePlayerNode,
      loop, //is this really a "node"?
    },

    numOscillators,
    currentChord: [],
    changeDrumPattern,

    async init() {
      console.log("start");

      //start Tone
      await Tone.start();

      //start oscillators
      this.nodes.oscillatorNodes.forEach((oscillatorNode) =>
        oscillatorNode.start()
      );
    },

    start() {
      Tone.Transport.start();
      this.nodes.masterVolumeNode.volume.rampTo(0, 1);
    },

    stop() {
      Tone.Transport.stop();
      this.nodes.masterVolumeNode.volume.rampTo(-Infinity, 1);
    },

    getOscillatorGains() {
      return this.nodes.oscillatorGainNodes.map(
        (gainNode) => gainNode.gain.value
      );
    },

    startLoop() {
      if (!loopIsStarted) {
        loop.start(0);
        loopIsStarted = !loopIsStarted;
      } else if (loopIsStarted) {
        loop.stop();
        loopIsStarted = !loopIsStarted;
      }
    },

    setBpmValue(value) {
      Tone.Transport.bpm.value = value;
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

    setFilterFreqFromNormalizedValue(v, rampTime = 0.1) {
      const min = 400;
      const middle = 1000;
      const max = 10000;

      const freq = curvefit3(v, min, middle, max);

      this.nodes.filterNode.frequency.rampTo(freq, rampTime);
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
