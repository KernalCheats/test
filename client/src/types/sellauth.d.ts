// SellAuth embed types
declare global {
  interface Window {
    sellAuthEmbed?: {
      checkout: (element: Element | null, options: {
        cart: Array<{
          productId: number;
          variantId: number;
          quantity: number;
        }>;
        shopId: number;
        email?: string;
      }) => void;
    };
  }
}

export {};