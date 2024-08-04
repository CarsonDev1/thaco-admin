import axios from 'axios';

export const updateCategory = async ({ id, categoryDetails }: { id: string; categoryDetails: FormData }) => {
  try {
    const response = await axios.put(`https://thaco-be.onrender.com/api/category/${id}`, categoryDetails, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (response.status === 204) {
      return;
    } else {
      return response.data;
    }
  } catch (error) {
    throw new Error('Error updating category');
  }
};
