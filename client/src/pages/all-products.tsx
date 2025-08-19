import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Product } from "@shared/schema";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function AllProducts() {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"]
  });

  const getBadgeColor = (product: Product) => {
    if (product.isPopular === "true") return "bg-neon-purple text-black";
    if (product.isNew === "true") return "bg-neon-pink text-white";
    if (product.isBestseller === "true") return "bg-yellow-500 text-black";
    return "";
  };

  const getBadgeText = (product: Product) => {
    if (product.isPopular === "true") return "POPULAR";
    if (product.isNew === "true") return "NEW";
    if (product.isBestseller === "true") return "BESTSELLER";
    return "";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white font-inter">
        <Navigation />
        <div className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="text-gradient">All Products</span>
              </h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-medium-gray rounded-xl p-6 animate-pulse">
                  <div className="w-full h-48 bg-gray-600 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-600 rounded mb-2"></div>
                  <div className="h-4 bg-gray-600 rounded mb-4"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-600 rounded"></div>
                    <div className="h-3 bg-gray-600 rounded"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-600 rounded w-20"></div>
                    <div className="h-10 bg-gray-600 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
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
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient">All Products</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Explore our complete collection of gaming enhancement tools for competitive advantage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products?.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <div className="bg-medium-gray rounded-xl p-6 border border-gray-700 hover:border-neon-purple transition-all duration-300 transform hover:scale-105 hover-glow cursor-pointer">
                  {product.imageUrl && (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-48 object-cover rounded-lg mb-4" 
                    />
                  )}
                  
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">{product.name}</h3>
                    {getBadgeText(product) && (
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getBadgeColor(product)}`}>
                        {getBadgeText(product)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-300 mb-4 line-clamp-3">{product.description}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-neon-purple mb-2">Key Features:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {product.features.slice(0, 3).map((feature, index) => (
                        <li key={index}>
                          <i className="fas fa-check text-neon-purple mr-2"></i>
                          {feature}
                        </li>
                      ))}
                      {product.features.length > 3 && (
                        <li className="text-neon-purple">+ {product.features.length - 3} more features</li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-bold text-neon-purple">${product.price}</span>
                      <span className="text-gray-400 text-sm">/{product.period}</span>
                    </div>
                    <button className="bg-neon-purple text-black px-6 py-3 rounded-lg font-bold hover:bg-white transition-colors duration-300">
                      View Details
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}