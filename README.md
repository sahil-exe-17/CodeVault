# CodeVault — AI-Powered Coding Experiment & Revision Platform

> **Engineered for Computer Science & Engineering Students**  
> A desktop-first, monochromatic developer workspace for organizing laboratory practicals, generating line-by-line AI code breakdowns, simulating oral viva exams, and mastering algorithms via spaced repetition.

---

## 1. Design Philosophy

CodeVault is built with an **uncompromising pure monochrome aesthetic** inspired by Linear, Raycast, Arc Browser, and Apple macOS:

- **Strict Monochrome Palette**:
  - Main Background: `#090909`
  - Secondary Background: `#111111`
  - Elevated Surfaces: `#171717`
  - Glass Surfaces: `rgba(255, 255, 255, 0.035)` with `backdrop-filter: blur(12px)`
  - Primary Text: `#F5F5F5`
  - Secondary Text: `#A1A1A1`
  - Muted Text: `#666666`
  - Subtle Borders: `rgba(255, 255, 255, 0.09)`
  - Accent: `#FFFFFF`
- **Typography**:
  - Headings: `Manrope`
  - Body & Controls: `Inter`
  - Code & Metadata: `JetBrains Mono`
- **Zero Distractions**: Strictly no neon gradients, glowing blue/purple borders, or generic SaaS templates.

---

## 2. Key Modules & Capabilities

### 🧪 Experiment Management
- Full CRUD for university lab assignments and coding experiments.
- Real-time search, filters by Subject, Programming Language (Python, C, C++, Java, JS, TS), and Revision Status.
- Grid & compact table views, bookmarking, and duplication.
- File upload support (`.c`, `.cpp`, `.py`, `.java`, `.js`, `.ts`, `.txt`).

### 💻 Experiment Workspace (Monaco Editor Split-View)
- **Left Panel**:
  - Full Monaco Editor with syntax highlighting, font scaling, line numbering, code copying, and downloading.
  - Form tabs for Aim, Theory, Step-by-Step Algorithm, Sample I/O, Observations, and Complexity ($O(n)$, $O(1)$).
- **Right Panel**:
  - AI Code Explainer with 12 collapsible sections:
    1. Program Overview
    2. Simple Explanation
    3. Line-by-Line Breakdown
    4. Logic Breakdown
    5. Execution Flow Diagram
    6. Variables & Functions Table
    7. Algorithm Explanation
    8. Sample Input & Output
    9. Time Complexity Proof
    10. Space Complexity Proof
    11. Common Mistakes
    12. Practical Exam Points
  - Dynamic Viva Q&A generation with clickable answer reveals.
  - Related practicals within the same academic subject.

### 🤖 Ask CodeVault (Contextual Assistant)
- Linear/Raycast-styled developer chat workspace.
- Conversation history persistence and one-click prompt templates.
- Context-aware querying attached to any active experiment.
- Instantaneous answer copy and code fence rendering.

### 🧠 Revision Studio
- **Flashcards**: Interactive 3D flip cards with active recall tracking ("Got It" vs "Still Learning").
- **MCQ Practice**: 4-option quizzes with instantaneous monochrome feedback, scoring, and explanations.
- **Quick Notes**: High-yield bullet points formatted for whiteboards and printouts.
- **Output Quiz**: Terminal output prediction on tricky pointer/loop code snippets.
- **Debug Challenge**: Spot off-by-one errors and memory leaks.
- **Mock Practical Exam**: Timed 30-minute exam simulation with comprehensive theoretical evaluation.

### 🎙️ Viva Simulator
- Simulates an oral university viva with an AI examiner.
- Easy, Medium, and Hard difficulty escalation.
- Grades student responses out of 10, pinpoints missing concepts, and provides a verified model answer.

### 📅 Revision Planner & Progress Analytics
- Spaced repetition algorithm (1 day, 3 days, 7 days, 14 days).
- Upcoming university exam countdown indicators.
- Monochrome Recharts visualizations (weekly activity area charts, language donut charts, quiz scoring progression lines).

### 🐙 GitHub Repository Import
- Enter any GitHub repo URL to inspect and import source files directly into your workspace.

---

## 3. Architecture & Tech Stack

```
CodeVault/
├── frontend/             # React 19 + Vite + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/   # Layout (Sidebar, TopNav), UI primitives, Monaco & Recharts
│   │   ├── pages/        # Dashboard, Experiments, AI Studio, Planner, Analytics, Settings
│   │   ├── lib/          # Typed API services & Supabase client
│   │   └── store/        # Zustand state store
├── backend/              # Python FastAPI REST API
│   ├── routers/          # auth, subjects, experiments, ai, conversations, quizzes, revision, analytics
│   ├── services/         # gemini_service (Gemini 1.5 Flash), supabase_client, github_service
│   └── middleware/       # JWT extraction & authentication
└── supabase/             # PostgreSQL migrations & seed data
    ├── migrations/       # 001_initial_schema.sql (15 tables, RLS, triggers)
    └── seed.sql          # Realistic practical assignments in C, C++, and Python
```

---

## 4. Setup & Installation

### Prerequisites
- Node.js 18+ (tested on Node v24)
- Python 3.10+
- (Optional) Free Supabase project for persistent cloud database
- (Optional) Gemini API Key from [Google AI Studio](https://aistudio.google.com)

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run build
npm run dev
```
The frontend starts at `http://localhost:5173`. You can immediately use the **⚡ Instant Developer Demo Login** to explore all features with rich pre-seeded data.

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:5173
```

Run the backend server:
```bash
python main.py
```
FastAPI runs at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.

### 3. Database Schema Setup
1. In your Supabase Dashboard, go to the **SQL Editor**.
2. Run `supabase/migrations/001_initial_schema.sql` to create all tables, indexes, and Row Level Security policies.
3. Run `supabase/seed.sql` to insert sample course experiments, flashcards, and quizzes.

---

## 5. License
MIT License. Built for developers and students worldwide.
