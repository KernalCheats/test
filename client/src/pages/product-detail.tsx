import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import type { Product, ProductVariant } from "@shared/schema";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import PaymentIntegration from "@/components/payment-integration";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  
  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", params?.id],
    enabled: !!params?.id
  });
  
  const { data: variants, isLoading: variantsLoading } = useQuery<ProductVariant[]>({
    queryKey: ["/api/products", params?.id, "variants"],
    enabled: !!params?.id
  });

  // Set default variant when variants load
  useEffect(() => {
    if (variants && variants.length > 0 && !selectedVariantId) {
      const defaultVariant = variants.find(v => v.isDefault) || variants[0];
      setSelectedVariantId(defaultVariant.id);
    }
  }, [variants, selectedVariantId]);
  
  // Get selected variant data
  const selectedVariant = variants?.find(v => v.id === selectedVariantId);

  const handlePurchaseSuccess = () => {
    // Handle successful purchase
    alert("Purchase successful! Check your email for download instructions.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white font-inter">
        <Navigation />
        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-600 rounded w-64 mb-8"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="w-full h-96 bg-gray-600 rounded-lg"></div>
                <div className="space-y-6">
                  <div className="h-10 bg-gray-600 rounded"></div>
                  <div className="h-6 bg-gray-600 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-600 rounded"></div>
                    <div className="h-4 bg-gray-600 rounded"></div>
                    <div className="h-4 bg-gray-600 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white font-inter">
        <Navigation />
        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
            <p className="text-gray-300 mb-8">The product you're looking for doesn't exist.</p>
            <Link href="/products">
              <button className="bg-neon-purple text-black px-8 py-4 rounded-lg font-bold hover:bg-white transition-colors duration-300">
                Browse All Products
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-inter">
      <Navigation />
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-gray-400 mb-8">
            <Link href="/" className="hover:text-neon-purple transition-colors">Home</Link>
            <i className="fas fa-chevron-right text-sm"></i>
            <Link href="/products" className="hover:text-neon-purple transition-colors">Products</Link>
            <i className="fas fa-chevron-right text-sm"></i>
            <span className="text-white">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Image & Video */}
            <div className="space-y-6">
              {product.imageUrl && (
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="w-full h-96 object-cover rounded-lg border border-gray-700" 
                />
              )}
              
              {/* YouTube Video Preview */}
              <div className="bg-medium-gray rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-neon-purple">
                  <i className="fab fa-youtube mr-2"></i>Product Demo
                </h3>
                <div className="aspect-video bg-black rounded-lg flex items-center justify-center border border-gray-600">
                  <div className="text-center">
                    <i className="fab fa-youtube text-6xl text-red-500 mb-4"></i>
                    <p className="text-gray-300">Product demonstration video</p>
                    <p className="text-sm text-gray-400">Available after purchase</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                <p className="text-xl text-gray-300 mb-6">{product.description}</p>
                
                <div className="flex items-center space-x-4 mb-6">
                  <span className="px-3 py-1 bg-neon-purple text-black rounded-full text-sm font-bold">
                    {product.category}
                  </span>
                  {product.isPopular === "true" && (
                    <span className="px-3 py-1 bg-neon-pink text-white rounded-full text-sm font-bold">
                      POPULAR
                    </span>
                  )}
                  {product.isNew === "true" && (
                    <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">
                      NEW
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-neon-purple">Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <i className="fas fa-check text-neon-purple"></i>
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Variants */}
              <div>
                <h3 className="text-2xl font-bold mb-4 text-neon-purple">Choose Your Plan</h3>
                {variantsLoading ? (
                  <div className="animate-pulse">
                    <div className="h-12 bg-gray-600 rounded mb-4"></div>
                    <div className="h-20 bg-gray-600 rounded"></div>
                  </div>
                ) : variants && variants.length > 0 ? (
                  <div className="space-y-4">
                    <Select value={selectedVariantId} onValueChange={setSelectedVariantId}>
                      <SelectTrigger className="w-full bg-medium-gray border-gray-600 text-white">
                        <SelectValue placeholder="Select a pricing plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {variants.map((variant) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">{variant.name}</span>
                              <div className="text-right ml-4">
                                <span className="text-lg font-bold text-neon-purple">
                                  ${variant.price}
                                </span>
                                {variant.discount && (
                                  <span className="text-sm text-neon-pink font-bold ml-2">
                                    {variant.discount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* Selected Plan Display */}
                    {selectedVariant && (
                      <div className="bg-medium-gray rounded-lg p-4 border border-gray-700">
                        <div className="text-center">
                          <h4 className="font-bold text-xl mb-2">{selectedVariant.name}</h4>
                          <div className="text-3xl font-bold text-neon-purple mb-2">
                            ${selectedVariant.price}
                          </div>
                          {selectedVariant.discount && (
                            <div className="text-lg text-neon-pink font-bold">
                              {selectedVariant.discount}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-medium-gray rounded-lg p-4 border border-gray-700 text-center">
                    <p className="text-gray-300">No pricing plans available for this product.</p>
                  </div>
                )}
              </div>

              {/* Payment Integration */}
              {selectedVariant && (
                <div>
                  <PaymentIntegration 
                    product={product} 
                    selectedVariant={selectedVariant}
                    onSuccess={handlePurchaseSuccess}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-medium-gray rounded-lg p-6 border border-gray-700">
              <h4 className="text-lg font-bold mb-3 text-neon-purple">
                <i className="fas fa-download mr-2"></i>Instant Access
              </h4>
              <p className="text-gray-300">Download immediately after purchase with detailed setup instructions.</p>
            </div>
            
            <div className="bg-medium-gray rounded-lg p-6 border border-gray-700">
              <h4 className="text-lg font-bold mb-3 text-neon-purple">
                <i className="fas fa-sync-alt mr-2"></i>Regular Updates
              </h4>
              <p className="text-gray-300">Free updates for the duration of your subscription to stay ahead of patches.</p>
            </div>
            
            <div className="bg-medium-gray rounded-lg p-6 border border-gray-700">
              <h4 className="text-lg font-bold mb-3 text-neon-purple">
                <i className="fas fa-headset mr-2"></i>24/7 Support
              </h4>
              <p className="text-gray-300">Round-the-clock support through Discord and our ticketing system.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}