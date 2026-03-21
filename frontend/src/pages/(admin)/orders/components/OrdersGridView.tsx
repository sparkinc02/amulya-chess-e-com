import type { Order, OrderWithUser } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Calendar, User, Package, CreditCard, Loader2 } from "lucide-react"
import { OrderActionsMenu } from "./OrderActionMenu"

interface OrderGridProps {
    orders: OrderWithUser[]
    onViewDetails: (order: OrderWithUser) => void
    onUpdateStatus: (order: OrderWithUser) => void
    isLoading?: boolean
    // onSendMessage: (order: OrderWithUser) => void
    // onPrintOrder: (order: Order) => void
    // onGenerateInvoice: (order: Order) => void
    // onCancelOrder: (order: OrderWithUser) => void
}

export const OrdersGridView = ({
    orders,
    onViewDetails,
    onUpdateStatus,
    isLoading = false,
    // onSendMessage,
    // onPrintOrder,
    // onGenerateInvoice,
    // onCancelOrder,
}: OrderGridProps) => {
    if (isLoading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading orders...</span>
                </div>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className="flex h-40 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 p-8 text-center">
                <Package className="h-8 w-8 text-muted-foreground" />
                <div>
                    <h3 className="font-medium">No orders found</h3>
                    <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {orders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{order.id}</CardTitle>
                            <OrderActionsMenu
                                order={order}
                                onViewDetails={onViewDetails}
                                onUpdateStatus={onUpdateStatus}
                                // onSendMessage={onSendMessage}
                                // onPrintOrder={onPrintOrder}
                                // onGenerateInvoice={onGenerateInvoice}
                                // onCancelOrder={onCancelOrder}
                            />
                        </div>
                        <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(order.createdAt, true)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                                <p className="font-medium text-sm">{order.user.userName}</p>
                                <p className="text-xs text-muted-foreground">{order.user.email}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{order.orderItems.length} items</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{formatCurrency(order.amount)}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                        <Badge
                            className="w-full justify-center py-1"
                            variant={
                                order.status === "DELIVERED"
                                    ? "default"
                                    : order.status === "SHIPPED"
                                        ? "secondary"
                                        : order.status === "PROCESSING"
                                            ? "outline"
                                            : order.status === "CANCELLED"
                                                ? "destructive"
                                                : "secondary"
                            }
                        >
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()}
                        </Badge>
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
