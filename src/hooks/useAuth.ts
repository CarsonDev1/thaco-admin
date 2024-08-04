// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  fullname: string;
  email: string;
  // Add any other relevant user fields
}

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Verify token and get user details
        const res = await axios.get<User>('http://localhost:5000/api/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to authenticate:', error);
        setIsLoading(false);
        // Handle authentication failure (e.g., clear token, redirect to login)
        localStorage.removeItem('accessToken');
        setUser(null);
      }
    };

    checkAuthStatus();
  }, []);

  const checkAdmin = async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No token found');
      }

      const res = await axios.get<{ isAdmin: boolean }>('http://localhost:5000/api/auth/check-admin', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data.isAdmin;
    } catch (error) {
      console.error('Failed to check admin status:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return { user, isLoading, checkAdmin, logout };
};

export default useAuth;
