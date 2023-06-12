//Libraries
import React, { useRef, useEffect, useState } from "react";
import * as mpPose from "@mediapipe/pose";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";

import styles from "../styles/posenet.module.css";

function PoseNet({ setModX, setModY, isTrackingPose }) {
	//refs
	const webcamRef = useRef(null);
	const detectorRef = useRef(null);
	const posesRef = useRef(null);
	const intervalRef = useRef(null);


	//states
	const [notEnoughData, setNotEnoughData] = useState(true);

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

			console.log(videoWidth, videoHeight)

			let rightWrist = posesRef.current[0]?.["keypoints"][10];
			let valueX = 1 - rightWrist.x / videoWidth
			let valueY = 1 - rightWrist.y / videoHeight;
			let roundedX = valueX.toFixed(3);
			let roundedY = valueY.toFixed(3);

			if (rightWrist && rightWrist.score > 0.4 && roundedX < 1 && roundedY < 1) {
				setModX(roundedX);
				setModY(roundedY);
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
			<main className={styles.container}>
				<div>
					<div className={styles.webcam_wrapper}>
					<video
						className={`${styles.webcam} ${
							isTrackingPose ? styles.active : styles.inactive
						}`}
						ref={webcamRef}
						autoPlay
					/>
					</div>
					<p>
						{notEnoughData && isTrackingPose
							? "can't get a good enough look on the pose, move back"
							: ""}
					</p>
				</div>
			</main>
		</>
	);
}

export default PoseNet;
