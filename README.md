# CodeVault — The Intelligent Engineering Lab & Code Revision Platform

[![Live App on Vercel](https://img.shields.io/badge/Production-Live%20on%20Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://codevault-app-azure.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-sahil--exe--17%2FCodeVault-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sahil-exe-17/CodeVault.git)
[![Built with React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Backend FastAPI](https://img.shields.io/badge/Backend-FastAPI%20%2B%20Python%203.11-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![AI Gemini Vision](https://img.shields.io/badge/AI%20Engine-Google%20Gemini%20Flash%20Vision-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)

---

> **Engineered for Computer Science & Engineering Students and Developers.**  
> CodeVault is a brutalist, distraction-free laboratory notebook and code mastery platform. It turns physical university lab manuals into searchable digital repositories, extracts code from handwritten notebook photos via AI Vision, generates deep line-by-line algorithmic explanations, and simulates university viva exams with real-time feedback.

**Live Production URL:** [https://codevault-app-azure.vercel.app](https://codevault-app-azure.vercel.app)  
**Official Repository:** [https://github.com/sahil-exe-17/CodeVault.git](https://github.com/sahil-exe-17/CodeVault.git)

---

## Table of Contents
- [1. Why CodeVault?](#1-why-codevault)
- [2. Design & Visual Identity](#2-design--visual-identity)
- [3. Core Features & Capabilities](#3-core-features--capabilities)
- [4. System Architecture](#4-system-architecture)
- [5. Technology Stack](#5-technology-stack)
- [6. Getting Started (Local Development)](#6-getting-started-local-development)
- [7. Environment Configuration](#7-environment-configuration)
- [8. API Endpoints Overview](#8-api-endpoints-overview)
- [9. Production Deployment](#9-production-deployment)
- [10. Project Structure](#10-project-structure)
- [11. License](#11-license)

---

## 1. Why CodeVault?

During university laboratory coursework, engineering students face several recurring hurdles:
1. **Scattered Coursework**: Practical codes, output screenshots, algorithms, and manual scans get lost across folders, thumb drives, and chat groups.
2. **Physical Lab Notebook Risk**: University practical books are frequently lost, damaged, or permanently retained by external examiners before finals.
3. **Viva Voce Anxiety**: Oral viva examinations require instant recall of time complexities, pointer logic, edge cases, and memory models.
4. **Painful Handwritten Code Digitization**: Manually re-typing handwritten notebook codes or textbook assignments into IDEs is tedious and error-prone.

**CodeVault solves all four in a single unified workspace.**

---

## 2. Design & Visual Identity

CodeVault follows an uncompromising **dark brutalist aesthetic** inspired by Linear, Raycast, and Apple macOS:
- **Palette**: Deep pitch black (`#050507`), secondary obsidian (`#0e0e12`), subtle hairline borders (`rgba(255, 255, 255, 0.08)`), and high-contrast stark white typography (`#FFFFFF`).
- **Kinetic Intro**: A procedural kinetic typography splash sequence featuring the geometric CodeVault monogram logo.
- **Pure Focus**: Zero neon gradients or distracting gamification badges. Everything is optimized for readability, keyboard ergonomics, and focus.
- **Mobile Responsive**: Native touch-friendly interactions, bottom sheets, drawer navigation, and safe-area scaling for handheld devices.

---

## 3. Core Features & Capabilities

### 🗂️ Clean Subject & Experiment Hierarchy
- Create custom academic subjects (e.g., *Data Structures & Algorithms*, *Operating Systems*, *Design and Analysis of Algorithms*, *Computer Networks*).
- Zero mock/demo clutter: Every workspace is clean and user-scoped.
- Filter experiments by subject, programming language (C, C++, Python, Java, JS, TS, Rust, Go), and revision status.

### 📷 AI Vision Photo-to-Code Scanner
- Snap or upload a photo of a handwritten lab notebook, whiteboard diagram, textbook page, or monitor screen.
- **Google Gemini Multimodal Vision** automatically extracts the code, recognizes the programming language, infers Title, Aim, and Algorithm steps, and populates the editor with zero retyping needed.

### 📓 Physical Notebook PDF Archive
- Upload and archive full PDF scans or high-res photos of your verified university lab manual.
- Built-in in-browser document reader allows you to review your handwritten work anywhere—even when your physical book is submitted to examiners.

### 💻 Split-View Monaco Code Workspace
- **Desktop & Tablet Optimized**: Left panel hosts Microsoft Monaco Editor (the core editor powering VS Code) with syntax highlighting, font scaling, auto-formatting, line numbering, and one-click code copy or download.
- Full experiment documentation tabs:
  - **Aim & Objectives**
  - **Theoretical Background**
  - **Step-by-Step Algorithm**
  - **Sample Inputs & Outputs**
  - **Observations & Results**
  - **Time & Space Complexity** ($O(n \log n)$, $O(1)$)
  - **Lab Notebook PDF Viewer**

### 🎙️ AI Viva Voce Examination Simulator
- Simulates an oral university viva with an AI professor.
- Dynamic difficulty scaling (Easy, Medium, Hard).
- Evaluates student responses out of 10, pinpoints conceptual mistakes, and provides an authoritative model answer.

### 🔍 12-Section AI Algorithmic Explainer
- One-click deep algorithmic breakdown powered by Gemini:
  1. High-Level Program Overview
  2. Plain English Explanation (ELI5)
  3. Line-by-Line Code Breakdown
  4. Core Logic & Control Flow
  5. ASCII Execution Flow Diagram
  6. Variables, Data Types & Function Signatures Table
  7. Step-by-Step Algorithm
  8. Sample Input & Output Traces
  9. Mathematical Time Complexity Proof
  10. Space Complexity Proof & Memory Profile
  11. Common Pitfalls & Edge Cases
  12. Frequently Asked Exam Questions

### 🧠 Revision Studio & Spaced Repetition
- **Flashcards**: Interactive 3D flip cards with active recall tracking ("Got It" vs "Still Learning").
- **MCQ Quizzes**: 4-option code comprehension tests with immediate feedback and scoring.
- **Output Prediction Quiz**: Guess terminal output for tricky pointer arithmetic, scoping, and recursion snippets.
- **Bug Hunt Challenge**: Identify off-by-one errors, memory leaks, and logic flaws.
- **Spaced Repetition Scheduler**: Automated 1-day, 3-day, 7-day, and 14-day review prompts.

### 🤖 Ask CodeVault Contextual Assistant
- Full conversational AI terminal embedded directly in the workspace.
- Retains context of your active experiment code and subject syllabus to answer questions, suggest optimizations, or write test cases.

### 🔐 True Account Persistence
- Google OAuth 2.0 and direct browser profile authentication.
- Deterministic cryptographic user hashing with offline-first local storage caching and SQLite server backup.
- Never loses user subjects or loads into someone else's account.

---

## 4. System Architecture

```
                                  ┌─────────────────────────────┐
                                  │      Client Browser         │
                                  │   (Desktop & Mobile Web)    │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │     Vercel Edge Network     │
                                  │   (Static Assets & SPA)     │
                                  └──────────────┬──────────────┘
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │    React 19 + TypeScript    │
                                  │   - Monaco Code Editor      │
                                  │   - Zustand State Store     │
                                  │   - Tailwind CSS & Motion   │
                                  └──────────────┬──────────────┘
                                                 │
                                     REST APIs / JSON / Multipart
                                                 │
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │     FastAPI Backend         │
                                  │  - Auth & Profile Manager   │
                                  │  - Subjects & Experiments   │
                                  │  - Revision & Quiz Engine   │
                                  └──────┬───────────────┬──────┘
                                         │               │
                     Local SQL / Foreign Keys            │ Async Multimodal Prompt
                                         │               │
                                         ▼               ▼
                        ┌───────────────────┐  ┌───────────────────┐
                        │ SQLite 3 Database │  │ Google Gemini API │
                        │  (13 Tables, RLS) │  │  (Vision & LLM)   │
                        └───────────────────┘  └───────────────────┘
```

---

## 5. Technology Stack

### Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Code Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Charts**: [Recharts](https://recharts.org/)
- **Notifications**: [react-hot-toast](https://react-hot-toast.com/)

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Asynchronous ASGI)
- **Runtime**: Python 3.10+ / 3.11
- **Database**: SQLite3 with thread-safe connection pooling
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/)
- **Server**: [Uvicorn](https://www.uvicorn.org/)

### Artificial Intelligence
- **Provider**: Google AI Studio / Gemini API
- **Models**: `gemini-2.5-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`
- **Capabilities**: Multimodal Document Vision, Code OCR, Algorithmic Analysis, Viva Generation.

---

## 6. Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (v20+ recommended)
- [Python](https://www.python.org/) 3.10 or higher
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/sahil-exe-17/CodeVault.git
cd CodeVault
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
# On Windows:
python -m venv .venv
.\.venv\Scripts\activate

# On macOS/Linux:
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your environment file
cp .env.example .env
# Open .env and add your GEMINI_API_KEY from https://aistudio.google.com/

# Start the FastAPI server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
The backend will run on `http://127.0.0.1:8000`.
- API Health Check: `http://127.0.0.1:8000/api/health`
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
Open a second terminal window:
```bash
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```
The application will launch at `http://localhost:5173`.

---

## 7. Environment Configuration

### Backend (`backend/.env`)
```env
# Google Gemini API Key (Get free key from https://aistudio.google.com)
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend CORS URL
FRONTEND_URL=http://localhost:5173

# Optional Google OAuth Client ID
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

### Frontend (`frontend/.env` or Vercel Environment Variables)
```env
# Backend API Base URL
VITE_API_URL=http://localhost:8000

# Optional Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

---

## 8. API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Create student profile with password hash |
| `POST` | `/api/auth/login` | Authenticate and obtain session token |
| `GET` | `/api/auth/me` | Fetch active user credentials and preferences |
| `GET` | `/api/subjects` | List all academic subjects belonging to user |
| `POST` | `/api/subjects` | Create a new subject module |
| `DELETE`| `/api/subjects/{id}` | Delete subject and cascade delete experiments |
| `GET` | `/api/experiments` | List experiments (supports `subject_id`, `search`, `language`) |
| `POST` | `/api/experiments` | Create experiment with code, aim, and complexity |
| `POST` | `/api/ai/scan-notebook` | Multimodal Vision OCR extraction from photo upload |
| `POST` | `/api/ai/explain` | Generate 12-section algorithmic breakdown |
| `POST` | `/api/ai/viva` | Interactive Viva simulator with scoring & feedback |
| `POST` | `/api/ai/chat` | Context-aware Ask CodeVault conversational assistant |
| `GET` | `/api/analytics/overview`| Real-time study statistics and completion rate |

---

## 9. Production Deployment

### Frontend (Vercel)
The frontend is configured with `vercel.json` for seamless Single Page Application (SPA) routing:
```bash
cd frontend
npx vercel --prod
```
Current Live URL: **[https://codevault-app-azure.vercel.app](https://codevault-app-azure.vercel.app)**

### Backend
The backend can be deployed to any container or cloud provider supporting Python ASGI (e.g., Render, Railway, Google Cloud Run, AWS EC2):
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## 10. Project Structure

```
CodeVault/
├── backend/
│   ├── main.py                  # FastAPI initialization & CORS
│   ├── codevault.db             # SQLite database engine
│   ├── middleware/              # Authentication & JWT security
│   ├── models/                  # Pydantic v2 schemas
│   ├── routers/                 # Modular API endpoints
│   │   ├── ai.py                # Gemini Vision OCR & Viva simulation
│   │   ├── analytics.py         # Revision statistics & progress charts
│   │   ├── auth.py              # User authentication & registration
│   │   ├── experiments.py       # Experiment CRUD & file uploads
│   │   ├── quizzes.py           # MCQ & debug challenges
│   │   └── subjects.py          # Academic course management
│   ├── services/
│   │   ├── db.py                # Database schema, connection pool & migrations
│   │   └── gemini_service.py    # Google Gemini API connector
│   └── uploads/                 # Storage for notebook scans & PDFs
├── frontend/
│   ├── index.html               # App entrypoint & high-res branding
│   ├── package.json
│   ├── tailwind.config.js       # Brutalist design tokens & font definitions
│   ├── vercel.json              # Vercel deployment & rewrite configuration
│   └── src/
│       ├── components/
│       │   ├── auth/            # Google OAuth modal & glass inputs
│       │   ├── common/          # Kinetic typography intro splash & logo
│       │   ├── experiments/     # Photo scanner modal & notebook reader
│       │   ├── layout/          # Desktop sidebar, mobile navbar & topnav
│       │   └── ui/              # Buttons, inputs, modals, empty states
│       ├── pages/
│       │   ├── auth/            # Sign In & Sign Up pages
│       │   ├── experiments/     # Experiment list & Monaco workspace
│       │   ├── subjects/        # Subject catalog & subject detail
│       │   ├── ai/              # AI Explainer, Viva, & Revision Studio
│       │   ├── Dashboard.tsx    # Command center & recent practicals
│       │   └── Settings.tsx     # Profile preferences & API keys
│       └── store/
│           └── authStore.ts     # Persistent user state & auth cache
└── README.md
```

---

## 11. License

Distributed under the **MIT License**. Free for academic, personal, and commercial usage.

Developed with precision for engineering excellence.
