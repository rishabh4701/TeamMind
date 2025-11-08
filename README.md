# 🧠 TeamMind — AI-Powered Team Knowledge Hub

**TeamMind** is a collaborative knowledge-sharing platform built with **Next.js 15/16**, **PostgreSQL**, **Prisma**, and **NextAuth**.
It enables authenticated team members to create, enrich, and explore “knowledge cards” — concise, AI-enhanced content units shared across or within teams.

---

## 🚀 1. Setup and Run Instructions

### 🧩 Prerequisites

* **Node.js ≥ 18**
* **PostgreSQL** running locally (or on cloud)
* **pnpm** or **npm**
* **Google Gemini API Key** (for AI enrichment)

---

### ⚙️ Installation

```bash
# 1️⃣ Clone the repository
git clone https://github.com/<your-username>/teammind.git
cd teammind

# 2️⃣ Install dependencies
pnpm install

# 3️⃣ Create environment variables
touch .env
```

Add the following to your `.env` file:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/teammind?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_long_random_string"
GEMINI_API_KEY="your_gemini_api_key"   # from https://aistudio.google.com/app/apikey
```

---

### 🗄️ Database Setup

```bash
# Initialize Prisma
npx prisma generate
npx prisma db push

# (Optional) Seed sample users and cards
pnpm run seed
```

### ▶️ Run the App Locally

```bash
pnpm run dev
```

Now open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### 🧾 Build for Production

```bash
pnpm run build
pnpm start
```

---

## 🧱 2. Architecture Overview

TeamMind uses the **Next.js App Router** with modular **Server Actions** and **Prisma ORM**. Each layer of the app is designed for separation of concerns and clarity.

### 📂 Directory Structure

```
app/
 ├─ (auth)/sign-in, sign-up → Authentication pages
 ├─ dashboard/              → Global view of all public cards
 ├─ team/                   → Team-based view with access control
 ├─ actions/                → Server Actions (AI, CRUD, Likes, Comments)
 ├─ api/auth/[...nextauth]  → NextAuth route handler
 ├─ layout.tsx, page.tsx    → Global layout and redirects
components/
 ├─ CardItem, CardForm, LikeButton, CommentList, CommentForm
lib/
 ├─ prisma.ts   → Prisma client
 ├─ auth.ts     → NextAuth configuration
 ├─ access.ts   → Access control logic
prisma/
 ├─ schema.prisma → Database schema
```

---

## 🧠 3. Server Actions Overview

All main logic is implemented using **Next.js Server Actions** for direct server-side DB access — no REST or GraphQL required.

| Action               | File                  | Description                                                       |
| -------------------- | --------------------- | ----------------------------------------------------------------- |
| `upsertCard()`       | `app/actions/card.ts` | Create or update cards; includes AI enrichment before saving. |
| `toggleLike()`       | `app/actions/card.ts` | Handles optimistic like/unlike using Prisma transactions.         |
| `addComment()`       | `app/actions/card.ts` | Adds a comment to a card and triggers revalidation.               |
| `enrichCardWithAI()` | `app/actions/ai.ts`   | Uses Google Gemini API to generate summary, tags, and related cards.     |

### ✅ Optimistic UI

React’s `useOptimistic()` and `useTransition()` hooks provide instant feedback while actions run on the server.

---

## 🔐 4. Access Control Logic

Each user belongs to one of three fixed teams:

* A-Team
* B-Team
* C-Team

Access control ensures that private content remains visible only to the correct team members.

| View                       | Logic                                                                                                    | Access          |
| -------------------------- | -------------------------------------------------------------------------------------------------------- | --------------- |
| **Dashboard (/dashboard)** | Shows only cards where `access = PUBLIC`.                                                                | Global view     |
| **Team (/team)**           | If viewer’s team = section team → show all cards (PUBLIC + PRIVATE). Otherwise → show only PUBLIC cards. | Team-based view |

### Implementation (`lib/access.ts`)

```ts
export const dashboardWhere = () => ({ access: "PUBLIC" });

export const teamSectionWhere = (sectionTeamId: string, viewerTeamId: string) =>
  sectionTeamId === viewerTeamId
    ? { teamId: viewerTeamId }
    : { teamId: sectionTeamId, access: "PUBLIC" };
```

✅ **Enforcement**

* Access checks applied both in **Prisma queries** and **session-based validation**.
* Unauthorized access is blocked at query-time, not just in the UI.

---

## 💬 5. Reflection

### ❓ Most Challenging Feature

AI-based enrichment and access-controlled collaboration.

### 🧩 Challenges

* Handling Google Gemini API responses reliably within Server Actions.
* Keeping data consistent when AI calls fail or time out.
* Implementing optimistic UI updates while ensuring DB consistency.
* Designing team-based filtering and privacy enforcement.

### 💡 Solutions

* Implemented `enrichCardWithAI()` using **Google Gemini (gemini-pro)** for summarization and tag generation.
* Added error handling and fallback values (e.g., *"AI enrichment unavailable"").
* Unified access control logic in `lib/access.ts`.
* Used React hooks `useOptimistic()` and `useTransition()` for seamless, real-time feedback.

---

## 🌐 6. Deployment

* **Platform:** Vercel
* **Database:** Neon / Supabase / Local PostgreSQL
* **Environment:** Managed via Vercel Dashboard

### Manual Deployment

```bash
pnpm run build
pnpm start
```

> If TypeScript or ESLint warnings block deployment, `next.config.mjs` is configured to ignore them safely.

---

## 👨‍💻 Tech Stack Summary

| Layer              | Technology                                        |
| ------------------ | ------------------------------------------------- |
| **Frontend**       | Next.js 15/16 (App Router), React 18              |
| **Styling**        | Tailwind CSS                                      |
| **Authentication** | NextAuth.js (Credentials Provider)                |
| **Database**       | PostgreSQL + Prisma ORM                           |
| **AI Integration** | Google Gemini API (gemini-pro)                          |
| **Optimistic UI**  | React 18 hooks (`useOptimistic`, `useTransition`) |
| **Deployment**     | Vercel                                            |

---

## 🧪 7. Demo Workflow

1. **Sign Up** as a new user and choose your team (A-Team / B-Team / C-Team).
2. **Sign In** to access the dashboard.
3. **Create a Card** — enter title, content, and choose access (PUBLIC/PRIVATE).
4. **AI** automatically generates a summary, tags, and related cards.
5. **Like or Comment** on any card (optimistic UI updates instantly).
6. **Team View** displays cards grouped by team visibility.
7. **Sign Out** securely via the header button.

---


