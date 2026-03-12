
import * as React from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProductSearchProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function ProductSearch({ value, onChange, placeholder = "Search products...", className }: ProductSearchProps) {
    const [localValue, setLocalValue] = React.useState(value)

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onChange(localValue)
        }, 300)

        return () => clearTimeout(timer)
    }, [localValue, onChange])

    // Update local value when external value changes
    React.useEffect(() => {
        setLocalValue(value)
    }, [value])

    return (
        <div className={cn("relative", className)}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                placeholder={placeholder}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                className="pl-9 pr-9"
            />
            {localValue && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                    onClick={() => {
                        setLocalValue("")
                        onChange("")
                    }}
                >
                    <X className="h-3 w-3" />
                </Button>
            )}
        </div>
    )
}
