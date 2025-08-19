# Overview

This is a modern full-stack web application for "Kernal.wtf", a gaming enhancement tools marketplace. The application features a React frontend with a Node.js/Express backend, built to showcase and sell gaming cheats and enhancement tools for popular games like Apex Legends, Valorant, and CS:GO. The site includes product listings, Discord integration, FAQ sections, comprehensive variant management in the admin panel, and a dark gaming-themed UI with neon green accents.

## Recent Updates (January 2025)
- ✅ **Comprehensive Variant Management System**: Admin panel now includes full variant management with individual prices, custom names, SellAuth variant IDs, discount labels, and period selection
- ✅ **Quick Add Common Periods**: One-click buttons to add standard pricing tiers (1 month, 3 months, 6 months, lifetime) with auto-calculated prices and discounts
- ✅ **Enhanced Period Options**: Support for various periods including days, weeks, months, and custom periods
- ✅ **Static Build System**: Created build-static.js script for exporting the website to static hosting platforms like GitHub Pages, Cloudflare Pages, Netlify
- ✅ **Database Schema Fixes**: Resolved all database connection and validation issues

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using **React 18** with **TypeScript** and uses a component-based architecture:

- **UI Framework**: Built with shadcn/ui components using Radix UI primitives for accessibility and consistency
- **Styling**: TailwindCSS with a custom dark theme featuring gaming aesthetics (neon green/pink accents)
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a clean component structure with reusable UI components, custom hooks, and TypeScript for type safety. The design emphasizes a modern gaming aesthetic with gradient backgrounds, neon colors, and smooth animations.

## Backend Architecture

The backend uses **Express.js** with TypeScript in ESM format:

- **API Design**: RESTful API structure with dedicated routes for products, Discord data, and FAQ items
- **Storage Layer**: Abstract storage interface (IStorage) with in-memory implementation for development
- **Middleware**: Custom logging middleware for API requests and error handling
- **Development Integration**: Vite middleware integration for seamless development experience

The storage layer is designed to be easily swappable, currently using in-memory storage with sample data but architected to support database backends.

## Data Storage Solutions

**Database Setup**:
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema Management**: Centralized schema definitions in the shared directory
- **Migration System**: Drizzle Kit for database migrations and schema synchronization
- **Current State**: Uses in-memory storage with sample data, but database infrastructure is ready

The database schema includes tables for users, products, Discord data, and FAQ items with proper relationships and validation.

## Authentication and Authorization

The application is prepared for authentication but not currently implemented:
- **Session Management**: connect-pg-simple configured for PostgreSQL session storage
- **Schema**: User table with username/password fields ready for authentication implementation
- **API Structure**: Routes are designed to accommodate future authentication middleware

## External Service Integrations

**Discord Integration**:
- API endpoints for Discord server data (member count, online count, invite URLs)
- Frontend components for displaying Discord community information
- Referral code system for Discord invites

**Development Tools**:
- Replit-specific plugins for development environment integration
- Error overlay and cartographer plugins for enhanced debugging
- Custom development banner for external access

The application is structured as a monorepo with shared TypeScript definitions between frontend and backend, enabling type-safe communication across the full stack.