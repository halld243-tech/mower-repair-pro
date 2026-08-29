# Engine Repair Pro - Website Setup Guide

A full-stack e-commerce website for small engine repair services built with **Next.js**, **PostgreSQL**, and **Prisma**.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (currently using Node 18 - upgrade recommended)
- PostgreSQL 12+ (local or cloud hosted)
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and update with your configuration:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/lawn_mower_business"

# Email service (choose one)
SENDGRID_API_KEY="your_key"
# OR RESEND_API_KEY="your_key"

OWNER_EMAIL="owner@enginerepairpro.com"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run prisma:generate

# Create database and run migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view/edit data
npm run prisma:studio
```

### 4. Seed Database (Optional)

Create sample services by running this SQL in your PostgreSQL client:

```sql
-- Insert service category
INSERT INTO "ServiceCategory" (id, name) VALUES ('cat-1', 'Lawn Mower Repair');

-- Insert services
INSERT INTO "Service" (id, name, description, price, duration, "categoryId")
VALUES 
  ('svc-1', 'Basic Tune-Up', 'Oil change, filter cleaning, spark plug check', 49.99, 30, 'cat-1'),
  ('svc-2', 'Blade Sharpening', 'Professional blade sharpening and balancing', 29.99, 20, 'cat-1'),
  ('svc-3', 'Engine Repair', 'Comprehensive engine diagnostics and repair', 99.99, 60, 'cat-1');
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your website!

---

## 📁 Project Structure

```
.
├── app/
│   ├── api/                    # API routes (Next.js)
│   │   ├── services/          # Service CRUD endpoints
│   │   ├── appointments/      # Appointment booking & availability
│   │   └── contact/           # Contact form submission
│   ├── services/              # Services listing page
│   ├── booking/               # Appointment booking page
│   ├── contact/               # Contact form page
│   ├── blog/                  # Blog listing page
│   └── layout.tsx             # Root layout with Header/Footer
├── components/
│   ├── Header.tsx             # Navigation header
│   ├── Footer.tsx             # Footer with business info
│   └── ServiceCard.tsx        # Reusable service card component
├── lib/
│   ├── db.ts                  # Prisma client setup
│   ├── email.ts               # Email service wrapper
│   └── utils.ts               # Utility functions (availability, date formatting)
├── prisma/
│   └── schema.prisma          # Database schema
├── content/
│   └── blog/                  # Blog markdown files (future)
├── .env.local                 # Environment variables (git-ignored)
├── .env.example               # Example environment file
└── package.json               # Dependencies
```

---

## 🔧 Features Implemented

### ✅ Service Management
- List all services with pricing and duration
- API endpoint: `GET /api/services`
- Detailed service view with booking button

### ✅ Appointment Booking
- Date picker with business hours (9 AM - 5 PM, closed weekends)
- Available time slots (30-min intervals)
- Automatic slot calculation excluding existing appointments
- Customer confirmation email
- API endpoints:
  - `POST /api/appointments` - Create booking
  - `GET /api/appointments/availability` - Get available slots

### ✅ Contact Form
- Email validation
- Automatic confirmation email to customer
- Owner notification email
- API endpoint: `POST /api/contact`

### ✅ Blog System
- Blog listing page with sample posts
- Ready for markdown-based content
- Future: Add blog admin panel

### ✅ UI Components
- Responsive header with navigation
- Footer with business hours and contact info
- Service cards with pricing
- Form components with validation

---

## 🗄️ Database Schema

### Services
- `id`: Unique identifier
- `name`: Service name
- `description`: Service details
- `price`: Cost in dollars
- `duration`: Time in minutes
- `categoryId`: Link to service category
- `image`: Optional service image URL

### Appointments
- `id`: Unique identifier
- `serviceId`: Booked service
- `customerId`: Customer information
- `dateTime`: Appointment date/time
- `status`: confirmed, completed, cancelled, rescheduled
- `notes`: Optional notes

### Customers
- `id`: Unique identifier
- `name`: Customer name
- `email`: Customer email (unique)
- `phone`: Contact number

### Inquiries
- `id`: Unique identifier
- `customerId`: Customer who submitted
- `message`: Inquiry message
- `status`: new, in-progress, resolved

### Blog Posts
- `id`: Unique identifier
- `title`: Post title
- `slug`: URL-friendly slug
- `content`: Post content
- `author`: Author name
- `published`: Publication status
- `publishedAt`: Publication date

---

## 🔌 API Endpoints

### Services
- `GET /api/services` - List all services
- `GET /api/services/[id]` - Get specific service

### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - List all appointments (admin)
- `GET /api/appointments/availability` - Get available slots

### Contact
- `POST /api/contact` - Submit contact form

---

## 📧 Email Configuration

### SendGrid Setup
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create an API key
3. Add to `.env.local`: `SENDGRID_API_KEY=your_key`

### Resend Setup
1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Add to `.env.local`: `RESEND_API_KEY=your_key`

---

## 🚀 Deployment to Azure

### Option 1: Azure App Service

```bash
# Install Azure CLI
# Visit: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli

# Login
az login

# Create resource group
az group create --name lawn-mower-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name lawn-mower-plan \
  --resource-group lawn-mower-rg \
  --sku B1 \
  --is-linux

# Create App Service
az webapp create \
  --resource-group lawn-mower-rg \
  --plan lawn-mower-plan \
  --name engine-repair-pro \
  --runtime "NODE|18"

# Configure environment variables in Azure Portal
# Set DATABASE_URL, SENDGRID_API_KEY, etc.

# Deploy
git push azure main
```

### Option 2: Azure Container Instances

1. Create `Dockerfile` in project root
2. Build and push to Azure Container Registry
3. Deploy container

---

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

---

## 📝 Next Steps (Phase 2)

- [ ] Add NextAuth.js for business owner login
- [ ] Build admin dashboard for managing appointments
- [ ] Integrate payment processing (Stripe)
- [ ] Add blog post admin UI
- [ ] Set up automated email reminders
- [ ] Implement service availability calendar view
- [ ] Add customer review system
- [ ] Set up analytics and monitoring

---

## 🤝 Support

For questions or issues, check the following:
1. Ensure PostgreSQL is running locally
2. Verify `.env.local` has correct DATABASE_URL
3. Run `npm run prisma:generate` if encountering Prisma errors
4. Check logs: `npm run dev` shows console output

---

## 📄 License

This project is built for Engine Repair Pro. All rights reserved.
