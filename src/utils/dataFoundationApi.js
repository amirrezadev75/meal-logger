/**
 * API utility functions for DataFoundation dataset operations
 * Converts jQuery $.ajax calls to modern fetch API
 */

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

// Default export with all functions
export default {
  createDataItem,
  getDataItem,
  updateDataItem,
  deleteDataItem,
  saveMealData
};