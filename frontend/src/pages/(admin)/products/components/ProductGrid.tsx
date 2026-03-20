import { Loader2, Package } from "lucide-react";
import { AdminProductCard } from "./AdminProductCard";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const ProductGrid = ({
  products,
  onEdit,
  onDelete,
  isLoading = false,
  className,
}: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Loading products...
          </span>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex h-40 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 p-8 text-center">
        <Package className="h-8 w-8 text-muted-foreground" />
        <div>
          <h3 className="font-medium">No products found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-4",
        "grid-cols-1",
        "sm:grid-cols-3",
        "xl:grid-cols-4",
        className,
      )}
    >
      {products.map((product) => (
        <AdminProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
