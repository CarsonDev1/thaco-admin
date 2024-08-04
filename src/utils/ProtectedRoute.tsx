// utils/ProtectedRoute.tsx
'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';

const ProtectedRoute = (WrappedComponent: React.FC<{ user: any }>) => {
	const Wrapper: React.FC = () => {
		const [loading, setLoading] = useState(true);
		const [user, setUser] = useState(null);
		const router = useRouter();

		useEffect(() => {
			const checkAuth = async () => {
				const token = localStorage.getItem('token');
				if (!token) {
					router.push('/login');
					return;
				}

				try {
					const res = await axios.get('https://thaco-be.onrender.com/api/auth/me', {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});

					if (res.data.role === 'admin') {
						setUser(res.data);
					} else {
						router.push('/login');
					}
				} catch (error) {
					console.error('Error fetching user data:', error);
					router.push('/login');
				} finally {
					setLoading(false);
				}
			};

			checkAuth();
		}, [router]);

		if (loading) {
			return (
				<div className='loading'>
					<CircularProgress sx={{ color: '#ff4141' }} />
				</div>
			);
		}

		return user ? <WrappedComponent user={user} /> : null;
	};

	return Wrapper;
};

export default ProtectedRoute;
