# Shadcn Dashboard Simplified

> A streamlined and simplified version of the shadcn/ui dashboard template, focused on essential business functionality.

This is a [Next.js 15](https://nextjs.org/) project with React 19, featuring a clean, production-ready dashboard with only the components you actually need.

## ✨ What's Included

### 🏠 **2 Core Dashboards**
- **Default Dashboard** - Main business overview with revenue, subscriptions, and analytics
- **E-commerce Dashboard** - Complete e-commerce suite with products, orders, and sales tracking

### 📱 **3 Essential Apps**  
- **AI Chat** - Modern AI-powered chat interface
- **Chat System** - Real-time messaging with contacts and media sharing
- **Calendar** - Event management and scheduling

### 📄 **Core Pages**
- User management and profiles
- Comprehensive settings (Account, Appearance, Notifications, Display)
- Product & order management
- Pricing pages (Column, Table, Single layouts)
- Authentication flows (Login, Register, Password Reset)
- Error pages (404, 500, 403)

## 🚀 Getting Started

1. Clone this repository:

    ```sh
    git clone https://github.com/mitchmort/shadcn-dashboard.git
    cd shadcn-dashboard
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

   If you encounter any problems installing packages, try:

    ```sh
    npm install --legacy-peer-deps
    ```

3. Run the development server:

    ```sh
    npm run dev
    ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Navigate to [http://localhost:3000/dashboard/default](http://localhost:3000/dashboard/default) to see the main dashboard.

## 📊 Key Features

- **31 optimized pages** for fast performance
- **Smaller bundle size** with focused functionality
- **Faster build times** with essential components only
- **Clean navigation** with intuitive organization
- **High maintainability** with well-structured code

## 🛠️ Built With

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React features
- **Tailwind CSS** - Utility-first CSS framework  
- **shadcn/ui** - Beautiful, accessible component library
- **TypeScript** - Type-safe development
- **Recharts** - Responsive chart library

## 📝 Project Structure

```
├── app/
│   └── dashboard/
│       ├── (auth)/
│       │   ├── default/          # Main dashboard
│       │   ├── ecommerce/        # E-commerce dashboard  
│       │   ├── apps/             # AI Chat, Chats, Calendar
│       │   └── pages/            # Users, Settings, Products, etc.
│       └── (guest)/              # Authentication pages
├── components/
│   ├── ui/                       # shadcn/ui components
│   └── layout/                   # Header, Sidebar, Logo
└── lib/                          # Utilities and configuration
```

## 🎨 Perfect For

This dashboard template is ideal for:
- **Business dashboards** requiring clean analytics
- **E-commerce applications** with product/order management  
- **SaaS applications** needing user management and settings
- **Startups** wanting a professional dashboard foundation
- **Custom business applications** requiring modern UI components

## 🚀 Deployment

Deploy easily with [Vercel](https://vercel.com) (recommended for Next.js):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mitchmort/shadcn-dashboard)

Or deploy to other platforms:
- **Netlify** - Drag and drop the build folder
- **Railway** - Connect your GitHub repository
- **Render** - Auto-deploy from GitHub

## 📄 License

This project is based on the original shadcn/ui dashboard template. MIT License.

---

**Repository:** [https://github.com/mitchmort/shadcn-dashboard](https://github.com/mitchmort/shadcn-dashboard)  
**Live Demo:** [Deploy your own](https://vercel.com/new/clone?repository-url=https://github.com/mitchmort/shadcn-dashboard)

