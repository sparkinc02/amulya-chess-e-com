
import type React from "react"
import { useState } from "react"
import { Send, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Order } from "@/lib/types"

interface CustomerMessageFormProps {
    order: Order
    onSendMessage: (
        orderId: string,
        data: {
            type: string
            subject: string
            message: string
            priority: string
        },
    ) => Promise<void>
    onClose: () => void
}

const messageTemplates = {
    status_update: {
        subject: "Update on your order #{orderId}",
        message:
            "Hi {customerName},\n\nWe wanted to update you on your recent order #{orderId}.\n\n[Your message here]\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nCustomer Service Team",
    },
    shipping_delay: {
        subject: "Shipping delay notification - Order #{orderId}",
        message:
            "Hi {customerName},\n\nWe're writing to inform you about a delay with your order #{orderId}.\n\n[Explain the delay and new expected timeline]\n\nWe apologize for any inconvenience and appreciate your patience.\n\nBest regards,\nCustomer Service Team",
    },
    delivery_confirmation: {
        subject: "Your order #{orderId} has been delivered",
        message:
            "Hi {customerName},\n\nGreat news! Your order #{orderId} has been successfully delivered.\n\nWe hope you're happy with your purchase. If you have any issues, please let us know.\n\nThank you for choosing us!\n\nBest regards,\nCustomer Service Team",
    },
    custom: {
        subject: "Regarding your order #{orderId}",
        message: "",
    },
}

export const CustomerMessageForm = ({ order, onSendMessage, onClose }: CustomerMessageFormProps) => {
    const [messageType, setMessageType] = useState("custom")
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [priority, setPriority] = useState("normal")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleTemplateChange = (type: string) => {
        setMessageType(type)
        const template = messageTemplates[type as keyof typeof messageTemplates]
        if (template) {
            setSubject(template.subject.replace("{orderId}", order.id))
            setMessage(template.message.replace("{customerName}", order.customer.name).replace(/{orderId}/g, order.id))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!subject.trim() || !message.trim()) {
            // toast({
            //     title: "Required fields missing",
            //     description: "Please fill in both subject and message fields.",
            //     variant: "destructive",
            // })
            return
        }

        setIsSubmitting(true)

        try {
            await onSendMessage(order.id, {
                type: messageType,
                subject: subject.trim(),
                message: message.trim(),
                priority,
            })
            // toast({
            //     title: "Message sent successfully",
            //     description: `Message sent to ${order.customer.name}`,
            // })
            onClose()
        } catch (error) {
            // toast({
            //     title: "Error sending message",
            //     description: "There was a problem sending your message.",
            //     variant: "destructive",
            // })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Customer Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-sm font-medium">Name:</span>
                        <span className="text-sm">{order.customer.name}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm font-medium">Email:</span>
                        <span className="text-sm">{order.customer.email}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-sm font-medium">Order:</span>
                        <Badge variant="outline">{order.id}</Badge>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-2">
                <Label htmlFor="template">Message Template</Label>
                <Select value={messageType} onValueChange={handleTemplateChange}>
                    <SelectTrigger id="template">
                        <SelectValue placeholder="Choose a template" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="status_update">Status Update</SelectItem>
                        <SelectItem value="shipping_delay">Shipping Delay</SelectItem>
                        <SelectItem value="delivery_confirmation">Delivery Confirmation</SelectItem>
                        <SelectItem value="custom">Custom Message</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="priority">
                        <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="normal">Normal Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject"
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={8}
                    required
                />
                <p className="text-xs text-muted-foreground">
                    Tip: Use {"{customerName}"} and {"{orderId}"} as placeholders
                </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}
