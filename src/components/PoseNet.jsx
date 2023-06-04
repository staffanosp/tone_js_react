//Libraries
import React, { useRef, useEffect, useState } from "react";
import "@tensorflow/tfjs-backend-webgl";
import * as mpPose from "@mediapipe/pose";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";

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
			let leftWrist = posesRef.current[0]?.["keypoints"][9];
			let combinedX = (leftWrist.x + rightWrist.x) / 1000;
			let combinedY = (leftWrist.y + rightWrist.y) / 1000;

			// Checks if the score is high enough to create a pose
			if (
				rightWrist &&
				rightWrist.score > 0 &&
				combinedX < 1 &&
				combinedY < 1
			) {
				setModX(combinedX);
				setModY(combinedY);
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
				console.error("Error accessing webcam:", error);
			}
		};

		setupCamera();
	}, []);

	return (
		<>
			<video
				style={{
					width: 640,
					height: 480,
				}}
				ref={webcamRef}
				autoPlay
			/>
			<button onClick={toggleTracking}>
				{isTrackingPose ? "Stop Tracking" : "Start Tracking"}
			</button>
		</>
	);
}

export default PoseNet;
