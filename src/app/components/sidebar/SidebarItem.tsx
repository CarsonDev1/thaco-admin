import React from 'react';
import { Avatar } from '@mui/material';
import Link from 'next/link';

interface SidebarItemProps {
	icon?: JSX.Element;
	label: string;
	isAvatar?: boolean;
	href: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isAvatar = false, href }) => {
	return (
		<li className='sidebar-item'>
			<Link href={href} legacyBehavior>
				<a className='sidebar-link'>
					{isAvatar ? (
						<Avatar alt={label} src='/static/images/avatar/1.jpg' sx={{ width: '30px', height: '30px' }} />
					) : (
						icon
					)}
					<span>{label}</span>
				</a>
			</Link>
		</li>
	);
};

export default SidebarItem;
