# Vicky's Luxury E-Commerce Website

## Overview
This is a fully responsive e-commerce website for \"Vicky's Luxury\" featuring luxury clothing and accessories. The frontend is built with vanilla HTML, CSS, and JavaScript, connecting to a backend API for dynamic product data, user authentication, and admin management.

## Key Features

### User Features
- **Product Catalog**: Browse products with filtering by category, size preference, and new arrivals
- **User Authentication**: Login/Register with session management via localStorage
- **Personalized Shopping**: Size-based product filtering based on user preferences
- **Shopping Cart**: Add to bag functionality with localStorage persistence
- **Responsive Design**: Mobile-first design with hamburger menu and user dropdown

### Admin Features
- **Product Management**: Add, view, and manage products
- **Order Management**: View and manage customer orders
- **Admin Authentication**: Separate login for admin panel

## Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Storage**: localStorage for cart, user session, tokens
- **Backend API**: `https://ecommerceapi-f6ep.onrender.com/api/`
  - `/api/products` - Product catalog
  - `/api/auth/login`, `/api/auth/register` - User auth
  - `/api/auth/me` - User profile

## Project Structure
```
c:/vickytutt/
├── index.html              # Main landing page
├── style.css              # Global styles
├── script.js              # Core JavaScript logic
├── auth.js                # Authentication handlers
├── fetch.js               # API fetch utilities
├── sections.html          # Page sections/templates
├── profile.html           # User profile page
├── addtocart.html         # Cart/checkout
├── signupform.html        # Registration form
├── admin/                 # Admin panel
│   ├── admin.html         # Admin dashboard
│   ├── adminlogin.html    # Admin login
│   ├── adminproduct.html  # Product management
│   ├── adminorder.html    # Order management
│   ├── admin.css          # Admin styles
│   └── *.js               # Admin scripts
└── image/                 # Product images
```

## Quick Start

1. **Open in Browser**:
   ```bash
   # Windows
   start index.html
   
   # Or simply double-click index.html
   ```

2. **Test Features**:
   - Browse products on homepage
   - Register/login via signupform.html or modals
   - Add products to cart
   - Access admin panel at `admin/admin.html`

## API Endpoints Used
```
GET    /api/products          # All products
POST   /api/auth/login        # User login
POST   /api/auth/register     # User signup
GET    /api/auth/me           # User profile (with token)
```

## Local Development
- No build tools required - pure static site
- Edit HTML/CSS/JS files directly
- Images stored in `image/` and `admin/image/` folders
- All state managed via localStorage

## Customization
1. Update product images in `image/` folder
2. Modify styles in `style.css` and `admin/admin.css`
3. Change API endpoint in JS files (search for `ecommerceapi-f6ep.onrender.com`)
4. Add new product categories in filter logic

## Deployment
- Host static files on any web server (Netlify, Vercel, GitHub Pages)
- Backend API already live on Render.com

---

**Built with ❤️ for Vicky's Luxury**
