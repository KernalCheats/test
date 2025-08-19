import express from "express";
import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import qrcode from "qrcode";
import { storage } from "./storage";
import type { AdminUser } from "@shared/schema";

// Session middleware to track authenticated admin users
export function isAdminAuthenticated(req: express.Request, res: express.Response, next: express.NextFunction) {
  const session = req.session as any;
  
  if (!session.adminUserId || !session.isAdminAuthenticated) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  next();
}

export async function setupAuthRoutes(app: express.Application) {
  // Admin login endpoint
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password, twoFactorCode } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      
      // Find admin user
      const adminUser = await storage.getAdminUserByUsername(username);
      if (!adminUser) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, adminUser.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // If 2FA is enabled, verify the TOTP code
      if (adminUser.twoFactorEnabled && adminUser.twoFactorSecret) {
        if (!twoFactorCode) {
          return res.status(200).json({ 
            requires2FA: true,
            message: "Two-factor authentication code required" 
          });
        }
        
        const isValidToken = authenticator.verify({
          token: twoFactorCode,
          secret: adminUser.twoFactorSecret
        });
        
        if (!isValidToken) {
          return res.status(401).json({ message: "Invalid two-factor authentication code" });
        }
      }
      
      // Set session
      const session = req.session as any;
      session.adminUserId = adminUser.id;
      session.isAdminAuthenticated = true;
      
      // Update last login
      await storage.updateAdminUser(adminUser.id, {
        lastLogin: new Date() as any
      });
      
      res.json({ 
        success: true,
        message: "Login successful",
        user: {
          id: adminUser.id,
          username: adminUser.username,
          twoFactorEnabled: adminUser.twoFactorEnabled
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  
  // Admin logout endpoint
  app.post("/api/admin/logout", (req, res) => {
    const session = req.session as any;
    session.adminUserId = null;
    session.isAdminAuthenticated = false;
    
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });
  
  // Get current admin user
  app.get("/api/admin/user", isAdminAuthenticated, async (req, res) => {
    try {
      const session = req.session as any;
      const adminUser = await storage.getAdminUser(session.adminUserId);
      
      if (!adminUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: adminUser.id,
        username: adminUser.username,
        twoFactorEnabled: adminUser.twoFactorEnabled
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  
  // Setup 2FA endpoint
  app.post("/api/admin/setup-2fa", isAdminAuthenticated, async (req, res) => {
    try {
      const session = req.session as any;
      const adminUser = await storage.getAdminUser(session.adminUserId);
      
      if (!adminUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate new secret
      const secret = authenticator.generateSecret();
      
      // Generate QR code
      const otpauthUrl = authenticator.keyuri(
        adminUser.username,
        "Kernal.wtf Admin",
        secret
      );
      
      const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);
      
      // Save secret but don't enable 2FA yet
      await storage.updateAdminUser(adminUser.id, {
        twoFactorSecret: secret
      });
      
      res.json({
        secret,
        qrCodeUrl,
        manualEntryKey: secret
      });
    } catch (error) {
      console.error("2FA setup error:", error);
      res.status(500).json({ message: "Failed to setup 2FA" });
    }
  });
  
  // Enable 2FA endpoint
  app.post("/api/admin/enable-2fa", isAdminAuthenticated, async (req, res) => {
    try {
      const { code } = req.body;
      const session = req.session as any;
      
      if (!code) {
        return res.status(400).json({ message: "Verification code required" });
      }
      
      const adminUser = await storage.getAdminUser(session.adminUserId);
      if (!adminUser || !adminUser.twoFactorSecret) {
        return res.status(400).json({ message: "2FA setup required first" });
      }
      
      // Verify the code
      const isValidToken = authenticator.verify({
        token: code,
        secret: adminUser.twoFactorSecret
      });
      
      if (!isValidToken) {
        return res.status(401).json({ message: "Invalid verification code" });
      }
      
      // Enable 2FA
      await storage.updateAdminUser(adminUser.id, {
        twoFactorEnabled: true
      });
      
      res.json({ message: "Two-factor authentication enabled successfully" });
    } catch (error) {
      console.error("2FA enable error:", error);
      res.status(500).json({ message: "Failed to enable 2FA" });
    }
  });
  
  // Disable 2FA endpoint
  app.post("/api/admin/disable-2fa", isAdminAuthenticated, async (req, res) => {
    try {
      const { password } = req.body;
      const session = req.session as any;
      
      if (!password) {
        return res.status(400).json({ message: "Password required to disable 2FA" });
      }
      
      const adminUser = await storage.getAdminUser(session.adminUserId);
      if (!adminUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, adminUser.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }
      
      // Disable 2FA
      await storage.updateAdminUser(adminUser.id, {
        twoFactorEnabled: false,
        twoFactorSecret: null
      });
      
      res.json({ message: "Two-factor authentication disabled" });
    } catch (error) {
      console.error("2FA disable error:", error);
      res.status(500).json({ message: "Failed to disable 2FA" });
    }
  });
}