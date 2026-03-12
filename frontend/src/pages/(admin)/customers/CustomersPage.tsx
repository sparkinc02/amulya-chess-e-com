"use client";

import { useState, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Grid3X3,
  TableIcon,
  Search,
  RefreshCw,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
  Eye,
} from "lucide-react";

import { CustomerWithStats, Order, UserData } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "./components/DataTable";
import { CustomersGridView } from "./components/CustomersGridView";
import { useGetCustomers, CustomerWithUserData } from "./CustomerService";

type DialogType = {
  type: "details";
  customer: CustomerWithStats;
  userData: UserData;
};

export default function CustomersPage() {
  const [customersData, setCustomersData] = useState<CustomerWithUserData[]>(
    [],
  );
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerWithStats | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<UserData | null>(
    null,
  );
  const [dialogContent, setDialogContent] = useState<DialogType | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const {
    data: getCustomersResponse,
    isPending: isFetchingCustomers,
    isFetched: isFetchedCustomers,
    refetch,
    isRefetching,
  } = useGetCustomers();

  useEffect(() => {
    if (getCustomersResponse?.data) setCustomersData(getCustomersResponse.data);
  }, [getCustomersResponse]);

  // Extract just the customers for filtering
  const customers = customersData.map((item) => item.customer);

  // Filter customers based on search term and status
  const filteredCustomersData = customersData.filter((item) => {
    const customer = item.customer;
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ||
      getCustomerStatus(customer).label.toLowerCase() ===
        statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const filteredCustomers = filteredCustomersData.map((item) => item.customer);

  const getCustomerStatus = (customer: CustomerWithStats) => {
    if (customer.orders === 0)
      return { label: "New", variant: "secondary" as const };
    if (customer.orders >= 5)
      return { label: "VIP", variant: "default" as const };
    if (customer.totalSpent > 15000)
      return { label: "Premium", variant: "default" as const };
    return { label: "Regular", variant: "outline" as const };
  };

  // Dialog handlers
  const openDetailsDialog = (customer: CustomerWithStats) => {
    setSelectedCustomer(customer);
    // Find the corresponding UserData from the customersData
    const customerData = customersData.find(
      (item) => item.customer.id === customer.id,
    );
    if (customerData) {
      setSelectedUserData(customerData.userData);
      setDialogContent({
        type: "details",
        customer,
        userData: customerData.userData,
      });
    }
  };

  const closeDialog = () => {
    setDialogContent(null);
  };

  const refreshCustomers = () => {
    refetch();
  };

  const columns: ColumnDef<CustomerWithStats>[] = [
    {
      accessorKey: "name",
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
              Customer
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const customer = row.original;
        const initials = customer.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase();
        return (
          <div className="flex items-center justify-start">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{customer.name}</div>
                <div className="text-sm text-muted-foreground">
                  {customer.email}
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <div className="flex items-center justify-start">
          <span className="font-medium">Phone</span>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-start">
            <span className="whitespace-nowrap">{row.getValue("phone")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "orders",
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
              Orders
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <span className="font-medium">{row.getValue("orders")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "totalSpent",
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
              Total Spent
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("totalSpent"));
        const formatted = formatCurrency(amount);
        return (
          <div className="flex items-center justify-end min-w-[100px]">
            <span className="font-medium whitespace-nowrap">{formatted}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "lastOrder",
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
              Last Order
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const date = row.getValue("lastOrder") as string;
        return (
          <div className="flex items-center justify-center">
            <span className="whitespace-nowrap">
              {date ? formatDate(date) : "-"}
            </span>
          </div>
        );
      },
    },
    {
      id: "status",
      header: ({ column }) => (
        <div className="flex items-center justify-center">
          <span className="font-medium">Status</span>
        </div>
      ),
      cell: ({ row }) => {
        const customer = row.original;
        const status = getCustomerStatus(customer);
        return (
          <div className="flex items-center justify-center">
            <Badge variant={status.variant}>{status.label}</Badge>
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
        const customer = row.original;
        return (
          <div className="flex items-center justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDetailsDialog(customer)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Customer Management
          </h2>
          <p className="text-muted-foreground">
            Manage and view all customer information and order history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshCustomers}
            disabled={isRefetching}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 md:items-center flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers by name, email or phone..."
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
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="regular">Regular</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="xl:flex hidden items-center gap-2">
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
        Showing {filteredCustomers.length} of {customers.length} customers
      </div>

      {/* Content */}
      <div className="xl:block hidden">
        {viewMode === "grid" && (
          <CustomersGridView
            customers={filteredCustomers}
            onViewDetails={openDetailsDialog}
            isLoading={isFetchingCustomers || !isFetchedCustomers}
          />
        )}

        {viewMode === "table" && (
          <DataTable
            columns={columns}
            data={filteredCustomers}
            searchValue={searchTerm}
            isLoading={isFetchingCustomers || !isFetchedCustomers}
          />
        )}
      </div>

      <div className="xl:hidden block">
        <CustomersGridView
          customers={filteredCustomers}
          onViewDetails={openDetailsDialog}
          isLoading={isFetchingCustomers || !isFetchedCustomers}
        />
      </div>

      {/* Customer Details Dialog */}
      <Dialog
        open={dialogContent?.type === "details"}
        onOpenChange={() => dialogContent?.type === "details" && closeDialog()}
      >
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              Customer ID: {selectedCustomer?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && selectedUserData && (
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Customer Info</TabsTrigger>
                <TabsTrigger value="orders">
                  Orders ({selectedUserData.orders.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4 pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-xl">
                          {selectedCustomer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold">
                            {selectedCustomer.name}
                          </h3>
                          <Badge
                            variant={
                              getCustomerStatus(selectedCustomer).variant
                            }
                          >
                            {getCustomerStatus(selectedCustomer).label}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          {selectedCustomer.email}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-1">Phone</h4>
                          <p className="text-muted-foreground">
                            {selectedCustomer.phone}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Address</h4>
                          <p className="text-muted-foreground">
                            {selectedCustomer.address}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-1">Total Orders</h4>
                          <p className="text-2xl font-bold">
                            {selectedCustomer.orders}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Total Spent</h4>
                          <p className="text-2xl font-bold">
                            {formatCurrency(selectedCustomer.totalSpent)}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Last Order</h4>
                          <p className="text-muted-foreground">
                            {selectedCustomer.lastOrder
                              ? formatDate(selectedCustomer.lastOrder)
                              : "No orders yet"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="orders" className="pt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>
                      {selectedUserData.orders.length} orders found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedUserData.orders.length > 0 ? (
                      <div className="space-y-4">
                        {selectedUserData.orders.map((order, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{order.id}</p>
                                <Badge
                                  variant={
                                    order.status === "DELIVERED"
                                      ? "default"
                                      : order.status === "SHIPPED"
                                        ? "secondary"
                                        : order.status === "PROCESSING"
                                          ? "outline"
                                          : "destructive"
                                  }
                                >
                                  {order.status.charAt(0).toUpperCase() +
                                    order.status.slice(1).toLowerCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(
                                  new Date(
                                    order.createdAt,
                                  ).toLocaleDateString(),
                                )}{" "}
                                • {order.orderItems.length} items
                              </p>
                            </div>
                            <div className="font-medium">
                              {formatCurrency(order.amount)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No orders found for this customer.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
