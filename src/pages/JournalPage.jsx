import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDataItem, updateDataItem } from '../utils/dataFoundationApi';
import { useParticipant } from '../contexts/ParticipantContext';
import './JournalPage.css';

const JournalPage = () => {
  const navigate = useNavigate();
  const { participantId, isLoading: participantLoading } = useParticipant();
  const [dfLoading, setDfLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [journalData, setJournalData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Set dfLoading to false when participant is loaded
  useEffect(() => {
    if (!participantLoading) {
      setDfLoading(false);
    }
  }, [participantLoading]);

  // Set today's date as default when component mounts
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, []);

  // Fetch data when date changes
  useEffect(() => {
    if (selectedDate && !dfLoading) {
      fetchDataForDate();
    }
  }, [selectedDate, dfLoading]);

  const fetchDataForDate = async () => {
    if (!selectedDate) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const data = await getDataItem(participantId || 'unknown_participant');
      
      if (data && data[selectedDate]) {
        setJournalData(data[selectedDate]);
        setEditedData(JSON.parse(JSON.stringify(data[selectedDate]))); // Deep copy
        setMessage('');
      } else {
        setJournalData(null);
        setEditedData({});
        setMessage('You did not have any entry for this day.');
      }
    } catch (error) {
      setJournalData(null);
      setEditedData({});
      if (error.message.includes('404')) {
        setMessage('You did not have any entry for this day.');
      } else {
        setMessage('Error loading data. Please try again.');
        console.error('Error fetching data:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditMeal = (mealType, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        [field]: value
      }
    }));
  };

  const handleEditAnswer = (mealType, questionKey, value) => {
    setEditedData(prev => ({
      ...prev,
      [mealType]: {
        ...prev[mealType],
        questions: {
          ...prev[mealType].questions,
          [questionKey]: {
            ...prev[mealType].questions[questionKey],
            answer: value
          }
        }
      }
    }));
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    
    try {
      // Get current data and update the selected date
      const currentData = await getDataItem(participantId || 'unknown_participant');
      const updatedData = {
        ...currentData,
        [selectedDate]: editedData
      };
      
      await updateDataItem(updatedData, participantId || 'unknown_participant');
      setJournalData(editedData);
      setEditMode(false);
      setMessage('Changes saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving changes:', error);
      setMessage('Error saving changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="mobile-container">
      {/* Header */}
      <header className="header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h1>Journal</h1>
        <p className="subtitle">View and edit your meal entries</p>
      </header>

      {/* Date Picker */}
      <div className="date-picker-section">
        <label htmlFor="date-picker">Select Date:</label>
        <input 
          id="date-picker"
          type="date" 
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]} // Can't select future dates
        />
        {selectedDate && (
          <p className="selected-date">{formatDate(selectedDate)}</p>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-section">
          <p>Loading...</p>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`message ${message.includes('Error') || message.includes('did not have') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {/* Journal Data Display */}
      {journalData && !loading && (
        <div className="journal-content">
          <div className="edit-controls">
            {!editMode && (
              <button 
                className="btn btn-primary"
                onClick={() => setEditMode(true)}
              >
                Edit Entries
              </button>
            )}
          </div>

          {Object.entries(editMode ? editedData : journalData).map(([mealType, mealData]) => (
            <div key={mealType} className="meal-entry">
              <h3 className="meal-title">{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h3>
              
              {/* Food Information */}
              <div className="food-section">
                <label>Food:</label>
                {editMode ? (
                  <textarea
                    value={editedData[mealType]?.food || ''}
                    onChange={(e) => handleEditMeal(mealType, 'food', e.target.value)}
                    rows="3"
                  />
                ) : (
                  <p className="food-text">{mealData.food}</p>
                )}
              </div>

              {/* Questions */}
              {mealData.questions && Object.keys(mealData.questions).length > 0 && (
                <div className="questions-section">
                  <h4>Context Questions:</h4>
                  {Object.entries(mealData.questions).map(([questionKey, questionData]) => (
                    <div key={questionKey} className="question-item">
                      <div className="question-text">
                        <strong>Q:</strong>
                        <span> {questionData.question}</span>
                      </div>
                      <div className="answer-text">
                        <strong>A:</strong>
                        {editMode ? (
                          <input
                            type="text"
                            value={editedData[mealType]?.questions[questionKey]?.answer || ''}
                            onChange={(e) => handleEditAnswer(mealType, questionKey, e.target.value)}
                          />
                        ) : (
                          <span> {questionData.answer}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Edit Mode Controls */}
          {editMode && (
            <div className="edit-actions">
              <button 
                className="btn btn-outline"
                onClick={() => {
                  setEditMode(false);
                  setEditedData(JSON.parse(JSON.stringify(journalData))); // Reset changes
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleSaveChanges}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Confirm Changes'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JournalPage;