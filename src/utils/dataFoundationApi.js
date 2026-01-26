/**
 * API utility functions for DataFoundation dataset operations
 * Converts jQuery $.ajax calls to modern fetch API
 */

// Helper function to get current date in European format (DD/MM/YYYY)
const getCurrentDateEuropean = () => {
  const date = new Date();
  return date.toLocaleDateString('en-GB');
};

// Get configuration from environment variables
const getConfig = () => ({
  baseUrl: import.meta.env.VITE_API_URL || 'https://data.id.tue.nl/api/v1/datasets/entity/18693',
  apiToken: import.meta.env.VITE_API_TOKEN || 'UGF4bUZFNDUzZFZiaUZ2VjZyTUtLK240ZEtVSzlwRmZBVktXOXoxSS9hOD0=',
  defaultToken: '1'
});

/**
 * Base function to make API requests
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} resourceId - Resource identifier
 * @param {Object|null} data - Data to send (for POST/PUT)
 * @param {string} token - Custom token (optional)
 * @returns {Promise} - API response
 */
const makeApiRequest = async (method, resourceId, data = null, token = null) => {
  const config = getConfig();
  
  const headers = {
    'Content-Type': 'application/json',
    'api_token': config.apiToken,
    'resource_id': resourceId,
    'token': token || config.defaultToken
  };

  const requestConfig = {
    method: method,
    headers: headers,
  };

  // Add body for POST and PUT requests
  if (data && (method === 'POST' || method === 'PUT')) {
    requestConfig.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(config.baseUrl, requestConfig);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log(`${method} request successful:`, responseData);
    return responseData;
  } catch (error) {
    console.error(`${method} request failed:`, error);
    throw error;
  }
};

/**
 * Create/Add a new data item to the dataset
 * @param {Object} data - Data to add
 * @param {string} resourceId - Resource identifier  
 * @param {string} token - Custom token (optional)
 * @returns {Promise} - API response
 */
export const createDataItem = async (data, resourceId, token = null) => {
  return makeApiRequest('POST', resourceId, data, token);
};

/**
 * Get a data item from the dataset
 * @param {string} resourceId - Resource identifier
 * @param {string} token - Custom token (optional)
 * @returns {Promise} - API response
 */
export const getDataItem = async (resourceId, token = null) => {
  return makeApiRequest('GET', resourceId, null, token);
};

/**
 * Update a data item in the dataset
 * @param {Object} data - Updated data
 * @param {string} resourceId - Resource identifier
 * @param {string} token - Custom token (optional)
 * @returns {Promise} - API response
 */
export const updateDataItem = async (data, resourceId, token = null) => {
  return makeApiRequest('PUT', resourceId, data, token);
};

/**
 * Delete a data item from the dataset
 * @param {string} resourceId - Resource identifier
 * @param {string} token - Custom token (optional)
 * @returns {Promise} - API response
 */
export const deleteDataItem = async (resourceId, token = null) => {
  return makeApiRequest('DELETE', resourceId, null, token);
};

/**
 * Convenience function to save meal data (specific to your app)
 * @param {Object} mealData - Meal data to save
 * @param {string} participantId - Participant identifier
 * @returns {Promise} - API response
 */
export const saveMealData = async (mealData, participantId) => {
  return createDataItem(mealData, participantId || 'unknown_participant');
};

/**
 * Save a food item to savedFoods within participant data
 * @param {Object} savedFoodData - Saved food data to add (format: { mealType: { food: "..." } })
 * @param {string} participantId - Participant identifier
 * @returns {Promise} - API response
 */
export const saveFoodItem = async (savedFoodData, participantId) => {
  const resourceId = participantId || 'unknown_participant';
  
  try {
    // Try to get existing participant data
    const existingData = await getDataItem(resourceId);
    
    // Merge savedFood with existing data
    const mergedData = { ...existingData };
    
    // Initialize savedFoods as array if it doesn't exist
    if (!mergedData.savedFoods) {
      mergedData.savedFoods = [];
    }
    
    // Add metadata to the saved food item
    const savedFoodEntry = {
      ...savedFoodData,
      savedDate: getCurrentDateEuropean()
    };
    
    // Push the new saved food item to the array
    mergedData.savedFoods.push(savedFoodEntry);
    
    // Update the participant data
    return await updateDataItem(mergedData, resourceId);
    
  } catch (error) {
    // Check if it's a 404 error (participant data doesn't exist)
    if (error.message.includes('404')) {
      // Create new participant data with savedFoods array
      const newData = {
        savedFoods: [{
          ...savedFoodData,
          savedDate: getCurrentDateEuropean()
        }]
      };
      return await createDataItem(newData, resourceId);
    } else {
      throw error;
    }
  }
};

/**
 * Get saved foods for a participant
 * @param {string} participantId - Participant identifier
 * @returns {Promise} - Saved foods object
 */
export const getSavedFoods = async (participantId) => {
  const resourceId = participantId || 'unknown_participant';
  
  try {
    const participantData = await getDataItem(resourceId);
    return participantData?.savedFoods || {};
  } catch (error) {
    // If participant data doesn't exist, return empty object
    if (error.message.includes('404')) {
      return {};
    }
    throw error;
  }
};

/**
 * Delete a saved food item from participant data
 * @param {number} savedFoodIndex - Index of the saved food to delete in the array
 * @param {string} participantId - Participant identifier
 * @returns {Promise} - API response
 */
export const deleteSavedFood = async (savedFoodIndex, participantId) => {
  const resourceId = participantId || 'unknown_participant';
  
  try {
    // Get existing participant data
    const existingData = await getDataItem(resourceId);
    
    if (existingData?.savedFoods && Array.isArray(existingData.savedFoods)) {
      // Remove the saved food item at the specified index
      if (savedFoodIndex >= 0 && savedFoodIndex < existingData.savedFoods.length) {
        existingData.savedFoods.splice(savedFoodIndex, 1);
        
        // Update the participant data
        return await updateDataItem(existingData, resourceId);
      } else {
        throw new Error('Invalid saved food index');
      }
    } else {
      throw new Error('No saved foods found');
    }
    
  } catch (error) {
    throw error;
  }
};

// Default export with all functions
export default {
  createDataItem,
  getDataItem,
  updateDataItem,
  deleteDataItem,
  saveMealData,
  saveFoodItem,
  getSavedFoods,
  deleteSavedFood
};