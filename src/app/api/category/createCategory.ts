import axios from 'axios';

export const createCategory = async (categoryDetails: FormData) => {
  try {
    const response = await axios.post('https://thaco-be.onrender.com/api/category/create', categoryDetails, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Error creating category');
  }
};
