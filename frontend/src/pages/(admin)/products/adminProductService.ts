import { queryClient } from "@/App";
import { api } from "@/config/axios";
import { GET_ALL_PRODUCTS_KEY, GET_PRODUCT_KEY } from "@/lib/constants";
import { ApiResponse, ProductFormValues } from "@/lib/types";
import { createStructuredProductFormData } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";

const createProduct = async (data: ProductFormValues) => {
  const formData = createStructuredProductFormData(data);
  const response = await api.post<ApiResponse<void>>("/products", formData);
  return response.data;
};
const updateProduct = async ({
  data,
  id,
}: {
  data: ProductFormValues;
  id: string;
}) => {
  const formData = createStructuredProductFormData(data);
  const response = await api.put<ApiResponse<void>>(
    `/products/${id}`,
    formData,
  );
  return response.data;
};

const deleteProduct = async (id: string) => {
  const response = await api.delete<ApiResponse<void>>(`/products/${id}`);
  return response.data;
};
export const useCreateProduct = () =>
  useMutation({
    mutationFn: createProduct,
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: [GET_ALL_PRODUCTS_KEY],
      });
    },
  });

export const useUpdateProduct = () =>
  useMutation({
    mutationFn: updateProduct,
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({
        queryKey: [GET_ALL_PRODUCTS_KEY],
      });
      queryClient.invalidateQueries({
        queryKey: [GET_PRODUCT_KEY, id],
      });
    },
  });

export const useDeleteProduct = () =>
  useMutation({
    mutationFn: deleteProduct,
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: [GET_ALL_PRODUCTS_KEY],
      });
    },
  });
