import axios from 'axios';

export async function getAllProducts() {
  try {
    const baseUrl = `${process.env.NEXT_PUBLIC_API_GET_PRODUCTS}`;

    const response = await axios.get(baseUrl, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
