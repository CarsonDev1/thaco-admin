import axios from 'axios';

export const deleteProduct = async (id: string) => {
  const response = await axios.delete(`https://thaco-be.onrender.com/api/products/${id}`);
  return response.data;
};
