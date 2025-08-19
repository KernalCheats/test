import type { Product } from "@shared/schema";

interface SellAuthConfig {
  apiKey: string;
  shopId: string;
}

interface SellAuthCheckoutRequest {
  cart: Array<{
    productId: number;
    variantId: number;
    quantity: number;
  }>;
  ip: string;
  country_code: string;
  user_agent: string;
  email: string;
  gateway?: string;
  asn?: number;
  discord_user_id?: string | null;
  discord_user_username?: string | null;
  discord_access_token?: string | null;
  discord_refresh_token?: string | null;
  coupon?: string | null;
  newsletter?: boolean;
}

interface SellAuthCheckoutResponse {
  success: boolean;
  invoice_id: number;
  invoice_url: string;
  url: string;
}

interface SellAuthProduct {
  id: string;
  title: string;
  price: number;
  currency: string;
  type: string;
}

export class SellAuthClient {
  private config: SellAuthConfig;
  private baseUrl = 'https://api.sellauth.com/v1';

  constructor() {
    this.config = {
      apiKey: process.env.SELLAUTH_API_KEY || '',
      shopId: process.env.SELLAUTH_SHOP_ID || ''
    };
    
    if (!this.config.apiKey || !this.config.shopId) {
      throw new Error('SellAuth credentials not configured');
    }
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const config: RequestInit = {
      method,
      headers,
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    try {
      console.log('SellAuth API Request:', { url, method, data });
      const response = await fetch(url, config);
      
      const responseText = await response.text();
      console.log('SellAuth API Response:', { status: response.status, body: responseText });
      
      if (!response.ok) {
        throw new Error(`SellAuth API Error: ${response.status} - ${responseText}`);
      }

      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
    } catch (error) {
      console.error('SellAuth API request failed:', error);
      throw error;
    }
  }

  async createCheckout(request: SellAuthCheckoutRequest): Promise<SellAuthCheckoutResponse> {
    const endpoint = `/shops/${this.config.shopId}/checkout`;
    const response = await this.makeRequest(endpoint, 'POST', request);
    return response;
  }

  async getProduct(productId: string): Promise<SellAuthProduct> {
    const response = await this.makeRequest(`/products/${productId}`);
    return response;
  }

  async verifyPayment(paymentId: string): Promise<any> {
    const response = await this.makeRequest(`/payments/${paymentId}`);
    return response;
  }

  // Create a checkout URL for our products
  async createProductCheckout(product: Product, plan: string, customerEmail: string, userIp: string = '127.0.0.1') {
    const checkoutRequest: SellAuthCheckoutRequest = {
      cart: [{
        productId: 436109, // Your test product ID
        variantId: 634959, // Your correct variant ID
        quantity: 1
      }],
      ip: userIp,
      country_code: 'US',
      user_agent: 'Kernal.wtf Website',
      email: customerEmail,
      gateway: 'STRIPE',
      newsletter: false
    };

    return await this.createCheckout(checkoutRequest);
  }

  private getPriceForPlan(product: Product, plan: string): string {
    const basePrice = parseFloat(product.price);
    switch (plan) {
      case "3month": return (basePrice * 2.7).toFixed(2);
      case "6month": return (basePrice * 5).toFixed(2);
      case "12month": return (basePrice * 9).toFixed(2);
      default: return product.price;
    }
  }
}

export const sellAuth = new SellAuthClient();