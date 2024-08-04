// components/Customers.tsx
'use client';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
	Container,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	Button,
} from '@mui/material';
import { getAllUser } from '@/app/api/user/users';
import { getUserById } from '@/app/api/user/userId';

const Customers: React.FC = () => {
	const token = localStorage.getItem('token') || '';
	const { data, isLoading, error } = useQuery({
		queryKey: ['listUser'],
		queryFn: () => getAllUser(token),
	});

	const [selectedUser, setSelectedUser] = useState<any>(null);

	const handleUserClick = async (userId: string) => {
		try {
			const userData = await getUserById(userId, token);
			setSelectedUser(userData);
		} catch (error) {
			console.error('Error fetching user details:', error);
		}
	};

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error loading data</div>;

	return (
		<Container>
			<h1>Customers</h1>
			<Button
				variant='contained'
				color='primary'
				// startIcon={<Add />}
				onClick={() => alert('Add user functionality to be implemented')}
			>
				Add User
			</Button>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Name</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Role</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{data &&
							data.map((user: any) => (
								<TableRow key={user._id} onClick={() => handleUserClick(user._id)}>
									<TableCell>{user._id}</TableCell>
									<TableCell>{user.fullname}</TableCell>
									<TableCell>{user.email}</TableCell>
									<TableCell>{user.role}</TableCell>
								</TableRow>
							))}
					</TableBody>
				</Table>
			</TableContainer>

			{/* Render selected user details */}
			{selectedUser && (
				<div>
					<h2>User Details</h2>
					<p>ID: {selectedUser._id}</p>
					<p>Name: {selectedUser.fullname}</p>
					<p>Email: {selectedUser.email}</p>
					<p>Role: {selectedUser.role}</p>
				</div>
			)}
		</Container>
	);
};

export default Customers;
