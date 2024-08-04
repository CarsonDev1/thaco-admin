// components/LoginForm.tsx
'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './login-form.scss';

const schema = yup.object().shape({
	email: yup.string().email('Invalid email format').required('Email is required'),
	password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

interface LoginFormInputs {
	email: string;
	password: string;
}

const LoginForm: React.FC = () => {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormInputs>({
		resolver: yupResolver(schema),
	});
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const router = useRouter();

	const onSubmit = async (data: LoginFormInputs) => {
		setError(null);

		try {
			const res = await axios.post<{
				message: string;
				access_token: string;
				role: string;
			}>('https://thaco-be.onrender.com/api/auth/login', data);

			if (res.status === 200) {
				const { access_token, role } = res.data;
				localStorage.setItem('token', access_token);
				localStorage.setItem('role', role);

				if (role === 'admin') {
					router.push('/');
				} else {
					setError('Access denied. Admins only.');
				}
			} else {
				setError(res.data.message || 'Invalid email or password');
			}
		} catch (err: any) {
			if (err.response) {
				setError(err.response.data.message || 'Invalid email or password');
			} else if (err.request) {
				setError('No response received from the server. Please try again later.');
			} else {
				setError('An unexpected error occurred. Please try again.');
			}
		}
	};

	return (
		<div className='login-form'>
			<form onSubmit={handleSubmit(onSubmit)}>
				<h1>Login to your Account</h1>
				<div className='form-group'>
					<div className='input-wrapper'>
						<FaEnvelope className='icon' />
						<input type='text' placeholder='Email' {...register('email')} />
					</div>
					{errors.email && <p className='error-message'>{errors.email.message}</p>}
				</div>
				<div className='form-group'>
					<div className='input-wrapper'>
						<FaLock className='icon' />
						<input
							type={showPassword ? 'text' : 'password'}
							placeholder='Password'
							{...register('password')}
						/>
						<div className='toggle-password' onClick={() => setShowPassword(!showPassword)}>
							{showPassword ? <FaEyeSlash /> : <FaEye />}
						</div>
					</div>
					{errors.password && <p className='error-message'>{errors.password.message}</p>}
				</div>
				<button type='submit'>Login</button>
			</form>
			{error && <p className='error-message'>{error}</p>}
		</div>
	);
};

export default LoginForm;
