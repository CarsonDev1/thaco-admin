'use client';
import ProtectedRoute from '@/utils/ProtectedRoute';

const Home: React.FC = ({ user }: any) => {
	return (
		<main>
			<div>
				<h1>Home Page</h1>
				<div>Welcome, {user.fullname}</div>
				<div>Email: {user.email}</div>
			</div>
		</main>
	);
};

export default ProtectedRoute(Home);
