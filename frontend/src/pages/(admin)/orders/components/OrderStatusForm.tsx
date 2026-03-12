import type React from "react";
import { useState } from "react";
import { Check, Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import type { ApiResponse, Order } from "@/lib/types";
import { useUpdateOrderStatus } from "../orderService";
import { isAxiosError, AxiosError } from "axios";
import { DatePicker } from "@/components/ui/date-picker";

interface OrderStatusFormProps {
  order: Order;
  onClose: () => void;
  setIsDatePickerOpen?: (open: boolean) => void;
}

export const OrderStatusForm = ({
  order,
  onClose,
  setIsDatePickerOpen,
}: OrderStatusFormProps) => {
  const [status, setStatus] = useState<string>(order.status);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState<Date | undefined>(
    undefined,
  );
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mutate: updateOrderStatus, isPending: isUpdatingStatus } =
    useUpdateOrderStatus();
  const [localDatePickerOpen, setLocalDatePickerOpen] = useState(false);
  const handleDatePickerOpenChange =
    setIsDatePickerOpen || setLocalDatePickerOpen;

  const statusOptions = [
    {
      value: "ORDER_PLACED",
      label: "Order Placed",
      description: "Order has been placed by the customer",
    },
    {
      value: "PROCESSING",
      label: "Processing",
      description: "Order is being prepared",
    },
    {
      value: "SHIPPED",
      label: "Shipped",
      description: "Order has been dispatched",
    },
    {
      value: "DELIVERED",
      label: "Delivered",
      description: "Order has been delivered",
    },
    {
      value: "CANCELLED",
      label: "Cancelled",
      description: "Order has been cancelled",
    },
  ];

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Check if status is selected
    if (!status) {
      newErrors.status = "Please select a status";
    }

    // Validate status transitions
    if (order.status === "DELIVERED") {
      newErrors.status = "Cannot update order that is already delivered";
    }

    if (order.status === "CANCELLED") {
      newErrors.status = "Cannot update order that is already cancelled";
    }

    // Only allow valid transitions
    if (
      order.status === "ORDER_PLACED" &&
      status !== "PROCESSING" &&
      status !== "CANCELLED"
    ) {
      newErrors.status =
        "You can only move from Order Placed to Processing or Cancelled";
    }

    // Validate SHIPPED status requirements
    if (status === "SHIPPED") {
      if (!trackingNumber.trim()) {
        newErrors.trackingNumber =
          "Tracking number is required for shipped orders";
      } else if (trackingNumber.trim().length < 3) {
        newErrors.trackingNumber =
          "Tracking number must be at least 3 characters";
      }

      if (!estimatedDelivery) {
        newErrors.estimatedDelivery =
          "Estimated delivery date is required for shipped orders";
      } else if (estimatedDelivery <= new Date()) {
        newErrors.estimatedDelivery =
          "Estimated delivery date must be in the future";
      }
    }

    // Validate note length
    if (note && note.length > 500) {
      newErrors.note = "Note cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      updateOrderStatus(
        {
          orderId: order.id,
          status,
          trackingNumber: trackingNumber.trim() || undefined,
          note: status === "SHIPPED" ? note.trim() : "",
          notifyCustomer,
          estimatedDelivery:
            estimatedDelivery?.toISOString().split("T")[0] || undefined,
        },
        {
          onSuccess: () => {
            toast.success(`Order status updated to ${status}`);
            onClose();
          },
          onError: (error: Error) => {
            if (isAxiosError(error)) {
              const axiosError = error as AxiosError;
              const responseData = axiosError.response
                ?.data as ApiResponse<void>;
              if (responseData && responseData.message) {
                toast.error(responseData.message);
                return;
              }
            }
            toast.error("Failed to update order status. Please try again.");
          },
        },
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status. Please try again.");
    }
  };

  const selectedStatusOption = statusOptions.find(
    (option) => option.value === status,
  );

  // Clear errors and note when status changes
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    if (newStatus !== "SHIPPED") setNote("");
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.status;
      delete newErrors.trackingNumber;
      delete newErrors.estimatedDelivery;
      delete newErrors.note;
      return newErrors;
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Order Status</CardTitle>
          <CardDescription>Order #{order.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            Current Status:{" "}
            <span className="font-medium capitalize">{order.status}</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <Label htmlFor="status">New Status</Label>
        <Select value={status} onValueChange={handleStatusChange} required>
          <SelectTrigger
            id="status"
            className={errors.status ? "border-red-500" : ""}
          >
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {option.description}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedStatusOption && (
          <p className="text-sm text-muted-foreground">
            {selectedStatusOption.description}
          </p>
        )}
        {errors.status && (
          <p className="text-sm text-red-500">{errors.status}</p>
        )}
      </div>

      {status === "SHIPPED" && (
        <div className="space-y-4 p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-blue-600" />
            <Label className="text-blue-900 dark:text-blue-100 font-medium">
              Shipping Information
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracking">Tracking Number *</Label>
            <Input
              id="tracking"
              placeholder="Enter tracking number"
              value={trackingNumber}
              onChange={(e) => {
                setTrackingNumber(e.target.value);
                if (errors.trackingNumber) {
                  setErrors((prev) => ({ ...prev, trackingNumber: "" }));
                }
              }}
              className={errors.trackingNumber ? "border-red-500" : ""}
            />
            {errors.trackingNumber && (
              <p className="text-sm text-red-500">{errors.trackingNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery">Estimated Delivery Date *</Label>
            <DatePicker
              date={estimatedDelivery}
              onDateChange={(date) => {
                setEstimatedDelivery(date);
                if (errors.estimatedDelivery) {
                  setErrors((prev) => ({ ...prev, estimatedDelivery: "" }));
                }
              }}
              placeholder="Select delivery date"
              className={errors.estimatedDelivery ? "border-red-500" : ""}
              onOpenChange={handleDatePickerOpenChange}
            />
            {errors.estimatedDelivery && (
              <p className="text-sm text-red-500">{errors.estimatedDelivery}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Status Update Note</Label>
            <Textarea
              id="note"
              placeholder="Add a note about this status change (optional)"
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (errors.note) {
                  setErrors((prev) => ({ ...prev, note: "" }));
                }
              }}
              rows={3}
              className={errors.note ? "border-red-500" : ""}
            />
            {errors.note && (
              <p className="text-sm text-red-500">{errors.note}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {note.length}/500 characters
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <Switch
          id="notify-customer"
          checked={notifyCustomer}
          onCheckedChange={setNotifyCustomer}
        />
        <Label htmlFor="notify-customer">
          Send email notification to customer
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isUpdatingStatus}>
          {isUpdatingStatus ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Update Status
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
