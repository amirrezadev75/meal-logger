import { useEffect } from 'react';

const useReloadProtection = (message = 'Are you sure you want to leave? You will lose your session data.') => {
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [message]);
};

export default useReloadProtection;