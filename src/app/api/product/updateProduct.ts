import axios from 'axios';

export const updateProduct = async ({ id, productDetails }: { id: string; productDetails: FormData }) => {
  try {
    const response = await axios.put(`https://thaco-be.onrender.com/api/products/${id}`, productDetails, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Error updating product');
  }
};



