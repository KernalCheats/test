import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, insertProductVariantSchema } from "@shared/schema";
import type { InsertProduct, Product, InsertProductVariant, ProductVariant, SupportTicket, SupportReply } from "@shared/schema";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import AdminLogin from "@/components/admin-login";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AdminPanel() {
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "support">("products");
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading, refetch: refetchAuth } = useAdminAuth();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    enabled: isAuthenticated
  });

  // Variant form setup
  const variantForm = useForm<InsertProductVariant>({
    resolver: zodResolver(insertProductVariantSchema),
    defaultValues: {
      productId: "",
      name: "",
      period: "1month",
      price: "",
      discount: "",
      sellAuthVariantId: "",
      isDefault: false,
    }
  });

  const { data: variants, isLoading: variantsLoading } = useQuery<ProductVariant[]>({
    queryKey: ["/api/products", selectedProductForVariants, "variants"],
    enabled: isAuthenticated && !!selectedProductForVariants
  });

  // Support ticket queries
  const { data: tickets, isLoading: ticketsLoading } = useQuery<(SupportTicket & { replyCount: number })[]>({
    queryKey: ["/api/admin/support/tickets"],
    enabled: isAuthenticated && activeTab === "support"
  });

  const { data: ticketDetails, isLoading: ticketDetailsLoading } = useQuery<{
    ticket: SupportTicket;
    replies: SupportReply[];
  }>({
    queryKey: ["/api/admin/support/tickets", selectedTicket],
    enabled: isAuthenticated && !!selectedTicket
  });

  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      period: "month",
      category: "",
      features: [] as string[],
      imageUrl: "",
      isPopular: "false",
      isNew: "false",
      isBestseller: "false",
      sellAuthProductId: "",
      sellAuthShopId: "174522" // Default to your shop ID
    }
  });

  const addProductMutation = useMutation({
    mutationFn: async (productData: InsertProduct) => {
      const response = await apiRequest('POST', '/api/admin/products', productData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product added successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      form.reset();
      setIsAddingProduct(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive"
      });
      console.error('Failed to add product:', error);
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/products/${productId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product deleted successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive"
      });
      console.error('Failed to delete product:', error);
    }
  });

  const addVariantMutation = useMutation({
    mutationFn: async (variantData: InsertProductVariant) => {
      const response = await apiRequest('POST', '/api/admin/variants', variantData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Variant added successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products", selectedProductForVariants, "variants"] });
      variantForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add variant. Please try again.",
        variant: "destructive"
      });
      console.error('Failed to add variant:', error);
    }
  });

  const deleteVariantMutation = useMutation({
    mutationFn: async (variantId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/variants/${variantId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Variant deleted successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/products", selectedProductForVariants, "variants"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete variant. Please try again.",
        variant: "destructive"
      });
      console.error('Failed to delete variant:', error);
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/admin/logout');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Logged out successfully!"
      });
      refetchAuth();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      });
      console.error('Failed to logout:', error);
    }
  });

  // Support ticket reply mutation
  const replyForm = useForm<{ message: string }>({
    defaultValues: { message: "" }
  });

  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const response = await apiRequest('POST', `/api/admin/support/tickets/${ticketId}/reply`, { message });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reply sent successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/tickets", selectedTicket] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/tickets"] });
      replyForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, data }: { ticketId: string; data: any }) => {
      const response = await apiRequest('PATCH', `/api/admin/support/tickets/${ticketId}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Ticket updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/tickets", selectedTicket] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update ticket",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertProduct) => {
    // Convert features string to array
    const featuresArray = Array.isArray(data.features) 
      ? data.features 
      : (data.features as string).split('\n').filter((f: string) => f.trim());
    
    const productData = {
      ...data,
      features: featuresArray
    };
    addProductMutation.mutate(productData);
  };

  const onVariantSubmit = (data: InsertProductVariant) => {
    const variantData = {
      ...data,
      productId: selectedProductForVariants!
    };
    addVariantMutation.mutate(variantData);
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white font-inter flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-neon-purple mb-4"></i>
          <p className="text-gray-300">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => refetchAuth()} />;
  }

  return (
    <div className="min-h-screen bg-black text-white font-inter">
      <Navigation />
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient">Admin Panel</span>
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              Manage products and SellAuth integration
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </Button>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-medium-gray rounded-lg p-1">
              <Button
                variant={activeTab === "products" ? "default" : "ghost"}
                onClick={() => setActiveTab("products")}
                className={`mr-1 ${activeTab === "products" ? "bg-neon-purple text-white" : "text-gray-400 hover:text-white"}`}
                data-testid="tab-products"
              >
                <i className="fas fa-box mr-2"></i>
                Products
              </Button>
              <Button
                variant={activeTab === "support" ? "default" : "ghost"}
                onClick={() => setActiveTab("support")}
                className={activeTab === "support" ? "bg-neon-purple text-white" : "text-gray-400 hover:text-white"}
                data-testid="tab-support"
              >
                <i className="fas fa-headset mr-2"></i>
                Support
                {tickets && tickets.length > 0 && (
                  <span className="ml-2 bg-neon-pink px-2 py-1 rounded-full text-xs">
                    {tickets.filter(t => t.status === "open").length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Products Tab */}
          {activeTab === "products" && (
            <>
              {/* Add Product Button */}
              <div className="mb-8">
                <Button
                  onClick={() => setIsAddingProduct(!isAddingProduct)}
                  className="bg-neon-purple hover:bg-purple-600 text-white"
                >
                  <i className="fas fa-plus mr-2"></i>
                  {isAddingProduct ? "Cancel" : "Add New Product"}
                </Button>
              </div>

          {/* Add Product Form */}
          {isAddingProduct && (
            <div className="bg-medium-gray rounded-xl p-8 mb-8 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-neon-purple">Add New Product</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="bg-black border-gray-600 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Apex Legends, Valorant" className="bg-black border-gray-600 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Price (USD)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" className="bg-black border-gray-600 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="period"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Period</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-black border-gray-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="day">Day</SelectItem>
                              <SelectItem value="week">Week</SelectItem>
                              <SelectItem value="month">Month</SelectItem>
                              <SelectItem value="year">Year</SelectItem>
                              <SelectItem value="lifetime">Lifetime</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* SellAuth Configuration */}
                    <FormField
                      control={form.control}
                      name="sellAuthProductId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SellAuth Product ID</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} placeholder="e.g., 436109" className="bg-black border-gray-600 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sellAuthShopId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SellAuth Shop ID</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} className="bg-black border-gray-600 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL (optional)</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ""} type="url" className="bg-black border-gray-600 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="bg-black border-gray-600 text-white min-h-[100px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="features"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Features (one per line)</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="ESP Wallhack&#10;Aimbot&#10;Triggerbot&#10;Radar Hack"
                            className="bg-black border-gray-600 text-white min-h-[120px]"
                            value={Array.isArray(field.value) ? field.value.join('\n') : field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Product Badges */}
                  <div className="grid grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="isPopular"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Popular Product</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || "false"}>
                            <FormControl>
                              <SelectTrigger className="bg-black border-gray-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="false">No</SelectItem>
                              <SelectItem value="true">Yes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isNew"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Product</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || "false"}>
                            <FormControl>
                              <SelectTrigger className="bg-black border-gray-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="false">No</SelectItem>
                              <SelectItem value="true">Yes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isBestseller"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bestseller</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || "false"}>
                            <FormControl>
                              <SelectTrigger className="bg-black border-gray-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="false">No</SelectItem>
                              <SelectItem value="true">Yes</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      disabled={addProductMutation.isPending}
                      className="bg-neon-purple hover:bg-purple-600 text-white"
                    >
                      {addProductMutation.isPending ? (
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                      ) : (
                        <i className="fas fa-plus mr-2"></i>
                      )}
                      Add Product
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddingProduct(false)}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {/* Existing Products */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-neon-purple">Existing Products</h2>
            {isLoading ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-2xl text-neon-purple"></i>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products?.map((product) => (
                  <div key={product.id} className="bg-medium-gray rounded-xl p-6 border border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">{product.name}</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedProductForVariants(product.id)}
                          className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-white"
                          data-testid={`button-manage-variants-${product.id}`}
                        >
                          <i className="fas fa-cogs mr-1"></i>
                          Variants
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteProductMutation.mutate(product.id)}
                          disabled={deleteProductMutation.isPending}
                          data-testid={`button-delete-product-${product.id}`}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <p><span className="text-gray-400">Price:</span> ${product.price}/{product.period}</p>
                      <p><span className="text-gray-400">Category:</span> {product.category}</p>
                      <p><span className="text-gray-400">SellAuth Product ID:</span> {product.sellAuthProductId || "Not set"}</p>
                      <p><span className="text-gray-400">Features:</span> {product.features.length} features</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {product.isPopular === "true" && (
                        <span className="px-2 py-1 bg-neon-purple text-white text-xs rounded-full">POPULAR</span>
                      )}
                      {product.isNew === "true" && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">NEW</span>
                      )}
                      {product.isBestseller === "true" && (
                        <span className="px-2 py-1 bg-yellow-500 text-black text-xs rounded-full">BESTSELLER</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Variant Management Modal */}
          {selectedProductForVariants && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-medium-gray rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-neon-purple">
                    Manage Variants - {products?.find(p => p.id === selectedProductForVariants)?.name}
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedProductForVariants(null)}
                    className="border-gray-600 text-white hover:bg-gray-700"
                    data-testid="button-close-variants"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </div>

                {/* Quick Add Common Variants */}
                <div className="bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 rounded-lg p-6 mb-6 border border-neon-purple/30">
                  <h3 className="text-xl font-bold mb-4 text-neon-purple">Quick Add Common Periods</h3>
                  <p className="text-gray-300 text-sm mb-4">Click to quickly add standard pricing variants for this product:</p>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => {
                        const basePrice = parseFloat(products?.find(p => p.id === selectedProductForVariants)?.price || "29.99");
                        variantForm.setValue("name", "1 Month");
                        variantForm.setValue("period", "1month");
                        variantForm.setValue("price", basePrice.toFixed(2));
                        variantForm.setValue("discount", "");
                        variantForm.setValue("isDefault", true);
                      }}
                      variant="outline"
                      className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-white"
                      data-testid="button-quick-1month"
                    >
                      <i className="fas fa-calendar-day mr-2"></i>
                      1 Month
                    </Button>
                    <Button
                      onClick={() => {
                        const basePrice = parseFloat(products?.find(p => p.id === selectedProductForVariants)?.price || "29.99");
                        variantForm.setValue("name", "3 Months");
                        variantForm.setValue("period", "3month");
                        variantForm.setValue("price", (basePrice * 2.7).toFixed(2));
                        variantForm.setValue("discount", "10% OFF");
                        variantForm.setValue("isDefault", false);
                      }}
                      variant="outline"
                      className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-white"
                      data-testid="button-quick-3month"
                    >
                      <i className="fas fa-calendar-alt mr-2"></i>
                      3 Months (-10%)
                    </Button>
                    <Button
                      onClick={() => {
                        const basePrice = parseFloat(products?.find(p => p.id === selectedProductForVariants)?.price || "29.99");
                        variantForm.setValue("name", "6 Months");
                        variantForm.setValue("period", "6month");
                        variantForm.setValue("price", (basePrice * 5).toFixed(2));
                        variantForm.setValue("discount", "17% OFF");
                        variantForm.setValue("isDefault", false);
                      }}
                      variant="outline"
                      className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                      data-testid="button-quick-6month"
                    >
                      <i className="fas fa-calendar mr-2"></i>
                      6 Months (-17%)
                    </Button>
                    <Button
                      onClick={() => {
                        const basePrice = parseFloat(products?.find(p => p.id === selectedProductForVariants)?.price || "29.99");
                        variantForm.setValue("name", "Lifetime Access");
                        variantForm.setValue("period", "lifetime");
                        variantForm.setValue("price", (basePrice * 12).toFixed(2));
                        variantForm.setValue("discount", "BEST VALUE");
                        variantForm.setValue("isDefault", false);
                      }}
                      variant="outline"
                      className="border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black"
                      data-testid="button-quick-lifetime"
                    >
                      <i className="fas fa-infinity mr-2"></i>
                      Lifetime
                    </Button>
                  </div>
                  <p className="text-gray-400 text-xs mt-3">
                    <i className="fas fa-info-circle mr-1"></i>
                    Click a button above to auto-fill the form below, then adjust as needed before adding.
                  </p>
                </div>

                {/* Add Variant Form */}
                <div className="bg-black rounded-lg p-6 mb-6 border border-gray-700">
                  <h3 className="text-xl font-bold mb-4 text-neon-pink">Add New Variant</h3>
                  <Form {...variantForm}>
                    <form onSubmit={variantForm.handleSubmit(onVariantSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={variantForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Variant Name</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="e.g., 1 Month, 3 Months, Lifetime"
                                  className="bg-medium-gray border-gray-600 text-white"
                                  data-testid="input-variant-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={variantForm.control}
                          name="period"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Period</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-medium-gray border-gray-600 text-white" data-testid="select-variant-period">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="1day">1 Day</SelectItem>
                                  <SelectItem value="3day">3 Days</SelectItem>
                                  <SelectItem value="1week">1 Week</SelectItem>
                                  <SelectItem value="2week">2 Weeks</SelectItem>
                                  <SelectItem value="1month">1 Month</SelectItem>
                                  <SelectItem value="2month">2 Months</SelectItem>
                                  <SelectItem value="3month">3 Months</SelectItem>
                                  <SelectItem value="6month">6 Months</SelectItem>
                                  <SelectItem value="12month">12 Months</SelectItem>
                                  <SelectItem value="lifetime">Lifetime</SelectItem>
                                  <SelectItem value="custom">Custom Period</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={variantForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price (USD)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  step="0.01" 
                                  placeholder="29.99"
                                  className="bg-medium-gray border-gray-600 text-white"
                                  data-testid="input-variant-price"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={variantForm.control}
                          name="sellAuthVariantId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SellAuth Variant ID</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="SellAuth variant ID"
                                  className="bg-medium-gray border-gray-600 text-white"
                                  data-testid="input-sellauth-variant-id"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={variantForm.control}
                          name="discount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Discount Text (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  value={field.value || ""}
                                  placeholder="e.g., 25% OFF, BEST DEAL"
                                  className="bg-medium-gray border-gray-600 text-white"
                                  data-testid="input-variant-discount"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={variantForm.control}
                          name="isDefault"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Default Variant</FormLabel>
                              <Select onValueChange={(value) => field.onChange(value === "true")} defaultValue={field.value ? "true" : "false"}>
                                <FormControl>
                                  <SelectTrigger className="bg-medium-gray border-gray-600 text-white" data-testid="select-variant-default">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="false">No</SelectItem>
                                  <SelectItem value="true">Yes</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <Button
                          type="submit"
                          disabled={addVariantMutation.isPending}
                          className="bg-neon-pink hover:bg-pink-600 text-white"
                          data-testid="button-add-variant"
                        >
                          {addVariantMutation.isPending ? (
                            <i className="fas fa-spinner fa-spin mr-2"></i>
                          ) : (
                            <i className="fas fa-plus mr-2"></i>
                          )}
                          Add Variant
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>

                {/* Existing Variants */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-neon-purple">Existing Variants</h3>
                    {variants && variants.length > 0 && (
                      <div className="text-sm text-gray-400">
                        <i className="fas fa-info-circle mr-1"></i>
                        {variants.length} variant{variants.length !== 1 ? 's' : ''} configured
                      </div>
                    )}
                  </div>
                  {variantsLoading ? (
                    <div className="text-center py-8">
                      <i className="fas fa-spinner fa-spin text-2xl text-neon-purple"></i>
                    </div>
                  ) : variants && variants.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {variants.map((variant) => (
                        <div key={variant.id} className="bg-black rounded-lg p-4 border border-gray-700">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-lg">{variant.name}</h4>
                              {variant.isDefault && (
                                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">DEFAULT</span>
                              )}
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteVariantMutation.mutate(variant.id)}
                              disabled={deleteVariantMutation.isPending}
                              data-testid={`button-delete-variant-${variant.id}`}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <p><span className="text-gray-400">Price:</span> <span className="text-neon-purple font-bold">${variant.price}</span></p>
                            <p><span className="text-gray-400">Period:</span> {variant.period}</p>
                            <p><span className="text-gray-400">SellAuth Variant ID:</span> {variant.sellAuthVariantId}</p>
                            {variant.discount && (
                              <p><span className="text-gray-400">Discount:</span> <span className="text-neon-pink font-bold">{variant.discount}</span></p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <i className="fas fa-box-open text-4xl mb-4"></i>
                      <p>No variants found. Add your first variant above.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
            </>
          )}

          {/* Support Tab */}
          {activeTab === "support" && (
            <div className="space-y-6">
              {selectedTicket ? (
                // Ticket Detail View
                <div className="bg-medium-gray rounded-xl p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedTicket(null)}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      <i className="fas fa-arrow-left mr-2"></i>
                      Back to Tickets
                    </Button>
                    {ticketDetails && (
                      <div className="flex gap-2">
                        <Select
                          value={ticketDetails.ticket.status}
                          onValueChange={(status) => updateTicketMutation.mutate({ 
                            ticketId: selectedTicket, 
                            data: { status } 
                          })}
                        >
                          <SelectTrigger className="w-32 bg-black border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={ticketDetails.ticket.priority}
                          onValueChange={(priority) => updateTicketMutation.mutate({ 
                            ticketId: selectedTicket, 
                            data: { priority } 
                          })}
                        >
                          <SelectTrigger className="w-24 bg-black border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {ticketDetailsLoading ? (
                    <div className="text-center py-8">
                      <i className="fas fa-spinner fa-spin text-2xl text-neon-purple"></i>
                    </div>
                  ) : ticketDetails ? (
                    <div className="space-y-6">
                      {/* Ticket Header */}
                      <div className="bg-black rounded-lg p-6 border border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-neon-purple">{ticketDetails.ticket.subject}</h3>
                            <p className="text-gray-400">{ticketDetails.ticket.customerName} ({ticketDetails.ticket.customerEmail})</p>
                          </div>
                          <div className="text-right text-sm text-gray-400">
                            <p>Created: {ticketDetails.ticket.createdAt ? new Date(ticketDetails.ticket.createdAt).toLocaleString() : 'Unknown'}</p>
                            <p>Updated: {ticketDetails.ticket.updatedAt ? new Date(ticketDetails.ticket.updatedAt).toLocaleString() : 'Unknown'}</p>
                          </div>
                        </div>
                        <div className="bg-medium-gray rounded-lg p-4">
                          <p className="whitespace-pre-wrap">{ticketDetails.ticket.message}</p>
                        </div>
                      </div>

                      {/* Conversation */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-bold">Conversation</h4>
                        {ticketDetails.replies.map((reply) => (
                          <div key={reply.id} className={`p-4 rounded-lg ${reply.isFromAdmin ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-green-900/20 border border-green-500/30'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-semibold">
                                {reply.isFromAdmin ? '🛠️ Support Team' : '👤 ' + reply.senderName}
                              </div>
                              <div className="text-sm text-gray-400">
                                {reply.createdAt ? new Date(reply.createdAt).toLocaleString() : 'Unknown'}
                              </div>
                            </div>
                            <p className="whitespace-pre-wrap">{reply.message}</p>
                          </div>
                        ))}
                      </div>

                      {/* Reply Form */}
                      <Form {...replyForm}>
                        <form onSubmit={replyForm.handleSubmit((data) => replyMutation.mutate({ ticketId: selectedTicket, message: data.message }))}>
                          <div className="space-y-4">
                            <FormField
                              control={replyForm.control}
                              name="message"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Reply to Customer</FormLabel>
                                  <FormControl>
                                    <Textarea 
                                      {...field} 
                                      placeholder="Type your reply here..."
                                      className="bg-black border-gray-600 text-white min-h-32"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="submit"
                              disabled={replyMutation.isPending}
                              className="bg-neon-purple hover:bg-purple-600 text-white"
                            >
                              {replyMutation.isPending ? (
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                              ) : (
                                <i className="fas fa-reply mr-2"></i>
                              )}
                              Send Reply
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
                      <p>Ticket not found.</p>
                    </div>
                  )}
                </div>
              ) : (
                // Tickets List View
                <div className="bg-medium-gray rounded-xl p-6 border border-gray-700">
                  <h2 className="text-2xl font-bold mb-6 text-neon-purple">Support Tickets</h2>
                  {ticketsLoading ? (
                    <div className="text-center py-8">
                      <i className="fas fa-spinner fa-spin text-2xl text-neon-purple"></i>
                    </div>
                  ) : tickets && tickets.length > 0 ? (
                    <div className="space-y-4">
                      {tickets.map((ticket) => (
                        <div 
                          key={ticket.id}
                          className="bg-black rounded-lg p-4 border border-gray-700 hover:border-neon-purple/50 cursor-pointer transition-all"
                          onClick={() => setSelectedTicket(ticket.id)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-lg">{ticket.subject}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  ticket.status === 'open' ? 'bg-red-500/20 text-red-300' :
                                  ticket.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300' :
                                  'bg-green-500/20 text-green-300'
                                }`}>
                                  {ticket.status.toUpperCase()}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  ticket.priority === 'urgent' ? 'bg-red-500/20 text-red-300' :
                                  ticket.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                                  ticket.priority === 'normal' ? 'bg-blue-500/20 text-blue-300' :
                                  'bg-gray-500/20 text-gray-300'
                                }`}>
                                  {ticket.priority.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-gray-400 mb-2">From: {ticket.customerName} ({ticket.customerEmail})</p>
                              <p className="text-gray-300 line-clamp-2">{ticket.message}</p>
                            </div>
                            <div className="text-right text-sm text-gray-400">
                              <p>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Unknown'}</p>
                              <p>{ticket.replyCount} replies</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <i className="fas fa-inbox text-4xl mb-4"></i>
                      <p>No support tickets yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}