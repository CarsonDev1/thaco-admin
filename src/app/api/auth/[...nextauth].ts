// // pages/api/auth/[...nextauth].ts
// import NextAuth, { NextAuthOptions } from 'next-auth';
// import CredentialsProvider from 'next-auth/providers/credentials';
// import axios from 'axios';
// import { NextApiRequest, NextApiResponse } from 'next';

// export const authOptions: NextAuthOptions = {
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         email: { label: 'Email', type: 'text' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           throw new Error('Email and password are required');
//         }

//         try {
//           const response = await axios.post('http://localhost:5000/api/auth/login', {
//             email: credentials.email,
//             password: credentials.password,
//           });

//           const user = response.data;

//           if (!user) {
//             throw new Error('No user found');
//           }

//           // Assuming the API returns a plain password that needs to be hashed
//           // This part may vary based on your API response
//           const isMatchedPassword = credentials.password === user.password;

//           if (!isMatchedPassword) {
//             throw new Error('Invalid password');
//           }

//           return user;
//         } catch (error: unknown) {
//           if (axios.isAxiosError(error)) {
//             throw new Error(error.response?.data?.message || 'Login failed');
//           } else {
//             throw new Error('An unknown error occurred');
//           }
//         }
//       },
//     }),
//   ],
//   pages: {
//     signIn: '/login',
//     error: '/login', // Redirect to login page in case of error
//   },
// };

// export default (req: NextApiRequest, res: NextApiResponse) => NextAuth(req, res, authOptions);
