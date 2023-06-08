import { useEffect } from "react";

//the "type" of analyser is set in audioEngine.js:
//const analyserNode = new Tone.Analyser("fft");

//the smoothing is in the same file:
//nalyserNode.smoothing = 0;

//It should really not use this interval thing — it was just to get some logging thing to be done.
//Make a proper frame loop :)

function Visualizer({ analyserNodeRef }) {
  useEffect(() => {
    const interval = setInterval(() => {
      if (analyserNodeRef.current) {
        // console.log("size", analyserNodeRef.current.size);
        const buffer = analyserNodeRef.current.getValue("adfg");

        console.log(buffer);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [analyserNodeRef]);

  return <div>VIZ!</div>;
}

export default Visualizer;
