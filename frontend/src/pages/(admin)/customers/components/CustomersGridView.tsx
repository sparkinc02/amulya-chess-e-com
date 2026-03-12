import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
  Eye,
  Loader2,
} from "lucide-react";
import { CustomerWithStats } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CustomersGridViewProps {
  customers: CustomerWithStats[];
  onViewDetails: (customer: CustomerWithStats) => void;
  isLoading?: boolean;
}

export function CustomersGridView({
  customers,
  onViewDetails,
  isLoading = false,
}: CustomersGridViewProps) {
  const getCustomerStatus = (customer: CustomerWithStats) => {
    if (customer.orders === 0)
      return { label: "New", variant: "secondary" as const };
    if (customer.orders >= 5)
      return { label: "VIP", variant: "default" as const };
    if (customer.totalSpent > 15000)
      return { label: "Premium", variant: "default" as const };
    return { label: "Regular", variant: "outline" as const };
  };

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Loading customers...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {customers.map((customer) => {
        const initials = customer.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase();
        const status = getCustomerStatus(customer);

        return (
          <Card
            key={customer.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onViewDetails(customer)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <div>
                <CardTitle className="text-lg">{customer.name}</CardTitle>
                <CardDescription className="text-sm">
                  {customer.email}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{customer.address}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <ShoppingBag className="h-4 w-4" />
                    <span>Orders</span>
                  </div>
                  <div className="font-semibold">{customer.orders}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">
                    Total Spent
                  </div>
                  <div className="font-semibold">
                    {formatCurrency(customer.totalSpent)}
                  </div>
                </div>
              </div>
              {customer.lastOrder && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                  <Calendar className="h-4 w-4" />
                  <span>Last order: {formatDate(customer.lastOrder)}</span>
                </div>
              )}
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(customer);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
