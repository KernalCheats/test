# Kernal.wtf Deployment Guide

This guide will walk you through hosting your website on GitHub and running the server on your local PC.

## Part 1: Setting Up Your Local Development Environment

### Prerequisites
Make sure you have these installed on your PC:
- **Node.js** (version 18 or higher) - Download from [nodejs.org](https://nodejs.org/)
- **Git** - Download from [git-scm.com](https://git-scm.com/)
- **PostgreSQL** (optional, for local database) - Download from [postgresql.org](https://www.postgresql.org/)

### Step 1: Download the Project
1. Go to your project on Replit
2. Click the three dots menu → "Download as ZIP"
3. Extract the ZIP file to a folder on your PC (e.g., `C:\kernal-website` or `~/kernal-website`)

### Step 2: Install Dependencies
1. Open Command Prompt (Windows) or Terminal (Mac/Linux)
2. Navigate to your project folder:
   ```bash
   cd path/to/your/kernal-website
   ```
3. Install all dependencies:
   ```bash
   npm install
   ```

### Step 3: Set Up Environment Variables
1. Create a file called `.env` in your project root folder
2. Add your configuration:
   ```env
   # Database Configuration
   DATABASE_URL=your_database_url_here
   
   # SellAuth Configuration
   SELLAUTH_API_KEY=your_sellauth_api_key
   SELLAUTH_SHOP_ID=your_sellauth_shop_id
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

### Step 4: Database Setup (Choose One Option)

#### Option A: Use Neon Database (Recommended)
1. Go to [neon.tech](https://neon.tech/) and create a free account
2. Create a new database project
3. Copy the connection string and use it as your `DATABASE_URL`

#### Option B: Local PostgreSQL
1. Install PostgreSQL on your PC
2. Create a database: `createdb kernal_website`
3. Use connection string like: `postgresql://username:password@localhost:5432/kernal_website`

### Step 5: Run Database Migration
```bash
npm run db:push
```

### Step 6: Start the Server
```bash
npm run dev
```

Your website will be available at `http://localhost:5000`

## Part 2: Hosting on GitHub

### Step 1: Create GitHub Repository
1. Go to [github.com](https://github.com) and sign in
2. Click "New repository"
3. Name it `kernal-website` (or any name you prefer)
4. Make it **Public** if you want free GitHub Pages hosting
5. Click "Create repository"

### Step 2: Prepare Your Code for GitHub
1. In your project folder, create a `.gitignore` file:
   ```gitignore
   node_modules/
   .env
   .env.local
   .env.production
   dist/
   *.log
   .DS_Store
   ```

2. Initialize Git and push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Kernal.wtf website"
   git remote add origin https://github.com/yourusername/kernal-website.git
   git branch -M main
   git push -u origin main
   ```

### Step 3: Set Up GitHub Pages (For Frontend Only)
1. In your GitHub repository, go to Settings → Pages
2. Under "Source", select "GitHub Actions"
3. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      if: github.ref == 'refs/heads/main'
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
```

## Part 3: Production Server Setup

### Option A: Run Server on Your PC (24/7)

#### Setup for Windows:
1. Create a batch file `start-server.bat`:
   ```batch
   @echo off
   cd /d "C:\path\to\your\kernal-website"
   npm run build
   npm start
   pause
   ```

2. To run as Windows Service (advanced):
   - Install PM2: `npm install -g pm2`
   - Create `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [{
       name: 'kernal-website',
       script: 'dist/index.js',
       env: {
         NODE_ENV: 'production',
         PORT: 5000
       }
     }]
   }
   ```
   - Start with: `pm2 start ecosystem.config.js`

#### Setup for Mac/Linux:
1. Create a shell script `start-server.sh`:
   ```bash
   #!/bin/bash
   cd /path/to/your/kernal-website
   npm run build
   npm start
   ```

2. Make it executable: `chmod +x start-server.sh`

### Option B: Cloud Hosting (Recommended)

#### Deploy to Railway:
1. Go to [railway.app](https://railway.app/)
2. Connect your GitHub repository
3. Add environment variables in Railway dashboard
4. Railway will automatically deploy your app

#### Deploy to Vercel:
1. Go to [vercel.com](https://vercel.com/)
2. Import your GitHub repository
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables in Vercel dashboard

#### Deploy to Render:
1. Go to [render.com](https://render.com/)
2. Create new "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Build Command: `npm run build`
   - Start Command: `npm start`
5. Add environment variables

## Part 4: Domain and DNS Setup

### Step 1: Get a Domain
- Purchase from providers like Namecheap, GoDaddy, or Cloudflare
- Or use a free subdomain from services like No-IP or DuckDNS

### Step 2: Configure DNS
If using your own server:
1. Point your domain's A record to your PC's public IP address
2. Set up port forwarding on your router (port 5000 or 80/443)

If using cloud hosting:
1. Point your domain to the hosting provider's servers
2. Follow their custom domain setup guide

## Part 5: Security and Production Considerations

### Essential Security Steps:
1. **Use HTTPS**: Get SSL certificate (free from Let's Encrypt)
2. **Environment Variables**: Never commit `.env` files to GitHub
3. **Database Security**: Use strong passwords and connection limits
4. **Rate Limiting**: Add rate limiting to your API endpoints
5. **CORS**: Configure CORS for your specific domain

### Performance Optimization:
1. **CDN**: Use Cloudflare for static assets
2. **Database**: Use connection pooling
3. **Caching**: Implement Redis for session storage
4. **Monitoring**: Set up uptime monitoring

## Troubleshooting

### Common Issues:

#### "Module not found" errors:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### Database connection issues:
- Check your DATABASE_URL format
- Ensure database is running and accessible
- Verify firewall settings

#### Port conflicts:
- Change PORT in your `.env` file
- Check if another service is using the port

#### Build failures:
- Check Node.js version compatibility
- Ensure all environment variables are set
- Review build logs for specific errors

## Getting Help

If you encounter issues:
1. Check the error logs in your terminal
2. Verify all environment variables are correctly set
3. Ensure your database is accessible
4. Check that all required services (SellAuth) are properly configured

Your Kernal.wtf website should now be successfully deployed and running!