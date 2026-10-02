import { createContext, useContext, useState, useCallback } from 'react';

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [userName, setUserNameState] = useState(() => {
    return localStorage.getItem('spendly-user-name') || '';
  });

  const [avatarGradient, setAvatarGradientState] = useState(() => {
    return localStorage.getItem('spendly-avatar-gradient') || '#6d28d9,#7c3aed';
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

  const getGreeting = useCallback(() => 'Hello', []);

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
