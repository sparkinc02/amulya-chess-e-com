
import { MoreHorizontal, Eye, Send, Printer, FileText, AlertTriangle, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Order, OrderWithUser } from "@/lib/types"

interface OrderActionsMenuProps {
    order: OrderWithUser
    onViewDetails: (order: OrderWithUser) => void
    onUpdateStatus: (order: OrderWithUser) => void
    // onSendMessage: (order: OrderWithUser) => void
    // onPrintOrder: (order: OrderWithUser) => void
    // onGenerateInvoice: (order: OrderWithUser) => void
    // onCancelOrder: (order: OrderWithUser) => void
}

export const OrderActionsMenu = ({
    order,
    onViewDetails,
    onUpdateStatus,
    // onSendMessage,
    // onPrintOrder,
    // onGenerateInvoice,
    // onCancelOrder,
}: OrderActionsMenuProps) => {
        const isCancellable = order.status !== "DELIVERED" && order.status !== "CANCELLED"

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onViewDetails(order)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateStatus(order)}>
                    <Package className="mr-2 h-4 w-4" />
                    Update Status
                </DropdownMenuItem>
                {/* <DropdownMenuItem onClick={() => onSendMessage(order)}>
                    <Send className="mr-2 h-4 w-4" />
                    Message Customer
                </DropdownMenuItem> */}
                {/* <DropdownMenuSeparator /> */}
                {/* <DropdownMenuItem onClick={() => onPrintOrder(order)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print Order
                </DropdownMenuItem> */}
                {/* <DropdownMenuItem onClick={() => onGenerateInvoice(order)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Invoice
                </DropdownMenuItem> */}
                {/* <DropdownMenuSeparator /> */}
                {/* <DropdownMenuItem
                    onClick={() => onCancelOrder(order)}
                    disabled={!isCancellable}
                    className={!isCancellable ? "text-muted-foreground" : "text-destructive"}
                >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Cancel Order
                </DropdownMenuItem> */}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
