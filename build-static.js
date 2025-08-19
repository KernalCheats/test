#!/usr/bin/env node

/**
 * Static Site Builder for Kernal.wtf
 * 
 * This script builds a static version of the website that can be deployed to:
 * - GitHub Pages
 * - Cloudflare Pages  
 * - Netlify
 * - Vercel
 * - Any static hosting provider
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const DIST_DIR = 'dist';
const STATIC_DIR = 'static-build';

console.log('🚀 Building static version of Kernal.wtf...\n');

// Step 1: Clean previous builds
console.log('1. Cleaning previous builds...');
if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
}
if (fs.existsSync(STATIC_DIR)) {
  fs.rmSync(STATIC_DIR, { recursive: true, force: true });
}

// Step 2: Build the client
console.log('2. Building React client...');
try {
  execSync('npm run build:client', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Client build failed:', error.message);
  process.exit(1);
}

// Step 3: Create static build directory
console.log('3. Setting up static build directory...');
fs.mkdirSync(STATIC_DIR, { recursive: true });

// Step 4: Copy built client files
console.log('4. Copying client files...');
const clientBuildPath = path.join(DIST_DIR, 'public');
if (fs.existsSync(clientBuildPath)) {
  execSync(`cp -r ${clientBuildPath}/* ${STATIC_DIR}/`, { stdio: 'inherit' });
} else {
  console.error('❌ Client build files not found');
  process.exit(1);
}

// Step 5: Create API data files for static hosting
console.log('5. Creating static API data...');
const apiDir = path.join(STATIC_DIR, 'api');
fs.mkdirSync(apiDir, { recursive: true });

// Sample data that would normally come from the database
const staticData = {
  products: [
    {
      "id": "cc811d5e-19d4-4f9c-9bb2-62e19ac71af4",
      "name": "APEX LEGENDS CHEAT",
      "description": "Advanced ESP, aimbot, and triggerbot for Apex Legends. Undetected by anti-cheat systems.",
      "price": "29.99",
      "period": "month",
      "features": ["Wallhack ESP", "Aimbot with smoothing", "Triggerbot", "No recoil/spread"],
      "imageUrl": "https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      "category": "FPS",
      "isPopular": "true",
      "isBestseller": "false",
      "isNew": "false",
      "sellAuthProductId": "436109",
      "sellAuthShopId": "174522"
    },
    {
      "id": "valorant-pro-tool",
      "name": "VALORANT PRO TOOL",
      "description": "Professional Valorant enhancement suite with advanced anti-detection technology.",
      "price": "39.99",
      "period": "month",
      "features": ["Silent Aimbot", "Glow ESP", "Radar Hack", "Stream Proof"],
      "imageUrl": "https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      "category": "FPS",
      "isPopular": "false",
      "isBestseller": "false",
      "isNew": "true",
      "sellAuthProductId": "",
      "sellAuthShopId": "174522"
    },
    {
      "id": "warzone-dominator",
      "name": "WARZONE DOMINATOR",
      "description": "Complete Warzone enhancement package with advanced features and lifetime updates.",
      "price": "49.99",
      "period": "month",
      "features": ["Magic Bullet", "2D Radar", "Vehicle ESP", "Loot ESP"],
      "imageUrl": "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
      "category": "FPS",
      "isPopular": "false",
      "isBestseller": "true",
      "isNew": "false",
      "sellAuthProductId": "",
      "sellAuthShopId": "174522"
    }
  ],
  discord: {
    "id": "97f55d0f-30fc-40ba-81c8-a491364ae68c",
    "serverId": "1234567890",
    "memberCount": "2,847",
    "onlineCount": "1,234",
    "referralCode": "kernal",
    "inviteUrl": "https://discord.gg/kernal"
  },
  faq: [
    {
      "id": "1607086b-1fa2-4e31-b743-f91983379756",
      "question": "Is it safe to use your cheats?",
      "answer": "Yes, all our products are developed with advanced anti-detection technology and are regularly updated to stay undetected.",
      "order": "1"
    },
    {
      "id": "faq-2",
      "question": "How do I download my purchase?",
      "answer": "After successful payment, you'll receive download links via email within 5 minutes. You'll also get access to our Discord server.",
      "order": "2"
    },
    {
      "id": "faq-3",
      "question": "Do you offer refunds?",
      "answer": "We offer a 24-hour refund policy for first-time customers. Contact support if you experience any issues.",
      "order": "3"
    }
  ]
};

// Write static API files
fs.writeFileSync(path.join(apiDir, 'products.json'), JSON.stringify(staticData.products, null, 2));
fs.writeFileSync(path.join(apiDir, 'featured.json'), JSON.stringify(staticData.products.slice(0, 3), null, 2));
fs.writeFileSync(path.join(apiDir, 'discord.json'), JSON.stringify(staticData.discord, null, 2));
fs.writeFileSync(path.join(apiDir, 'faq.json'), JSON.stringify(staticData.faq, null, 2));

// Create individual product files
staticData.products.forEach(product => {
  fs.writeFileSync(path.join(apiDir, `product-${product.id}.json`), JSON.stringify(product, null, 2));
  
  // Create variants for each product
  const variants = [
    {
      "id": `${product.id}-1month`,
      "productId": product.id,
      "name": "1 Month",
      "period": "1month",
      "price": product.price,
      "discount": "",
      "sellAuthVariantId": "634959",
      "isDefault": true
    },
    {
      "id": `${product.id}-3month`,
      "productId": product.id,
      "name": "3 Months",
      "period": "3month",
      "price": (parseFloat(product.price) * 2.7).toFixed(2),
      "discount": "10% OFF",
      "sellAuthVariantId": "634960",
      "isDefault": false
    },
    {
      "id": `${product.id}-6month`,
      "productId": product.id,
      "name": "6 Months",
      "period": "6month",
      "price": (parseFloat(product.price) * 5).toFixed(2),
      "discount": "17% OFF",
      "sellAuthVariantId": "634961",
      "isDefault": false
    }
  ];
  
  fs.writeFileSync(path.join(apiDir, `variants-${product.id}.json`), JSON.stringify(variants, null, 2));
});

// Step 6: Create deployment configuration files
console.log('6. Creating deployment configurations...');

// GitHub Pages workflow
const githubWorkflow = `name: Deploy to GitHub Pages

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
      
    - name: Build static site
      run: node build-static.js
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: \${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./static-build
`;

// Cloudflare Pages configuration
const cloudflarePagesConfig = `# Cloudflare Pages Configuration

Build command: node build-static.js
Build output directory: static-build
Node.js version: 18

# Environment Variables (set in Cloudflare dashboard):
# NODE_VERSION=18
`;

// Netlify configuration
const netlifyConfig = `# Netlify Configuration
# netlify.toml

[build]
  command = "node build-static.js"
  publish = "static-build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/api/:splat.json"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;

// Create deployment configuration files
fs.mkdirSync(path.join(STATIC_DIR, '.github', 'workflows'), { recursive: true });
fs.writeFileSync(path.join(STATIC_DIR, '.github', 'workflows', 'deploy.yml'), githubWorkflow);
fs.writeFileSync(path.join(STATIC_DIR, 'CLOUDFLARE_PAGES.md'), cloudflarePagesConfig);
fs.writeFileSync(path.join(STATIC_DIR, 'netlify.toml'), netlifyConfig);

// Step 7: Create a README for deployment
const deploymentReadme = `# Kernal.wtf Static Deployment

This is the static build of Kernal.wtf that can be deployed to any static hosting provider.

## Deployment Options

### 1. GitHub Pages
1. Create a new GitHub repository
2. Push these files to the repository
3. Go to Settings > Pages in your GitHub repo
4. Select "GitHub Actions" as the source
5. The workflow will automatically deploy your site

### 2. Cloudflare Pages
1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: \`node build-static.js\`
3. Set build output directory: \`static-build\`
4. Deploy

### 3. Netlify
1. Connect your GitHub repository to Netlify
2. The netlify.toml file will automatically configure the build
3. Deploy

### 4. Vercel
1. Connect your GitHub repository to Vercel
2. Set build command: \`node build-static.js\`
3. Set output directory: \`static-build\`
4. Deploy

## Features Included
- ✅ Complete responsive website
- ✅ Product showcase
- ✅ Discord integration display
- ✅ FAQ section
- ✅ Gaming-themed dark UI
- ✅ SEO optimized
- ✅ Mobile responsive

## Features Disabled (Static Only)
- ❌ Admin panel (requires backend)
- ❌ Real-time payment processing
- ❌ Database operations
- ❌ User authentication

## Custom Domain Setup
After deployment, you can configure a custom domain in your hosting provider's dashboard.

## Notes
- This static build uses pre-generated JSON files for API data
- Payment integration will redirect to SellAuth checkout pages
- The site is fully functional for showcasing products
`;

fs.writeFileSync(path.join(STATIC_DIR, 'README.md'), deploymentReadme);

// Step 8: Create a simple server for local testing
const testServer = `#!/usr/bin/env node

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('.'));

// API routes that serve JSON files
app.get('/api/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'api', 'products.json'));
});

app.get('/api/products/featured', (req, res) => {
  res.sendFile(path.join(__dirname, 'api', 'featured.json'));
});

app.get('/api/products/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'api', \`product-\${req.params.id}.json\`));
});

app.get('/api/products/:id/variants', (req, res) => {
  res.sendFile(path.join(__dirname, 'api', \`variants-\${req.params.id}.json\`));
});

app.get('/api/discord', (req, res) => {
  res.sendFile(path.join(__dirname, 'api', 'discord.json'));
});

app.get('/api/faq', (req, res) => {
  res.sendFile(path.join(__dirname, 'api', 'faq.json'));
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`🚀 Static site running at http://localhost:\${PORT}\`);
  console.log('📁 Serving from:', __dirname);
});
`;

fs.writeFileSync(path.join(STATIC_DIR, 'server.js'), testServer);

console.log('\n✅ Static build completed successfully!');
console.log(`📁 Static files are in: ${STATIC_DIR}/`);
console.log('🌐 Ready for deployment to GitHub Pages, Cloudflare, Netlify, or Vercel');
console.log('\n📋 Next steps:');
console.log('1. Copy the static-build folder to your deployment repository');
console.log('2. Choose your hosting provider and follow the README instructions');
console.log('3. Configure your custom domain if needed');
console.log('\n🧪 To test locally: cd static-build && node server.js');