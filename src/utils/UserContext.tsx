'use client';
// utils/UserContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface User {
	fullname: string;
	email: string;
}

interface UserContextProps {
	user: User | null;
	loading: boolean;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchUser = async () => {
			const token = localStorage.getItem('token');
			if (token) {
				try {
					const res = await axios.get('https://thaco-be.onrender.com/api/auth/me', {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});
					setUser(res.data);
				} catch (error) {
					console.error('Error fetching user data:', error);
					localStorage.removeItem('token');
				}
			}
			setLoading(false);
		};

		fetchUser();
	}, []);

	return <UserContext.Provider value={{ user, loading }}>{children}</UserContext.Provider>;
};

export const useUser = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
};
