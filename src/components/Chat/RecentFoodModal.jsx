import React, { useState, useEffect } from 'react';
import { Modal, Button, Row, Col, Card, Form, InputGroup, Badge } from 'react-bootstrap';
import { BsSearch, BsClock, BsBookmark, BsX } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { getDataItem } from '../../utils/dataFoundationApi';
import { useParticipant } from '../../contexts/ParticipantContext';
import './RecentFoodModal.css';

const RecentFoodModal = ({ show, onHide, onFoodSelect, mealType }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recentFoods, setRecentFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const { participantId } = useParticipant();
  const navigate = useNavigate();

  // Fetch recent foods from database when modal is shown or mealType changes
  useEffect(() => {
    if (show && participantId) {
      fetchRecentFoods();
    }
  }, [show, mealType, participantId]);

  const fetchRecentFoods = async () => {
    setLoading(true);
    try {
      const data = await getDataItem(participantId);
      
      if (data) {
        const recentFoodItems = [];
        
        // Filter only date keys (YYYY-MM-DD format) and skip other keys
        const dateEntries = Object.entries(data)
          .filter(([key]) => /^\d{4}-\d{2}-\d{2}$/.test(key))
          .sort(([a], [b]) => new Date(b) - new Date(a)) // Sort by date descending
          .slice(0, 5); // Take only the 5 latest dates
        
        // Extract food entries from the latest 5 dates
        dateEntries.forEach(([date, dateData]) => {
          if (dateData && typeof dateData === 'object') {
            Object.entries(dateData).forEach(([meal, mealData]) => {
              if (mealData && mealData.food) {
                // If mealType is specified, filter by meal type, otherwise include all
                if (!mealType || meal.toLowerCase() === mealType.toLowerCase()) {
                  // Truncate food text to first 50 words
                  const words = mealData.food.split(' ');
                  const truncatedFood = words.length > 50 ? words.slice(0, 50).join(' ') + '...' : mealData.food;
                  
                  recentFoodItems.push({
                    id: `${date}-${meal}`,
                    name: truncatedFood,
                    description: `From ${meal} on ${new Date(date).toLocaleDateString('en-GB')}`,
                    fullFood: mealData.food, // Keep full text for selection
                    date: date,
                    mealType: meal,
                    timestamp: new Date(date).getTime()
                  });
                }
              }
            });
          }
        });
        
        // Sort by date (most recent first) and take only 7 items
        const sortedFoods = recentFoodItems
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 7);
        
        setRecentFoods(sortedFoods);
      }
    } catch (error) {
      console.error('Error fetching recent foods:', error);
      setRecentFoods([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFoods = recentFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFoodClick = (food) => {
    // Pass the food object with full text for selection
    const foodForSelection = {
      ...food,
      name: food.fullFood || food.name // Use full food text if available
    };
    onFoodSelect(foodForSelection);
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

              {/* Food List */}
              <div className="food-list">
                {loading ? (
                  <div className="empty-state">
                    <BsClock size={48} className="empty-icon" />
                    <p className="empty-title">Loading recent foods...</p>
                  </div>
                ) : (
                  filteredFoods.map((food) => (
                    <div 
                      key={food.id}
                      className="food-item-card" 
                      onClick={() => handleFoodClick(food)}
                    >
                      <div className="food-item-info">
                        <div className="food-item-header">
                          <span className="food-id">#{food.id}</span>
                        </div>
                        <h3 className="food-item-title">{food.name}</h3>
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
                  ))
                )}
              </div>

              {!loading && filteredFoods.length === 0 && (
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