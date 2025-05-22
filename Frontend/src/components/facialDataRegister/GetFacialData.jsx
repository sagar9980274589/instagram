import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GetFacialData = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const futuristicCanvasRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const displaySizeRef = useRef({ width: 400, height: 300 });
  const navigate = useNavigate();
  const [message, setMessage] = useState("👋 Starting face scan...");
  const [progress, setProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [embeddings, setEmbeddings] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [landmarks, setLandmarks] = useState(null);
  const [faceQuality, setFaceQuality] = useState(0);
  const [consecutiveGoodFrames, setConsecutiveGoodFrames] = useState(0);

  const drawFuturisticLandmarks = (landmarks, canvas) => {
    if (!landmarks) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up futuristic styling
    ctx.strokeStyle = '#00ff88';
    ctx.fillStyle = '#00ff88';
    ctx.lineWidth = 2;
    
    // Draw connecting lines between landmarks
    const positions = landmarks.positions;
    
    // Draw face outline
    ctx.beginPath();
    ctx.moveTo(positions[0].x, positions[0].y);
    for (let i = 1; i < 17; i++) {
      ctx.lineTo(positions[i].x, positions[i].y);
    }
    ctx.strokeStyle = '#00ffff';
    ctx.stroke();

    // Draw eyes
    const leftEye = positions.slice(36, 42);
    const rightEye = positions.slice(42, 48);

    ctx.beginPath();
    ctx.moveTo(leftEye[0].x, leftEye[0].y);
    leftEye.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.strokeStyle = '#ff00ff';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rightEye[0].x, rightEye[0].y);
    rightEye.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.stroke();

    // Draw nose
    const nose = positions.slice(27, 36);
    ctx.beginPath();
    ctx.moveTo(nose[0].x, nose[0].y);
    nose.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.strokeStyle = '#00ff88';
    ctx.stroke();

    // Draw mouth
    const mouth = positions.slice(48, 60);
    ctx.beginPath();
    ctx.moveTo(mouth[0].x, mouth[0].y);
    mouth.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.strokeStyle = '#ffff00';
    ctx.stroke();

    // Draw points
    positions.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });

    // Add scanning effect
    const scanLine = (Date.now() / 10) % canvas.height;
    const gradient = ctx.createLinearGradient(0, scanLine - 10, 0, scanLine);
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const assessFaceQuality = (detection, landmarks) => {
    if (!detection || !landmarks) return 0;

    // Get face dimensions
    const faceBox = detection.box;
    const faceWidth = faceBox.width;
    const faceHeight = faceBox.height;

    // More lenient center check (40% of frame instead of 20%)
    const videoWidth = videoRef.current.videoWidth;
    const videoHeight = videoRef.current.videoHeight;
    const faceCenterX = faceBox.x + faceWidth / 2;
    const faceCenterY = faceBox.y + faceHeight / 2;
    const isCentered = 
      Math.abs(faceCenterX - videoWidth / 2) < videoWidth * 0.4 &&
      Math.abs(faceCenterY - videoHeight / 2) < videoHeight * 0.4;

    // More lenient size check (10% to 80% of frame)
    const faceArea = faceWidth * faceHeight;
    const frameArea = videoWidth * videoHeight;
    const goodSize = faceArea > frameArea * 0.1 && faceArea < frameArea * 0.8;

    // More lenient angle check (30 degrees instead of 15)
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const eyeAngle = Math.abs(Math.atan2(
      rightEye[0].y - leftEye[0].y,
      rightEye[0].x - leftEye[0].x
    ) * (180 / Math.PI));
    const isStraight = eyeAngle < 30;

    // Simplified scoring
    let qualityScore = 0;
    if (isCentered) qualityScore += 50;  // More weight on just being visible
    if (goodSize) qualityScore += 30;
    if (isStraight) qualityScore += 20;  // Less weight on perfect alignment

    return qualityScore;
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const startProgressSimulation = () => {
    let currentProgress = 0;
    progressIntervalRef.current = setInterval(() => {
      currentProgress += 2;
      if (currentProgress <= 100) {
        setProgress(currentProgress);
        setMessage(`📸 Capturing face data... ${currentProgress}%`);
      } else {
        clearInterval(progressIntervalRef.current);
      }
    }, 50);
  };

  const isValidFacialStructure = (landmarks) => {
    if (!landmarks) return false;

    try {
      // Get key facial feature points
      const jawline = landmarks.getJawOutline();
      const nose = landmarks.getNose();
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const mouth = landmarks.getMouth();

      // Check if we have all required facial features
      if (!jawline.length || !nose.length || !leftEye.length || !rightEye.length || !mouth.length) {
        return false;
      }

      // Check if eyes are detected clearly
      const leftEyeCenter = leftEye[0];
      const rightEyeCenter = rightEye[0];
      if (!leftEyeCenter || !rightEyeCenter) {
        return false;
      }

      // Check if face is reasonably front-facing by comparing eye positions
      const eyeYDifference = Math.abs(leftEyeCenter.y - rightEyeCenter.y);
      const eyeXDistance = Math.abs(leftEyeCenter.x - rightEyeCenter.x);
      const maxYTilt = eyeXDistance * 0.3; // Allow for slight tilt
      
      if (eyeYDifference > maxYTilt) {
        return false; // Face is too tilted
      }

      // Check if nose is between eyes (face is front-facing)
      const noseTop = nose[0];
      const noseBridge = nose[1];
      if (!noseTop || !noseBridge) {
        return false;
      }

      const isFrontFacing = 
        noseTop.x > Math.min(leftEyeCenter.x, rightEyeCenter.x) &&
        noseTop.x < Math.max(leftEyeCenter.x, rightEyeCenter.x);
      
      if (!isFrontFacing) {
        return false; // Face is turned too much to the side
      }

      // Check if mouth is detected clearly
      const upperLip = mouth[0];
      const lowerLip = mouth[3];
      if (!upperLip || !lowerLip) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error validating facial structure:", error);
      return false;
    }
  };

  const detect = async () => {
    if (scanComplete) {
      stopCamera();
      return;
    }

    try {
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ 
          inputSize: 512, 
          scoreThreshold: 0.3
        }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        // Create canvas if it doesn't exist
        if (!canvasRef.current.firstChild) {
          const canvas = faceapi.createCanvasFromMedia(videoRef.current);
          canvasRef.current.appendChild(canvas);
          faceapi.matchDimensions(canvas, displaySizeRef.current);
        }

        // Create futuristic canvas if it doesn't exist
        if (!futuristicCanvasRef.current.firstChild) {
          const futuristicCanvas = document.createElement('canvas');
          futuristicCanvas.width = displaySizeRef.current.width;
          futuristicCanvas.height = displaySizeRef.current.height;
          futuristicCanvasRef.current.appendChild(futuristicCanvas);
        }

        const canvas = canvasRef.current.firstChild;
        const futuristicCanvas = futuristicCanvasRef.current.firstChild;

        const resizedDetections = faceapi.resizeResults(detections, displaySizeRef.current);
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

        setLandmarks(resizedDetections.landmarks);
        drawFuturisticLandmarks(resizedDetections.landmarks, futuristicCanvas);

        // Check for valid facial structure before completing scan
        if (!scanComplete && isValidFacialStructure(resizedDetections.landmarks)) {
          startProgressSimulation();
          setTimeout(() => {
            setScanComplete(true);
            setEmbeddings(detections.descriptor);
            setMessage("✅ Valid face scan completed!");
            setShowRegister(true);
            stopCamera();
            clearInterval(progressIntervalRef.current);
            setProgress(100);
          }, 2000);
          return;
        } else if (!scanComplete) {
          setMessage("📱 Align your face properly in the frame");
          requestAnimationFrame(detect);
        }
      } else if (!scanComplete) {
        setMessage("⚠️ No face detected");
        requestAnimationFrame(detect);
      }
    } catch (error) {
      console.error("❌ Error during face detection:", error);
      if (!scanComplete) {
        setMessage("⚠️ An error occurred. Please retry.");
      }
    }
  };

  const detectFaces = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    detect();
  };

  useEffect(() => {
    let modelLoaded = false;

    const loadModels = async () => {
      if (modelLoaded) return;
      
      try {
        setMessage("🔄 Loading face detection models...");
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
        await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
        modelLoaded = true;
        setMessage("✅ Starting camera...");
        startVideo();
      } catch (error) {
        console.error("❌ Error loading models:", error);
        setMessage("⚠️ Failed to load models. Check console.");
      }
    };

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener("loadedmetadata", () => {
            setIsLoading(false);
            detectFaces();
          });
        }
      } catch (error) {
        console.error("⚠️ Webcam access denied:", error);
        setMessage("⚠️ Please allow camera access and refresh.");
      }
    };

    loadModels();

    return () => {
      stopCamera();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handleRegister = async () => {
    if (!embeddings || embeddings.length === 0) {
      console.error("❌ No facial data found. Embeddings are missing.");
      setToastMessage("❌ No facial data found. Please retry.");
      return;
    }

    const userData = JSON.parse(localStorage.getItem("userData"));
    if (!userData) {
      console.error("❌ User data missing from localStorage.");
      setToastMessage("⚠️ User data not found. Please register again.");
      return;
    }

    const payload = {
      ...userData,
      facialEmbeddings: Array.from(embeddings),
    };

    console.log("📤 Sending Data to Backend:", payload);

    try {
      setMessage("🔄 Registering your account...");
      const response = await axios.post("http://localhost:3000/user/register", payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 201) {
        console.log("✅ User registered successfully!");
        setToastMessage("✅ Registration Successful!");
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        }
        toast.success("Registration Successful!", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
        setShowRegister(false);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("❌ Error sending data:", error.response?.data || error.message);
      setToastMessage("⚠️ Registration Failed. Try again.");
      toast.error("Registration failed. Please try again.", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const handleRetry = () => {
    setScanComplete(false);
    setShowRegister(false);
    setProgress(0);
    setMessage("📱 Position your face in the frame");
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        videoRef.current.srcObject = stream;
        detectFaces();
      })
      .catch(error => {
        console.error("⚠️ Webcam access denied:", error);
        setMessage("⚠️ Please allow camera access and refresh.");
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col justify-center items-center px-4">
      <div className="max-w-6xl w-full bg-gray-800 rounded-xl shadow-2xl p-8 space-y-6 border border-gray-700">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-blue-400">Biometric Registration</h2>
          <p className="text-gray-400 text-sm">
            {scanComplete ? "Face scan completed" : "Advanced facial recognition scan in progress"}
          </p>
        </div>

        <div className="relative">
          {/* Progress Bar */}
          <div className="absolute -top-2 left-0 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                scanComplete ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Split View Container */}
          <div className="flex gap-4 justify-center">
            {/* Video Container */}
            <div className={`relative w-[400px] h-[300px] rounded-lg overflow-hidden border-2 ${
              scanComplete ? 'border-green-500' : 'border-gray-700'
            } bg-gray-900`}>
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              <div ref={canvasRef} className="absolute top-0 left-0" />
            </div>

            {/* Futuristic Visualization */}
            <div className={`relative w-[400px] h-[300px] rounded-lg overflow-hidden border-2 ${
              scanComplete ? 'border-green-500' : 'border-gray-700'
            } bg-gray-900`}>
              <div ref={futuristicCanvasRef} className="absolute top-0 left-0" />
              <div className={`absolute top-2 left-2 text-xs ${
                scanComplete ? 'bg-green-900 text-green-400' : 'bg-gray-900 text-cyan-400'
              } bg-opacity-75 px-2 py-1 rounded`}>
                {scanComplete ? 'Scan Complete' : 'Biometric Analysis'}
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className={`p-4 rounded-lg text-center transition-all duration-300 ${
          scanComplete ? "bg-green-900 text-green-400" :
          message.includes("⚠️") ? "bg-yellow-900 text-yellow-400" :
          "bg-blue-900 text-blue-400"
        }`}>
          <p className="text-sm font-medium">{message}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          {showRegister && (
            <>
              <button
                onClick={handleRetry}
                className="px-6 py-3 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
              >
                Retry Scan
              </button>
              <button
                onClick={handleRegister}
                className={`px-6 py-3 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                  scanComplete 
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-green-500'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:ring-blue-500'
                }`}
              >
                Complete Registration
              </button>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="text-center text-xs text-gray-400">
          {!scanComplete && (
            <>
              <p>Ensure optimal lighting conditions and maintain a steady position</p>
              <p>System will automatically detect and analyze facial features</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GetFacialData;