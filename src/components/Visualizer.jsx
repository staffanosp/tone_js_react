import { Component, createRef } from "react";
import { Renderer, Camera, Transform, Program, Mesh, Triangle, Color } from 'ogl';

import { clamp } from "../utils/utils";

import vertex from './shaders/vertex.glsl'
import fragment from './shaders/fragment.glsl'
import fragment2 from './shaders/fragment2.glsl'

//the "type" of analyser is set in audioEngine.js:
//const analyserNode = new Tone.Analyser("fft");

//the smoothing is in the same file:
//nalyserNode.smoothing = 0;

//It should really not use this interval thing — it was just to get some logging thing to be done.
//Make a proper frame loop :)

// function Visualizer({ analyserNodeRef }) {
//   const canvasRef = useRef();

//   useEffect(() => {
//     let requestAnimationFrameRef;

//     const canvas = canvasRef.current;
//     const canvasCtx = canvas.getContext("2d");
//     canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

//     function draw() {
//       //Schedule next redraw
//       requestAnimationFrameRef = requestAnimationFrame(draw);

//       console.log("FRAME");

//       const buffer = analyserNodeRef.current?.getValue();
//       const bufferSize = analyserNodeRef.current?.size;

//       if (!buffer) return; //there is no buffer before the audio engine is created

//       //Draw black background
//       canvasCtx.fillStyle = "rgb(0, 0, 0)";
//       canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

//       //Draw spectrum
//       const barWidth = (canvas.width / bufferSize) * 2.5;
//       let posX = 0;
//       for (let i = 0; i < bufferSize; i++) {
//         const barHeight = (buffer[i] + 140) * 2;
//         canvasCtx.fillStyle =
//           "rgb(" + Math.floor(barHeight + 100) + ", 50, 50)";
//         canvasCtx.fillRect(
//           posX,
//           canvas.height - barHeight / 2,
//           barWidth,
//           barHeight / 2
//         );
//         posX += barWidth + 1;
//       }
//     }

//     draw();

//     return () => {
//       //clean up
//       cancelAnimationFrame(requestAnimationFrameRef);
//     };
//   }, []);

//   return (
//     <div>
//       <canvas ref={canvasRef} />
//     </div>
//   );
// }


// function Visualizer({ analyserNodeRef }) {
//   const canvasRef = useRef(null);

//   const init = () => {
//     const renderer = new Renderer({ canvas: canvasRef.current });
//     const gl = renderer.gl;
//     const camera = new Camera(gl);
//     camera.position.z = 5;

//     const scene = new Transform();

//     const geometry = new Triangle(gl);

//     const program = new Program(gl, {
//       vertex,
//       fragment,
//       uniforms: {
//         uTime: { value: 0 },
//         bass: { value: 0 },
//       }
//     });

//     const mesh = new Mesh(gl, { geometry, program });
//     mesh.setParent(scene);

//     function resize() {
//       renderer.setSize(window.innerWidth, window.innerHeight);
//       camera.perspective({
//         aspect: gl.canvas.width / gl.canvas.height,
//       });
//     }
//     window.addEventListener('resize', resize, false);
//     canvasRef.current.addEventListener('click', () => { console.log('click') })
//     resize();

//     let lastLog = 0;

//     function animate(t) {
//       requestAnimationFrame(animate);

//       program.uniforms.uTime.value = t * 0.001;

//       if (analyserNodeRef.current !== null) {
//         const buffer = analyserNodeRef.current?.getValue();
//         const bufferSize = analyserNodeRef.current?.size;
//         const sampleRate = 1 / analyserNodeRef.current?.sampleTime;


//         let bassSum = 0;
//         //What we want to calculate here which entries in the buffer are in our desired range.
//         const lowerBin = Math.floor(20 / (sampleRate / bufferSize));
//         const upperBin = Math.floor(200 / (sampleRate / bufferSize));

//         // console.log({ bufferSize, sampleRate, buffer, lowerBin, upperBin })
//         for (let i = lowerBin; i <= upperBin; i++) {
//           bassSum += buffer[i];
//         }

//         const bassValue = clamp(Math.abs((bassSum / (upperBin - lowerBin + 1)) / 80));

//         program.uniforms.bass.value = bassValue;


//         // console.log({ bassSum, bassValue, lowerBin, upperBin, sampleRate, bufferSize, buffer })
//         const diff = Math.abs(lastLog - bassValue);
//         if (diff > 0.1) {
//           lastLog = bassValue;
//           console.log(bassValue)

//         }
//       }


//       renderer.render({ scene: mesh });
//     }

//     animate();
//   };

//   useEffect(() => {
//     init();
//   }, []);

//   return <>
//     <canvas className="visualizer" ref={canvasRef} />
//   </>
// }


class Visualizer extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = createRef();

  }

  componentDidMount() {
    this.init();
    this.createTriangle();
    this.resize();
    this.addEventListeners();
    this.animate();
  }

  init() {
    this.renderer = new Renderer({ canvas: this.canvasRef.current });
    this.gl = this.renderer.gl;

    this.camera = new Camera(this.gl);
    this.camera.position.z = 5;

    this.scene = new Transform();

    this.lastLog = 0;
  }

  createTriangle() {
    this.geometry = new Triangle(this.gl);

    this.program = new Program(this.gl, {
      vertex: vertex,
      fragment: fragment,
      uniforms: {
        uTime: { value: 0 },
        bass: { value: 0 },
      },
    });

    this.mesh = new Mesh(this.gl, { geometry: this.geometry, program: this.program });
    this.mesh.setParent(this.scene);
  }

  addEventListeners() {
    window.addEventListener('resize', this.resize.bind(this), false);

    this.canvasRef.current.addEventListener('click', this.changeFragment.bind(this));
  }

  changeFragment() {
    console.log('YEP')
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.perspective({
      aspect: this.gl.canvas.width / this.gl.canvas.height,
    });
  }

  animate(t) {
    requestAnimationFrame(this.animate.bind(this)); //We use bind(this) so that the context of 'this' doesn't get lost

    this.program.uniforms.uTime.value = t * 0.001;

    const { analyserNodeRef } = this.props;
    if (analyserNodeRef.current !== null) {
      const buffer = analyserNodeRef.current?.getValue();
      const bufferSize = analyserNodeRef.current?.size;
      const sampleRate = 1 / analyserNodeRef.current?.sampleTime;

      let bassSum = 0;
      const lowerBin = Math.floor(20 / (sampleRate / bufferSize));
      const upperBin = Math.floor(200 / (sampleRate / bufferSize));

      for (let i = lowerBin; i <= upperBin; i++) {
        bassSum += buffer[i];
      }

      const bassValue = clamp(Math.abs((bassSum / (upperBin - lowerBin + 1)) / 80));

      this.program.uniforms.bass.value = bassValue;

      const diff = Math.abs(this.lastLog - bassValue);
      if (diff > 0.1) {
        this.lastLog = bassValue;
        console.log(bassValue);
      }
    }

    this.renderer.render({ scene: this.mesh });
  }


  render() {
    return (
      <>
        <canvas className="visualizer" ref={this.canvasRef} />
      </>
    );
  }
}


export default Visualizer;
