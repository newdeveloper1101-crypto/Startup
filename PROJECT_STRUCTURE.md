# LeadSync CRM - Complete Project Structure

## 📁 Root Directory Structure

```
leadsync-crm/
├── 📋 Documentation Files
│   ├── DOCS_INDEX.md                       # Documentation index and navigation
│   ├── DOCUMENTATION_SUMMARY.md            # Comprehensive documentation summary
│   ├── ENHANCEMENTS_COMPLETE.md            # ✅ All UI enhancements completed
│   ├── ENHANCEMENTS_SUMMARY.md             # Summary of enhancements applied
│   ├── ENHANCEMENTS.md                     # Enhancement guidelines & implementation details
│   ├── FILE_DETAILS.md                     # Detailed file descriptions
│   ├── FILE_INVENTORY.md                   # Complete file inventory
│   ├── PROJECT_CODEBASE_DOCUMENTATION.md   # Detailed codebase documentation
│   ├── PROJECT_STRUCTURE.md                # This file
│   ├── README.md                           # Project overview, features & architecture
│   ├── RUNNING.md                          # Setup & running instructions
│   ├── SETTINGS_ENHANCEMENTS.md            # Settings page enhancements
│   ├── FRONTEND_QUICK_REFERENCE.md         # Quick reference for frontend
│   ├── FRONTEND_SETUP.md                   # Frontend setup guide
│   ├── FRONTEND_STRUCTURE.md               # Frontend folder structure
│   ├── FRONTEND_STYLING.md                 # Styling system documentation
│   ├── FRONTEND_COMPONENTS.md              # Component documentation
│   ├── FRONTEND_PAGES.md                   # Pages documentation
│   ├── FRONTEND_ARCHITECTURE.md            # Frontend architecture overview
│   ├── FRONTEND_OVERVIEW.md                # Frontend overview
│   ├── FRONTEND_DOCS_INDEX.md              # Frontend documentation index
│   ├── QUICK_REFERENCE.md                  # Quick reference guide
│   └── DOCS_INDEX.md                       # Main documentation index
│
├── 📦 Frontend Configuration Files
│   ├── package.json                 # Frontend dependencies (React 18, Vite, Tailwind, etc.)
│   ├── tsconfig.json                # TypeScript config for src/ folder
│   ├── tsconfig.node.json           # TypeScript config for Vite & build files
│   ├── vite.config.ts               # Vite build configuration with React plugin
│   ├── tailwind.config.js           # Tailwind CSS config (blue/cyan theme)
│   ├── postcss.config.js            # PostCSS config (autoprefixer, tailwindcss)
│   ├── index.html                   # HTML entry point
│   └── .env.local (not in repo)     # Frontend environment variables (BASE_URL, etc.)
│
└── 📁 Frontend Source Code (src/)
    ├── App.tsx                      # React Router setup - main routing component
    ├── main.tsx                     # React entry point (renders App to #root)
    ├── index.css                    # Global styles + Tailwind CSS imports
    ├── vite-env.d.ts                # Vite & import.meta type definitions
    │
    ├── 🔐 Authentication & Context
    │   └── context/
    │       └── AuthContext.tsx       # Global auth context state (user, company, token)
    │
    ├── 📄 Pages (Route Components)
    │   ├── Home.tsx                 # Public landing/marketing page
    │   ├── Login.tsx                # Login form with email & password
    │   ├── Signup.tsx               # Registration form for new companies
    │   │
    │   └── dashboard/               # Protected dashboard pages (require auth)
    │       ├── DashboardHome.tsx    # Dashboard overview with KPIs & metrics
    │       ├── Leads.tsx            # Leads management and list page
    │       ├── Conversations.tsx    # Shared inbox / Telegram conversations
    │       ├── Deals.tsx            # Sales pipeline / Kanban board view
    │       ├── Revenue.tsx          # Revenue analytics & charts
    │       ├── Reports.tsx          # Reports & business analytics
    │       └── Settings.tsx         # Settings, integrations & profile management
    │
    ├── 🧩 Reusable Components
    │   ├── auth/
    │   │   └── RequireAuth.tsx      # Route guard component (checks authentication)
    │   │
    │   ├── layout/
    │   │   ├── DashboardLayout.tsx  # Main dashboard wrapper with sidebar
    │   │   ├── Sidebar.tsx          # Navigation sidebar with role-based menu items
    │   │   └── MarketingNav.tsx     # Public site navigation bar
    │   │
    │   ├── leads/
    │   │   ├── LeadsTable.tsx       # Data table for leads with filtering & pagination
    │   │   └── LeadDetailModal.tsx  # Modal to view lead details (3 tabs)
    │   │
    │   ├── conversations/
    │   │   └── ChatPanel.tsx        # Chat message display with auto-scroll
    │   │
    │   ├── dashboard/
    │   │   └── SectionSummary.tsx   # KPI / metric card component (reusable)
    │   │
    │   └── ui/
    │       ├── Modal.tsx            # Generic modal wrapper with overlay
    │       ├── Spinner.tsx          # Loading spinner component
    │       ├── Toast.tsx            # Individual toast notification
    │       └── ToastContainer.tsx   # Toast notification container & manager
    │
    ├── 🎨 Data & Types
    │   ├── data/
    │   │   └── mockData.ts          # Mock data for leads, conversations, deals, revenue
    │   │
    │   └── types/
    │       └── index.ts             # TypeScript interfaces & types (Lead, User, Company, etc.)
    │
    └── 📊 Utilities
        └── utils/
            └── formatINR.ts         # Indian Rupee currency formatter utility
```

---

## 🗄️ Backend Directory Structure

```
leadsync-backend/
├── 📦 Backend Configuration
│   ├── package.json                 # Dependencies (Express, Prisma, bcryptjs, JWT, etc.)
│   ├── tsconfig.json                # Backend TypeScript configuration
│   ├── tsconfig.prisma.json         # Prisma-specific TypeScript configuration
│   └── .env (not in repo)           # Environment variables
│       ├── DATABASE_URL             # PostgreSQL connection string
│       ├── PORT                     # Server port (default: 4000)
│       ├── TELEGRAM_BOT_TOKEN       # Telegram bot authentication token
│       └── NODE_ENV                 # Environment (development/production)
│
├── 📤 Prisma ORM & Database
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema definition
│   │   │   ├── Models: Company, User, Lead, Conversation, Message
│   │   │   └── Enums: ConversationMode, Channel, Role, MessageSender
│   │   ├── seed.ts                  # Database seed script (demo data)
│   │   └── migrations/              # Database migration history
│   │       ├── migration_lock.toml  # Migration lock file
│   │       ├── 20260208094647_init/ # Initial schema creation
│   │       ├── 20260208182720_add_telegram_webhook_secret_and_fix_relations/
│   │       ├── 20260208183718_add_telegram_webhook_secret/
│   │       ├── 20260208202707_add_conversation_mode/
│   │       ├── 20260208211639_fix_company_conversation_relation/
│   │       └── 20260208212439_finalize_conversation_schema/
│   │
│   └── src/lib/
│       └── prisma.ts                # Prisma client singleton instance
│
├── 🚀 Express Application
│   ├── src/
│   │   ├── server.ts                # Server entry point (starts on port 4000)
│   │   │
│   │   ├── app.ts                   # Express application setup
│   │   │   ├── CORS middleware (http://localhost:5173)
│   │   │   ├── JSON body parser
│   │   │   ├── Health check endpoint: GET /health
│   │   │   └── Route mounting
│   │   │
│   │   ├── 🔐 Middleware
│   │   │   └── auth.middleware.ts   # JWT token verification & user extraction
│   │   │
│   │   ├── 🛣️ Routes
│   │   │   ├── auth.routes.ts       # Authentication routes
│   │   │   │   ├── POST /api/auth/signup    # Company & user registration
│   │   │   │   └── POST /api/auth/login     # User login with JWT
│   │   │   │
│   │   │   ├── leads/
│   │   │   │   └── leads.routes.ts  # Lead management routes
│   │   │   │       └── GET /api/leads?companyId=xxx  # Fetch company leads
│   │   │   │
│   │   │   ├── conversations.routes.ts     # Conversation routes
│   │   │   │   ├── GET /api/conversations # Fetch Telegram conversations
│   │   │   │   └── GET /api/conversations/:id # Get conversation with messages
│   │   │   │
│   │   │   ├── telegram/
│   │   │   │   ├── telegram.routes.ts      # Telegram routes
│   │   │   │   │   └── POST /api/telegram/webhook # Webhook receiver
│   │   │   │   └── telegram.controller.ts  # Telegram webhook handler
│   │   │   │
│   │   │   ├── integrations.routes.ts      # Integration routes
│   │   │   │   └── GET /api/integrations/ping  # Connectivity check
│   │   │   │
│   │   │   └── secure.routes.ts            # Protected routes
│   │   │       └── GET /api/secure         # Check auth with middleware
│   │   │
│   │   ├── 🛠️ Utilities
│   │   │   └── jwt.ts               # JWT creation and verification
│   │   │       ├── signToken()      # Create JWT token
│   │   │       └── verifyToken()    # Verify & decode JWT
│   │   │
│   │   ├── 🤖 Telegram Services
│   │   │   ├── services/
│   │   │   │   ├── telegram.service.ts     # Telegram message processing logic
│   │   │   │   └── telegram.webhook.ts     # Webhook handling & verification
│   │   │   │
│   │   │   └── bot/
│   │   │       ├── bot.logic.ts            # Bot conversation logic
│   │   │       └── telegram.sender.ts      # Message sending to Telegram
│   │   │
│   │   └── dist/                    # Compiled JavaScript output (after build)
│
└── 📊 Database Models (Prisma Schema)
    ├── Company
    │   ├── id (UUID, primary key)
    │   ├── name
    │   ├── telegramBotToken
    │   ├── telegramBotUsername
    │   ├── telegramWebhookSecret (unique)
    │   ├── createdAt
    │   └── Relations: users[], leads[], conversations[]
    │
    ├── User
    │   ├── id (UUID, primary key)
    │   ├── email
    │   ├── name
    │   ├── passwordHash (bcrypt)
    │   ├── role (OWNER | AGENT)
    │   ├── companyId (foreign key)
    │   ├── createdAt
    │   └── Unique constraint: [email, companyId]
    │
    ├── Lead
    │   ├── id (UUID, primary key)
    │   ├── name
    │   ├── contact (email/phone)
    │   ├── channel (WEBSITE | TELEGRAM | WHATSAPP)
    │   ├── companyId (foreign key)
    │   ├── createdAt
    │   ├── Relations: conversations[]
    │   └── Unique constraint: [contact, channel, companyId]
    │
    ├── Conversation
    │   ├── id (UUID, primary key)
    │   ├── leadId (foreign key)
    │   ├── companyId (foreign key)
    │   ├── channel (WEBSITE | TELEGRAM | WHATSAPP)
    │   ├── mode (BOT | HUMAN)
    │   ├── createdAt
    │   ├── updatedAt
    │   ├── Relations: lead, company, messages[]
    │   └── Indexes: [companyId], [leadId]
    │
    └── Message
        ├── id (UUID, primary key)
        ├── content
        ├── sender (CLIENT | AGENT | SYSTEM)
        ├── conversationId (foreign key)
        ├── createdAt
        └── Relations: conversation
```

---

## 🔄 API Endpoints Summary

### Authentication
- `POST /api/auth/signup` - Register new company and owner user
- `POST /api/auth/login` - Authenticate user and get JWT token

### Leads
- `GET /api/leads?companyId=xxx` - Fetch all leads for a company

### Conversations
- `GET /api/conversations` - Get all Telegram conversations (protected)
- `GET /api/conversations/:id` - Get conversation with messages (protected)

### Telegram
- `POST /api/telegram/webhook` - Receive Telegram webhook updates

### Integrations
- `GET /api/integrations/ping` - Health check

### Secure
- `GET /api/secure` - Test authenticated access (protected)

---

## 🔄 Application Flow

### Frontend Flow:
1. **App.tsx** → Routes pages with React Router
2. **AuthContext.tsx** → Provides global user/company state
3. **RequireAuth.tsx** → Guards protected routes
4. **DashboardLayout.tsx** → Wraps dashboard pages with sidebar
5. **Sidebar.tsx** → Navigation menu with role-based items
6. **Dashboard Pages** → Use components & mock data

### Backend Flow:
1. **server.ts** → Starts Express on port 4000
2. **app.ts** → Configures middleware, CORS, routes
3. **Routes** → Handle API requests (auth, leads, conversations, telegram)
4. **JWT Middleware** → Protects authenticated endpoints
5. **Prisma** → Queries PostgreSQL database
6. **Services** → Handle business logic (Telegram integration, bot logic)

### Authentication Flow:
1. User registers/logs in via frontend
2. Backend creates user with bcrypt password hash
3. JWT token issued on successful login
4. Frontend stores token in localStorage/context
5. Protected routes check token with AuthContext
6. Backend verifies JWT on protected endpoints

---

## 🎨 Styling & UI System

- **Tailwind CSS 3.4** - Utility-first CSS framework (3.4.15)
- **Color Scheme** - Blue/Cyan theme
  - Primary Blue: `#3b82f6` (500)
  - Accent Cyan: `#0ea5e9` (500)
- **Component Libraries**
  - **Lucide React** - Icon library (454.0)
  - **Recharts** - React charting library (2.6.2)
  - **React Hot Toast** - Toast notifications (2.4.0)
  - **Framer Motion** - Animations (10.12.16)
  - **Headless UI** - Unstyled accessible components (1.7.17)
- **Animations** - Framer Motion for transitions
- **Responsive Design** - Mobile-first (sm, md, lg, xl, 2xl breakpoints)

---

## 📦 Key Dependencies

### Frontend (src/)
- **React** 18.3 - UI library
- **React Router** 6.28 - Client-side routing
- **TypeScript** 5.6 - Type safety
- **Vite** 5.4 - Build tool & dev server
- **Tailwind CSS** 3.4 - Styling
- **Framer Motion** 10.12 - Animations
- **Recharts** 2.6 - Charts & graphs
- **React Hot Toast** 2.4 - Notifications
- **Lucide React** 0.454 - Icons
- **Headless UI** 1.7 - Components

### Backend (leadsync-backend/)
- **Express** 4.22 - Web framework
- **Prisma** 6.6 - ORM & database
- **TypeScript** 5.9 - Type safety
- **JWT** 9.0 - Authentication
- **bcryptjs** 3.0 - Password hashing
- **CORS** 2.8 - Cross-origin handling
- **Axios** 1.13 - HTTP client
- **ts-node-dev** 2.0 - Development runner
- **PostgreSQL** - Database (via Prisma)

---

## 🚀 Development & Build Commands

### Frontend (root directory)
```bash
npm run dev          # Start Vite dev server (http://localhost:5173)
npm run build        # TypeScript check + Vite production build
npm run preview      # Preview production build locally
```

### Backend (leadsync-backend/)
```bash
npm run dev          # Start with ts-node-dev (http://localhost:4000)
npm run ngrok        # Start ngrok tunnel for Telegram webhook
npm run dev:all      # Concurrent: frontend + backend + ngrok
npm run seed         # Populate database with demo data
npm run build        # TypeScript compilation to dist/
npm run start        # Run compiled dist/server.js
```

---

## 🏗️ Environment Setup

### Frontend (.env.local)
- `VITE_API_URL` - Backend API base URL (optional, defaults to localhost:4000)

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/leadsync
PORT=4000
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
NODE_ENV=development
```

---

## 📝 Notes

- **Multi-Tenant Ready** - All data scoped to Company ID
- **Role-Based Access** - OWNER vs AGENT roles
- **Telegram Integration** - Webhook-based message sync
- **Mock Data** - Frontend uses mock data, backend seeds PostgreSQL
- **Development Mode** - CORS allows localhost:5173 ↔ localhost:4000
- **Type Safety** - Both frontend & backend fully typed with TypeScript
