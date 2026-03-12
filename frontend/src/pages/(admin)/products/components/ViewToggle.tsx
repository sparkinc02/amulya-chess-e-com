"use client"
import { Grid, List } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useLocalStorage } from "@/lib/hooks/hooks"

interface ViewToggleProps {
    storageKey?: string
    onChange?: (view: "grid" | "table") => void
    className?: string
}

export const ViewToggle = ({ storageKey = "view-mode", onChange, className }: ViewToggleProps) => {
    const [view, setView] = useLocalStorage<"grid" | "table">(storageKey, "table")

    const handleViewChange = (newView: "grid" | "table") => {
        setView(newView)
        onChange?.(newView)
    }

    return (
        <div className={cn("flex items-center gap-1 rounded-md border p-1", className)}>
            <Button
                variant={view === "table" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleViewChange("table")}
                aria-label="Table view"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant={view === "grid" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleViewChange("grid")}
                aria-label="Grid view"
            >
                <Grid className="h-4 w-4" />
            </Button>
        </div>
    )
}
