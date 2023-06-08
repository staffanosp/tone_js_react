import { useEffect, useRef } from "react";

//the "type" of analyser is set in audioEngine.js:
//const analyserNode = new Tone.Analyser("fft");

//the smoothing is in the same file:
//nalyserNode.smoothing = 0;

//It should really not use this interval thing — it was just to get some logging thing to be done.
//Make a proper frame loop :)

function Visualizer({ analyserNodeRef }) {
  const canvasRef = useRef();

  useEffect(() => {
    let requestAnimationFrameRef;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext("2d");
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    function draw() {
      //Schedule next redraw
      requestAnimationFrameRef = requestAnimationFrame(draw);

      console.log("FRAME");

      const buffer = analyserNodeRef.current?.getValue();
      const bufferSize = analyserNodeRef.current?.size;

      if (!buffer) return; //there is no buffer before the audio engine is created

      //Draw black background
      canvasCtx.fillStyle = "rgb(0, 0, 0)";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      //Draw spectrum
      const barWidth = (canvas.width / bufferSize) * 2.5;
      let posX = 0;
      for (let i = 0; i < bufferSize; i++) {
        const barHeight = (buffer[i] + 140) * 2;
        canvasCtx.fillStyle =
          "rgb(" + Math.floor(barHeight + 100) + ", 50, 50)";
        canvasCtx.fillRect(
          posX,
          canvas.height - barHeight / 2,
          barWidth,
          barHeight / 2
        );
        posX += barWidth + 1;
      }
    }

    draw();

    return () => {
      //clean up
      cancelAnimationFrame(requestAnimationFrameRef);
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default Visualizer;
