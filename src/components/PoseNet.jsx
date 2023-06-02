import React, { useRef, useEffect } from "react";
import "@tensorflow/tfjs-backend-webgl";
import * as mpPose from "@mediapipe/pose";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";

function PoseNet() {
	const webcamRef = useRef(null);
	const detectorRef = useRef(null);
	const posesRef = useRef(null);


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
			console.log(posesRef.current);
		}
	};


	//create webcam
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
			></video>
			<button onClick={estimatePose}>Estimate Poses</button>
		</>
	);
}

export default PoseNet;
