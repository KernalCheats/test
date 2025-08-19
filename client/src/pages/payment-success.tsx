import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function PaymentSuccess() {
  const [location] = useLocation();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('pending');

  useEffect(() => {
    // Extract payment ID from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('payment_id') || urlParams.get('id');
    
    if (id) {
      setPaymentId(id);
      verifyPayment(id);
    } else {
      setIsVerifying(false);
      setPaymentStatus('success'); // Assume success if no ID to verify
    }
  }, []);

  const verifyPayment = async (id: string) => {
    try {
      const response = await fetch(`/api/payment/verify/${id}`);
      const payment = await response.json();
      
      if (payment.status === 'completed') {
        setPaymentStatus('success');
      } else {
        setPaymentStatus('failed');
      }
    } catch (error) {
      console.error('Payment verification failed:', error);
      setPaymentStatus('failed');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-black text-white font-inter">
        <Navigation />
        <div className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-spin w-16 h-16 border-4 border-neon-purple border-t-transparent rounded-full mx-auto mb-8"></div>
            <h1 className="text-4xl font-bold mb-4">Verifying Payment</h1>
            <p className="text-xl text-gray-300">Please wait while we confirm your purchase...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-black text-white font-inter">
        <Navigation />
        <div className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <i className="fas fa-times text-2xl text-white"></i>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-red-500">Payment Failed</h1>
            <p className="text-xl text-gray-300 mb-8">
              There was an issue processing your payment. Please try again or contact support.
            </p>
            <div className="space-x-4">
              <Link href="/products">
                <button className="bg-neon-purple text-black px-8 py-4 rounded-lg font-bold hover:bg-white transition-colors duration-300">
                  Try Again
                </button>
              </Link>
              <Link href="/discord">
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-black transition-colors duration-300">
                  Contact Support
                </button>
              </Link>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Success Animation */}
          <div className="w-16 h-16 bg-neon-purple rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <i className="fas fa-check text-2xl text-black"></i>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Payment Successful!</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8">
            Thank you for your purchase! Your gaming enhancement tools are ready for download.
          </p>

          {/* Next Steps */}
          <div className="bg-medium-gray rounded-xl p-8 mb-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-6 text-neon-purple">What's Next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="space-y-3">
                <div className="w-10 h-10 bg-neon-purple rounded-full flex items-center justify-center">
                  <i className="fas fa-envelope text-black"></i>
                </div>
                <h3 className="font-bold">Check Your Email</h3>
                <p className="text-gray-300 text-sm">
                  Download links and installation instructions have been sent to your email.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="w-10 h-10 bg-neon-purple rounded-full flex items-center justify-center">
                  <i className="fab fa-discord text-black"></i>
                </div>
                <h3 className="font-bold">Join Discord</h3>
                <p className="text-gray-300 text-sm">
                  Get setup help and connect with other users in our Discord community.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="w-10 h-10 bg-neon-purple rounded-full flex items-center justify-center">
                  <i className="fas fa-download text-black"></i>
                </div>
                <h3 className="font-bold">Download & Install</h3>
                <p className="text-gray-300 text-sm">
                  Follow the setup guide to install and configure your new tools.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <button className="bg-neon-purple text-black px-8 py-4 rounded-lg font-bold hover:bg-white transition-colors duration-300">
                  <i className="fas fa-shopping-cart mr-2"></i>
                  Continue Shopping
                </button>
              </Link>
              
              <button 
                onClick={() => window.open('https://discord.gg/kernal', '_blank')}
                className="bg-[#5865F2] text-white px-8 py-4 rounded-lg font-bold hover:bg-[#4752C4] transition-colors duration-300"
              >
                <i className="fab fa-discord mr-2"></i>
                Join Discord
              </button>
            </div>
            
            <p className="text-sm text-gray-400">
              Need help? Contact our support team on Discord or via email.
            </p>
          </div>

          {paymentId && (
            <div className="mt-8 p-4 bg-black/50 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400">
                Payment ID: <code className="text-neon-purple">{paymentId}</code>
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}