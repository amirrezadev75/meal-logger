import React, { useState } from 'react';
import { BsSearch, BsBookmark, BsTrash, BsX } from 'react-icons/bs';
import './SavedFoodModal.css';

const SavedFoodModal = ({ show, onHide, onFoodSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock saved food data
  const [savedFoods] = useState([
    {
      id: 1,
      name: 'Grilled Chicken Breast',
      description: 'Lean protein source, great for muscle building and weight management.'
    },
    {
      id: 2,
      name: 'Quinoa Bowl',
      description: 'Complete protein grain with all essential amino acids.'
    },
    {
      id: 3,
      name: 'Greek Yogurt',
      description: 'Probiotic-rich dairy with high protein content.'
    },
    {
      id: 4,
      name: 'Avocado Toast',
      description: 'Rich in healthy monounsaturated fats and fiber.'
    },
    {
      id: 5,
      name: 'Salmon Fillet',
      description: 'High in omega-3 fatty acids and quality protein.'
    },
    {
      id: 6,
      name: 'Mixed Berries',
      description: 'Antioxidant-rich fruits with natural sweetness.'
    }
  ]);

  const filteredFoods = savedFoods.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    food.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFoodClick = (food) => {
    onFoodSelect(food);
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
              {/* Search Bar */}
              <div className="search-section">
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search saved foods..."
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
                      className="delete-food-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Delete food:', food.id);
                      }}
                    >
                      <BsTrash />
                    </button>
                  </div>
                ))}
              </div>

              {filteredFoods.length === 0 && (
                <div className="empty-state">
                  <BsBookmark size={48} className="empty-icon" />
                  <p className="empty-title">No saved foods found</p>
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

export default SavedFoodModal;