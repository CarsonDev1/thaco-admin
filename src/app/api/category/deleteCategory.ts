import axios from 'axios';

export const deleteCategory = async (id: string) => {
  const response = await axios.delete(`https://thaco-be.onrender.com/api/category/${id}`);
  return response.data;
};
