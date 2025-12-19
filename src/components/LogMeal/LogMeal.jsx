import React from 'react';
import { Container, Stack, Button } from 'react-bootstrap';
import { BsChevronRight } from 'react-icons/bs';
import BottomNav from '../BottomNav/BottomNav';
import './LogMeal.css';

const LogMeal = () => {
  const mealOptions = ["Breakfast", "Lunch", "Dinner", "Snack/Drink"];

  return (
    <div className="meal-page-layout">
      <Container className="pt-5">
        <h2 className="text-center page-title">Log a meal</h2>
        
        <Stack gap={3} className="mx-auto meal-stack">
          {mealOptions.map((item) => (
            <Button key={item} className="meal-select-btn">
              <span>{item}</span>
              <BsChevronRight className="arrow-icon" size={20} />
            </Button>
          ))}
        </Stack>
      </Container>
    </div>
  );
};

export default LogMeal;