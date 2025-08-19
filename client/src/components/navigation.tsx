import { useState, useEffect } from "react";
import { Link } from "wouter";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let lastScrollTop = 0;
    const handleScroll = () => {
      const nav = document.querySelector('nav');
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      
      if (currentScroll > lastScrollTop && currentScroll > 100) {
        nav?.style.setProperty('transform', 'translateY(-100%)');
      } else {
        nav?.style.setProperty('transform', 'translateY(0)');
      }
      lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
      setIsScrolled(currentScroll > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/90 backdrop-blur-md' : 'bg-black/90 backdrop-blur-md'
    } border-b border-medium-gray`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <i className="fas fa-terminal text-neon-purple text-2xl"></i>
            <span className="text-2xl font-bold text-gradient">Kernal.wtf</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('home')}
              className="hover:text-neon-purple transition-colors duration-300"
            >
              Home
            </button>
            <Link href="/products" className="hover:text-neon-purple transition-colors duration-300">
              Products
            </Link>
            <button 
              onClick={() => scrollToSection('features')}
              className="hover:text-neon-purple transition-colors duration-300"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('discord')}
              className="hover:text-neon-purple transition-colors duration-300"
            >
              Discord
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className="hover:text-neon-purple transition-colors duration-300"
            >
              FAQ
            </button>
          </div>
          
          {/* Discord & Cart */}
          <div className="flex items-center space-x-4">
            <button className="bg-[#5865F2] hover:bg-[#4752C4] px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105">
              <i className="fab fa-discord mr-2"></i>Join Discord
            </button>
            <button className="relative hover-glow">
              <i className="fas fa-shopping-cart text-xl hover:text-neon-purple transition-colors duration-300"></i>
              <span className="absolute -top-2 -right-2 bg-neon-pink text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">0</span>
            </button>
            {/* Mobile menu button */}
            <button className="md:hidden text-white">
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
