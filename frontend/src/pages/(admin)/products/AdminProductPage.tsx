import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  Edit,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash,
} from "lucide-react";
import type { Product, BulkAction, ApiResponse } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdvanceDataTable } from "./components/AdvanceDataTable";
import { categories } from "@/data/data";
import { useState, useMemo, useEffect } from "react";
import { FilterGroup, EnhancedFilters } from "./components/EnhancedFilters";
import { ProductGrid } from "./components/ProductGrid";
import { ProductSearch } from "./components/ProductSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateAndUpdateProductDiaglog from "./components/CreateAndUpdateProductDiaglog";
import { toast } from "sonner";
import { useDeleteProduct } from "./adminProductService";
import { isAxiosError, AxiosError } from "axios";
import { GET_ALL_PRODUCTS_KEY } from "@/lib/constants";
import { ViewToggle } from "./components/ViewToggle";
import { useGetProducts } from "@/lib/commonService";
export const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: getProductsResponse,
    isPending: isFetchingProducts,
    isFetched: isFetchedProducts,
    refetch,
    isRefetching,
  } = useGetProducts();
  useEffect(() => {
    if (getProductsResponse?.data) setProducts(getProductsResponse.data);
  }, [getProductsResponse]);

  useEffect(() => {
    if (!open) {
      setEditingProduct(null);
    }
  }, [open]);

  // Calculate discount percentage in real-time

  // Generate filter options from data
  const categoryOptions = useMemo(() => {
    return Object.entries(categories).map(([key, category]) => ({
      label: category.name,
      value: key,
      count: products.filter((p) => p.category === key).length,
    }));
  }, [products]);

  const priceRanges = useMemo(() => {
    const prices = products.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { min, max };
  }, [products]);

  // Advanced filters - removed stock status and rating
  const filterGroups: FilterGroup[] = [
    {
      id: "category",
      label: "Category",
      type: "select",
      options: categoryOptions,
    },
    // {
    //   id: "maxPrice",
    //   label: "Maximum Price",
    //   type: "max-price",
    //   range: {
    //     min: priceRanges.min,
    //     max: priceRanges.max,
    //     step: 100,
    //     formatValue: (value) => `₹${value}`,
    //   },
    // },
    {
      id: "active",
      label: "Status",
      type: "boolean",
    },
    {
      id: "isFeatured",
      label: "Featured",
      type: "boolean",
    },
  ];

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      const query = searchQuery?.toLowerCase().trim();
      filtered = filtered.filter(
        (product) =>
          product?.name.toLowerCase().includes(query) ||
          product?.description.toLowerCase().includes(query) ||
          product?.category.toLowerCase().includes(query) ||
          product?.subcategory.toLowerCase().includes(query) ||
          (categories[product.category]?.name || "")
            .toLowerCase()
            .includes(query),
      );
    }

    // Apply other filters
    if (activeFilters.category) {
      filtered = filtered.filter(
        (product) => product.category === activeFilters.category,
      );
    }

    if (activeFilters.maxPrice) {
      filtered = filtered.filter(
        (product) => product.price <= activeFilters.maxPrice,
      );
    }

    if (activeFilters.active !== undefined) {
      filtered = filtered.filter(
        (product) => product.active === activeFilters.active,
      );
    }

    if (activeFilters.isFeatured !== undefined) {
      filtered = filtered.filter(
        (product) => product.isFeatured === activeFilters.isFeatured,
      );
    }

    return filtered;
  }, [products, activeFilters, searchQuery]);

  // Comment out bulkActions array
  // const bulkActions: BulkAction[] = [
  //   {
  //     id: "activate",
  //     label: "Activate Products",
  //     action: (ids: string[]) => {
  //       setProducts((prev) =>
  //         prev.map((p) => (ids.includes(p.id) ? { ...p, active: true } : p))
  //       );
  //       toast.message("Products activated", {
  //         description: `${ids.length} products have been activated.`,
  //       });
  //     },
  //   },
  //   {
  //     id: "deactivate",
  //     label: "Deactivate Products",
  //     action: (ids: string[]) => {
  //       setProducts((prev) =>
  //         prev.map((p) => (ids.includes(p.id) ? { ...p, active: false } : p))
  //       );
  //       // toast("Products deactivated", {
  //       //   description: `${ids.length} products have been deactivated.`,
  //       // });
  //     },
  //   },
  //   {
  //     id: "delete",
  //     label: "Delete Products",
  //     variant: "destructive",
  //     action: (ids: string[]) => {
  //       setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
  //       // toast({
  //       //   title: ,
  //       //   description: `${ids.length} products have been deleted.`,
  //       //   variant: "destructive",
  //       // });
  //     },
  //   },
  // ];

  function handleEdit(product: Product) {
    setEditingProduct(product);

    setOpen(true);
  }

  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();
  function handleDelete(id: string) {
    deleteProduct(id, {
      onError: (error: Error) => {
        // Handle API errors
        if (isAxiosError(error)) {
          const axiosError = error as AxiosError;
          const responseData = axiosError.response?.data as ApiResponse<void>;
          if (responseData && responseData.message) {
            toast.error(responseData.message);
            // setRootError(responseData.message);
            return;
          }
        }
        toast.error("Something went wrong. Please try again.");
      },
      onSuccess: (response) => {
        setDeleteDialogOpen(false);
        setProductToDelete(null);
        toast.success(response.message);
      },
    });
  }

  const handleRefresh = async () => {
    await refetch();
    toast.success("Products refreshed");
  };

  const handleFilterChange = (id: string, value: any) => {
    setActiveFilters((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleClearFilter = (id: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[id];
      return newFilters;
    });
  };

  const handleClearAllFilters = () => {
    setActiveFilters({});
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "images",
      header: ({ column }) => (
        <div className="flex items-center justify-center">Image</div>
      ),
      cell: ({ row }) => {
        const product = row.original;
        const primaryImage = product.images?.[0] || "/placeholder.svg";
        return (
          <div className="flex items-center justify-center">
            <div className="relative w-12 h-12 overflow-hidden rounded-md">
              <img
                src={primaryImage || "/placeholder.svg"}
                alt={product.name}
                className="object-cover w-full h-full"
                sizes="48px"
              />
              {product.images && product.images.length > 1 && (
                <Badge className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground text-xs h-4 w-4 rounded-full p-0 flex items-center justify-center">
                  +{product.images.length - 1}
                </Badge>
              )}
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <div className="flex items-center justify-start">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium"
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center justify-start">
            <div className="max-w-[200px]">
              <div className="font-medium truncate">{product.name}</div>
              <div className="text-sm text-muted-foreground truncate">
                {product.description}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <div className="flex items-center justify-start">
          <span className="font-medium">Category</span>
        </div>
      ),
      cell: ({ row }) => {
        const category =
          categories[row.original.category]?.name || row.original.category;
        return (
          <div className="flex items-center justify-start">
            <div>
              <div className="font-medium">{category}</div>
              <div className="text-sm text-muted-foreground">
                {row.original.subcategory}
              </div>
            </div>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return row.getValue(id) === value;
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium"
            >
              Price
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const price = Number.parseFloat(row.getValue("price"));
        const originalPrice = row.original.originalPrice;
        const discount = row.original.discount;
        return (
          <div className="flex items-center justify-center min-w-[120px]">
            <div className="">
              <div className="font-medium whitespace-nowrap">
                {formatCurrency(price)}
              </div>
              {discount > 0 && (
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  <span className="line-through mr-1">
                    {formatCurrency(originalPrice)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    -{discount}%
                  </Badge>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "stock",
      header: ({ column }) => {
        return (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium"
            >
              Stock
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );
      },
      cell: ({ row }) => {
        const stock = row.original.stock;
        return (
          <div className="flex justify-center items-center gap-2">
            <span className="font-medium">{stock}</span>
            {/* {stock <= 10 && (
              <Badge variant="destructive" className="text-xs">
                Low
              </Badge>
            )} */}
          </div>
        );
      },
    },
    {
      accessorKey: "active",
      header: ({ column }) => (
        <div className="flex items-center justify-center">
          <span className="font-medium">Status</span>
        </div>
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("active");
        return (
          <div className="flex items-center justify-center">
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return row.getValue(id) === value;
      },
    },
    {
      id: "actions",
      header: ({ column }) => (
        <div className="flex items-center justify-center">
          <span className="font-medium">Actions</span>
        </div>
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(product)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setProductToDelete(product.id);
                    setDeleteDialogOpen(true);
                  }}
                  className="text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product inventory and pricing
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
          <CreateAndUpdateProductDiaglog
            open={open}
            setOpen={setOpen}
            categories={categories}
            editingProduct={editingProduct}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
            <ProductSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search products by name, category, description..."
              className="sm:w-80"
            />
            <EnhancedFilters
              filters={filterGroups}
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              onClearFilter={handleClearFilter}
              onClearAllFilters={handleClearAllFilters}
            />
          </div>
          <ViewToggle
            storageKey="products-view"
            onChange={setViewMode}
            className="xl:block hidden"
          />
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {filteredProducts.length} of {products.length} products
            {searchQuery && ` for "${searchQuery}"`}
          </span>
        </div>
        <div className="xl:block hidden">
          {viewMode === "table" ? (
            <AdvanceDataTable
              columns={columns}
              data={filteredProducts}
              searchKey=""
              searchPlaceholder=""
              filters={[]}
              handleRefresh={handleRefresh}
              pageSize={10}
              isRefetching={isRefetching}
              storageKey="products-table"
              isLoading={isFetchingProducts || !isFetchedProducts}
            />
          ) : (
            <ProductGrid
              products={filteredProducts}
              onEdit={handleEdit}
              onDelete={(id) => {
                setProductToDelete(id);
                setDeleteDialogOpen(true);
              }}
              isLoading={isFetchingProducts || !isFetchedProducts}
            />
          )}
        </div>
        <div className="xl:hidden block">
          <ProductGrid
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={(id) => {
              setProductToDelete(id);
              setDeleteDialogOpen(true);
            }}
            isLoading={isFetchingProducts || !isFetchedProducts}
          />
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              product.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => productToDelete && handleDelete(productToDelete)}
            >
              <>
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash className="mr-2 h-4 w-4" />
                )}
                {isDeleting ? "Deleting..." : "Delete Product"}
              </>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
