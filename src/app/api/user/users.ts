import axios from 'axios';

export async function getAllUser(token: string) {
  try {
    const baseUrl = `${process.env.NEXT_PUBLIC_API_GET_USERS}`;

    const response = await axios.get(baseUrl, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
