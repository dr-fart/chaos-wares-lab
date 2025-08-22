# Chaos Wares - Hugo Lab Site

A complete static e-commerce website for the fictional company "Chaos Wares" built with Hugo. This site demonstrates physics-inspired art pieces and serves as a training lab for Cloudflare security features.

## 🎯 Project Overview

**Company**: Chaos Wares  
**Tagline**: Curated Curiosities for the Inquisitive Mind  
**Purpose**: Static site generator lab for Cloudflare security training

## 🚀 Quick Start

### Prerequisites
- Hugo (extended version recommended)
- Git

### Installation & Setup

1. **Install Hugo** (if not already installed):
   ```bash
   brew install hugo
   ```

2. **Navigate to the project directory**:
   ```bash
   cd /Users/lsares/CascadeProjects/chaos-wares
   ```

3. **Start the Hugo development server**:
   ```bash
   hugo server -D
   ```

4. **Build for production**:
   ```bash
   hugo --minify
   ```

The built site will be in the `public/` directory, ready for deployment.

## 🏗️ Project Structure

```
chaos-wares/
├── hugo.toml              # Hugo configuration
├── content/               # Markdown content files
│   ├── _index.md         # Homepage content
│   ├── about.md          # About page
│   ├── login.md          # Login page
│   ├── checkout.md       # Checkout page
│   ├── support.md        # Support page
│   ├── admin/
│   │   └── tools.md      # Admin tools page
│   └── products/         # Product catalog
│       ├── _index.md     # Products listing page
│       └── *.md          # Individual product pages
├── layouts/              # Hugo templates
│   ├── _default/         # Default layouts
│   ├── partials/         # Reusable components
│   └── *.html           # Page-specific layouts
├── static/               # Static assets
│   ├── css/
│   │   └── main.css     # Main stylesheet
│   └── js/
│       ├── main.js      # Core functionality
│       └── ai-tool.js   # AI tool functionality
└── public/              # Generated site (after build)
```

## 🎨 Brand Identity

### Color Palette
- **Background**: `#0A192F` (Deep Space Blue)
- **Text**: `#E2E8F0` (Light Slate Gray)
- **Headings**: `#FFFFFF`
- **Primary Accent**: `#00F5D4` (Plasma Teal)
- **Secondary Accent**: `#FF7B00` (Fusion Orange)
- **Card Background**: `#1E293B`

### Typography
- **Headings**: Poppins (Google Font)
- **Body Text**: Inter (Google Font)

## 📦 Product Catalog

The site features 9 physics-inspired products:

1. **The Entropy Lamp** - $89.99 (CW-LP-001)
2. **Chaotic Double Pendulum** - $175.00 (CW-DP-001)
3. **Ferrofluidic Sculpture** - $129.50 (CW-FS-001)
4. **Kinetic Light Mobile** - $249.00 (CW-KM-001)
5. **Interactive Plasma Ball** - $69.99 (CW-PB-001)
6. **Oceanic Wave Machine** - $95.00 (CW-WM-001)
7. **Rippling Water Caustics** - $210.00 (CW-WC-001)
8. **Turbulent Fluid Vortex** - $165.00 (CW-FV-001)
9. **Ant Colony Habitat** - $299.99 (CW-AC-001)

## 🔧 Features

### Frontend Functionality
- **Shopping Cart**: LocalStorage-based cart management
- **Responsive Design**: Mobile-friendly navigation and layouts
- **Interactive Forms**: Login, checkout, and support contact forms
- **Product Catalog**: Dynamic product listing and detail pages
- **Product Gallery**: Visual browsing with hover effects and image zoom
- **SVG Product Images**: Scalable, animated product visualizations

### API Integration Points
The site makes POST requests to these endpoints (handled by Cloudflare Workers):
- `/api/v1/auth/login` - User authentication
- `/api/v1/cart/checkout` - Order processing
- `/api/v1/forms/contact-submit` - Support form submission
- `/api/v1/generate-description` - AI product description generator

### Admin Tools
- **AI Product Description Generator**: Located at `/admin/tools/`
- Form-based interface for generating product descriptions
- Integrates with Gemini API via Cloudflare Worker

## 🌐 Deployment Configuration

### Hugo Configuration
- **Relative URLs**: Enabled for dynamic domain support
- **Markup**: Unsafe HTML rendering enabled for SVG logos
- **Minification**: Recommended for production builds

### Docker Deployment
The site is designed to be served from a Docker container using Nginx:

```dockerfile
FROM nginx:alpine
COPY public/ /usr/share/nginx/html/
EXPOSE 80
```

### Domain Support
Configured for dynamic domains (e.g., `<slug>.spxlab.com`) with relative URL paths.

## 🎯 Lab Training Features

This site serves as a realistic e-commerce target for security training:

- **Attack Surfaces**: Forms, user input, API endpoints
- **Realistic Content**: Complete product catalog and company story
- **Interactive Elements**: Shopping cart, user authentication flows
- **Admin Interface**: Internal tools for advanced scenarios

## 🛠️ Development

### Adding New Products
1. Create a new markdown file in `content/products/`
2. Include frontmatter with `title`, `price`, `sku`, and `description`
3. Add product content in markdown format

### Customizing Styles
- Main styles are in `static/css/main.css`
- CSS variables define the color palette
- Responsive breakpoints at 768px

### JavaScript Functionality
- `static/js/main.js`: Cart management and core features
- `static/js/ai-tool.js`: AI description generator tool
- All API calls use fetch() with proper error handling

## 📝 License

This project is created for educational and training purposes as part of Cloudflare security labs.

---

**Chaos Wares** - Where Physics Becomes Art 🌌
