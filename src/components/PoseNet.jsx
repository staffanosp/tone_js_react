//Libraries
import React, { useRef, useEffect, useState } from "react";
import * as mpPose from "@mediapipe/pose";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { motion as m } from "framer-motion";

import styles from "../styles/posenet.module.css";

function createFrameAverage(nFrames) {
  return {
    nFrames,
    frames: undefined,
    getFrameAverage(v) {
      if (!this.frames) {
        this.frames = Array(this.nFrames).fill(v);
      }

      this.frames.shift();
      this.frames.push(v);

      return this.frames.reduce((a, b) => a + b, 0) / nFrames;
    },
  };
}

function PoseNet({ setModX, setModY, isTrackingPose }) {
  //refs
  const webcamRef = useRef(null);
  const detectorRef = useRef(null);
  const posesRef = useRef(null);
  const intervalRef = useRef(null);

  const frameAverageSize = 15;
  const frameAverageX = useRef(createFrameAverage(frameAverageSize));
  const frameAverageY = useRef(createFrameAverage(frameAverageSize));

  //states
  const [notEnoughData, setNotEnoughData] = useState(true);

  //animations
  const variants = {
    tracking: { opacity: 1, y: "-100%" },
    notTracking: { opacity: 0, y: "100%" },
  };

  // create detector
  useEffect(() => {
    const start = async () => {
      await tf.ready();
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      };
      detectorRef.current = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );
    };
    start();
  }, []);

  // create poses to get x-y value
  const estimatePose = async () => {
    if (detectorRef.current && webcamRef.current) {
      const videoElm = webcamRef.current;
      posesRef.current = await detectorRef.current.estimatePoses(videoElm);

      const { videoWidth, videoHeight } = videoElm;

      console.log(videoWidth, videoHeight);

      let rightWrist = posesRef.current[0]?.["keypoints"][10];
      let valueX = 1 - rightWrist.x / videoWidth;
      let valueY = 1 - rightWrist.y / videoHeight;

      let smoothX = frameAverageX.current.getFrameAverage(valueX);
      let smoothY = frameAverageY.current.getFrameAverage(valueY);

      if (rightWrist && rightWrist.score > 0.4 && smoothX < 1 && smoothY < 1) {
        setModX(smoothX);
        setModY(smoothY);
        setNotEnoughData(false);
      }
    }
  };

  // toggles to activate pose

  useEffect(() => {
    if (!isTrackingPose) {
      clearInterval(intervalRef.current);
      console.log("I am no longer animating");
    } else {
      // set the fps to 60
      intervalRef.current = setInterval(estimatePose, 1000 / 60);
      console.log("I am animating");
    }
  }, [isTrackingPose]);

  // create webcam
  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        webcamRef.current.srcObject = stream;
      } catch (error) {
        console.error("couldnt activate cam", error);
      }
    };
    setupCamera();
  }, []);

  return (
    <>
      <m.main
        className={styles.container}
        animate={isTrackingPose ? "tracking" : "notTracking"}
        variants={variants}
      >
        <video className={styles.webcam} ref={webcamRef} autoPlay />
        <p>
          {notEnoughData && isTrackingPose
            ? "can't get a good enough look on the pose, move back"
            : ""}
        </p>
      </m.main>
    </>
  );
}

export default PoseNet;
