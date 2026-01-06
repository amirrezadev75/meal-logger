import React, { useState } from 'react';
import { Modal, Button, Row, Col, Card, Form, InputGroup, Badge } from 'react-bootstrap';
import { BsSearch, BsClock, BsBookmark, BsX } from 'react-icons/bs';
import './RecentFoodModal.css';

const RecentFoodModal = ({ show, onHide, onFoodSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock recent food data
  const [recentFoods] = useState([
    {
      id: 1,
      name: 'Chicken Caesar Salad',
      description: 'Fresh romaine lettuce with grilled chicken, parmesan, and caesar dressing.'
    },
    {
      id: 2,
      name: 'Oatmeal with Blueberries',
      description: 'Steel-cut oats topped with fresh blueberries and a drizzle of honey.'
    },
    {
      id: 3,
      name: 'Turkey Sandwich',
      description: 'Whole grain bread with sliced turkey, lettuce, tomato, and mustard.'
    },
    {
      id: 4,
      name: 'Green Smoothie',
      description: 'Spinach, banana, protein powder, almond milk, and chia seeds.'
    },
    {
      id: 5,
      name: 'Grilled Salmon',
      description: 'Atlantic salmon grilled with herbs and served with steamed vegetables.'
    },
    {
      id: 6,
      name: 'Protein Bar',
      description: 'Chocolate peanut butter protein bar with natural ingredients.'
    }
  ]);

  const filteredFoods = recentFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFoodClick = (food) => {
    onFoodSelect(food);
  };

  const handleSaveFood = (food, e) => {
    e.stopPropagation();
    // Handle save functionality here
    console.log('Save food to favorites:', food.id);
    // You could show a toast notification here
  };

  const getMealBadgeColor = (meal) => {
    switch (meal.toLowerCase()) {
      case 'breakfast': return 'warning';
      case 'lunch': return 'success';
      case 'dinner': return 'info';
      case 'snack': return 'secondary';
      default: return 'light';
    }
  };

  return (
    <>
      {show && (
        <div className="food-modal-overlay">
          <div className="mobile-container">
            {/* Header */}
            <header className="header">
              <div className="d-flex justify-content-between align-items-center">
                <h1 className="d-flex align-items-center gap-2">
                  <BsClock color="#88b083" /> Recent Foods
                </h1>
                <Button variant="outline-secondary" onClick={onHide} className="close-btn">
                  <BsX size={24} />
                </Button>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="content">
              {/* Search Bar */}
              <div className="search-section">
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search recent foods..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="icon-group">
                    <BsSearch size={24} color="#88b083" />
                  </div>
                </div>
              </div>

              {/* Food List */}
              <div className="food-list">
                {filteredFoods.map((food) => (
                  <div 
                    key={food.id}
                    className="food-item-card" 
                    onClick={() => handleFoodClick(food)}
                  >
                    <div className="food-item-info">
                      <div className="food-item-header">
                        <span className="food-id">#{food.id}</span>
                        <h3 className="food-item-title">{food.name}</h3>
                      </div>
                      <p className="food-item-description">{food.description}</p>
                    </div>
                    <button
                      className="save-food-btn"
                      onClick={(e) => handleSaveFood(food, e)}
                      title="Save to favorites"
                    >
                      <BsBookmark />
                    </button>
                  </div>
                ))}
              </div>

              {filteredFoods.length === 0 && (
                <div className="empty-state">
                  <BsClock size={48} className="empty-icon" />
                  <p className="empty-title">No recent foods found</p>
                  {searchTerm && <p className="empty-subtitle">Try a different search term</p>}
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </>
  );
};

export default RecentFoodModal;