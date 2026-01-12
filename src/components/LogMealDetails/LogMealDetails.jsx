import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Container, Button, InputGroup, Form } from 'react-bootstrap';
import { FaMicrophone, FaCamera } from 'react-icons/fa';
import './LogMealDetails.css';

const LogMealDetails = () => {
  const { mealType } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get date from navigation state, fallback to today's date
  const selectedDate = location.state?.selectedDate || new Date().toISOString().split('T')[0];
  
  // Decode and format meal type from URL
  const selectedMeal = mealType ? 
    decodeURIComponent(mealType.replace(/-/g, ' '))
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') 
    : null;

  // Valid meal options for validation
  const validMeals = ['breakfast', 'lunch', 'dinner', 'snack/drink'];
  const isValidMeal = mealType && validMeals.includes(mealType.toLowerCase().replace(/-/g, '/'));

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

  // Get short European date format (DD/MM/YYYY)
  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // If invalid meal type, redirect back to meal selection
  React.useEffect(() => {
    if (!isValidMeal) {
      navigate('/');
    }
  }, [isValidMeal, navigate]);

  if (!isValidMeal) {
    return null;
  }

  return (
    <div className="meal-details-layout">
      <Container className="pt-5 px-4">
        <h2 className="page-title mb-3">Log your {selectedMeal.toLowerCase()}</h2>
        <p className="text-muted mb-4">
          <strong>{selectedMeal}</strong> - {formatDate(selectedDate)}
        </p>

        {/* Top Buttons: Saved and Recent with new green borders */}
        <div className="top-toggle-container mb-5">
          <Button variant="outline-success" className="toggle-btn-rounded">
            Saved Foods
          </Button>
          <Button variant="outline-success" className="toggle-btn-rounded">
            Recent Foods
          </Button>
        </div>

        {/* New Consolidated Input Bar */}
        <div className="input-section mt-auto">
          <InputGroup className="custom-input-group">
            <Form.Control
              placeholder="Type"
              aria-label="Meal input"
              className="border-0 shadow-none bg-transparent py-3"
            />
            <InputGroup.Text className="bg-transparent border-0 pe-3">
              <FaMicrophone className="input-icon me-3" />
              <FaCamera className="input-icon" />
            </InputGroup.Text>
          </InputGroup>
        </div>
      </Container>
    </div>
  );
};

export default LogMealDetails;