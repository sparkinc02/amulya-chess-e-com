import { ImageFile } from "@/components/ImageUpload";

export interface AuthResponse {
  user: UserData;
  accessToken: string;
  orders: Order[];
}

export interface UserData {
  id: string;
  userName: string;
  phone: string;
  email: string;
  role: "user" | "admin";
  picture?: string;
  address?: {
    addressLine: string;
    apartment?: string;
    city: string;
    state: string;
    pincode: string;
  };
  orders: Order[];
}

export interface OrderItemType {
  productId: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  name: string;
  image: string;
}

export interface ShippingAddressType {
  addressLine: string;
  apartment?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

export interface PaymentInfoType {
  paymentId: string;
  status: string;
  method: string;
}

export type Order = {
  id: string;
  userId: string;
  orderItems: OrderItem[];
  shippingAddress: {
    addressLine: string;
    apartment?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  amount: number;
  subtotal: number;
  shipping: number;
  status: "ORDER_PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentInfo: {
    paymentId: string;
    status: string;
    method: string;
  };
  shippingInfo?: {
    trackingNumber: string;
    estimatedDelivery: Date;
    note?: string;
  };
  isPaid: boolean;
  paidAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  productId: string;
  quantity: number;
  size: string;
  color: string;
  name: string;
  image: string;
  price: number;
};

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  userName: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: UserData;
  accessToken: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface Settings {
  general: {
    siteName: string;
    siteDescription: string;
    currency: string;
    timezone: string;
    language: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    lowStockAlert: boolean;
    newOrderAlert: boolean;
    lowStockThreshold: number;
  };
  shipping: {
    freeShippingThreshold: number;
    standardShippingRate: number;
    expressShippingRate: number;
  };
  tax: {
    taxRate: number;
    taxIncluded: boolean;
  };
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number;
  discount: number;
  images: string[]; // Changed from single image to array of images
  description: string;
  stock: number;
  colors: string[];
  sizes: string[];
  active: boolean;
  isFeatured: boolean;
}

export type Categories = Record<
  string,
  {
    name: string;
    id?: string;
    subcategories: string[];
  }
>;

export interface BulkAction {
  id: string;
  label: string;
  icon?: any;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  action: (ids: string[]) => void;
}

export interface CustomerWithStats extends Customer {
  id: string;
  orders: number;
  totalSpent: number;
  lastOrder: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface OrderWithUser extends Order {
  user: UserData;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface TableFilter {
  key: string;
  label: string;
  type: "select" | "date" | "range" | "search";
  options?: FilterOption[];
  placeholder?: string;
}

export interface ProductFormValues {
  name: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number;
  description: string;
  stock: number;
  colors: string; // Assuming colorsArray is an array of strings
  sizes: string; // Assuming sizesArray is an array of strings
  active: boolean;
  isFeatured: boolean;
  images: ImageFile[]; // Assuming `files` is an array of File objects
}
