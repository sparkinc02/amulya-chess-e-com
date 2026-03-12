import { api } from "@/config/axios";
import { GET_CUSTOMERS_KEY } from "@/lib/constants";
import { ApiResponse, UserData, CustomerWithStats } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export interface CustomerWithUserData {
    customer: CustomerWithStats;
    userData: UserData;
}

export const getCustomers = async () => {
    const response = await api.get<ApiResponse<UserData[]>>("/users");

    // Transform UserData to CustomerWithStats and keep original UserData
    const customersWithData: CustomerWithUserData[] = response.data.data?.map(user => {
        const totalSpent = user.orders.reduce((sum, order) => sum + order.amount, 0);
        const lastOrder = user.orders.length > 0
            ? new Date(Math.max(...user.orders.map(order => new Date(order.createdAt).getTime()))).toISOString().split('T')[0]
            : "";

        const customer: CustomerWithStats = {
            id: user.id,
            name: user.userName,
            email: user.email,
            phone: user.phone,
            address: user.address
                ? `${user.address.addressLine}, ${user.address.city}, ${user.address.state} ${user.address.pincode}`
                : "No address provided",
            orders: user.orders.length,
            totalSpent,
            lastOrder,
        };

        return {
            customer,
            userData: user
        };
    }) || [];

    return {
        ...response.data,
        data: customersWithData
    };
}

export const useGetCustomers = () => {
    return useQuery({
        queryKey: [GET_CUSTOMERS_KEY],
        queryFn: getCustomers,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
    });
}