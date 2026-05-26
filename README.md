# AI Powered ORM Dashboard

An AI-powered hotel review management dashboard built with Next.js, Supabase, and OpenAI.

This project allows hotel staff to:
- manage customer reviews
- generate AI-powered responses
- approve official responses
- simulate importing Google reviews
- store approved replies in a database

---

# Features

## AI Response Generation
Generate 3 response styles:
- Professional
- Friendly
- Apology-focused

using OpenAI API.

---

## Review Approval Workflow
Staff can:
- approve AI-generated responses
- save approved replies to database
- manage review status

---

## Import Reviews
Simulate importing Google reviews using a mock API route.

Imported reviews are automatically stored in Supabase.

---

## Modern Dashboard UI
- dark mode UI
- loading states
- responsive layout
- SaaS-inspired dashboard design

---

# Tech Stack

- Next.js 16
- TypeScript
- Supabase
- OpenAI API
- Vercel
- CSS Modules

---

# Project Architecture

Frontend (Next.js)
↓
API Routes
↓
OpenAI / Mock Reviews API
↓
Supabase Database

---

# Environment Variables

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url

NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

# Installation

```bash
npm install
```

---

# Run Development Server

```bash
npm run dev
```

---

# Build Production

```bash
npm run build
```

---

# Deployment

This project is deployed on Vercel.

---

# Future Improvements

- Real Google Places API integration
- Authentication system
- Analytics dashboard

---

# Author

Duong Tuan Kiet