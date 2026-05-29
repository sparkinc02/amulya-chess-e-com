import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateProduct, useUpdateProduct } from "../adminProductService";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { ImageUpload, ImageFile } from "@/components/ImageUpload";
import { isAxiosError, AxiosError } from "axios";
import { ApiResponse, Categories, Product } from "@/lib/types";
import { Plus, Loader2, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { productSchema } from "@/lib/schemas/product.schema";

type ProductFormData = z.infer<typeof productSchema>;

interface CreateAndUpdateProductDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  categories: Categories;
  editingProduct?: Product | null;
}

const CreateAndUpdateProductDialog = ({
  categories,
  open,
  setOpen,
  editingProduct,
}: CreateAndUpdateProductDialogProps) => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [activeTab, setActiveTab] = useState<string>("details");
  const [rootError, setRootError] = useState<string>("");
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      subcategory: "",
      price: 0,
      originalPrice: 0,
      description: "",
      stock: 0,
      images: [],
      colors: "",
      sizes: "",
      active: true,
      isFeatured: false,
    },
  });

  const {
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form;
  const watchedCategory = watch("category");
  const watchedPrice = watch("price");
  const watchedOriginalPrice = watch("originalPrice");
  const watchedDescription = watch("description");

  const subcategories = watchedCategory
    ? categories[watchedCategory]?.subcategories || []
    : [];

  // Reset subcategory when category changes (but not during form initialization)
  useEffect(() => {
    if (watchedCategory && isFormInitialized) {
      // Only reset subcategory if we're not editing or if the category actually changed
      if (
        !editingProduct ||
        (editingProduct && editingProduct.category !== watchedCategory)
      ) {
        setValue("subcategory", "");
      }
    }
  }, [watchedCategory, setValue, isFormInitialized, editingProduct]);

  const discountPercentage = useMemo(() => {
    if (
      watchedOriginalPrice > 0 &&
      watchedPrice > 0 &&
      watchedOriginalPrice > watchedPrice
    ) {
      return Math.round(
        ((watchedOriginalPrice - watchedPrice) / watchedOriginalPrice) * 100,
      );
    }
    return 0;
  }, [watchedPrice, watchedOriginalPrice]);

  // Reset form when editing product changes or dialog opens/closes
  useEffect(() => {
    setIsFormInitialized(false);

    if (editingProduct) {
      reset({
        name: editingProduct.name,
        category: editingProduct.category,
        subcategory: editingProduct.subcategory,
        price: editingProduct.price,
        originalPrice: editingProduct.originalPrice,
        description: editingProduct.description,
        stock: editingProduct.stock,
        images: editingProduct.images || [],
        colors: editingProduct.colors?.join(", ") || "",
        sizes: editingProduct.sizes?.join(", ") || "",
        active: editingProduct.active,
        isFeatured: editingProduct.isFeatured || false,
      });
      if (editingProduct.images && editingProduct.images.length > 0) {
        const existingFiles = editingProduct.images.map((url, index) => {
          const mockFile = new File([], `image-${index + 1}.jpg`, {
            type: "image/jpeg",
          });
          const imageFile = mockFile as ImageFile;
          imageFile.preview = url;
          imageFile.progress = 100;
          imageFile.isExisting = true;
          return imageFile;
        });
        setFiles(existingFiles);
      } else {
        setFiles([]);
      }
    } else {
      reset({
        name: "",
        category: "",
        subcategory: "",
        price: 0,
        originalPrice: 0,
        description: "",
        stock: 0,
        images: [],
        colors: "",
        sizes: "",
        active: true,
        isFeatured: false,
      });
      setFiles([]);
    }
    setRootError("");

    // Set form as initialized after a brief delay to allow form reset to complete
    setTimeout(() => {
      setIsFormInitialized(true);
    }, 100);
  }, [editingProduct, reset, open]);

  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

  // Function to determine which tab has errors and switch to it
  const switchToErrorTab = () => {
    const errorFields = Object.keys(errors);
    if (errorFields.length === 0) return;

    const detailsFields = [
      "name",
      "category",
      "subcategory",
      "description",
      "originalPrice",
      "price",
      "stock",
      "colors",
      "sizes",
      "active",
      "isFeatured",
    ];
    const mediaFields = ["images"];

    const hasDetailsErrors = errorFields.some((field) =>
      detailsFields.includes(field),
    );
    const hasMediaErrors = errorFields.some((field) =>
      mediaFields.includes(field),
    );

    if (hasDetailsErrors) {
      setActiveTab("details");
    } else if (hasMediaErrors) {
      setActiveTab("media");
    }
  };

  const onSubmit = (data: ProductFormData) => {
    setRootError("");

    const productDataWithImages = {
      ...data,
      images: files,
    } as any; // Temporary cast to avoid complex ImageFile vs any[] mismatch in service

    if (editingProduct) {
      // Update product logic would go here
      updateProduct(
        { data: productDataWithImages, id: editingProduct.id },
        {
          onError: (error: Error) => {
            // Handle API errors
            if (isAxiosError(error)) {
              const axiosError = error as AxiosError;
              const responseData = axiosError.response
                ?.data as ApiResponse<void>;
              if (responseData && responseData.message) {
                setRootError(responseData.message);
                return;
              }
            }
            setRootError("Something went wrong. Please try again.");
          },
          onSuccess: (response) => {
            reset();
            setFiles([]);
            setRootError("");
            toast.success(response.message);
            setOpen(false);
          },
        },
      );
    } else {
      // Create product endpoint
      createProduct(productDataWithImages, {
        onError: (error: Error) => {
          // Handle API errors
          if (isAxiosError(error)) {
            const axiosError = error as AxiosError;
            const responseData = axiosError.response?.data as ApiResponse<void>;
            if (responseData && responseData.message) {
              setRootError(responseData.message);
              return;
            }
          }
          setRootError("Something went wrong. Please try again.");
        },
        onSuccess: (response) => {
          reset();
          setFiles([]);
          setRootError("");
          setOpen(false);
        },
      });
    }
  };

  const onInvalid = () => {
    // Switch to the tab with errors when form is invalid
    switchToErrorTab();
  };

  const getErrorCountInTab = (tab: string): number => {
    const detailsFields = [
      "name",
      "category",
      "subcategory",
      "description",
      "originalPrice",
      "price",
      "stock",
      "colors",
      "sizes",
      "active",
      "isFeatured",
    ];
    const mediaFields = ["images"];

    switch (tab) {
      case "details":
        return Object.keys(errors).filter((field) =>
          detailsFields.includes(field),
        ).length;
      case "media":
        return Object.keys(errors).filter((field) =>
          mediaFields.includes(field),
        ).length;
      default:
        return 0;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "Edit Product" : "Add Product"}
          </DialogTitle>
          <DialogDescription>
            {editingProduct
              ? "Update the product details below."
              : "Fill in the details below to add a new product."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            className="space-y-6 border-none"
          >
            {rootError && (
              <div className="rounded-lg bg-red-50 p-3 border border-red-200">
                <p className="text-sm text-red-700">{rootError}</p>
              </div>
            )}

            <Tabs
              defaultValue="media"
              className="w-full"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details" className="relative">
                  Product Details
                  {getErrorCountInTab("details") > 0 && (
                    <span className="absolute -top-2 z-10 -right-2 h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center">
                      {getErrorCountInTab("details")}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="media" className="relative">
                  Images & Media
                  {getErrorCountInTab("media") > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-destructive text-white text-xs flex items-center justify-center">
                      {getErrorCountInTab("media")}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="details"
                className="space-y-4 mt-4 border-none"
              >
                {/* Product Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear, descriptive name for your product
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category and Subcategory */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent
                            side="bottom"
                            position="popper"
                            sideOffset={4}
                            className="max-h-[220px]"
                          >
                            {Object.entries(categories).map(
                              ([key, category]) => (
                                <SelectItem key={key} value={key}>
                                  {category.name}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subcategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subcategory *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={
                            !watchedCategory || subcategories.length === 0
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select subcategory" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent
                            side="bottom"
                            position="popper"
                            sideOffset={4}
                            className="max-h-[220px]"
                          >
                            {subcategories.map((subcategory) => (
                              <SelectItem key={subcategory} value={subcategory}>
                                {subcategory}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your product features, materials, and benefits"
                          className="resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        {watchedDescription.length}/500 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Price Fields */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Price (₹) *</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0"
                            value={field.value}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^\d.]/g,
                                "",
                              );
                              // Allow only one decimal point
                              const parts = value.split(".");
                              if (parts.length > 2) return;
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>MRP or list price</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selling Price (₹) *</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0"
                            value={field.value}
                            onChange={(e) => {
                              const value = e.target.value.replace(
                                /[^\d.]/g,
                                "",
                              );
                              // Allow only one decimal point
                              const parts = value.split(".");
                              if (parts.length > 2) return;
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>Current selling price</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Quantity *</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="0"
                            value={field.value}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>Available units</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Discount Badge */}
                {discountPercentage > 0 && (
                  <div className="rounded-lg bg-accent/50 p-3 border border-border">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-semibold">
                        {discountPercentage}% OFF
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Customers save ₹{watchedOriginalPrice - watchedPrice}
                      </span>
                    </div>
                  </div>
                )}

                {/* Colors and Sizes */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="colors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Colors</FormLabel>
                        <FormControl>
                          <Input placeholder="Red, Blue, Green" {...field} />
                        </FormControl>
                        <FormDescription>
                          Separate colors with commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sizes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Sizes</FormLabel>
                        <FormControl>
                          <Input placeholder="S, M, L, XL" {...field} />
                        </FormControl>
                        <FormDescription>
                          Separate sizes with commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Switches */}
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Active Product
                        </FormLabel>
                        <FormDescription>
                          Product will be visible to customers when active
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* <FormField
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Featured Product
                        </FormLabel>
                        <FormDescription>
                          Product will be highlighted on the home page
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                /> */}
              </TabsContent>

              <TabsContent value="media" className="space-y-4 mt-4 border-none">
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Images *</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value}
                          onChange={field.onChange}
                          maxFiles={5}
                          required={true}
                          files={files}
                          setFiles={setFiles}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload 1-5 high-quality images. The first image will be
                        the primary display image.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {editingProduct ? (
                  <>
                    {isUpdating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Pencil className="mr-2 h-4 w-4" />
                    )}
                    {isUpdating ? "Updating..." : "Update Product"}
                  </>
                ) : (
                  <>
                    {isCreating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    {isCreating ? "Creating..." : "Create Product"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAndUpdateProductDialog;
