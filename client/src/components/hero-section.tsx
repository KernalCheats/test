export default function HeroSection() {
  const scrollToProducts = () => {
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToDiscord = () => {
    const element = document.getElementById('discord');
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-gradient-gaming overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-2 h-2 bg-neon-purple rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full animate-ping"></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-neon-pink rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-40 w-1 h-1 bg-neon-purple rounded-full animate-ping"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-slide-up">
        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
          <span className="text-gradient">KERNAL.WTF</span><br/>
          <span className="text-white">Premium Gaming Tools</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Unlock your gaming potential with our advanced cheat engines, ESP tools, and performance enhancers. 
          Professional-grade software trusted by thousands of gamers worldwide.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={scrollToProducts}
            className="bg-neon-purple text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-white transition-all duration-300 transform hover:scale-105 hover-glow"
          >
            <i className="fas fa-rocket mr-2"></i>Explore Products
          </button>
          <button 
            onClick={scrollToDiscord}
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105"
          >
            <i className="fab fa-discord mr-2"></i>Join Community
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-neon-purple">25K+</div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-neon-purple">50+</div>
            <div className="text-sm text-gray-400">Products</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-neon-purple">99.9%</div>
            <div className="text-sm text-gray-400">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
}
