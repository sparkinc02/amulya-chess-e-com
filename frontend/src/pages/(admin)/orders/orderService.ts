import { api } from "@/config/axios";
import { ApiResponse, OrderWithUser } from "@/lib/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isAxiosError, AxiosError } from "axios";
import { GET_ORDERS_KEY } from "@/lib/constants";

interface UpdateOrderStatusRequestBody {
  orderId: string;
  status: string;
  trackingNumber?: string;
  note?: string;
  notifyCustomer: boolean;
  estimatedDelivery?: string;
}

export const getOrders = async () => {
  const response = await api.get<ApiResponse<OrderWithUser[]>>("/orders");
  return response.data;
};

export const updateOrderStatus = async (
  statusData: UpdateOrderStatusRequestBody
) => {
  const response = await api.put<ApiResponse<OrderWithUser>>(
    `/orders/${statusData.orderId}/status`,
    statusData
  );
  return response.data;
};

export const useGetOrders = () => {
  return useQuery({
    queryKey: [GET_ORDERS_KEY],
    queryFn: getOrders,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateOrderStatus,

    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: [GET_ORDERS_KEY],
      });
    },
  });
};
