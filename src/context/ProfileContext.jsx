import { createContext, useContext, useState, useCallback } from 'react';

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [userName, setUserNameState] = useState(() => {
    return localStorage.getItem('spendly-user-name') || '';
  });

  const setUserName = useCallback((name) => {
    setUserNameState(name);
    localStorage.setItem('spendly-user-name', name);
  }, []);

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <ProfileContext.Provider value={{ userName, setUserName, getGreeting }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
