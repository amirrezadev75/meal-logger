import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { BsMic, BsCamera  } from 'react-icons/bs';
import { RiSendPlaneLine } from "react-icons/ri";
import SavedFoodModal from './SavedFoodModal';
import RecentFoodModal from './RecentFoodModal';
import { foundry } from '../../utils/aiFoundryLibrary';
import prompts from '../../config/prompts.json';
import useReloadProtection from '../../hooks/useReloadProtection';
import './Chat.css';

const Chat = () => {

  const { mealType } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get meal and date information
  const selectedDate = location.state?.selectedDate || new Date().toISOString().split('T')[0];
  const selectedMeal = mealType ? 
    decodeURIComponent(mealType.replace(/-/g, ' '))
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') 
    : null;

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

  // Validate meal type
  const validMeals = ['breakfast', 'lunch', 'dinner', 'snacks'];
  const isValidMeal = mealType && validMeals.includes(mealType.toLowerCase().replace(/-/g, '/'));

  useEffect(() => {
    if (!isValidMeal) {
      navigate('/');
    }
  }, [isValidMeal, navigate]);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'bot', 
      content: `Hello! You're logging your ${selectedMeal || 'meal'} for ${formatDate(selectedDate)}. Add what you ate using text, voice, or a photo.`, 
      timestamp: new Date() 
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [showSavedFood, setShowSavedFood] = useState(false);
  const [showRecentFood, setShowRecentFood] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmButtons, setShowConfirmButtons] = useState(false);
  const [currentFoodMode, setCurrentFoodMode] = useState(null); // 'saved', 'recent', or null
  const [aiMessagesHistory, setAiMessagesHistory] = useState([
    {
      role: "system",
      content: prompts.systemMessage
    }
  ]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Get API key from environment
  const apiKey = import.meta.env.VITE_AI_FOUNDRY_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Protect against page reload
  useReloadProtection();

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US'; // You can change this to other languages
      
      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        
        if (finalTranscript.trim()) {
          const voiceMessage = {
            id: Date.now(),
            type: 'user',
            content: finalTranscript.trim(),
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, voiceMessage]);
          
          // Process voice input with AI
          handleVoiceAI(finalTranscript.trim());
        }
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        let errorMessage = 'Speech recognition error. ';
        switch(event.error) {
          case 'network':
            errorMessage += 'Please check your internet connection.';
            break;
          case 'not-allowed':
            errorMessage += 'Please allow microphone access.';
            break;
          case 'no-speech':
            errorMessage += 'No speech detected. Try speaking again.';
            break;
          default:
            errorMessage += 'Please try again.';
        }
        alert(errorMessage);
      };
      
      recognitionInstance.onend = () => {
        setIsRecording(false);
      };
      
      setRecognition(recognitionInstance);
    }
  }, [messages.length]);

  // Handle AI response for voice input
  const handleVoiceAI = async (transcript) => {
    if (!apiKey || apiKey === 'df-your-api-key-here') {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Please set your AI Foundry API key in the .env file to use voice features.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    setIsLoading(true);
    
    try {
      // Add user message to AI history
      const updatedHistory = [...aiMessagesHistory, { role: "user", content: transcript }];
      setAiMessagesHistory(updatedHistory);
      
      const aiResponse = await foundry.textToText({
        api_token: apiKey,
        messages: updatedHistory,
        temperature: 0.7,
        max_tokens: 500,
        logging: false
      });

      if (aiResponse) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: aiResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        
        // Add bot response to AI history
        setAiMessagesHistory(prev => [...prev, { role: "assistant", content: aiResponse }]);
        
        // Show confirm buttons after any AI response
        if (!showConfirmButtons) {
          setShowConfirmButtons(true);
        }
      }
    } catch (error) {
      console.error('Voice AI response error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I had trouble processing your voice input. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    if (!apiKey || apiKey === 'df-your-api-key-here') {
      alert(prompts.errors.apiKeyMissing);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Add user message to AI history
    let updatedHistory = [...aiMessagesHistory, { role: "user", content: message }];
    
    // If we're in a special food mode, add the appropriate context
    if (currentFoodMode) {
      const specialPrompt = currentFoodMode === 'saved' ? prompts.savedFoodPrompt : prompts.recentFoodPrompt;
      updatedHistory = [
        ...aiMessagesHistory,
        { role: "user", content: message },
        { role: "system", content: specialPrompt }
      ];
    }
    
    setAiMessagesHistory(updatedHistory);
    
    setMessage('');
    setIsLoading(true);
    
    try {
      // Use foundry library for text-to-text with message history
      const aiResponse = await foundry.textToText({
        api_token: apiKey,
        messages: updatedHistory,
        temperature: 0.7,
        max_tokens: 500,
        logging: true
      });

      if (aiResponse) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: aiResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        
        // Add bot response to AI history
        setAiMessagesHistory(prev => [...prev, { role: "assistant", content: aiResponse }]);
        
        // Show confirm buttons after any AI response
        if (!showConfirmButtons) {
          setShowConfirmButtons(true);
        }
      }
    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || isLoading) return;

    if (!apiKey || apiKey === 'df-your-api-key-here') {
      alert(prompts.errors.apiKeyMissing);
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    const imageMessage = {
      id: Date.now(),
      type: 'user',
      content: 'I shared an image of my food.',
      image: imageUrl,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, imageMessage]);
    setIsLoading(true);
    
    try {
      // Use foundry library for image-to-text analysis with system prompt
      const prompt = prompts.systemMessage;
      
      const aiResponse = await foundry.imageToText({
        api_token: apiKey,
        prompt: prompt,
        image: file,
        temperature: 0.7,
        max_tokens: 500,
        logging: false
      });

      if (aiResponse) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: aiResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        
        // Add image analysis to AI history for context
        setAiMessagesHistory(prev => [
          ...prev,
          { role: "user", content: "I shared an image of my food." },
          { role: "assistant", content: aiResponse }
        ]);
        
        // Show confirm buttons after any AI response
        if (!showConfirmButtons) {
          setShowConfirmButtons(true);
        }
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I had trouble analyzing the image. Please try again or describe your food in text.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
    
    // Clear the file input
    e.target.value = '';
  };


  const handleVoiceStart = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    if (!isRecording) {
      try {
        setIsRecording(true);
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsRecording(false);
        alert('Error starting speech recognition. Please try again.');
      }
    }
  };

  const handleVoiceEnd = () => {
    if (recognition && isRecording) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  const handleVoiceCancel = () => {
    // Cancel recording if user drags away from button
    if (recognition && isRecording) {
      recognition.abort(); // Use abort instead of stop to cancel
      setIsRecording(false);
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleFoodSelection = async (foodItem, foodType) => {
    // Set the current food mode to continue using the special prompt
    setCurrentFoodMode(foodType);

    const foodMessage = {
      id: Date.now(),
      type: 'user',
      content: `I want to log: ${foodItem.description || foodItem.name}`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, foodMessage]);
    setShowSavedFood(false);
    setShowRecentFood(false);
    
    // Always show confirm buttons after food selection
    setShowConfirmButtons(true);
    
    // If no API key, just show the message and confirm buttons
    if (!apiKey || apiKey === 'df-your-api-key-here') {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Choose the appropriate prompt based on food type
      const specialPrompt = foodType === 'saved' ? prompts.savedFoodPrompt : prompts.recentFoodPrompt;
      
      // Create the message for AI with special context
      const contextMessage = `${specialPrompt} The food item is: ${foodItem.description || foodItem.name}`;
      
      // Update AI history with the food selection context
      const updatedHistory = [
        ...aiMessagesHistory,
        { role: "user", content: `I want to log: ${foodItem.description || foodItem.name}` },
        { role: "system", content: contextMessage }
      ];
      
      const aiResponse = await foundry.textToText({
        api_token: apiKey,
        messages: updatedHistory,
        temperature: 0.7,
        max_tokens: 500,
        logging: false
      });

      if (aiResponse) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: aiResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        
        // Add to AI history for context
        setAiMessagesHistory(prev => [
          ...prev,
          { role: "user", content: `I want to log: ${foodItem.description || foodItem.name}` },
          { role: "assistant", content: aiResponse }
        ]);
      }
    } catch (error) {
      console.error('Food selection AI response error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I had trouble processing your food selection. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmLog = async (shouldSaveFood = false) => {
    // Get the last AI message
    const lastAiMessage = messages.filter(msg => msg.type === 'bot').pop();
    
    
    // Navigate to extra information page (this is intended navigation, no protection needed)
    navigate('/extra-information', { 
      state: { 
        selectedDate, 
        selectedMeal,
        conversationHistory: messages,
        aiHistory: aiMessagesHistory,
        lastAiMessage: lastAiMessage,
        savedFood: shouldSaveFood
      } 
    });
  };

  return (
    <div className="mobile-container">
      {/* Header */}
      <header className="header">
        <h1>Chat with AI Nutritionist</h1>
        {selectedMeal && (
          <div className="meal-context">
            <p className="meal-info">
              <strong>{selectedMeal}</strong> - {formatDate(selectedDate)}
            </p>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="content">
        {/* Pre-chat buttons */}
        {messages.length === 1 && (
          <div className="button-group">
            <button 
              className="outline-btn" 
              onClick={() => setShowSavedFood(true)}
            >
              Saved Foods
            </button>
            <button 
              className="outline-btn" 
              onClick={() => setShowRecentFood(true)}
            >
              Recent Foods
            </button>
          </div>
        )}

        {/* Messages area */}
        <div className="messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.type}`}>
              <div className="message-bubble">
                {msg.image && (
                  <img src={msg.image} alt="Shared" className="message-image" />
                )}
                <p className="message-text">{msg.content}</p>
                <small className="message-time">{formatTime(msg.timestamp)}</small>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="message-bubble">
                <div className="loading-message">
                  <span>AI is thinking</span>
                  <div className="loading-dots">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {showConfirmButtons && (
            <div className="confirm-buttons">
              <button 
                className="btn btn-outline"
                onClick={() => handleConfirmLog(true)}
              >
                Confirm Log and Save Meal
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => handleConfirmLog(false)}
              >
                Confirm Log
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Bottom Input Section */}
      <section className="input-section">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder={isRecording ? "🎤 Recording... Release to send" : isLoading ? "AI is thinking..." : "Type your message or hold mic to record..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isRecording || isLoading}
          />
          <div className="icon-group">
            <BsMic 
              size={26} 
              className={`input-icon ${isRecording ? 'recording' : ''}`}
              onMouseDown={handleVoiceStart}
              onMouseUp={handleVoiceEnd}
              onMouseLeave={handleVoiceCancel}
              onTouchStart={(e) => {
                e.preventDefault();
                handleVoiceStart();
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleVoiceEnd();
              }}
              style={{
                backgroundColor: isRecording ? '#ff4444' : '',
                color: isRecording ? 'white' : '',
                borderRadius: '50%',
                padding: '10px',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                userSelect: 'none',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            />
            <BsCamera 
              size={26} 
              className="input-icon"
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '10px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: '50%',
                transition: 'all 0.2s ease'
              }}
            />
            <RiSendPlaneLine  
              size={26} 
              className="input-icon send-icon"
              onClick={handleSendMessage}
              style={{
                padding: '10px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isLoading || !message.trim() ? 'not-allowed' : 'pointer',
                borderRadius: '50%',
                transition: 'all 0.2s ease',
                backgroundColor: message.trim() ? '#007bff' : '#e0e0e0',
                color: message.trim() ? 'white' : '#999',
                opacity: isLoading ? 0.5 : 1
              }}
              disabled={isLoading || !message.trim()}
            />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </section>

      {/* Modals */}
      <SavedFoodModal
        show={showSavedFood}
        onHide={() => setShowSavedFood(false)}
        onFoodSelect={(foodItem) => handleFoodSelection(foodItem, 'saved')}
        mealType={mealType}
      />
      
      <RecentFoodModal
        show={showRecentFood}
        onHide={() => setShowRecentFood(false)}
        onFoodSelect={(foodItem) => handleFoodSelection(foodItem, 'recent')}
        mealType={mealType}
      />
    </div>
  );
};

export default Chat;