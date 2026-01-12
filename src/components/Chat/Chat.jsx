import React, { useState, useRef, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { BsMic, BsCamera } from 'react-icons/bs';
import SavedFoodModal from './SavedFoodModal';
import RecentFoodModal from './RecentFoodModal';
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
  const validMeals = ['breakfast', 'lunch', 'dinner', 'snack/drink'];
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
      content: `Hello! I'm here to help you log your ${selectedMeal?.toLowerCase() || 'meal'} for ${formatDate(selectedDate)}. Please tell me what you ate or ask any nutrition questions you have!`, 
      timestamp: new Date() 
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [showSavedFood, setShowSavedFood] = useState(false);
  const [showRecentFood, setShowRecentFood] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
            id: messages.length + 1,
            type: 'user',
            content: finalTranscript.trim(),
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, voiceMessage]);
          
          // Simulate bot response to voice
          setTimeout(() => {
            const botResponse = {
              id: messages.length + 2,
              type: 'bot',
              content: `I heard you say: "${finalTranscript.trim()}". Let me help you with that!`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, botResponse]);
          }, 1000);
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

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        content: message,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      // Simulate bot response
      setTimeout(() => {
        const botResponse = {
          id: messages.length + 2,
          type: 'bot',
          content: 'Thanks for your message! I\'m processing your request...',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageMessage = {
        id: messages.length + 1,
        type: 'user',
        content: `[Image: ${file.name}]`,
        image: URL.createObjectURL(file),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, imageMessage]);
      
      // Simulate bot response to image
      setTimeout(() => {
        const botResponse = {
          id: messages.length + 2,
          type: 'bot',
          content: 'I can see the image you shared! Let me analyze it for you...',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
      }, 1000);
    }
  };

  const startRecording = async () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    try {
      setIsRecording(true);
      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsRecording(false);
      alert('Error starting speech recognition. Please try again.');
    }
  };

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
      setIsRecording(false);
    }
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

  const handleFoodSelection = (foodItem) => {
    const foodMessage = {
      id: messages.length + 1,
      type: 'user',
      content: `Tell me about: ${foodItem.name}`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, foodMessage]);
    setShowSavedFood(false);
    setShowRecentFood(false);
    
    // Simulate bot response about the food
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        type: 'bot',
        content: `Here's information about ${foodItem.name}: ${foodItem.description || 'This is a nutritious food choice with great health benefits.'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
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
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Bottom Input Section */}
      <section className="input-section">
        <div className="search-bar">
          <input 
            type="text" 
            placeholder={isRecording ? "🎤 Recording... Release to send" : "Type your message or hold mic to record..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isRecording}
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
        onFoodSelect={handleFoodSelection}
      />
      
      <RecentFoodModal
        show={showRecentFood}
        onHide={() => setShowRecentFood(false)}
        onFoodSelect={handleFoodSelection}
      />
    </div>
  );
};

export default Chat;