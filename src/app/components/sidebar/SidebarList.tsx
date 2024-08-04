import React from 'react';
import SidebarItem from './SidebarItem';
import { MdOutlineDashboard } from 'react-icons/md';
import { BsCollection } from 'react-icons/bs';
import { LuShoppingBag } from 'react-icons/lu';
import { GrGroup } from 'react-icons/gr';
import { FiBox } from 'react-icons/fi';
import { useUser } from '@/utils/UserContext';

const items = [
	// { icon: <MdOutlineDashboard size={30} />, label: 'Dashboard', href: '/' },
	{ icon: <FiBox size={30} />, label: 'Sản Phẩm', href: '/products' },
	{ icon: <BsCollection size={30} />, label: 'Loại Sản Phẩm', href: '/collection' },
];

const SidebarList: React.FC = () => {
	const { user } = useUser();

	return (
		<ul className='sidebar-list'>
			{items.map((item, index) => (
				<SidebarItem key={index} icon={item.icon} label={item.label} href={item.href} />
			))}
			{user && <SidebarItem label={user.fullname} isAvatar href='/profile' />}
		</ul>
	);
};

export default SidebarList;
