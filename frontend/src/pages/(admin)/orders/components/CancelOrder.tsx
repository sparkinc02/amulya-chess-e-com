
import type React from "react"
import { useState } from "react"
import { AlertTriangle, Loader2, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Order, OrderWithUser } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
// import { toast } from "@/components/ui/use-toast"

interface CancelOrderDialogProps {
    order: OrderWithUser
    onCancelOrder: (
        orderId: string,
        data: {
            reason: string
            refundType: string
            refundAmount: number
            notifyCustomer: boolean
            restockItems: boolean
        },
    ) => Promise<void>
    onClose: () => void
}

const cancellationReasons = [
    "Customer requested cancellation",
    "Payment failed",
    "Item out of stock",
    "Shipping address issue",
    "Duplicate order",
    "Fraudulent order",
    "Other",
]

export const CancelOrderDialog = ({ order, onCancelOrder, onClose }: CancelOrderDialogProps) => {
    const [reason, setReason] = useState("")
    const [customReason, setCustomReason] = useState("")
    const [refundType, setRefundType] = useState("full")
    const [refundAmount, setRefundAmount] = useState(order.amount)
    const [notifyCustomer, setNotifyCustomer] = useState(true)
    const [restockItems, setRestockItems] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleReasonChange = (value: string) => {
        setReason(value)
        if (value !== "Other") {
            setCustomReason("")
        }
    }

    const handleRefundTypeChange = (value: string) => {
        setRefundType(value)
        if (value === "full") {
            setRefundAmount(order.amount)
        } else if (value === "partial") {
            setRefundAmount(order.amount) // Exclude shipping
        } else {
            setRefundAmount(0)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const finalReason = reason === "Other" ? customReason : reason

        if (!finalReason.trim()) {
            // toast({
            //     title: "Reason required",
            //     description: "Please provide a reason for cancellation.",
            //     variant: "destructive",
            // })
            return
        }

        if (refundType === "partial" && refundAmount <= 0) {
            // toast({
            //     title: "Invalid refund amount",
            //     description: "Please enter a valid refund amount.",
            //     variant: "destructive",
            // })
            return
        }

        setIsSubmitting(true)

        try {
            await onCancelOrder(order.id, {
                reason: finalReason.trim(),
                refundType,
                refundAmount,
                notifyCustomer,
                restockItems,
            })
            // toast({
            //     title: "Order cancelled successfully",
            //     description: `Order ${order.id} has been cancelled.`,
            // })
            onClose()
        } catch (error) {
            // toast({
            //     title: "Error cancelling order",
            //     description: "There was a problem cancelling the order.",
            //     variant: "destructive",
            // })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Alert className="border-destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    <strong>Warning:</strong> This action cannot be undone. The order will be permanently cancelled.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                    <CardDescription>Order #{order.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span>Customer:</span>
                        <span className="font-medium">{order.user.userName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-medium">{formatCurrency(order.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-medium capitalize">{order.status}</span>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-2">
                <Label htmlFor="reason">Cancellation Reason *</Label>
                <Select value={reason} onValueChange={handleReasonChange} required>
                    <SelectTrigger id="reason">
                        <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                        {cancellationReasons.map((reasonOption) => (
                            <SelectItem key={reasonOption} value={reasonOption}>
                                {reasonOption}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {reason === "Other" && (
                <div className="space-y-2">
                    <Label htmlFor="custom-reason">Custom Reason *</Label>
                    <Textarea
                        id="custom-reason"
                        placeholder="Please specify the reason for cancellation"
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        rows={3}
                        required
                    />
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Refund Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="refund-type">Refund Type</Label>
                        <Select value={refundType} onValueChange={handleRefundTypeChange}>
                            <SelectTrigger id="refund-type">
                                <SelectValue placeholder="Select refund type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="full">Full Refund ({formatCurrency(order.amount)})</SelectItem>
                                <SelectItem value="partial">Partial Refund</SelectItem>
                                <SelectItem value="none">No Refund</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {refundType === "partial" && (
                        <div className="space-y-2">
                            <Label htmlFor="refund-amount">Refund Amount</Label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm">₹</span>
                                <input
                                    id="refund-amount"
                                    type="number"
                                    min="0"
                                    max={order.amount}
                                    step="0.01"
                                    value={refundAmount}
                                    onChange={(e) => setRefundAmount(Number(e.target.value))}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    required
                                />
                            </div>
                                <p className="text-xs text-muted-foreground">Maximum refund amount: {formatCurrency(order.amount)}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Switch id="restock-items" checked={restockItems} onCheckedChange={setRestockItems} />
                    <Label htmlFor="restock-items">Restock items to inventory</Label>
                </div>

                <div className="flex items-center space-x-2">
                    <Switch id="notify-customer-cancel" checked={notifyCustomer} onCheckedChange={setNotifyCustomer} />
                    <Label htmlFor="notify-customer-cancel">Send cancellation notification to customer</Label>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                    Go Back
                </Button>
                <Button type="submit" variant="destructive" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cancelling...
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Confirm Cancellation
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
