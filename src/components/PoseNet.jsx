//Libraries
import React, { useRef, useEffect, useState } from "react";
import "@tensorflow/tfjs-backend-webgl";
import * as mpPose from "@mediapipe/pose";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import styles from "../styles/posenet.module.css";

function PoseNet({ setModX, setModY }) {
	//refs
	const webcamRef = useRef(null);
	const detectorRef = useRef(null);
	const posesRef = useRef(null);
	const intervalRef = useRef(null);

	//states
	const [isTrackingPose, setisTrackingPose] = useState(false);

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

			let rightWrist = posesRef.current[0]?.["keypoints"][10];
			let valueX = 1 - rightWrist.x / webcamRef.current.clientWidth;
			let valueY = 1 - rightWrist.y / webcamRef.current.clientHeight;
			let roundedX = valueX.toFixed(3)
			let roundedY = valueY.toFixed(3)


			if (
				rightWrist &&
				rightWrist.score > 0.4 &&
				roundedX < 1 &&
				roundedY < 1
			) {
				setModX(roundedX);
				setModY(roundedY);
			} else {
				console.log("didn't get a good enough view of the pose");
			}
		}
	};

	//creates toggle for button

	const toggleTracking = () => {
		if (isTrackingPose) {
			clearInterval(intervalRef.current);
			console.log("I am no longer animating");
			setisTrackingPose(false);
		} else {
			// set the fps to 60
			intervalRef.current = setInterval(estimatePose, 100 / 60);
			console.log("I am animating");
			setisTrackingPose(true);
		}
	};

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
			<video className={styles.webcam} ref={webcamRef} autoPlay />
			<button onClick={toggleTracking}>
				{isTrackingPose ? "Stop Tracking" : "Start Tracking"}
			</button>
		</>
	);
}

export default PoseNet;
