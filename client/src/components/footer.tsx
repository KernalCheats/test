const productLinks = [
  "Apex Legends",
  "Valorant", 
  "Warzone",
  "CS:GO",
  "Fortnite"
];

const supportLinks = [
  "Documentation",
  "Installation Guide",
  "Troubleshooting", 
  "Contact Us",
  "Discord Support"
];

const legalLinks = [
  "Terms of Service",
  "Privacy Policy",
  "Refund Policy",
  "Disclaimer",
  "DMCA"
];

export default function Footer() {
  return (
    <footer className="bg-black border-t border-medium-gray py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <i className="fas fa-terminal text-neon-purple text-2xl"></i>
              <span className="text-2xl font-bold text-gradient">Kernal.wtf</span>
            </div>
            <p className="text-gray-400 text-sm">
              Premium gaming enhancement tools for competitive players worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-neon-purple transition-colors duration-300">
                <i className="fab fa-discord text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-neon-purple transition-colors duration-300">
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-neon-purple transition-colors duration-300">
                <i className="fab fa-youtube text-xl"></i>
              </a>
            </div>
          </div>
          
          {/* Products */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Products</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {productLinks.map((link, index) => (
                <li key={index}>
                  <a href="#" className="hover:text-neon-purple transition-colors duration-300">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a href="#" className="hover:text-neon-purple transition-colors duration-300">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <a href="#" className="hover:text-neon-purple transition-colors duration-300">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-medium-gray mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-gray-400">
            © 2024 Kernal.wtf. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 mt-4 md:mt-0">
            Educational purposes only. Use responsibly.
          </p>
        </div>
      </div>
    </footer>
  );
}
