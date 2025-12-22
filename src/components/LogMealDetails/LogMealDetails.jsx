import React from 'react';
import { Container, Button, InputGroup, Form } from 'react-bootstrap';
import { FaMicrophone, FaCamera } from 'react-icons/fa';
import './LogMealDetails.css';

const LogMealDetails = () => {
  return (
    <div className="meal-details-layout">
      <Container className="pt-5 px-4">
        <h2 className="page-title mb-5">Log your meal</h2>

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