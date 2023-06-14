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

      return this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
    },
  };
}

function PoseNet({
  setModX,
  setModY,
  modY,
  isTrackingPose,
  gridCols,
  gridSelectedCol,
}) {
  //refs
  const webcamRef = useRef(null);
  const detectorRef = useRef(null);
  const posesRef = useRef(null);
  const intervalRef = useRef(null);

  const frameAverageSize = 20;
  const frameAverageX = useRef(createFrameAverage(frameAverageSize));
  const frameAverageY = useRef(createFrameAverage(frameAverageSize));

  //states
  const [notEnoughData, setNotEnoughData] = useState(true);

  //animations
  const variants = {
    tracking: { opacity: 1, y: "0" },
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
      valueX = Math.max(0, Math.min(1, valueX));
      let valueY = 1 - rightWrist.y / videoHeight;
      valueY = Math.max(0, Math.min(1, valueY));

      let smoothX = frameAverageX.current.getFrameAverage(valueX);
      let smoothY = frameAverageY.current.getFrameAverage(valueY);

      const overallPoseConfidence = posesRef.current[0]?.score;

      if (
        rightWrist &&
        overallPoseConfidence > 0.4 &&
        smoothX < 1 &&
        smoothY < 1
      ) {
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
        <div className={styles.cameraContainer}>
          <video className={styles.webcam} ref={webcamRef} autoPlay />
          <div className={styles.gridContainer}>
            {[...Array(gridCols)].map((_, i) => (
              <div
                className={`${styles.gridItem} ${
                  i === gridSelectedCol ? styles.gridItemSelected : ""
                }`}
              ></div>
            ))}
          </div>
        </div>

        {notEnoughData && isTrackingPose ? (
          <p className={styles.statusText}>
            can't get a good enough look on the pose, move back
          </p>
        ) : (
          ""
        )}
      </m.main>
    </>
  );
}

export default PoseNet;
