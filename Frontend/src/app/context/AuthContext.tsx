import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  profilePhotos: string[];
  activePhoto: string | null;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<User | undefined>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('parkflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {

    setIsLoading(true);

    try {

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: pass
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      const userData: User = {
        id: data.user._id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role || "user",
        profilePhotos: data.user.profilePhotos || [],
        activePhoto: data.user.activePhoto || null,
      };

      setUser(userData);
      localStorage.setItem('parkflow_user', JSON.stringify(userData));
      setIsLoading(false);
      return userData;

    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error.message || "Login failed");
    }
  };

  const register = async (email: string, pass: string, name: string) => {

    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // ❌ No auto login before OTP verification

    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('parkflow_user');
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem('parkflow_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );

};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};