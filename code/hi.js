// import React, { useState, useEffect, useRef, useCallback } from "react";
// import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
// import useClipboard from "react-use-clipboard";
// import styled from "styled-components";
// import Webcam from "react-webcam";
// import { MdCopyAll } from "react-icons/md";
// import { Loader } from "./Loader ";
// import * as faceapi from "face-api.js";
// import debounce from 'lodash.debounce';

// type QuestionType = {
//   question: string;
//   techStack: string;
// };

// export const Interview = () => {
//   const { transcript, browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition();
//   const [text, setText] = useState("");
//   const [isCopied, setCopied] = useClipboard(text);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [showFeed, setShowFeed] = useState<boolean>(false);
//   const [currentIndex, setCurrentIndex] = useState<number>(0);
//   const [feedBack, setFeedBack] = useState<string>("");
//   const videoRef = useRef<Webcam>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const { GoogleGenerativeAI } = require('@google/generative-ai');

//   const questions: QuestionType[] = [
//     // MERN Stack Questions
//     { question: "What is your experience with the MERN stack?", techStack: "Full Stack" },
//     { question: "How do you manage state in a React application?", techStack: "React" },
//     { question: "Explain the concept of middleware in Express.", techStack: "Node.js" },
//     { question: "What are the differences between SQL and NoSQL databases?", techStack: "Databases" },
//     { question: "How would you optimize a React application for performance?", techStack: "React" },

//     // Java Questions
//     { question: "What are the main principles of Object-Oriented Programming in Java?", techStack: "Java" },
//     { question: "How does Java manage memory?", techStack: "Java" },
//     { question: "What is the difference between an abstract class and an interface in Java?", techStack: "Java" },
//     { question: "Explain the concept of exception handling in Java.", techStack: "Java" },
//     { question: "What is the Java Virtual Machine (JVM)?", techStack: "Java" },

//     // Node.js Questions
//     { question: "What is Node.js and how does it work?", techStack: "Node.js" },
//     { question: "How do you handle asynchronous operations in Node.js?", techStack: "Node.js" },
//     { question: "What is the event loop in Node.js?", techStack: "Node.js" },
//     { question: "Explain the use of middleware in a Node.js application.", techStack: "Node.js" },
//     { question: "What are the advantages of using Node.js for backend development?", techStack: "Node.js" },
//   ];

//   useEffect(() => {
//     const loadModels = async () => {
//       await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
//       await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
//       await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
//       await faceapi.nets.faceExpressionNet.loadFromUri("/models");
//       console.log("Models Loaded");
//     };
//     loadModels();
//   }, []);

//   const handleExpressionDetection = useCallback(async () => {
//     if (videoRef.current && videoRef.current.video) {
//       const video = videoRef.current.video as HTMLVideoElement;
//       if (video.videoWidth && video.videoHeight) {
//         const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
//           .withFaceLandmarks()
//           .withFaceExpressions();
//         const canvas = canvasRef.current;
//         if (canvas) {
//           const { videoWidth: width, videoHeight: height } = video;
//           faceapi.matchDimensions(canvas, { width, height });
//           const context = canvas.getContext('2d');
//           if (context) context.clearRect(0, 0, width, height);
//           const resizedDetections = faceapi.resizeResults(detections, { width, height });
//           faceapi.draw.drawDetections(canvas, resizedDetections);
//           faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
//           faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
//         }
//       }
//     }
//   }, []);

//   const generateAnswerFeedback = async (answer: string) => {
//     setIsLoading(true);
//     setFeedBack("");
//     try {
//       const genAI = new GoogleGenerativeAI('AIzaSyCTA6MXE7vFdAX5583a9y5aWxB1nkSwn-8');
//       const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
//       const prompt = `User's answer: ${answer}. [//Is this answer correct for the question "${questions[currentIndex].question}"?]`;
  
//       const result = await model.generateContent(prompt);
//       const evaluation = await result.response.text();
  
//       setFeedBack(evaluation);
//     } catch (error) {
//       console.error("Error generating feedback:", error);
//       setFeedBack("An error occurred while generating feedback.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     const interval = setInterval(handleExpressionDetection, 1000);
//     return () => clearInterval(interval);
//   }, [handleExpressionDetection]);

//   const start = () => {
//     alert("Interview Started");
//     SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
//   };

//   const handleClear = () => {
//     resetTranscript();
//   };

//   const handleTurnoff = () => {
//     SpeechRecognition.abortListening();
//   };

//   const handleNextQuestion = () => {
//     setShowFeed(false);
//     resetTranscript();
//     setCurrentIndex((prev) => (prev === questions.length - 1 ? 0 : prev + 1));
//     window.speechSynthesis.cancel();
//   };

//   const handlePrevious = () => {
//     setShowFeed(false);
//     setCurrentIndex((prev) => (prev === 0 ? questions.length - 1 : prev - 1));
//     window.speechSynthesis.cancel();
//   };

//   const debouncedTranscript = useCallback(
//     debounce((newTranscript: string) => {
//       setText(newTranscript);
//     }, 500),
//     []
//   );

//   useEffect(() => {
//     debouncedTranscript(transcript);
//   }, [transcript, debouncedTranscript]);

//   // Function to convert feedback to voice
//   const speakFeedback = (feedbackText: string) => {
//     const synth = window.speechSynthesis;
//     const utterance = new SpeechSynthesisUtterance(feedbackText);
//     utterance.lang = "en-US";
//     synth.speak(utterance);
//   };

//   if (!browserSupportsSpeechRecognition) {
//     return null;
//   }

//   return (
//     <div>
//       <DIV>
//         {showFeed ? (
//           <div className="feedback-container">
//             <div className="feedback">
//               <div>
//                 <div className="student-answer">
//                   <h1 className="student-answer-heading">Your Answer</h1>
//                   <p>{transcript}</p>
//                 </div>
//               </div>
//               <div className="chat-feedback">
//                 {isLoading === false && (
//                   <p className="feedback-heading">Feedback</p>
//                 )}
//                 {isLoading ? (
//                   <div className="loader">
//                     <Loader />
//                   </div>
//                 ) : (
//                   <p className="feedback-text">{feedBack}</p>
//                 )}
//               </div>
//             </div>
//             {isLoading ? null : (
//               <div className="next-prev-container">
//                 <button
//                   disabled={isLoading}
//                   className="next-Question-btn"
//                   onClick={handlePrevious}
//                 >
//                   Previous Question
//                 </button>
//                 <button
//                   className="next-Question-btn"
//                   onClick={handleNextQuestion}
//                   disabled={isLoading}
//                 >
//                   Next Question
//                 </button>
//               </div>
//             )}
//             <div className="voice-btn-container">
//               <button
//                 className="btn voice"
//                 onClick={() => speakFeedback(feedBack)}
//               >
//                 Answer in Voice Format
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div>
//             <div className="question-and-cam-container">
//               <div className="question-container">
//                 <h1>Question {currentIndex + 1}</h1>
//                 <p className="question">
//                   {currentIndex + 1}.{" "}
//                   {questions.length !== 0 && questions[currentIndex].question}
//                 </p>
//               </div>
//               <div className="cam-container">
//                 <Webcam ref={videoRef} height="260px" />
//                 <canvas ref={canvasRef} className="appcanvas" />
//               </div>
//             </div>
//             <div
//               className="speech-text-container"
//               onClick={() => setText(transcript)}
//             >
//               {transcript ? (
//                 transcript
//               ) : (
//                 <h2 className="your_answer">
//                   Click on Start button and start speaking and submit your
//                   answer after completing...
//                 </h2>
//               )}
//             </div>
//             <div className="btn-container">
//               <button
//                 className="btn start"
//                 onClick={start}
//               >
//                 Start
//               </button>
//               <button
//                 className="btn clear"
//                 onClick={handleClear}
//               >
//                 Clear
//               </button>
//               <button
//                 className="btn stop"
//                 onClick={handleTurnoff}
//               >
//                 Stop
//               </button>
//               <button
//                 className="btn submit"
//                 onClick={() => {
//                   setShowFeed(true);
//                   generateAnswerFeedback(transcript);
//                 }}
//               >
//                 Submit
//               </button>
//               <button className="btn copy" onClick={setCopied}>
//                 <MdCopyAll />
//                 {isCopied ? "Copied!" : "Copy"}
//               </button>
//             </div>
//           </div>
//         )}
//       </DIV>
//     </div>
//   );
// };







// const DIV = styled.div`
//   .speech-text-container {
//     width: 90%;
//     height: 250px;
//     border: solid lightgray 1px;
//     border-radius: 5px;
//     margin: auto;
//     margin-top: 10px;
//     padding: 20px;
//     text-align: left;
//     font-size: large;
//   }

//   .feedback-container {
//     text-align: left;
//     margin: auto;
//     width: 90%;
//   }

//   .feedback {
//     border-radius: 5px;
//     border: solid lightgray 1px;
//     display: flex;
//   }

//   .feedback p {
//     padding: 10px;
//   }

//   .feedback-text {
//     color: red; /* Feedback will be displayed in red */
//   }

//   .student-answer-heading {
//     padding-top: 10px;
//     padding-left: 10px;
//     font-size: x-large;
//   }

//   .student-answer {
//     width: 50%;
//     height: 150px;
//     border-right: solid lightgray 1px;
//   }

//   .chat-feedback {
//     height: 150px;
//   }

//   .next-prev-container {
//     margin-top: 20px;
//     display: flex;
//     justify-content: space-between;
//   }

//   .next-Question-btn {
//     padding: 10px 20px;
//     background-color: #007bff;
//     color: white;
//     border: none;
//     border-radius: 5px;
//     cursor: pointer;
//   }

//   .next-Question-btn:disabled {
//     background-color: #ccc;
//   }

//   .btn-contianer {
//     display: flex;
//     justify-content: space-between;
//     margin-top: 20px;
//   }

//   .btn {
//     padding: 10px 20px;
//     background-color: #28a745;
//     color: white;
//     border: none;
//     border-radius: 5px;
//     cursor: pointer;
//   }

//   .btn.stop {
//     background-color: #dc3545;
//   }

//   .btn.copy {
//     background-color: #007bff;
//   }

//   .copy-icon {
//     margin-left: 5px;
//   }
// `;
