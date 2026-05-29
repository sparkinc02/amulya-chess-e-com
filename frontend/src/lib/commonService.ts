import { api } from "@/config/axios";
import { ApiResponse, Product } from "./types";
import { useQuery } from "@tanstack/react-query";
import {
  GET_ALL_PRODUCTS_KEY,
  GET_FEATURED_PRODUCTS_KEY,
  GET_PRODUCT_KEY,
} from "./constants";

const getProducts = async () => {
  const response = await api.get<ApiResponse<Product[]>>("/products?all=true");
  return response.data;
};
const getFeaturedProducts = async () => {
  const response = await api.get<ApiResponse<Product[]>>(
    "/products?isFeatured=true",
  );
  return response.data;
};
export const getProduct = async (id: string) => {
  const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return response.data;
};

export const getRelatedProducts = async (category: string) => {
  // await new Promise((resolve) => setTimeout(resolve, 4000));
  const response = await api.get<ApiResponse<Product[]>>(
    `/products?category=${category}`,
  );
  return response.data;
};
export const getSearchProducts = async (query: string) => {
  // await new Promise((resolve) => setTimeout(resolve, 4000));
  const response = await api.get<ApiResponse<Product[]>>(
    `/products?query=${query}`,
  );
  return response.data;
};

export const useGetProducts = () =>
  useQuery({
    queryKey: [GET_ALL_PRODUCTS_KEY],
    queryFn: getProducts,
  });

export const useGetFeaturedProducts = () =>
  useQuery({
    queryKey: [GET_FEATURED_PRODUCTS_KEY],
    queryFn: getFeaturedProducts,
  });

export const useGetProduct = (id: string) =>
  useQuery({
    queryKey: [GET_PRODUCT_KEY, id],
    queryFn: () => getProduct(id),
  });

export const useGetRelatedProducts = (category: string) =>
  useQuery({
    queryKey: [GET_PRODUCT_KEY, category],
    queryFn: () => getRelatedProducts(category),
  });

export const useGetSearchProducts = (query: string) =>
  useQuery({
    queryKey: [GET_PRODUCT_KEY, query],
    queryFn: () => getSearchProducts(query),
  });
