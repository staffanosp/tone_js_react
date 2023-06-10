import { Component, createRef } from "react";
import { Renderer, Camera, Transform, Program, Mesh, Triangle, Color } from 'ogl';

import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'
import fragment2 from './shaders/fragment2.glsl'

//the "type" of analyser is set in audioEngine.js:
//const analyserNode = new Tone.Analyser("fft");

//the smoothing is in the same file:
//nalyserNode.smoothing = 0;

//It should really not use this interval thing — it was just to get some logging thing to be done.
//Make a proper frame loop :)

class Visualizer extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = createRef();
    this.analyserNodeRef = this.props.analyserNodeRef;
    this.fragments = [fragment, fragment2];
    this.state = {
      fragment: 0
    }
  }

  componentDidMount() {
    this.init();
    this.createTriangle();
    this.resize();
    this.addEventListeners();
    this.animate();
  }

  componentDidUpdate() {
    console.log(this.state.fragment)
    this.program.fragment = this.fragments[this.state.fragment];
    // this.changeFragment();
  }

  init() {
    this.renderer = new Renderer({ canvas: this.canvasRef.current });
    this.gl = this.renderer.gl;

    this.camera = new Camera(this.gl);
    this.camera.position.z = 5;

    this.scene = new Transform();

  }

  createTriangle() {
    this.geometry = new Triangle(this.gl);

    this.program = new Program(this.gl, {
      vertex: vertex,
      fragment: this.fragments[this.state.fragment],
      uniforms: {
        uTime: { value: 0 },
        bass: { value: 0.5 },
        mids: { value: 0.5 },
        highs: { value: 0.5 },
      },
    });

    this.mesh = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    this.mesh.setParent(this.scene);
  }

  addEventListeners() {
    window.addEventListener('resize', this.resize.bind(this), false);

  }

  changeFragment() {
    this.program = new Program(this.gl, {
      vertex: vertex,
      fragment: this.fragments[this.state.fragment],
      uniforms: {
        uTime: { value: 0 },
        bass: { value: 0.5 },
        mids: { value: 0.5 },
        highs: { value: 0.5 },
      },
    });
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.perspective({
      aspect: this.gl.canvas.width / this.gl.canvas.height,
    });
  }

  updateAudioBuffer() {
    this.buffer = this.analyserNodeRef.current?.getValue();
    this.bufferSize = this.analyserNodeRef.current?.size;
    this.sampleRate = 1 / this.analyserNodeRef.current?.sampleTime;
  }

  getAudioBinValue(lower, upper) {
    let sum = 0;
    const lowerBin = Math.floor(lower / (this.sampleRate / this.bufferSize));
    const upperBin = Math.floor(upper / (this.sampleRate / this.bufferSize));
    const binCount = upperBin - lowerBin + 1;


    for (let i = lowerBin; i <= upperBin; i++) {
      sum += this.buffer[i];
    }

    const averageValue = sum / binCount;
    const normalizedValue = Math.abs(averageValue) / 100;

    return normalizedValue;
  }

  animate(t) {
    requestAnimationFrame(this.animate.bind(this)); //We use bind(this) so that the context of 'this' doesn't get lost

    this.program.uniforms.uTime.value = t * 0.001;
    if (this.analyserNodeRef.current !== undefined) {

      this.updateAudioBuffer();
      //todo make it a "medelvärde" of 5 latest values - also calculate f where (value(x) = fx)
      const bass = this.getAudioBinValue(20, 250);
      const mids = this.getAudioBinValue(500, 2000);
      const highs = this.getAudioBinValue(2000, 6000);

      this.program.uniforms.bass.value = bass;
      this.program.uniforms.mids.value = mids;
      this.program.uniforms.highs.value = highs;


      //temp logging
      // console.log({ bass, mids, highs })
    }

    this.renderer.render({ scene: this.mesh });
  }


  render() {
    return (
      <>
        <canvas onClick={() => this.setState({
          fragment: this.state.fragment < this.fragments.length - 1 ? this.state.fragment + 1 : 0
        })}
          className="visualizer" ref={this.canvasRef} />
      </>
    );
  }
}


export default Visualizer;
