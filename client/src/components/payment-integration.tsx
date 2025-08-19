import { useState } from "react";
import type { Product, ProductVariant } from "@shared/schema";

interface PaymentIntegrationProps {
  product: Product;
  selectedVariant: ProductVariant;
  onSuccess?: () => void;
}

export default function PaymentIntegration({ product, selectedVariant, onSuccess }: PaymentIntegrationProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");

  const handleSellAuthCheckout = async () => {
    if (!customerEmail) {
      alert('Please enter your email address');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Use SellAuth embed with selected variant ID
      if (window.sellAuthEmbed) {
        window.sellAuthEmbed.checkout(null, {
          cart: [{
            productId: parseInt(product.sellAuthProductId || '436109'), // Product ID from database
            variantId: parseInt(selectedVariant.sellAuthVariantId), // Selected variant ID
            quantity: 1
          }],
          shopId: parseInt(product.sellAuthShopId || '174522'), // Shop ID from database
          email: customerEmail
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Fallback to direct product page if embed fails
        const shopId = product.sellAuthShopId || '174522';
        const productId = product.sellAuthProductId || '436109';
        const productUrl = `https://sellauth.com/stores/${shopId}/products/${productId}?email=${encodeURIComponent(customerEmail)}`;
        window.open(productUrl, '_blank');
      }
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Failed to open checkout. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCryptoPayment = () => {
    // Integration with crypto payment processor
    const cryptoCheckoutUrl = `https://nowpayments.io/payment/?product=${encodeURIComponent(product.name)}&amount=${selectedVariant.price}`;
    window.open(cryptoCheckoutUrl, "_blank");
  };

  const handlePayPalPayment = () => {
    // PayPal integration
    const paypalUrl = `https://www.paypal.com/checkoutnow?product=${encodeURIComponent(product.name)}&amount=${selectedVariant.price}`;
    window.open(paypalUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email Address *
        </label>
        <input
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          placeholder="Enter your email for purchase confirmation"
          className="w-full px-4 py-3 bg-medium-gray border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-neon-purple focus:outline-none transition-colors"
          required
        />
      </div>

      {/* Main Purchase Button */}
      <button 
        onClick={handleSellAuthCheckout}
        disabled={isProcessing || !customerEmail}
        className="w-full bg-neon-purple text-black py-4 rounded-lg font-bold text-xl hover:bg-white transition-all duration-300 transform hover:scale-105 hover-glow disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <i className="fas fa-spinner fa-spin mr-2"></i>
            Opening Checkout...
          </>
        ) : (
          <>
            <i className="fas fa-shopping-cart mr-2"></i>
            Purchase Now - ${selectedVariant.price}
          </>
        )}
      </button>

      {/* Alternative Payment Methods */}
      <div className="space-y-3">
        <p className="text-center text-gray-400 text-sm">Or pay with:</p>
        
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handlePayPalPayment}
            className="flex items-center justify-center space-x-2 bg-[#0070ba] hover:bg-[#005ea6] text-white py-3 rounded-lg font-bold transition-colors duration-300"
          >
            <i className="fab fa-paypal text-xl"></i>
            <span>PayPal</span>
          </button>
          
          <button 
            onClick={handleCryptoPayment}
            className="flex items-center justify-center space-x-2 bg-[#f7931a] hover:bg-[#e8851f] text-white py-3 rounded-lg font-bold transition-colors duration-300"
          >
            <i className="fab fa-bitcoin text-xl"></i>
            <span>Crypto</span>
          </button>
        </div>
      </div>

      {/* Security Info */}
      <div className="text-center text-sm text-gray-400 space-y-1">
        <p><i className="fas fa-shield-alt text-neon-purple mr-1"></i> Secure payment processing via SellAuth</p>
        <p><i className="fas fa-lock text-neon-purple mr-1"></i> SSL encrypted & PCI compliant</p>
        <p><i className="fas fa-undo text-neon-purple mr-1"></i> 24-hour refund guarantee</p>
      </div>

      {/* Accepted Payment Methods */}
      <div className="flex justify-center items-center space-x-4 pt-4 border-t border-gray-700">
        <span className="text-sm text-gray-400">We accept:</span>
        <div className="flex space-x-3 text-2xl text-gray-400">
          <i className="fab fa-cc-visa hover:text-white cursor-pointer transition-colors"></i>
          <i className="fab fa-cc-mastercard hover:text-white cursor-pointer transition-colors"></i>
          <i className="fab fa-cc-amex hover:text-white cursor-pointer transition-colors"></i>
          <i className="fab fa-paypal hover:text-white cursor-pointer transition-colors"></i>
          <i className="fab fa-bitcoin hover:text-white cursor-pointer transition-colors"></i>
          <i className="fab fa-ethereum hover:text-white cursor-pointer transition-colors"></i>
        </div>
      </div>
    </div>
  );
}