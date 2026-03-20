import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const MinimalDialogRoot = DialogPrimitive.Root
const MinimalDialogTrigger = DialogPrimitive.Trigger
const MinimalDialogPortal = DialogPrimitive.Portal
const MinimalDialogClose = DialogPrimitive.Close

const MinimalDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
MinimalDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const MinimalDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <MinimalDialogPortal>
    <MinimalDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg max-h-[90vh] overflow-y-auto",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground cursor-pointer z-50">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </MinimalDialogPortal>
))
MinimalDialogContent.displayName = DialogPrimitive.Content.displayName

const MinimalDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
MinimalDialogHeader.displayName = "MinimalDialogHeader"

const MinimalDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
MinimalDialogFooter.displayName = "MinimalDialogFooter"

const MinimalDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
MinimalDialogTitle.displayName = DialogPrimitive.Title.displayName

const MinimalDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
MinimalDialogDescription.displayName = DialogPrimitive.Description.displayName

interface MinimalDialogProps {
  open: boolean
  onClose: () => void
  title?: string
  className?: string
  children: React.ReactNode
}

function MinimalDialog({ open, onClose, title, className, children }: MinimalDialogProps) {
  return (
    <MinimalDialogRoot open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <MinimalDialogContent className={className}>
        {title && (
          <MinimalDialogHeader>
            <MinimalDialogTitle>{title}</MinimalDialogTitle>
          </MinimalDialogHeader>
        )}
        {children}
      </MinimalDialogContent>
    </MinimalDialogRoot>
  )
}

export {
  MinimalDialog,
  MinimalDialogRoot,
  MinimalDialogPortal,
  MinimalDialogOverlay,
  MinimalDialogClose,
  MinimalDialogTrigger,
  MinimalDialogContent,
  MinimalDialogHeader,
  MinimalDialogFooter,
  MinimalDialogTitle,
  MinimalDialogDescription,
}
