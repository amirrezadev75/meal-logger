import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ExtraInformation.css';
import questionsConfig from '../config/extraInfoQuestions.json';
import { saveMealData, getDataItem, updateDataItem, createDataItem } from '../utils/dataFoundationApi';

const ExtraInformation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { selectedDate, selectedMeal, conversationHistory, aiHistory } = location.state || {};

  // State management for the flow
  const [currentStep, setCurrentStep] = useState('initial'); // 'initial', 'questions', 'details'
  const [participantId, setParticipantId] = useState('4233'); // Development default
  const [dfLoading, setDfLoading] = useState(true);
  const [wantsToProvideInfo, setWantsToProvideInfo] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [additionalNotes, setAdditionalNotes] = useState('');

  const questions = questionsConfig.questions;

  // Load DataFoundation script and get participant ID
  // Load DataFoundation script and get participant ID
  useEffect(() => {
    // Check if DF is already available
    if (window.DF && window.DF.participant) {
      setParticipantId(window.DF.participant.id);
      setDfLoading(false);
      return;
    }

    // Try to load the DataFoundation script
    const script = document.createElement('script');
    script.src = '/api/v1/participation.js';
    script.type = 'text/javascript';
    
    script.onload = () => {
      // Wait a bit for DF to initialize
      setTimeout(() => {
        if (window.DF && window.DF.participant) {
          setParticipantId(window.DF.participant.id);
          console.log('DataFoundation participant ID found:', window.DF.participant.id);
        } else {
          console.log('DataFoundation script loaded but participant ID not found');
        }
        setDfLoading(false);
      }, 100);
    };

    script.onerror = () => {
      console.log('DataFoundation script not available - using development participant ID');
      setDfLoading(false);
    };

    document.head.appendChild(script);

    // Cleanup
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Format date for European display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleInitialResponse = (wantsInfo) => {
    setWantsToProvideInfo(wantsInfo);
    if (wantsInfo) {
      setCurrentStep('questions');
    } else {
      // Send to backend directly
      handleSaveAndFinish();
    }
  };

  const handleQuestionResponse = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
  };

  const handleBackToChat = () => {
    navigate(-1);
  };

  const handleSaveAndFinish = async () => {
    try {
      // Extract food information from conversation history
      const foodInfo = conversationHistory?.length > 0 
        ? conversationHistory[conversationHistory.length - 1]?.content || "Food logged"
        : "Food logged";

      // Structure questions with both question and answer
      const questionsData = {};
      
      Object.keys(answers).forEach((questionId, index) => {
        const question = questions.find(q => q.id === questionId);
        const questionKey = `q${index + 1}`;
        questionsData[questionKey] = {
          question: question?.question || questionId,
          answer: answers[questionId]
        };
      });

      // Add additional notes if provided
      if (additionalNotes.trim()) {
        questionsData[`q${Object.keys(questionsData).length + 1}`] = {
          question: "Additional Notes",
          answer: additionalNotes
        };
      }

      // Structure data according to required format
      const mealData = {
        [selectedDate]: {
          [selectedMeal.toLowerCase()]: {
            food: foodInfo,
            questions: questionsData
          }
        }
      };

      console.log('Saving meal data:', mealData);

      // First, try to get existing data
      try {
        const existingData = await getDataItem(participantId || 'unknown_participant');
        console.log('Existing data found, merging with new data:', existingData);
        
        // Merge new meal data with existing data
        const mergedData = { ...existingData };
        
        // If the date already exists, merge the meal data
        if (mergedData[selectedDate]) {
          mergedData[selectedDate] = {
            ...mergedData[selectedDate],
            [selectedMeal.toLowerCase()]: {
              food: foodInfo,
              questions: questionsData
            }
          };
        } else {
          // Date doesn't exist, add the entire date object
          mergedData[selectedDate] = {
            [selectedMeal.toLowerCase()]: {
              food: foodInfo,
              questions: questionsData
            }
          };
        }
        
        // Data exists, so update it with merged data
        const data = await updateDataItem(mergedData, participantId || 'unknown_participant');
        console.log('Data updated successfully:', data);
      } catch (error) {
        // Check if it's a 404 error (data doesn't exist)
        if (error.message.includes('404')) {
          console.log('No existing data found, creating new entry');
          // Data doesn't exist, create new
          const data = await createDataItem(mealData, participantId || 'unknown_participant');
          console.log('Data created successfully:', data);
        } else {
          // Some other error occurred
          throw error;
        }
      }
      
      // Navigate back to home or meal logging page
      navigate('/');
    } catch (error) {
      console.error('Error saving meal data:', error);
      // You might want to show an error message to the user
      alert('Failed to save meal data. Please try again.');
    }
  };

  return (
    <div className="mobile-container">
      {/* Header */}
      <header className="header">
        <h1>Extra Information</h1>
        <p className="subtitle">Optional questions about the context of your meal.</p>
        {selectedMeal && (
          <div className="meal-context">
            <p className="meal-info">
              <strong>{selectedMeal}</strong> - {formatDate(selectedDate)}
            </p>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="content">
        <div className="extra-info-container">
          {currentStep === 'initial' && (
            <div className="question-section">
              <h2>Do you have time to provide some information about the context of your meal?</h2>
              <div className="button-group">
                <button 
                  className="btn btn-primary"
                  onClick={() => handleInitialResponse(true)}
                >
                  Yes
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => handleInitialResponse(false)}
                >
                  No
                </button>
              </div>
            </div>
          )}

          {currentStep === 'questions' && (
            <div className="questions-flow">
              {questions.map((question, index) => (
                <div key={question.id} className="question-section">
                  <h2>{question.question}</h2>
                  <div className="button-group">
                    {question.options.map((option) => (
                      <button 
                        key={option.value}
                        className={`btn ${answers[question.id] === option.value ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleQuestionResponse(question.id, option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentStep === 'details' && (
            <div className="details-section">
              <h2>Add details</h2>
              <div className="form-section">
                <label>Additional Notes:</label>
                <textarea 
                  placeholder="Any additional details about your meal..."
                  rows="4"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Buttons */}
      <footer className="footer-buttons">
        {currentStep === 'questions' && (
          <button 
            className="btn btn-outline"
            onClick={handleBackToChat}
          >
            Back to Chat
          </button>
        )}
        {currentStep === 'questions' && Object.keys(answers).length === questions.length && (
          <button 
            className="btn btn-primary"
            onClick={handleSaveAndFinish}
            disabled={dfLoading}
          >
            {dfLoading ? 'Loading...' : 'Confirm Log'}
          </button>
        )}
        {currentStep === 'details' && (
          <>
            <button 
              className="btn btn-outline"
              onClick={handleBackToChat}
            >
              Back to Chat
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSaveAndFinish}
              disabled={dfLoading}
            >
              {dfLoading ? 'Loading...' : 'Confirm Log'}
            </button>
          </>
        )}
      </footer>
    </div>
  );
};

export default ExtraInformation;