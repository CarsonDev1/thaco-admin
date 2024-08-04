import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Provider from '@/utils/Provider';
import SideBar from '@/app/components/sidebar/SideBar';
import { SessionProvider } from 'next-auth/react';
import { UserProvider } from '@/utils/UserContext';
import './globals.scss';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Create Next App',
	description: 'Generated by create next app',
};

export default function RootLayout({
	children,
	user,
}: Readonly<{
	children: React.ReactNode;
	user: User;
}>) {
	return (
		<html lang='en'>
			<body className={inter.className}>
				<Provider>
					<UserProvider>
						<div className='layout'>
							<SideBar />
							<main className='main'>{children}</main>
						</div>
					</UserProvider>
				</Provider>
			</body>
		</html>
	);
}
