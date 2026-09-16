import { createContext, useContext, useState, useCallback } from 'react';

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [userName, setUserNameState] = useState(() => {
    return localStorage.getItem('spendly-user-name') || '';
  });

  const [avatarGradient, setAvatarGradientState] = useState(() => {
    return localStorage.getItem('spendly-avatar-gradient') || '#0d9488,#0f766e';
  });

  const [avatarPhoto, setAvatarPhotoState] = useState(() => {
    return localStorage.getItem('spendly-avatar-photo') || null;
  });

  const setUserName = useCallback((name) => {
    setUserNameState(name);
    localStorage.setItem('spendly-user-name', name);
  }, []);

  const setAvatarGradient = useCallback((gradient) => {
    setAvatarGradientState(gradient);
    localStorage.setItem('spendly-avatar-gradient', gradient);
  }, []);

  const setAvatarPhoto = useCallback((photoDataUrl) => {
    setAvatarPhotoState(photoDataUrl);
    if (photoDataUrl) {
      localStorage.setItem('spendly-avatar-photo', photoDataUrl);
    } else {
      localStorage.removeItem('spendly-avatar-photo');
    }
  }, []);

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <ProfileContext.Provider value={{
      userName, setUserName,
      avatarGradient, setAvatarGradient,
      avatarPhoto, setAvatarPhoto,
      getGreeting,
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
