# 🧠 TeamMind — AI-Powered Team Knowledge Hub

**TeamMind** is a collaborative knowledge-sharing platform built with **Next.js 15/16**, **PostgreSQL**, **Prisma**, and **NextAuth**.  
It enables authenticated team members to create, enrich, and explore “knowledge cards” — concise, AI-enhanced content units shared across or within teams.

---

## 🚀 1. Setup and Run Instructions

### 🧩 Prerequisites
- **Node.js ≥ 18**
- **PostgreSQL** running locally (or on cloud)
- **pnpm** or **npm**
- **OpenAI API Key** (for AI enrichment)

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
.env

env
Copy code
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/teammind?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_long_random_string"
OPENAI_API_KEY="sk-..."   # from https://platform.openai.com/api-keys
🗄️ Database setup
bash
Copy code
# Initialize Prisma
npx prisma generate
npx prisma db push
(Optional) Seed sample users and cards:

bash
Copy code
pnpm run seed
▶️ Run the app locally
bash
Copy code
pnpm run dev
Now open http://localhost:3000

🧾 Build for production
bash
Copy code
pnpm run build
pnpm start
🧱 2. Architecture Overview
TeamMind uses the Next.js App Router with modular server actions and Prisma ORM.
Each layer of the app is organized for separation of concerns and clarity.

📂 Directory Structure
sql
Copy code
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
🧠 Server Actions Overview
All main logic is implemented using Next.js Server Actions for direct server-side DB access — no REST or GraphQL needed.

Action	File	Description
upsertCard()	app/actions/card.ts	Create or update cards; includes OpenAI enrichment before saving.
toggleLike()	app/actions/card.ts	Handles optimistic like/unlike using Prisma transactions.
addComment()	app/actions/card.ts	Adds a comment to a card and triggers revalidation.
enrichCardWithAI()	app/actions/ai.ts	Uses OpenAI API to generate summary, tags, and related cards.

✅ Optimistic UI
React’s useOptimistic() and useTransition() are used in components for instant feedback while actions run on the server.

🔐 3. Access Control Logic
Each user belongs to one of three fixed teams:

A-Team

B-Team

C-Team

Access control ensures that private content remains visible only to the correct team members.

View	Logic	Access
Dashboard (/dashboard)	Shows only cards where access = PUBLIC.	Global view
Team (/team)	If viewer’s team = section team → show all cards (PUBLIC + PRIVATE). Otherwise → show only PUBLIC cards.	Team-based view

Implementation (in lib/access.ts):

ts
Copy code
export const dashboardWhere = () => ({ access: "PUBLIC" });

export const teamSectionWhere = (sectionTeamId: string, viewerTeamId: string) =>
  sectionTeamId === viewerTeamId
    ? { teamId: viewerTeamId }
    : { teamId: sectionTeamId, access: "PUBLIC" };
✅ Enforcement

Access checks are applied both in Prisma queries and via session-based validation in Server Actions.

Unauthorized access is prevented at query-time, not just in the UI.

💬 4. Reflection
❓ Most Challenging Feature
AI-based enrichment and access-controlled collaborative features

🧩 Challenges:
Handling OpenAI responses reliably within Server Actions.

Keeping data consistent when AI calls failed or timed out.

Implementing optimistic UI updates while ensuring DB consistency.

Designing team-based filtering and privacy enforcement.

💡 Solution:
Implemented enrichCardWithAI() using the OpenAI API (gpt-4o-mini) to summarize content and suggest tags/relations.

Added error handling and fallback values (“AI enrichment unavailable”).

Unified access control logic in lib/access.ts for clarity.

Used useOptimistic() and useTransition() hooks for seamless, real-time UI feedback.

🌐 5. Deployment
Deployed via Vercel.

Database hosted on Neon / Supabase / Local Postgres.

.env secrets managed via Vercel dashboard.

To deploy manually:

bash
Copy code
pnpm run build
pnpm start
If TypeScript or ESLint warnings block deployment, next.config.mjs safely ignores them to allow successful build.

👨‍💻 Tech Stack Summary
Layer	Tech
Frontend	Next.js 15/16 (App Router), React 18
Styling	Tailwind CSS
Auth	NextAuth.js (Credentials provider)
Database	PostgreSQL + Prisma ORM
AI	OpenAI API (gpt-4o-mini)
Optimistic UI	React 18 hooks (useOptimistic, useTransition)
Deployment	Vercel

🧪 Optional: Project Demo Workflow
Sign Up as a new user (choose your team: A-Team, B-Team, or C-Team).

Sign In to access the dashboard.

Create a Card → enter title, content, and choose access (PUBLIC/PRIVATE).

AI will automatically generate a summary, tags, and related cards.

Like or Comment on any card (optimistic UI updates instantly).

Navigate to Team View to see cards grouped by team visibility.

Sign Out safely using the header button.