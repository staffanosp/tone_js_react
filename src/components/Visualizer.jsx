import { Component, createRef } from "react";
import PropTypes from "prop-types";

import {
  Renderer,
  Camera,
  Transform,
  Program,
  Mesh,
  Triangle,
  Vec2,
} from "ogl";

import vertex from "./shaders/vertex.glsl";
import fragment from "./shaders/fragment.glsl";
import fragment2 from "./shaders/fragment2.glsl";
import fragment3 from "./shaders/fragment3.glsl";
import fragment4 from "./shaders/fragment4.glsl";
import liqFrag1 from "./shaders/liqFrag1.glsl";

class Visualizer extends Component {
  constructor(props) {
    super(props);
    console.log(this.props);
    this.canvasRef = createRef();
    this.positionVector = new Vec2(props.modX, props.modY);
    this.analyserNodeRef = props.analyserNodeRef;
    this.fragments = [liqFrag1, fragment];
    this.state = {
      fragment: 0,
    };
  }

  componentDidMount() {
    this.init();
    this.createTriangle();
    this.resize();
    this.addResizeEventListener();
    this.animate();
  }

  componentDidUpdate() {
    this.program.uniforms.modPos.value.set(this.props.modX, this.props.modY);
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
        modPos: { value: new Vec2(this.props.modX, this.props.modY) },
      },
    });

    this.mesh = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });
    this.mesh.setParent(this.scene);
  }

  changeFragment() {
    this.scene.removeChild(this.mesh);
    this.setState({
      fragment:
        this.state.fragment < this.fragments.length - 1
          ? this.state.fragment + 1
          : 0,
    });
    this.createTriangle();
  }

  addResizeEventListener() {
    window.addEventListener("resize", this.resize.bind(this), false);
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
    let value = Math.abs(10 / sum) / binCount;
    value = Math.pow(value, 4);
    value = Number(value.toFixed(3));
    if (value > 2) {
      console.warn("too big");
    }

    return value;
  }

  animate(t) {
    requestAnimationFrame(this.animate.bind(this)); //We use bind(this) so that the context of 'this' doesn't get lost

    this.program.uniforms.uTime.value = t * 0.001;
    if (this.analyserNodeRef.current !== undefined) {
      this.updateAudioBuffer();
      const bass = this.getAudioBinValue(20, 250);

      this.program.uniforms.bass.value =
        this.program.uniforms.bass.value * 0.95 + bass * 0.9; //slowly changes
    }

    this.renderer.render({ scene: this.mesh });
  }

  render() {
    return (
      <>
        <canvas
          onClick={this.changeFragment.bind(this)}
          className="visualizer"
          ref={this.canvasRef}
        />
      </>
    );
  }
}

Visualizer.propTypes = {
  modX: PropTypes.number,
  modY: PropTypes.number,
  analyserNodeRef: PropTypes.object,
};

export default Visualizer;
