import React, { useState, useEffect } from 'react';
import { BsSearch, BsBookmark, BsTrash, BsX } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { getDataItem, deleteDataItem, updateDataItem, getSavedFoods, deleteSavedFood } from '../../utils/dataFoundationApi';
import { useParticipant } from '../../contexts/ParticipantContext';
import './SavedFoodModal.css';

const SavedFoodModal = ({ show, onHide, onFoodSelect, mealType }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [savedFoods, setSavedFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { participantId } = useParticipant();
  const navigate = useNavigate();
  
  // Load saved foods when modal opens or mealType changes
  useEffect(() => {
    if (show && participantId) {
      loadSavedFoods();
    }
  }, [show, mealType, participantId]);

  const loadSavedFoods = async () => {
    setIsLoading(true);
    try {
      const savedFoodsData = await getSavedFoods(participantId);
      console.log('mealType:', mealType);
      
      // Use the simplified data structure directly
      let foodsArray = [];
      console.log('Saved foods data type:', typeof savedFoodsData);
      if (savedFoodsData && Array.isArray(savedFoodsData)) {
        foodsArray = savedFoodsData.map((savedFoodItem, index) => {
          return {
            id: index,
            name: savedFoodItem.food, // Use the raw food content
            mealType: savedFoodItem.mealtype,
            savedDate: savedFoodItem.savedDate,
            originalData: savedFoodItem // Keep original for reference
          };
        }).filter(food => {
          // If mealType is specified, filter by meal type, otherwise include all
          return !mealType || food.mealType.toLowerCase() === mealType.toLowerCase();
        });
      }
      
      // Sort by most recently saved
      foodsArray.reverse();
      
      setSavedFoods(foodsArray);
    } catch (error) {
      console.error('Error loading saved foods:', error);
      setSavedFoods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFood = async (foodIndex, e) => {
    e.stopPropagation();
    
    try {
      // Since we reversed the array for display, we need to convert back to actual index
      const actualIndex = savedFoods.length - 1 - foodIndex;
      await deleteSavedFood(actualIndex, participantId);
      // Reload the saved foods list
      await loadSavedFoods();
    } catch (error) {
      console.error('Error deleting food:', error);
      alert('Error deleting food. Please try again.');
    }
  };

  const filteredFoods = savedFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFoodClick = (food) => {
    // Simply pass the food object with the original food content
    onFoodSelect({
      name: food.name, // This is the raw food content from the database
      mealType: food.mealType
    });
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
                  <BsBookmark color="#88b083" /> Saved Foods
                </h1>
                <button onClick={onHide} className="close-btn">
                  <BsX size={24} />
                </button>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="content">

              {/* Food List */}
              <div className="food-list">
                {isLoading ? (
                  <div className="empty-state">
                    <BsBookmark size={48} className="empty-icon" />
                    <p className="empty-title">Loading saved foods...</p>
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
                        <p className="food-item-description">Saved on {food.savedDate}</p>
                      </div>
                      <button
                        className="delete-food-btn"
                        onClick={(e) => handleDeleteFood(food.id, e)}
                      >
                        <BsTrash />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {!isLoading && filteredFoods.length === 0 && (
                <div className="empty-state">
                  <BsBookmark size={48} className="empty-icon" />
                  <p className="empty-title">No saved foods found</p>
                  {searchTerm ? (
                    <p className="empty-subtitle">Try a different search term</p>
                  ) : (
                    <p className="empty-subtitle">Save some meals to see them here</p>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </>
  );
};

export default SavedFoodModal;