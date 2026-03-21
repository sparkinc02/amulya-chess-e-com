import { api } from "@/config/axios";
import { useMutation } from '@tanstack/react-query';

export const usePlaceOrder = () => {
  return useMutation({
    mutationFn: async (orderData: any) => {
      const response = await api.post("/orders/place", orderData);
      return response.data;
    },
  });
};

export const useVerifyPayment = () => {
  return useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await api.post("/payments/verify", paymentData);
      return response.data;
    },
  });
};
