import { Edit, MoreHorizontal, Trash, Copy } from "lucide-react";

import { cn, formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { categories } from "@/data/data";

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export const AdminProductCard = ({
  product,
  onEdit,
  onDelete,
  className,
}: ProductCardProps) => {
  const categoryName = categories[product.category]?.name || product.category;
  const primaryImage = product.images?.[0] || "/placeholder.svg";

  return (
    <Card
      className={cn(
        "overflow-hidden border transition-all duration-200 hover:shadow-md",
        className
      )}
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        <img
          src={primaryImage || "/placeholder.svg"}
          alt={product.name}
          loading="lazy"
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Top badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount > 0 && (
            <Badge className="bg-red-500 text-white hover:bg-red-600 text-xs font-medium">
              -{product.discount}%
            </Badge>
          )}
          {product.images && product.images.length > 1 && (
            <Badge className="bg-black/70 text-white text-xs">
              +{product.images.length - 1}
            </Badge>
          )}
        </div>

        {/* Status badge */}
        {!product.active && (
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 bg-gray-500/90 text-white text-xs"
          >
            Inactive
          </Badge>
        )}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-3">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(product)} className="">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(product.id)}
                  className="text-destructive"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className="p-4 space-y-1">
        {/* Category */}
        <Badge variant="outline" className="text-xs w-fit">
          {categoryName}
        </Badge>

        {/* Product Name */}
        <h3
          className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem]"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Pricing */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">
              {formatCurrency(product.price)}
            </span>
            {product.discount > 0 && (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Stock Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Stock: {product.stock}
          </span>
          <Badge
            variant={
              product.stock > 10
                ? "default"
                : product.stock > 0
                ? "secondary"
                : "destructive"
            }
            className="text-xs"
          >
            {product.stock > 10
              ? "In Stock"
              : product.stock > 0
              ? "Low Stock"
              : "Out of Stock"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
