// Function to send data to database
export const sendToDatabase = async ({
  data = {},
  activity = 'MEAL_LOGGING',
  source_id = 'WEB_APP',
  participant = null
}) => {
  // Get environment variables
  const dbBaseUrl = import.meta.env.VITE_DATABASE_BASE_URL;
  const dbId = import.meta.env.VITE_DB_ID;
  const datasetApiKey = import.meta.env.VITE_DATASET_API_KEY;
  
  // Validate required environment variables
  if (!dbBaseUrl || !dbId || !datasetApiKey) {
    console.error("Missing required environment variables for database");
    throw new Error("Database configuration not found. Please check environment variables.");
  }
  
  // Validate participant
  if (!participant || participant === null || participant === undefined) {
    console.error("Participant ID is required and cannot be null");
    throw new Error("Participant ID is required for database operations");
  }
  
  if (logging) {
    console.log("Sending data to database:", data);
  }
  
  // Prepare data object with participant
  const dataWithParticipant = {
    ...data,
    participant: participant
  };
  
  // Prepare request body
  const jsonBody = {
    activity: activity,
    source_id: source_id,
    data: JSON.stringify(dataWithParticipant)
  };
  
  try {
    const url = `${dbBaseUrl}/${dbId}/${datasetApiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(jsonBody)
    });
    
    if (!response.ok) {
      throw new Error(`Database request failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error("Database error:", error);
    throw error;
  }
};
