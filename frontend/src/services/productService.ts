import { api } from "@/config/axios";
import { ApiResponse, Product } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { GET_ALL_PRODUCTS_KEY, GET_PRODUCT_KEY } from "@/lib/constants";

export const getProducts = async (params?: { category?: string; query?: string; isFeatured?: boolean }) => {
  const response = await api.get<ApiResponse<Product[]>>("/products", { params });
  return response.data;
};

export const getProductById = async (id: string) => {
  const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
  return response.data;
};

export const useGetProducts = (params?: { category?: string; query?: string; isFeatured?: boolean }) => {
  return useQuery({
    queryKey: [GET_ALL_PRODUCTS_KEY, params],
    queryFn: () => getProducts(params),
  });
};

export const useGetProductById = (id: string) => {
  return useQuery({
    queryKey: [GET_PRODUCT_KEY, id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });
};

export const useGetFeaturedProducts = () => {
  return useQuery({
    queryKey: [GET_ALL_PRODUCTS_KEY, "featured"],
    queryFn: () => getProducts({ isFeatured: true }),
  });
};

export const getCategories = async () => {
  const response = await api.get<ApiResponse<string[]>>("/products/categories");
  return response.data;
};

export const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });
};
