import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { sellAuth } from "./sellauth";
import { setupAuthRoutes, isAdminAuthenticated } from "./auth";
import { emailService } from "./email";
import crypto from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
  
  // Setup authentication routes
  await setupAuthRoutes(app);
  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get("/api/products/:id/variants", async (req, res) => {
    try {
      const variants = await storage.getProductVariants(req.params.id);
      res.json(variants);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product variants" });
    }
  });

  // Discord routes
  app.get("/api/discord", async (req, res) => {
    try {
      const discordData = await storage.getDiscordData();
      if (!discordData) {
        return res.status(404).json({ message: "Discord data not found" });
      }
      res.json(discordData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Discord data" });
    }
  });

  // FAQ routes
  app.get("/api/faq", async (req, res) => {
    try {
      const faqItems = await storage.getAllFaqItems();
      res.json(faqItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch FAQ items" });
    }
  });

  // Payment routes
  app.post("/api/payment/checkout", async (req, res) => {
    try {
      const { productId, plan, email } = req.body;
      
      if (!productId || !plan || !email) {
        return res.status(400).json({ message: "Product ID, plan, and email are required" });
      }

      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Get user's IP address
      const userIp = req.headers['x-forwarded-for'] as string || req.connection.remoteAddress || '127.0.0.1';
      
      const checkout = await sellAuth.createProductCheckout(product, plan, email, userIp);
      res.json(checkout);
    } catch (error) {
      console.error("Checkout creation failed:", error);
      res.status(500).json({ message: "Failed to create checkout" });
    }
  });

  // SellAuth webhook endpoint
  app.post("/api/webhook/sellauth", async (req, res) => {
    try {
      const signature = req.headers['x-sellauth-signature'];
      const payload = JSON.stringify(req.body);
      
      // Verify webhook signature (optional but recommended)
      // const expectedSignature = crypto.createHmac('sha256', process.env.SELLAUTH_WEBHOOK_SECRET || '')
      //   .update(payload)
      //   .digest('hex');
      
      const { event, data } = req.body;
      
      if (event === 'payment.completed') {
        // Handle successful payment
        console.log('Payment completed:', data);
        
        // Here you would:
        // 1. Verify the payment with SellAuth API
        // 2. Grant access to the product
        // 3. Send download links via email
        // 4. Update user account
        
        const paymentVerification = await sellAuth.verifyPayment(data.payment_id);
        
        if (paymentVerification.status === 'completed') {
          // Process the successful payment
          console.log('Payment verified:', paymentVerification);
        }
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Webhook processing failed:", error);
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Payment verification endpoint
  app.get("/api/payment/verify/:paymentId", async (req, res) => {
    try {
      const { paymentId } = req.params;
      const payment = await sellAuth.verifyPayment(paymentId);
      res.json(payment);
    } catch (error) {
      console.error("Payment verification failed:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });



  // Admin endpoints (protected)
  app.post("/api/admin/products", isAdminAuthenticated, async (req, res) => {
    try {
      const productData = req.body;
      
      // Validate the product data
      if (!productData.name || !productData.description || !productData.price) {
        return res.status(400).json({ message: "Name, description, and price are required" });
      }

      const newProduct = await storage.createProduct(productData);
      res.json(newProduct);
    } catch (error) {
      console.error("Failed to create product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.delete("/api/admin/products/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProduct(id);
      res.json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
      console.error("Failed to delete product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Variant management routes
  app.post("/api/admin/variants", isAdminAuthenticated, async (req, res) => {
    try {
      const variantData = req.body;
      
      if (!variantData.productId || !variantData.name || !variantData.price || !variantData.sellAuthVariantId) {
        return res.status(400).json({ message: "Product ID, name, price, and SellAuth variant ID are required" });
      }

      const variant = await storage.createProductVariant(variantData);
      res.json(variant);
    } catch (error) {
      console.error("Failed to create variant:", error);
      res.status(500).json({ message: "Failed to create variant" });
    }
  });

  app.get("/api/products/:id/variants", async (req, res) => {
    try {
      const { id } = req.params;
      const variants = await storage.getProductVariants(id);
      res.json(variants);
    } catch (error) {
      console.error("Failed to get variants:", error);
      res.status(500).json({ message: "Failed to get variants" });
    }
  });

  app.delete("/api/admin/variants/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteProductVariant(id);
      res.json({ success: true, message: "Variant deleted successfully" });
    } catch (error) {
      console.error("Failed to delete variant:", error);
      res.status(500).json({ message: "Failed to delete variant" });
    }
  });

  // Support email route
  app.post("/api/support/message", async (req, res) => {
    let ticket;
    try {
      const { name, email, subject, message } = req.body;
      
      if (!name || !email || !message) {
        return res.status(400).json({ message: "Name, email, and message are required" });
      }

      // Create support ticket in database first
      console.log("Creating support ticket with data:", {
        customerName: name,
        customerEmail: email,
        subject: subject || "Support Request",
        message,
        status: "open",
        priority: "normal"
      });
      
      try {
        ticket = await storage.createSupportTicket({
          customerName: name,
          customerEmail: email,
          subject: subject || "Support Request",
          message,
          status: "open",
          priority: "normal"
        });
        console.log("Created ticket:", ticket);
      } catch (dbError) {
        console.error("Database error creating ticket:", dbError);
        // Don't throw yet, try to send emails anyway for backward compatibility
      }

      // Send email to support
      try {
        await emailService.sendSupportEmail({
          name,
          email,
          subject: subject || "Support Request",
          message
        });
      } catch (emailError) {
        console.error("Email service error:", emailError);
      }

      // Send confirmation to customer
      try {
        await emailService.sendConfirmationEmail(email, name);
      } catch (confirmError) {
        console.error("Confirmation email error:", confirmError);
      }

      res.json({ 
        success: true, 
        message: "Support request sent successfully. Check your email for confirmation.",
        ticketId: ticket?.id
      });
    } catch (error) {
      console.error("Failed to process support request:", error);
      res.status(500).json({ 
        message: "Failed to send support request. Please try again or contact us directly." 
      });
    }
  });

  // Admin support ticket routes
  app.get("/api/admin/support/tickets", isAdminAuthenticated, async (req, res) => {
    try {
      const tickets = await storage.getAllSupportTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Failed to get support tickets:", error);
      res.status(500).json({ message: "Failed to get support tickets" });
    }
  });

  app.get("/api/admin/support/tickets/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const ticket = await storage.getSupportTicket(req.params.id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      const replies = await storage.getSupportReplies(req.params.id);
      res.json({ ticket, replies });
    } catch (error) {
      console.error("Failed to get support ticket:", error);
      res.status(500).json({ message: "Failed to get support ticket" });
    }
  });

  app.post("/api/admin/support/tickets/:id/reply", isAdminAuthenticated, async (req, res) => {
    try {
      const { message } = req.body;
      const ticketId = req.params.id;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Get ticket details
      const ticket = await storage.getSupportTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Create reply
      const reply = await storage.createSupportReply({
        ticketId,
        message,
        isFromAdmin: true,
        senderName: "Support Team",
        senderEmail: "support@kernal.com"
      });

      // Send email reply to customer
      await emailService.sendReplyEmail(ticket.customerEmail, ticket.customerName, ticket.subject, message);

      // Update ticket status to in_progress if it's open
      if (ticket.status === "open") {
        await storage.updateSupportTicket(ticketId, { status: "in_progress" });
      }

      res.json({ 
        success: true, 
        message: "Reply sent successfully",
        reply 
      });
    } catch (error) {
      console.error("Failed to send reply:", error);
      res.status(500).json({ message: "Failed to send reply" });
    }
  });

  app.patch("/api/admin/support/tickets/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const { status, priority, assignedTo } = req.body;
      const ticketId = req.params.id;
      
      const updateData: any = {};
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;
      if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

      const updatedTicket = await storage.updateSupportTicket(ticketId, updateData);
      res.json({ success: true, ticket: updatedTicket });
    } catch (error) {
      console.error("Failed to update ticket:", error);
      res.status(500).json({ message: "Failed to update ticket" });
    }
  });

  app.delete("/api/admin/support/tickets/:id", isAdminAuthenticated, async (req, res) => {
    try {
      await storage.deleteSupportTicket(req.params.id);
      res.json({ success: true, message: "Ticket deleted successfully" });
    } catch (error) {
      console.error("Failed to delete ticket:", error);
      res.status(500).json({ message: "Failed to delete ticket" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
