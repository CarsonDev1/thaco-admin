import { Category } from "@/types/category";

export interface Product {
  _id: string;
  title: string;
  description: string;
  imageUrls: string[];
  price: number;
  category: Category[];
}