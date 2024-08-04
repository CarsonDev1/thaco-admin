'use client';
import React, { useState, useEffect, useRef } from 'react';
import SidebarList from './SidebarList';
import { CircularProgress } from '@mui/material';
import { useUser } from '@/utils/UserContext';
import { useRouter } from 'next/navigation';
import './SideBar.scss';

const SideBar: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const router = useRouter();
	const { loading } = useUser();
	const sidebarRef = useRef<HTMLDivElement | null>(null);
	const burgerRef = useRef<HTMLButtonElement | null>(null);

	const toggleSidebar = () => {
		if (isOpen) {
			setIsClosing(true);
			setTimeout(() => {
				setIsOpen(false);
				setIsClosing(false);
			}, 300); // Match the duration of the slideOut animation
		} else {
			setIsOpen(true);
		}
	};

	const handleClickOutside = (event: MouseEvent) => {
		if (
			isOpen &&
			sidebarRef.current &&
			burgerRef.current &&
			!sidebarRef.current.contains(event.target as Node) &&
			!burgerRef.current.contains(event.target as Node)
		) {
			toggleSidebar();
		}
	};

	useEffect(() => {
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	if (loading) {
		return <CircularProgress color='secondary' />;
	}

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('role');
		router.push('/login');
	};

	return (
		<>
			<button
				ref={burgerRef}
				className={`burger ${isOpen ? 'open' : ''} ${isOpen ? 'hide' : ''}`}
				onClick={toggleSidebar}
			>
				<div />
				<div />
				<div />
			</button>
			<nav ref={sidebarRef} className={`sidebar ${isOpen ? 'open' : ''} ${isClosing ? 'closing' : ''}`}>
				<div className='sidebar-logo'>
					<h1 className='sidebar-title'>Thaco Admin</h1>
					<button className='sidebar-close-btn' onClick={toggleSidebar}>
						<span>&times;</span>
					</button>
				</div>
				<ul className='sidebar-list'>
					<SidebarList />
				</ul>
				<div className='logout-btn-wrap'>
					<button className='logout-btn' onClick={handleLogout}>
						<span className='sign'>
							<svg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'>
								<path d='M192 0h128c8.4 0 16.6 3.37 22.6 9.37s9.4 14.22 9.4 22.63v256c0 8.4-3.4 16.6-9.4 22.6-6 6-14.2 9.4-22.6 9.4H192c-8.4 0-16.6-3.4-22.6-9.4s-9.4-14.2-9.4-22.6V32c0-8.41 3.37-16.63 9.37-22.63S183.6 0 192 0zm128 32H192v256h128V32zM350.7 329.4c6.2 6.3 14.5 9.6 23.3 9.6 8.7 0 17-3.4 23.2-9.6l104-104c6.2-6.2 9.6-14.5 9.6-23.2s-3.4-17-9.6-23.2l-104-104c-6.2-6.2-14.5-9.6-23.2-9.6-8.8 0-17.1 3.4-23.3 9.6-6.2 6.2-9.6 14.5-9.6 23.2s3.4 17 9.6 23.2L417.4 192H256c-8.8 0-17 7.2-17 16s7.2 16 17 16h161.4l-66.7 66.8c-6.3 6.2-9.6 14.5-9.6 23.2s3.3 17 9.6 23.2z' />
							</svg>
						</span>
						<span className='text'>Log out</span>
					</button>
				</div>
			</nav>
		</>
	);
};

export default SideBar;
