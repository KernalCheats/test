const features = [
  {
    icon: "fas fa-shield-alt",
    title: "Undetected",
    description: "Advanced anti-detection technology ensures your account stays safe while using our tools."
  },
  {
    icon: "fas fa-bolt",
    title: "High Performance",
    description: "Optimized code ensures minimal impact on game performance while maximizing effectiveness."
  },
  {
    icon: "fas fa-users",
    title: "24/7 Support",
    description: "Our dedicated support team is available around the clock to assist with any issues."
  },
  {
    icon: "fas fa-sync-alt",
    title: "Regular Updates",
    description: "Constant updates and improvements to stay ahead of game patches and anti-cheat systems."
  },
  {
    icon: "fas fa-cogs",
    title: "Easy Setup",
    description: "Simple installation process with detailed guides and video tutorials for quick setup."
  },
  {
    icon: "fas fa-certificate",
    title: "Premium Quality",
    description: "Professional-grade software developed by experienced programmers and gaming experts."
  }
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Why Choose Kernal.wtf?</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We provide industry-leading gaming enhancement tools with unmatched quality, 
            security, and support for the competitive gaming community.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="text-center p-8 rounded-xl bg-gradient-to-b from-dark-gray to-medium-gray border border-gray-700 hover:border-neon-purple transition-all duration-300 transform hover:scale-105"
            >
              <div className="w-16 h-16 bg-neon-purple rounded-full flex items-center justify-center mx-auto mb-6 hover-glow">
                <i className={`${feature.icon} text-black text-2xl`}></i>
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
