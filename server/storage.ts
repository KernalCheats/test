import { 
  type User, type InsertUser, type Product, type InsertProduct, 
  type DiscordData, type InsertDiscordData, type FaqItem, type InsertFaqItem,
  type AdminUser, type InsertAdminUser, type ProductVariant, type InsertProductVariant,
  type SupportTicket, type InsertSupportTicket, type SupportReply, type InsertSupportReply,
  users, adminUsers, products, productVariants, discordData, faqItems, supportTickets, supportReplies
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Admin User methods
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  updateAdminUser(id: string, data: Partial<InsertAdminUser>): Promise<AdminUser>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Product Variant methods
  getProductVariants(productId: string): Promise<ProductVariant[]>;
  createProductVariant(variant: InsertProductVariant): Promise<ProductVariant>;
  deleteProductVariant(id: string): Promise<void>;
  deleteProductVariants(productId: string): Promise<void>;
  
  // Discord methods
  getDiscordData(): Promise<DiscordData | undefined>;
  updateDiscordData(data: InsertDiscordData): Promise<DiscordData>;
  
  // FAQ methods
  getAllFaqItems(): Promise<FaqItem[]>;
  createFaqItem(item: InsertFaqItem): Promise<FaqItem>;
  
  // Support Ticket methods
  getAllSupportTickets(): Promise<(SupportTicket & { replyCount: number })[]>;
  getSupportTicket(id: string): Promise<SupportTicket | undefined>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: string, data: Partial<InsertSupportTicket>): Promise<SupportTicket>;
  deleteSupportTicket(id: string): Promise<void>;
  
  // Support Reply methods
  getSupportReplies(ticketId: string): Promise<SupportReply[]>;
  createSupportReply(reply: InsertSupportReply): Promise<SupportReply>;
  deleteSupportReply(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    try {
      // Check if admin user exists
      const existingAdmin = await db.select().from(adminUsers).limit(1);
      if (existingAdmin.length === 0) {
        // Create default admin user
        await db.insert(adminUsers).values({
          username: "admin",
          password: await bcrypt.hash("Amesads1&", 10),
          twoFactorEnabled: false
        });
      }

      // Check if data already exists
      const existingProducts = await db.select().from(products).limit(1);
      if (existingProducts.length > 0) {
        return; // Data already initialized
      }

      // Initialize sample products
      const sampleProducts: InsertProduct[] = [
        {
          name: "APEX LEGENDS CHEAT",
          description: "Advanced ESP, aimbot, and triggerbot for Apex Legends. Undetected by anti-cheat systems.",
          price: "29.99",
          period: "month",
          features: ["Wallhack ESP", "Aimbot with smoothing", "Triggerbot", "No recoil/spread"],
          imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
          category: "FPS",
          isPopular: "true",
          isBestseller: "false",
          isNew: "false",
          sellAuthProductId: "436109",
          sellAuthShopId: "174522"
        },
        {
          name: "VALORANT PRO TOOL",
          description: "Professional Valorant enhancement suite with advanced anti-detection technology.",
          price: "39.99",
          period: "month",
          features: ["Silent Aimbot", "Glow ESP", "Radar Hack", "Stream Proof"],
          imageUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
          category: "FPS",
          isPopular: "false",
          isBestseller: "false",
          isNew: "true",
          sellAuthProductId: "",
          sellAuthShopId: "174522"
        },
        {
          name: "WARZONE DOMINATOR",
          description: "Complete Warzone enhancement package with advanced features and lifetime updates.",
          price: "49.99",
          period: "month",
          features: ["Magic Bullet", "2D Radar", "Vehicle ESP", "Loot ESP"],
          imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
          category: "FPS",
          isPopular: "false",
          isBestseller: "true",
          isNew: "false",
          sellAuthProductId: "",
          sellAuthShopId: "174522"
        },
        {
          name: "CS:GO ELITE HACK",
          description: "Ultimate Counter-Strike enhancement with precision aimbot and advanced ESP systems.",
          price: "24.99",
          period: "month",
          features: ["Precision Aimbot", "Bone ESP", "Bunny Hop", "Anti-Flash"],
          imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
          category: "FPS",
          isPopular: "true",
          isBestseller: "false",
          isNew: "false",
          sellAuthProductId: "",
          sellAuthShopId: "174522"
        },
        {
          name: "FORTNITE ADVANTAGE",
          description: "Complete Fortnite enhancement suite with building assistance and combat improvements.",
          price: "34.99",
          period: "month",
          features: ["Auto Build", "Player ESP", "Loot ESP", "No Spread"],
          imageUrl: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
          category: "Battle Royale",
          isPopular: "false",
          isBestseller: "false",
          isNew: "true",
          sellAuthProductId: "",
          sellAuthShopId: "174522"
        },
        {
          name: "RUST SURVIVAL TOOL",
          description: "Advanced Rust enhancement for resource gathering and PvP dominance.",
          price: "19.99",
          period: "month",
          features: ["Resource ESP", "Player ESP", "No Recoil", "Auto Farm"],
          imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
          category: "Survival",
          isPopular: "false",
          isBestseller: "false",
          isNew: "false",
          sellAuthProductId: "",
          sellAuthShopId: "174522"
        }
      ];

      // Insert products into database
      const insertedProducts = await db.insert(products).values(sampleProducts as any).returning();
      
      // Create variants for the first product (Apex Legends)
      const apexProduct = insertedProducts[0];
      const apexVariants: InsertProductVariant[] = [
        {
          productId: apexProduct.id,
          name: "1 Month",
          period: "1month",
          price: "29.99",
          discount: "",
          sellAuthVariantId: "634959", // Your current variant ID
          isDefault: true
        },
        {
          productId: apexProduct.id,
          name: "3 Months",
          period: "3month",
          price: "80.97", // 29.99 * 2.7
          discount: "10% OFF",
          sellAuthVariantId: "634960", // You would get this from SellAuth
          isDefault: false
        },
        {
          productId: apexProduct.id,
          name: "6 Months",
          period: "6month",
          price: "149.95", // 29.99 * 5
          discount: "17% OFF",
          sellAuthVariantId: "634961", // You would get this from SellAuth
          isDefault: false
        },
        {
          productId: apexProduct.id,
          name: "12 Months",
          period: "12month",
          price: "269.91", // 29.99 * 9
          discount: "25% OFF",
          sellAuthVariantId: "634962", // You would get this from SellAuth
          isDefault: false
        }
      ];
      
      await db.insert(productVariants).values(apexVariants as any);

      // Initialize Discord data
      const discordDataInsert: InsertDiscordData = {
        serverId: "kernal-wtf-server",
        memberCount: "15234",
        onlineCount: "8420",
        referralCode: "KERNAL2024",
        inviteUrl: "https://discord.gg/kernal"
      };
      
      await db.insert(discordData).values(discordDataInsert);

      // Initialize FAQ items
      const sampleFaqItems: InsertFaqItem[] = [
        {
          question: "Is it safe to use your cheats?",
          answer: "Yes, our cheats are developed with advanced anti-detection technology and are regularly updated to stay undetected by anti-cheat systems. However, we recommend using them responsibly and following our usage guidelines.",
          order: "1"
        },
        {
          question: "How do I download and install the software?",
          answer: "After purchase, you'll receive download links and detailed installation instructions via email. Our Discord community also provides step-by-step video guides and live support.",
          order: "2"
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept major credit cards, PayPal, cryptocurrency (Bitcoin, Ethereum), and various other secure payment methods to ensure your privacy and security.",
          order: "3"
        },
        {
          question: "Do you offer refunds?",
          answer: "We offer a 24-hour refund policy for first-time customers. If you encounter any issues with our software within the first 24 hours, contact our support team for assistance or a refund.",
          order: "4"
        },
        {
          question: "How often do you update your cheats?",
          answer: "Our development team works around the clock to ensure all cheats are updated within hours of any game patches. Subscribers receive automatic updates and notifications through our platform.",
          order: "5"
        }
      ];

      await db.insert(faqItems).values(sampleFaqItems as any);
    } catch (error) {
      console.error("Error initializing default data:", error);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Admin User methods
  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return user;
  }

  async createAdminUser(insertUser: InsertAdminUser): Promise<AdminUser> {
    const [user] = await db.insert(adminUsers).values(insertUser).returning();
    return user;
  }
  
  async updateAdminUser(id: string, data: Partial<InsertAdminUser>): Promise<AdminUser> {
    const [user] = await db.update(adminUsers).set(data).where(eq(adminUsers.id, id)).returning();
    return user;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).limit(3);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const productData: InsertProduct = {
      ...insertProduct,
      sellAuthShopId: insertProduct.sellAuthShopId || "174522"
    };
    const [product] = await db.insert(products).values(productData).returning();
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    // Delete associated variants first
    await this.deleteProductVariants(id);
    // Then delete the product
    await db.delete(products).where(eq(products.id, id));
  }
  
  // Product Variant methods
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return await db.select().from(productVariants).where(eq(productVariants.productId, productId));
  }

  async createProductVariant(variant: InsertProductVariant): Promise<ProductVariant> {
    const [newVariant] = await db.insert(productVariants).values(variant).returning();
    return newVariant;
  }

  async deleteProductVariant(id: string): Promise<void> {
    await db.delete(productVariants).where(eq(productVariants.id, id));
  }

  async deleteProductVariants(productId: string): Promise<void> {
    await db.delete(productVariants).where(eq(productVariants.productId, productId));
  }

  // Discord methods
  async getDiscordData(): Promise<DiscordData | undefined> {
    const [data] = await db.select().from(discordData).limit(1);
    return data;
  }

  async updateDiscordData(data: InsertDiscordData): Promise<DiscordData> {
    const existing = await this.getDiscordData();
    if (existing) {
      const [updated] = await db.update(discordData).set(data).where(eq(discordData.id, existing.id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(discordData).values(data).returning();
      return created;
    }
  }

  // FAQ methods
  async getAllFaqItems(): Promise<FaqItem[]> {
    const items = await db.select().from(faqItems);
    return items.sort((a, b) => parseInt(a.order) - parseInt(b.order));
  }

  async createFaqItem(insertFaqItem: InsertFaqItem): Promise<FaqItem> {
    const [item] = await db.insert(faqItems).values({
      ...insertFaqItem,
      order: insertFaqItem.order || "0"
    }).returning();
    return item;
  }

  // Support Ticket methods
  async getAllSupportTickets(): Promise<(SupportTicket & { replyCount: number })[]> {
    const tickets = await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
    
    // Get reply counts for each ticket
    const ticketsWithCounts = await Promise.all(
      tickets.map(async (ticket) => {
        const replies = await this.getSupportReplies(ticket.id);
        return {
          ...ticket,
          replyCount: replies.length
        };
      })
    );
    
    return ticketsWithCounts;
  }

  async getSupportTicket(id: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket;
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const [newTicket] = await db.insert(supportTickets).values({
      ...ticket,
      updatedAt: new Date()
    }).returning();
    return newTicket;
  }

  async updateSupportTicket(id: string, data: Partial<InsertSupportTicket>): Promise<SupportTicket> {
    const [updated] = await db.update(supportTickets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(supportTickets.id, id))
      .returning();
    return updated;
  }

  async deleteSupportTicket(id: string): Promise<void> {
    // Delete all replies first
    await db.delete(supportReplies).where(eq(supportReplies.ticketId, id));
    // Then delete the ticket
    await db.delete(supportTickets).where(eq(supportTickets.id, id));
  }

  // Support Reply methods
  async getSupportReplies(ticketId: string): Promise<SupportReply[]> {
    return await db.select().from(supportReplies)
      .where(eq(supportReplies.ticketId, ticketId))
      .orderBy(supportReplies.createdAt);
  }

  async createSupportReply(reply: InsertSupportReply): Promise<SupportReply> {
    const [newReply] = await db.insert(supportReplies).values(reply).returning();
    return newReply;
  }

  async deleteSupportReply(id: string): Promise<void> {
    await db.delete(supportReplies).where(eq(supportReplies.id, id));
  }
}

export const storage = new DatabaseStorage();