import React, { createContext, useContext, useState, useEffect } from 'react';

// Create the context
const ParticipantContext = createContext();

// Provider component
export const ParticipantProvider = ({ children }) => {
  const [participantId, setParticipantId] = useState('4233'); // Development default
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for DataFoundation participant ID
    if (window.DF && window.DF.participant) {
      setParticipantId(window.DF.participant.id);
      console.log('DataFoundation participant ID found:', window.DF.participant.id);
      setIsLoading(false);
      setError(null);
      return;
    }

    // If DataFoundation is not immediately available, wait a bit and check again
    const checkForDF = () => {
      if (window.DF && window.DF.participant) {
        setParticipantId(window.DF.participant.id);
        console.log('DataFoundation participant ID found (delayed):', window.DF.participant.id);
        setIsLoading(false);
        setError(null);
        return;
      }
      
      // If still not available after waiting, use development default
      console.warn('DataFoundation not available, using development default participant ID');
      setParticipantId('4233');
      setIsLoading(false);
      setError('DataFoundation not available');
    };

    // Wait a short time for DataFoundation to load
    const timer = setTimeout(checkForDF, 1000);

    return () => clearTimeout(timer);
  }, []);

  const value = {
    participantId,
    isLoading,
    error,
    setParticipantId // In case manual override is needed
  };

  return (
    <ParticipantContext.Provider value={value}>
      {children}
    </ParticipantContext.Provider>
  );
};

// Custom hook to use the participant context
export const useParticipant = () => {
  const context = useContext(ParticipantContext);
  if (context === undefined) {
    throw new Error('useParticipant must be used within a ParticipantProvider');
  }
  return context;
};

export default ParticipantContext;