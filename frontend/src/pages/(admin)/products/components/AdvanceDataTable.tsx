import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, Filter, Loader2, RefreshCw, Search, Settings, X } from "lucide-react"

import { cn } from "@/lib/utils"
import type { BulkAction, TableFilter } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useMemo, useState } from "react"
import { useDebounce, useLocalStorage } from "@/lib/hooks/hooks"

interface AdvanceDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    searchKey?: string
    searchPlaceholder?: string
    filters?: TableFilter[]
    bulkActions?: BulkAction[]
    handleRefresh: () => void
    enableSelection?: boolean
    pageSize?: number
    storageKey?: string
    isLoading?: boolean
    isRefetching?: boolean
}

export function AdvanceDataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = "Search...",
    filters = [],
    bulkActions = [],
    handleRefresh,
    enableSelection = false,
    pageSize = 10,
    storageKey,
    isLoading,
    isRefetching
}: AdvanceDataTableProps<TData, TValue>) {
    // All hooks must be called before any early returns
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = useLocalStorage<VisibilityState>(
        storageKey ? `${storageKey}-visibility` : "table-visibility",
        {},
    )
    const [rowSelection, setRowSelection] = useState({})
    const [globalFilter, setGlobalFilter] = useState("")
    const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>({})

    const debouncedGlobalFilter = useDebounce(globalFilter, 300)

    // Add selection column if enabled
    const tableColumns = useMemo(() => {
        if (!enableSelection) return columns

        const selectionColumn: ColumnDef<TData, TValue> = {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected()}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        }

        return [selectionColumn, ...columns]
    }, [columns, enableSelection])

    const table = useReactTable({
        data,
        columns: tableColumns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter: debouncedGlobalFilter,
        },
        initialState: {
            pagination: {
                pageSize,
            },
        },
    })

    const selectedRows = table.getFilteredSelectedRowModel().rows
    const hasSelection = selectedRows.length > 0

    // Now we can have the early return after all hooks
    if (isLoading) {
        return (
            <div className="flex h-64 w-full items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading products...</span>
                </div>
            </div>
        )
    }

    const updateFilter = (key: string, value: unknown) => {
        setActiveFilters((prev) => ({ ...prev, [key]: value }))
        table.getColumn(key)?.setFilterValue(value)
    }

    const clearFilter = (key: string) => {
        setActiveFilters((prev) => {
            const newFilters = { ...prev }
            delete newFilters[key]
            return newFilters
        })
        table.getColumn(key)?.setFilterValue(undefined)
    }

    const clearAllFilters = () => {
        setActiveFilters({})
        table.resetColumnFilters()
        setGlobalFilter("")
    }

    const activeFilterCount = Object.keys(activeFilters).length + (globalFilter ? 1 : 0)

    return (
        <div className="w-full space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                    {/* Global Search */}
                    {searchKey && (
                        <div className="relative flex-1 sm:max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder={searchPlaceholder}
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    )}

                    {/* Filters */}
                    {filters.length > 0 && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 border-dashed">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filters
                                    {activeFilterCount > 0 && (
                                        <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                                            {activeFilterCount}
                                        </Badge>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="start">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">Filters</h4>
                                        {activeFilterCount > 0 && (
                                            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                                                Clear all
                                            </Button>
                                        )}
                                    </div>
                                    {filters.map((filter) => (
                                        <div key={filter.key} className="space-y-2">
                                            <label className="text-sm font-medium">{filter.label}</label>
                                            {filter.type === "select" && (
                                                <Select
                                                    value={activeFilters[filter.key] as string || ""}
                                                    onValueChange={(value) => updateFilter(filter.key, value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={filter.placeholder} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {filter.options?.map((option) => (
                                                            <SelectItem key={option.value} value={option.value}>
                                                                {option.label}
                                                                {option.count && (
                                                                    <span className="ml-auto text-muted-foreground">({option.count})</span>
                                                                )}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                            {filter.type === "date" && (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !activeFilters[filter.key] && "text-muted-foreground",
                                                            )}
                                                        >
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {activeFilters[filter.key] ? (
                                                                format(activeFilters[filter.key] as Date, "PPP")
                                                            ) : (
                                                                <span>{filter.placeholder}</span>
                                                            )}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0">
                                                        <Calendar
                                                            mode="single"
                                                            selected={activeFilters[filter.key] as Date}
                                                            onSelect={(date) => updateFilter(filter.key, date)}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                            {Boolean(activeFilters[filter.key]) && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => clearFilter(filter.key)}
                                                    className="h-6 px-2 text-xs"
                                                >
                                                    <X className="mr-1 h-3 w-3" />
                                                    Clear
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}

                    {/* Active Filters */}
                    {activeFilterCount > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {globalFilter && (
                                <Badge variant="secondary" className="h-6">
                                    Search: {globalFilter}
                                    <Button variant="ghost" size="sm" className="ml-1 h-4 w-4 p-0" onClick={() => setGlobalFilter("")}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            )}
                            {Object.entries(activeFilters).map(([key, value]) => {
                                const filter = filters.find((f) => f.key === key)
                                if (!filter || !value) return null
                                
                                // Format the value for display based on filter type
                                let displayValue: string
                                if (filter.type === "date" && value instanceof Date) {
                                    displayValue = format(value, "PPP")
                                } else {
                                    displayValue = String(value)
                                }
                                
                                return (
                                    <Badge key={key} variant="secondary" className="h-6">
                                        {filter.label}: {displayValue}
                                        <Button variant="ghost" size="sm" className="ml-1 h-4 w-4 p-0" onClick={() => clearFilter(key)}>
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Bulk Actions */}
                    {hasSelection && bulkActions.length > 0 && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    Actions ({selectedRows.length})
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {bulkActions.map((action) => (
                                    <DropdownMenuItem
                                        key={action.id}
                                        onClick={() => {
                                            const selectedIds = selectedRows.map((row) => (row.original as { id: string }).id)
                                            action.action(selectedIds)
                                            setRowSelection({})
                                        }}
                                        className={action.variant === "destructive" ? "text-destructive" : ""}
                                    >
                                        {action.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* Refresh */}
                    {handleRefresh && (
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefetching}>
                            <RefreshCw className={cn("h-4 w-4", isRefetching && "animate-spin")} />
                        </Button>
                    )}

                    {/* Column Visibility */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Settings className="mr-2 h-4 w-4" />
                                View
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-md border">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} className="whitespace-nowrap">
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="whitespace-nowrap">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                    {hasSelection && (
                        <span className="mr-4">
                            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
                            selected
                        </span>
                    )}
                    Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
                    {Math.min(
                        (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                        table.getFilteredRowModel().rows.length,
                    )}{" "}
                    of {table.getFilteredRowModel().rows.length} entries
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            {"<<"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            {"<"}
                        </Button>
                        <div className="flex items-center gap-1">
                            <span className="text-sm font-medium">
                                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                            </span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                            {">"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            {">>"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
