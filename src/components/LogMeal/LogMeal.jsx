import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Stack, Button, Form, Alert } from 'react-bootstrap';
import { BsChevronRight } from 'react-icons/bs';
import './LogMeal.css';

const LogMeal = () => {
  const navigate = useNavigate();
  const [selectedMeal, setSelectedMeal] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [showError, setShowError] = useState(false);
  const mealOptions = ["Breakfast", "Lunch", "Dinner", "Snack/Drink"];

  const handleMealSelect = (mealType) => {
    setSelectedMeal(mealType);
    setShowError(false); // Clear error when meal is selected
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setShowError(false); // Clear error when date is selected
  };

  // Get today's date in YYYY-MM-DD format for input max
  const getTodayForInput = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleProceed = () => {
    if (!selectedMeal || !selectedDate) {
      setShowError(true);
      return;
    }

    // Encode meal type for URL
    const encodedMealType = encodeURIComponent(selectedMeal.toLowerCase().replace(/\s+/g, '-'));
    navigate(`/mealdetails/${encodedMealType}`, {
      state: {
        selectedMeal,
        selectedDate
      }
    });
  };

  return (
    <div className="meal-page-layout">
      <Container className="pt-5">
        <h2 className="text-center page-title">Log a meal</h2>
        
        {/* Date Picker Section */}
        <div className="date-section mb-4">
          <Form.Group>
            <Form.Label className="date-label">Select Date *</Form.Label>
            <Form.Control
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="date-picker"
              max={getTodayForInput()} // Prevent future dates
            />
          </Form.Group>
        </div>

        {/* Error Alert */}
        {showError && (
          <Alert variant="danger" className="mb-4">
            Please select both a meal type and date to proceed.
          </Alert>
        )}
        
        {/* Meal Selection */}
        <div className="meal-selection-section mb-4">
          <Form.Label className="meal-label">Select Meal Type *</Form.Label>
          <Stack gap={3} className="mx-auto meal-stack">
            {mealOptions.map((item) => (
              <Button 
                key={item} 
                className={`meal-select-btn ${selectedMeal === item ? 'selected' : ''}`}
                onClick={() => handleMealSelect(item)}
                variant="outline-secondary"
              >
                <span>{item}</span>
                <BsChevronRight className="arrow-icon" size={20} />
              </Button>
            ))}
          </Stack>
        </div>

        {/* Proceed Button */}
        <div className="proceed-section">
          <Button 
            className="proceed-btn w-100" 
            onClick={handleProceed}
            disabled={!selectedMeal || !selectedDate}
            variant="primary"
            size="lg"
          >
            Proceed to Log Meal
          </Button>
        </div>
      </Container>
    </div>
  );
};

export default LogMeal;