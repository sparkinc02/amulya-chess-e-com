import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Grid3X3,
  TableIcon,
  Search,
  RefreshCw,
  Download,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order, OrderWithUser } from "@/lib/types";
import { CancelOrderDialog } from "./components/CancelOrder";
import { CustomerMessageForm } from "./components/CustomerMessageForm";
import { OrderActionsMenu } from "./components/OrderActionMenu";
import { OrderStatusForm } from "./components/OrderStatusForm";
import { OrdersGridView } from "./components/OrdersGridView";
import { OrdersDataTable } from "./components/OrdersDataTable";
import { useGetOrders, useUpdateOrderStatus } from "./orderService";
import { useEffect } from "react";
import { toast } from "sonner";
import { MinimalDialog } from "@/components/ui/minimal-dialog";

type DialogType =
  | { type: "details" }
  | { type: "status"; order: OrderWithUser }
  | { type: "message"; order: OrderWithUser }
  | { type: "cancel"; order: OrderWithUser };

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithUser[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<OrderWithUser | null>(
    null,
  );
  const [dialogContent, setDialogContent] = useState<DialogType | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const {
    data: getOrdersResponse,
    isPending: isFetchingOrders,
    isFetched: isFetchedOrders,
    refetch,
    isRefetching,
  } = useGetOrders();
  const { mutate: updateOrderStatus, isPending: isUpdatingStatus } =
    useUpdateOrderStatus();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    if (getOrdersResponse?.data) setOrders(getOrdersResponse.data);
  }, [getOrdersResponse]);

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    console.log("Filtered Orders", filteredOrders);
  }, [filteredOrders]);

  // Dialog handlers
  const openDetailsDialog = (order: OrderWithUser) => {
    setSelectedOrder(order);
    setDialogContent({ type: "details" });
  };

  const openStatusDialog = (order: OrderWithUser) => {
    setDialogContent({ type: "status", order });
  };

  // const openMessageDialog = (order: OrderWithUser) => {
  //     setDialogContent({ type: "message", order })
  // }

  // const openCancelDialog = (order: OrderWithUser) => {
  //     setDialogContent({ type: "cancel", order })
  // }

  const closeDialog = () => {
    setDialogContent(null);
  };

  // Action handlers
  const handleUpdateStatus = async (
    orderId: string,
    data: {
      status: string;
      trackingNumber?: string;
      note: string;
      notifyCustomer: boolean;
      estimatedDelivery?: string;
    },
  ) => {
    try {
      updateOrderStatus({
        orderId,
        status: data.status,
        trackingNumber: data.trackingNumber,
        note: data.note,
        notifyCustomer: data.notifyCustomer,
        estimatedDelivery: data.estimatedDelivery,
      });

      toast.success(`Order status updated to ${data.status}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status. Please try again.");
    }
  };

  const handleSendMessage = async (
    orderId: string,
    data: {
      type: string;
      subject: string;
      message: string;
      priority: string;
    },
  ) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleCancelOrder = async (
    orderId: string,
    data: {
      reason: string;
      refundType: string;
      refundAmount: number;
      notifyCustomer: boolean;
      restockItems: boolean;
    },
  ) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Update order status to cancelled
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: "CANCELLED" } : order,
      ),
    );
  };

  const handlePrintOrder = (order: Order) => {
    // toast({
    //     title: "Printing order",
    //     description: `Preparing to print order ${order.id}`,
    // })
    // In a real app, this would trigger a print dialog or generate a printable PDF
  };

  const handleGenerateInvoice = (order: Order) => {
    // toast({
    //     title: "Generating invoice",
    //     description: `Invoice for order ${order.id} is being generated`,
    // })
    // In a real app, this would generate an invoice PDF
  };

  const refreshOrders = () => {
    refetch();
  };

  const columns: ColumnDef<OrderWithUser>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <div className="flex items-center justify-start">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium"
            >
              Order ID
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-start">
            <span className="font-medium">{row.getValue("id")}</span>
          </div>
        );
      },
    },
    {
      id: "customer",
      header: ({ column }) => (
        <div className="flex items-center justify-start">
          <span className="font-medium">Customer</span>
        </div>
      ),
      cell: ({ row }) => {
        const customer = row.original.user;
        return (
          <div className="flex items-center justify-start">
            <div>
              <div className="font-medium">{customer.userName}</div>
              <div className="text-sm text-muted-foreground">
                {customer.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium"
            >
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as Date;
        return (
          <div className="flex items-center justify-center">
            <span className="whitespace-nowrap">
              {formatDate(date, true)}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <div className="flex items-center justify-center">
          <span className="font-medium">Status</span>
        </div>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return (
          <div className="flex items-center justify-center">
            <Badge
              variant={
                status === "DELIVERED"
                  ? "default"
                  : status === "SHIPPED"
                    ? "secondary"
                    : status === "PROCESSING"
                      ? "outline"
                      : status === "CANCELLED"
                        ? "destructive"
                        : "secondary"
              }
            >
              {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
            </Badge>
          </div>
        );
      },
    },
    {
      id: "totalItems",
      header: ({ column }) => {
        return (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium"
            >
              Items
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <span className="font-medium">
              {row.original.orderItems.length}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "total",
      header: ({ column }) => {
        return (
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium"
            >
              Total
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end min-w-[100px]">
            <span className="font-medium whitespace-nowrap">
              {formatCurrency(row.original.amount)}
            </span>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: ({ column }) => (
        <div className="flex items-center justify-center">
          <span className="font-medium">Actions</span>
        </div>
      ),
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="flex items-center justify-center">
            <OrderActionsMenu
              order={order}
              onViewDetails={openDetailsDialog}
              onUpdateStatus={openStatusDialog}
              // onSendMessage={openMessageDialog}
              // onPrintOrder={handlePrintOrder}
              // onGenerateInvoice={handleGenerateInvoice}
              // onCancelOrder={openCancelDialog}
            />
          </div>
        );
      },
    },
  ];
  // Get order statistics
  // const orderStats = {
  //     total: orders.length,
  //     pending: orders.filter((o) => o.status === "pending").length,
  //     processing: orders.filter((o) => o.status === "processing").length,
  //     shipped: orders.filter((o) => o.status === "shipped").length,
  //     delivered: orders.filter((o) => o.status === "delivered").length,
  //     cancelled: orders.filter((o) => o.status === "cancelled").length,
  // }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Order Management
          </h2>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshOrders}
            disabled={isRefetching}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orderStats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{orderStats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Processing</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{orderStats.processing}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Shipped</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">{orderStats.shipped}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Delivered</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{orderStats.delivered}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{orderStats.cancelled}</div>
                    </CardContent>
                </Card>
            </div> */}

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 md:items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders by customer name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PROCESSING">Processing</SelectItem>
              <SelectItem value="SHIPPED">Shipped</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className=" xl:flex hidden  items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            <TableIcon className="h-4 w-4 mr-2" />
            Table
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>
      <div className="xl:block hidden">
        {viewMode === "grid" && (
          <OrdersGridView
            orders={filteredOrders}
            onViewDetails={openDetailsDialog}
            onUpdateStatus={openStatusDialog}
            isLoading={isFetchingOrders || !isFetchedOrders}
            // onSendMessage={openMessageDialog}
            // onPrintOrder={handlePrintOrder}
            // onGenerateInvoice={handleGenerateInvoice}
            // onCancelOrder={openCancelDialog}
          />
        )}

        {viewMode === "table" && (
          <OrdersDataTable
            columns={columns}
            data={filteredOrders}
            searchValue={searchTerm}
            isLoading={isFetchingOrders || !isFetchedOrders}
          />
        )}
      </div>
      <div className="xl:hidden block">
        <OrdersGridView
          orders={filteredOrders}
          onViewDetails={openDetailsDialog}
          onUpdateStatus={openStatusDialog}
          isLoading={isFetchingOrders || !isFetchedOrders}
          // onSendMessage={openMessageDialog}
          // onPrintOrder={handlePrintOrder}
          // onGenerateInvoice={handleGenerateInvoice}
          // onCancelOrder={openCancelDialog}
        />
      </div>

      {/* Orders Display */}

      {/* Order Details Dialog */}
      <Dialog
        open={dialogContent?.type === "details"}
        onOpenChange={() => dialogContent?.type === "details" && closeDialog()}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Order ID: {selectedOrder?.id}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Order Details</TabsTrigger>
                <TabsTrigger value="customer">Customer Info</TabsTrigger>
                <TabsTrigger value="items">Items</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Date
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatDate(
                          new Date(
                            selectedOrder.createdAt,
                          ).toLocaleDateString(),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge
                        className="text-lg py-1 px-3"
                        variant={
                          selectedOrder.status === "DELIVERED"
                            ? "default"
                            : selectedOrder.status === "SHIPPED"
                              ? "secondary"
                              : selectedOrder.status === "PROCESSING"
                                ? "outline"
                                : selectedOrder.status === "CANCELLED"
                                  ? "destructive"
                                  : "secondary"
                        }
                      >
                        {selectedOrder.status.charAt(0).toUpperCase() +
                          selectedOrder.status.slice(1).toLowerCase()}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* {selectedOrder?.trackingNumber && (
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium">Tracking Information</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-lg font-mono">{selectedOrder?.trackingNumber}</div>
                                        </CardContent>
                                    </Card>
                                )} */}

                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(selectedOrder.amount)}</span>
                    </div>
                    {/* <div className="flex justify-between">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span>{formatCurrency(selectedOrder.shippingAddress)}</span> }         
                                        </div> */}
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(selectedOrder.amount)}</span>
                    </div>
                  </CardContent>
                </Card>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => openStatusDialog(selectedOrder)}
                  >
                    Update Status
                  </Button>
                  {/* <Button onClick={() => openMessageDialog(selectedOrder)}>Message Customer</Button> */}
                </div>
              </TabsContent>
              <TabsContent value="customer" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium">Name</h4>
                      <p>{selectedOrder.user.userName}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Email</h4>
                      <p>{selectedOrder.user.email}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Phone</h4>
                      <p>{selectedOrder.user.phone}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Shipping Address</h4>
                      <p>
                        {selectedOrder.shippingAddress.addressLine},{" "}
                        {selectedOrder.shippingAddress.city},{" "}
                        {selectedOrder.shippingAddress.state}{" "}
                        {selectedOrder.shippingAddress.pincode}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="items" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                    <CardDescription>
                      Total Items: {selectedOrder.orderItems.length}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedOrder.orderItems.map((item, i) => (
                        <div
                          key={i}
                          className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0 gap-4"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            {/* Product Image */}
                            <div className="w-16 h-16 rounded-lg overflow-hidden border flex-shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "/placeholder.svg";
                                }}
                              />
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">{item.name}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                {item.size && (
                                  <span className="flex items-center gap-1">
                                    <span className="font-medium">Size:</span>
                                    <span className="px-2 py-1 bg-muted text-foreground rounded text-xs">
                                      {item.size}
                                    </span>
                                  </span>
                                )}
                                {item.color && (
                                  <span className="flex items-center gap-1">
                                    <span className="font-medium">Color:</span>
                                    <span className="px-2 py-1 bg-muted text-foreground rounded text-xs">
                                      {item.color}
                                    </span>
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {formatCurrency(item.price)} × {item.quantity}
                              </p>
                            </div>
                          </div>

                          {/* Total Price */}
                          <div className="font-medium text-right min-w-[80px]">
                            {formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      {/* Update Status Dialog */}
      <MinimalDialog
        open={dialogContent?.type === "status"}
        onClose={closeDialog}
        title="Update Order Status"
        className="sm:max-w-[600px]"
      >
        {dialogContent?.type === "status" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Change the status for order {dialogContent.order.id}
            </p>
            <OrderStatusForm
              order={dialogContent.order}
              onClose={closeDialog}
              setIsDatePickerOpen={setIsDatePickerOpen}
            />
          </div>
        )}
      </MinimalDialog>

      {/* Message Customer Dialog */}
      {/* <Dialog
                open={dialogContent?.type === "message"}
                onOpenChange={() => dialogContent?.type === "message" && closeDialog()}
            >
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Message Customer</DialogTitle>
                        <DialogDescription>Send a message to the customer about their order</DialogDescription>
                    </DialogHeader>
                    {dialogContent?.type === "message" && (
                        <CustomerMessageForm order={dialogContent.order} onSendMessage={handleSendMessage} onClose={closeDialog} />
                    )}
                </DialogContent>
            </Dialog> */}

      {/* Cancel Order Dialog */}
      {/* <Dialog
                open={dialogContent?.type === "cancel"}
                onOpenChange={() => dialogContent?.type === "cancel" && closeDialog()}
            >
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Cancel Order</DialogTitle>
                        <DialogDescription>Are you sure you want to cancel this order?</DialogDescription>
                    </DialogHeader>
                    {dialogContent?.type === "cancel" && (
                        <CancelOrderDialog order={dialogContent.order} onCancelOrder={handleCancelOrder} onClose={closeDialog} />
                    )}
                </DialogContent>
            </Dialog> */}
    </div>
  );
}
