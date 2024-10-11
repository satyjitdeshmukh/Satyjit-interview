import React, { useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Webcam from 'react-webcam';
import './Loader.css'; // Custom CSS for loader animation and overall layout

const { GoogleGenerativeAI } = require('@google/generative-ai');

function Quiz() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [waiting, setWaiting] = useState<boolean>(false);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const { transcript, resetTranscript, listening } = useSpeechRecognition();

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const questions = [
    "What is the capital of France?",
    "Who wrote 'Hamlet'?",
    "What is the chemical symbol for water?",
    "Who is the CEO of Tesla?",
    "What is the largest planet in our solar system?"
  ];

  const checkAnswer = async (answer: string) => {
    setLoading(true);
    setWaiting(true);
    try {
      const genAI = new GoogleGenerativeAI('AIzaSyCTA6MXE7vFdAX5583a9y5aWxB1nkSwn-8');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `User's answer: ${answer}. [//Is this answer correct for the question "${questions[currentQuestionIndex]}"?]`;

      const result = await model.generateContent(prompt);
      const evaluation = await result.response.text();

      setTimeout(() => {
        setFeedback(evaluation);
        setWaiting(false);
      }, 5000); // Show feedback after 5 seconds
    } catch (error) {
      console.error('Error checking the answer:', error);
      setFeedback('Error checking the answer. Please try again.');
      setWaiting(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    checkAnswer(userAnswer);
  };

  const handleVoiceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (transcript) {
      checkAnswer(transcript);
    }
  };

  const handleStartListening = () => {
    SpeechRecognition.startListening({ continuous: true });
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
  };

  const handleNextQuestion = () => {
    setFeedback(''); // Clear feedback
    resetTranscript(); // Reset transcript
    setUserAnswer(''); // Reset user input
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1); // Move to the next question
  };

  return (
    <div className="quiz-container">
      <div className="quiz-content">
        <h2 className="quiz-question">
          Q{currentQuestionIndex + 1}: {questions[currentQuestionIndex]}
        </h2>

        {currentQuestionIndex < questions.length ? (
          <>
            <form onSubmit={handleSubmit} className="input-form">
              <label htmlFor="answerInput" className="input-label">Your Answer:</label>
              <input
                type="text"
                id="answerInput"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="answer-input"
              />
              <button type="submit" className="submit-btn">Submit Answer</button>
            </form>

            <form onSubmit={handleVoiceSubmit} className="voice-form">
              <button
                type="button"
                onClick={handleStartListening}
                className="voice-btn start"
              >
                Start Voice Input
              </button>
              <button
                type="button"
                onClick={handleStopListening}
                className="voice-btn stop"
              >
                Stop Voice Input
              </button>
              <button type="submit" className="submit-btn">Submit Voice Input</button>
            </form>

            <p className="transcript">Voice Input: {transcript}</p>
            {listening && <p className="listening-status">Listening...</p>}

            {waiting && (
              <div className="loader-container">
                <div className="loader"></div>
                <p>Please wait, generating feedback...</p>
              </div>
            )}

            {!waiting && feedback && (
              <p className="feedback">Feedback: {feedback}</p>
            )}

            {feedback && !loading && (
              <button onClick={handleNextQuestion} className="next-btn">
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </button>
            )}

            <div className="webcam-container">
              <Webcam audio={false} className="webcam" screenshotFormat="image/jpeg" />
            </div>
          </>
        ) : (
          <p>Quiz Complete! Thank you for participating.</p>
        )}
      </div>

      {/* Feedback Fullscreen Page */}
      {feedback && (
        <div className="feedback-page" style={{ display: feedback ? 'flex' : 'none', backgroundColor: '#fff', color: '#000', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
          <div className="feedback-text">
            <h1>{feedback}</h1>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quiz;
