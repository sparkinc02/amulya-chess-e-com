import * as React from "react"
import { Check, ChevronDown, X, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export type FilterOption = {
    label: string
    value: string
    count?: number
}

export type FilterGroup = {
    id: string
    label: string
    type: "select" | "multi-select" | "max-price" | "date" | "boolean"
    options?: FilterOption[]
    range?: {
        min: number
        max: number
        step?: number
        formatValue?: (value: number) => string
    }
}

interface EnhancedFiltersProps {
    filters: FilterGroup[]
    activeFilters: Record<string, any>
    onFilterChange: (id: string, value: any) => void
    onClearFilter: (id: string) => void
    onClearAllFilters: () => void
    className?: string
}

export function EnhancedFilters({
    filters,
    activeFilters,
    onFilterChange,
    onClearFilter,
    onClearAllFilters,
    className,
}: EnhancedFiltersProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const activeFilterCount = Object.keys(activeFilters).length

    return (
        <div className={cn("space-y-4", className)}>
            {/* Filter trigger and active filters */}
            <div className="flex flex-wrap items-center gap-2">
                <Popover open={isOpen} onOpenChange={setIsOpen}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-9 border-dashed">
                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                            Filters
                            {activeFilterCount > 0 && (
                                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs flex justify-center">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                        <Card className="border-0 shadow-none">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium">Filter Products</CardTitle>
                                    {activeFilterCount > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                onClearAllFilters()
                                                setIsOpen(false)
                                            }}
                                            className="h-auto p-1 text-xs"
                                        >
                                            Clear all
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 max-h-[400px] overflow-auto">
                                {filters.map((filter) => (
                                    <div key={filter.id} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium">{filter.label}</h4>
                                            {activeFilters[filter.id] !== undefined && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onClearFilter(filter.id)}
                                                    className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </div>

                                        {filter.type === "select" && filter.options && (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" size="sm" className="w-full justify-between font-normal">
                                                        {activeFilters[filter.id]
                                                            ? filter.options.find((option) => option.value === activeFilters[filter.id])?.label ||
                                                            "Select..."
                                                            : "Select..."}
                                                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[250px] p-0">
                                                    <Command>
                                                        <CommandInput placeholder={`Search ${filter.label.toLowerCase()}...`} />
                                                        <CommandList>
                                                            <CommandEmpty>No results found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {filter.options.map((option) => (
                                                                    <CommandItem
                                                                        key={option.value}
                                                                        value={option.value}
                                                                        onSelect={() => onFilterChange(filter.id, option.value)}
                                                                    >
                                                                        <Check
                                                                            className={cn(
                                                                                "mr-2 h-4 w-4",
                                                                                activeFilters[filter.id] === option.value ? "opacity-100" : "opacity-0",
                                                                            )}
                                                                        />
                                                                        <span className="flex-1">{option.label}</span>
                                                                        {option.count !== undefined && (
                                                                            <span className="text-xs text-muted-foreground">({option.count})</span>
                                                                        )}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        )}

                                        {filter.type === "multi-select" && filter.options && (
                                            <div className="space-y-2 max-h-32 overflow-auto">
                                                {filter.options.map((option) => {
                                                    const isSelected = Array.isArray(activeFilters[filter.id])
                                                        ? activeFilters[filter.id]?.includes(option.value)
                                                        : false
                                                    return (
                                                        <div key={option.value} className="flex items-center gap-2">
                                                            <Button
                                                                variant={isSelected ? "default" : "outline"}
                                                                size="sm"
                                                                className="h-8 w-full justify-start gap-2 text-xs"
                                                                onClick={() => {
                                                                    const currentValues = Array.isArray(activeFilters[filter.id])
                                                                        ? [...activeFilters[filter.id]]
                                                                        : []
                                                                    const newValues = isSelected
                                                                        ? currentValues.filter((v) => v !== option.value)
                                                                        : [...currentValues, option.value]
                                                                    onFilterChange(filter.id, newValues.length ? newValues : undefined)
                                                                }}
                                                            >
                                                                <Check className={cn("h-3 w-3", isSelected ? "opacity-100" : "opacity-0")} />
                                                                <span className="flex-1 text-left">{option.label}</span>
                                                                {option.count !== undefined && (
                                                                    <span className="text-xs text-muted-foreground">({option.count})</span>
                                                                )}
                                                            </Button>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
{/* 
                                        {filter.type === "max-price" && filter.range && (
                                            <div className="space-y-3 px-1">
                                                <div className="text-xs text-muted-foreground">
                                                    Maximum Price:{" "}
                                                    {filter.range.formatValue
                                                        ? filter.range.formatValue(activeFilters[filter.id] ?? filter.range.max)
                                                        : activeFilters[filter.id] ?? filter.range.max}
                                                </div>
                                                <Slider
                                                    min={filter.range.min}
                                                    max={filter.range.max}
                                                    step={filter.range.step || 1}
                                                    value={[activeFilters[filter.id] ?? filter.range.max]}
                                                    onValueChange={(value) => {
                                                        onFilterChange(filter.id, value[0])
                                                    }}
                                                    className="w-full"
                                                />
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span>
                                                        {filter.range.formatValue ? filter.range.formatValue(filter.range.min) : filter.range.min}
                                                    </span>
                                                    <span>
                                                        {filter.range.formatValue ? filter.range.formatValue(filter.range.max) : filter.range.max}
                                                    </span>
                                                </div>
                                            </div>
                                        )} */}

                                        {filter.type === "boolean" && (
                                            <div className="flex gap-2">
                                                <Button
                                                    variant={activeFilters[filter.id] === true ? "default" : "outline"}
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() =>
                                                        onFilterChange(filter.id, activeFilters[filter.id] === true ? undefined : true)
                                                    }
                                                >
                                                    Yes
                                                </Button>
                                                <Button
                                                    variant={activeFilters[filter.id] === false ? "default" : "outline"}
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() =>
                                                        onFilterChange(filter.id, activeFilters[filter.id] === false ? undefined : false)
                                                    }
                                                >
                                                    No
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </PopoverContent>
                </Popover>

                {/* Active filter badges */}
                {Object.entries(activeFilters).map(([id, value]) => {
                    const filter = filters.find((f) => f.id === id)
                    if (!filter) return null

                    let label = ""
                    if (filter.type === "select") {
                        const option = filter.options?.find((o) => o.value === value)
                        label = `${filter.label}: ${option?.label || value}`
                    } else if (filter.type === "multi-select" && Array.isArray(value)) {
                        label = `${filter.label}: ${value.length} selected`
                    } else if (filter.type === "max-price") {
                        const formatValue = filter.range?.formatValue || ((v) => v.toString())
                        label = `Max Price: ${formatValue(value)}`
                    } else if (filter.type === "boolean") {
                        label = `${filter.label}: ${value ? "Yes" : "No"}`
                    } else {
                        label = `${filter.label}: ${value}`
                    }

                    return (
                        <Badge key={id} variant="secondary" className="flex items-center gap-1 px-2 py-1">
                            <span className="text-xs">{label}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onClearFilter(id)}
                                className="h-auto -mr-1 p-0 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Remove filter</span>
                            </Button>
                        </Badge>
                    )
                })}

                {activeFilterCount > 0 && (
                    <>
                        <Separator orientation="vertical" className="mx-1 h-4" />
                        <Button variant="ghost" size="sm" onClick={onClearAllFilters} className="h-8 px-2 text-xs">
                            Clear all filters
                        </Button>
                    </>
                )}
            </div>
        </div>
    )
}

