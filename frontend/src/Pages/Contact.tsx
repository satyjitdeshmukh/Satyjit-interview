import React, { useState, useEffect } from 'react';

type AnswersType = {
  [key: string]: string;
};

export const Contact = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswersType>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  const questions = [
    "Can you tell me about yourself?",
    "What are your strengths and weaknesses?",
    "Why do you want to work with us?",
    "Describe a difficult work situation and how you overcame it.",
    "Where do you see yourself in five years?"
  ];

  useEffect(() => {
    if ('SpeechRecognition' in window) {
      const rec = new (window as any).SpeechRecognition();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.onresult = (event: SpeechRecognitionEvent) => {
        if (event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          setAnswers(prevAnswers => ({
            ...prevAnswers,
            [`answer${step}`]: transcript
          }));
        }
      };
      rec.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error', event.error);
        setFeedback('An error occurred while recognizing speech.');
      };
      setRecognition(rec);
    } else {
      console.warn('Speech recognition is not supported in this browser.');
    }
  }, [step]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAnswers({ ...answers, [`answer${step}`]: e.target.value });
  };

  const fetchFeedback = async (userAnswer: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://api.gemini.com/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'AIzaSyCTA6MXE7vFdAX5583a9y5aWxB1nkSwn-8', // Replace with your actual API key
        },
        body: JSON.stringify({ answer: userAnswer }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
      } else {
        const errorText = await response.text(); // Capture the response error text
        console.error('Failed to fetch feedback:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        setFeedback('Failed to fetch feedback. Please try again.'); // Generic error message for the user
      }
    } catch (error: any) {
      console.error('An error occurred while fetching feedback:', {
        message: error.message,
        stack: error.stack
      });
      setFeedback('Failed to fetch feedback. Please try again.'); // Generic error message for the user
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (answers[`answer${step}`]?.trim()) {
      await fetchFeedback(answers[`answer${step}`]);
    } else {
      alert('Please provide an answer before proceeding.');
    }
  };

  const handleContinue = () => {
    setFeedback(null);
    setStep(step + 1);
  };

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const generateContent = async (prompt: string) => {
    try {
      const response = await fetch('https://api.gemini.com/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'AIzaSyCTA6MXE7vFdAX5583a9y5aWxB1nkSwn-8', // Replace with your actual API key
        },
        body: JSON.stringify({ prompt }),
      });
      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data.content);
      } else {
        const errorText = await response.text();
        console.error('Failed to generate content:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
      }
    } catch (error) {
      console.error('Error generating content:', error);
    }
  };

  const handleGenerate = () => {
    const prompt = answers[`answer${step}`] || '';
    if (prompt.trim()) {
      generateContent(prompt);
    } else {
      alert('Please provide an answer to generate content.');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>Contact</h2>
      {step < questions.length && (
        <div>
          <p>{questions[step]}</p>
          <textarea
            style={{ width: '100%', height: '100px', marginBottom: '10px', padding: '10px' }}
            value={answers[`answer${step}`] || ''}
            onChange={handleInputChange}
          />
          <button onClick={handleNext} disabled={loading}>
            {loading ? 'Fetching feedback...' : 'Submit Answer'}
          </button>
          {isListening ? (
            <button onClick={stopListening}>Stop Listening</button>
          ) : (
            <button onClick={startListening}>Start Listening</button>
          )}
          {feedback && (
            <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc', backgroundColor: '#f9f9f9' }}>
              <p><strong>Feedback:</strong> {feedback}</p>
              <button onClick={handleContinue}>Continue</button>
            </div>
          )}
          <button onClick={handleGenerate}>
            Generate Content
          </button>
          {generatedContent && (
            <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc', backgroundColor: '#f9f9f9' }}>
              <p><strong>Generated Content:</strong> {generatedContent}</p>
            </div>
          )}
        </div>
      )}
      {step === questions.length && (
        <div>
          <h3>Thank you for answering all the questions!</h3>
          <p>Your responses:</p>
          <ul>
            {questions.map((question, index) => (
              <li key={index}>
                <strong>{question}</strong>
                <p>{answers[`answer${index}`]}</p>
              </li>
            ))}
          </ul>
          {generatedContent && (
            <div>
              <h3>About the Generated Content</h3>
              <p>{generatedContent}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
