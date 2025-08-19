import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { FaqItem } from "@shared/schema";

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  
  const { data: faqItems, isLoading } = useQuery<FaqItem[]>({
    queryKey: ["/api/faq"]
  });

  const toggleFAQ = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  if (isLoading) {
    return (
      <section id="faq" className="py-20 bg-dark-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient">Frequently Asked Questions</span>
            </h2>
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-medium-gray rounded-xl border border-gray-700 p-6 animate-pulse">
                <div className="h-6 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="faq" className="py-20 bg-dark-gray">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Frequently Asked Questions</span>
          </h2>
          <p className="text-xl text-gray-300">
            Get answers to common questions about our products and services.
          </p>
        </div>
        
        <div className="space-y-6">
          {faqItems?.map((item) => (
            <div key={item.id} className="bg-medium-gray rounded-xl border border-gray-700 overflow-hidden">
              <button 
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-600 transition-colors duration-300"
                onClick={() => toggleFAQ(item.id)}
              >
                <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                <i className={`fas fa-chevron-down text-neon-purple transition-transform duration-300 ${
                  openItems.has(item.id) ? 'rotate-180' : ''
                }`}></i>
              </button>
              {openItems.has(item.id) && (
                <div className="px-6 pb-4">
                  <p className="text-gray-300">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-300 mb-4">Still have questions?</p>
          <button className="bg-neon-purple text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-white transition-all duration-300 transform hover:scale-105">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
}
