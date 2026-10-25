# 🎓 StudyMate — AI-Powered Student Productivity Platform

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-success.svg)](#technology-stack)
[![React](https://img.shields.io/badge/Frontend-React_18_%2B_Vite-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_%2B_Express-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248.svg)](https://www.mongodb.com/atlas)
[![AI Engine](https://img.shields.io/badge/AI-Google_Gemini_API-blue.svg)](https://ai.google.dev/)
[![Authentication](https://img.shields.io/badge/Security-JWT_%2B_Bcrypt-red.svg)](#security--data-privacy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **StudyMate** is an intelligent, full-stack student productivity and academic workflow application. Built on the modern MERN stack with native cloud **MongoDB Atlas** persistence and powered by **Google Gemini AI**, StudyMate helps university and college students master course syllabi, manage deadline-driven assignments, track Pomodoro focus intervals, and receive 24/7 personalized academic tutoring.

---

## 🌟 Core Features

### 1. 📚 Course & Subject Portfolio
- Track enrolled courses, course codes, target letter grades, credit weights, instructors, and lecture schedules.
- Live academic progress metrics per subject, including pending vs. completed task ratios and total accumulated study hours.
- Visual color-coded themes per subject that seamlessly flow across tasks, study timers, notes, and analytics.

### 2. 📋 Smart Task & Assignment Planner
- Organize course deliverables: Assignments, Exam Prep, Projects, Reading, Lab Reports, and Quizzes.
- Multi-dimensional sorting and filtering by priority (`urgent`, `high`, `medium`, `low`), status (`pending`, `in_progress`, `completed`), and course.
- Quick status toggle with automatic completion timestamps and deadline urgency badges.

### 3. ⏱️ Focus Study Timer & Session Logger
- Built-in Pomodoro timer (`25m Focus`, `5m Short Break`, `15m Long Break`, and customizable `Deep Work` intervals).
- Log sessions with subjective 1–5 star productivity ratings and session reflection notes.
- Automatic actual-time synchronization: logging a session against a task automatically increments the task's logged minutes.

### 4. 📝 Course Notes & 1-Click AI Summarization
- Rich markdown lecture notes linked directly to courses, tagged for quick search, and pinnable.
- **AI Summary Button**: Summarizes lecture notes into 2 high-yield, exam-focused review sentences powered by Google Gemini.

### 5. 🤖 Gemini AI 24/7 Academic Tutor
- **Concept Breakdown (Feynman Technique)**: Explains challenging academic concepts using real-world intuitive analogies.
- **Polyglot Code Assistant**: Generates clean, well-commented code in the exact language requested (Java, Python, C++, JavaScript, C) with Big-O time and space complexity analysis.
- **Active Recall Quiz Generator**: Generates 3–5 multi-choice questions with answer keys and rationale explanations for self-testing.
- **Exam Cheat Sheets**: Produces high-yield study tables, formula cheat-sheets, and spaced repetition schedules.
- User-specific private chat history stored in MongoDB Atlas with 1-click chat clear.

### 6. 📊 Real-Time Productivity Analytics & Streaks
- Daily study target goal progress ring with dynamic progress indicators.
- 7-day rolling activity bar chart comparing study time per day.
- Habit streak counter reinforcing consistent daily study habits.
- Course distribution chart breaking down study hours across subjects.
- Dynamic AI coach insights that adapt based on upcoming deadlines and daily goal attainment.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Lucide Icons, Modern Responsive CSS Design System |
| **Backend** | Node.js, Express (RESTful API), ES Modules (`import`/`export`) |
| **Database** | MongoDB Atlas (Cloud Cluster), Mongoose ODM |
| **AI / LLM** | Google Gemini API (`@google/genai`) |
| **Security & Auth** | JSON Web Tokens (JWT), Bcrypt password hashing (10 rounds) |
| **Testing** | Automated Node.js integration test suite |

---

## 🏗️ Architecture & Project Structure

```
StudyMate/
├── client/                     # Frontend React + Vite application
│   ├── src/
│   │   ├── assets/             # Brand logos and static images
│   │   ├── components/         # Navigation, Modals, Navbar, ProtectedRoute
│   │   ├── context/            # AuthContext (JWT state & user persistence)
│   │   ├── pages/              # Dashboard, Subjects, Tasks, Timer, Notes, AI Chat, Profile
│   │   ├── services/           # Axios/Fetch API client wrappers
│   │   ├── App.jsx             # Main router and shell layout
│   │   └── index.css           # Curated CSS custom properties & theme tokens
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend Express REST API
│   ├── config/
│   │   └── db.js               # Centralized MongoDB Atlas connection module
│   ├── controllers/            # Request handlers (Auth, Subjects, Tasks, Sessions, Notes, AI)
│   ├── middleware/             # JWT protection & centralized error handling
│   ├── models/                 # Pure Mongoose Models (User, Subject, Task, StudySession, Note, ChatMessage)
│   ├── routes/                 # Express route definitions
│   ├── scripts/
│   │   ├── migrateToMongo.js   # Idempotent JSON -> MongoDB Atlas migration utility
│   │   └── testSuite.js        # 45-point end-to-end automated API & Atlas test suite
│   ├── seed/                   # Realistic academic fixtures for demo login
│   ├── services/
│   │   └── geminiService.js    # Gemini API client & intelligent tutoring engine
│   ├── index.js                # Server entry point
│   └── package.json
│
├── .env.example                # Safe environment variable template
├── .gitignore                  # Git exclusion rules for secrets and runtime backups
├── package.json                # Root monorepo orchestrator (concurrent dev scripts)
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB Atlas Account**: A free cloud cluster from [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Google Gemini API Key**: From [Google AI Studio](https://aistudio.google.com/)

---

### 2. Installation

Clone the repository and install all dependencies for root, server, and client:

```bash
git clone https://github.com/your-username/StudyMate.git
cd StudyMate
npm run install-all
```

---

### 3. Environment Configuration

Create a `.env` file in the `server/` directory (you can copy `server/.env.example`):

```bash
cp server/.env.example server/.env
```

Fill in your actual environment credentials:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secure_random_jwt_secret_key_here
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/studymate?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Security Note:** Real `.env` files are strictly ignored by `.gitignore`. Never commit credentials to version control.

---

### 4. Database Migration & Initialization (Optional)

If you have existing JSON data from previous versions, run the idempotent migration utility to back up and transfer records to MongoDB Atlas:

```bash
# Run migration from root
npm run db:migrate

# Or directly from the server folder
cd server && npm run migrate
```

- Automatically creates a timestamped local backup directory in `server/data/backup_<timestamp>/`.
- Upserts records by unique ID to avoid duplicates on rerun.
- Strips any secrets before saving.

---

### 5. Running the Application

Start both the backend server (port 5000) and frontend client (port 5173) simultaneously:

```bash
npm run dev
```

- **Frontend Application:** `http://localhost:5173`
- **Backend API Server:** `http://localhost:5000`
- **Backend Health Check:** `http://localhost:5000/api/health`

---

### 6. Running Automated Tests

Run the comprehensive 45-point integration test suite against the live Atlas database:

```bash
npm run test
```

The test suite validates:
- Cloud Atlas connection readiness and health check endpoint.
- User registration and bcrypt password hashing.
- JWT token authentication and invalid login rejection.
- Subject, Task, Study Session, and Note CRUD operations in Atlas.
- Real-time AI chat generation and chat history clearing.
- **Multi-tenant data isolation**: Verifies User B cannot view or modify User A's private records.

---

## 📡 API Reference Overview

| Endpoint | Method | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Health status, database driver, and Gemini readiness | No |
| `/api/auth/register` | `POST` | Register a new student account | No |
| `/api/auth/login` | `POST` | Sign in with email and password | No |
| `/api/auth/demo-login` | `POST` | Instant sign-in as Demo Student (Alex Chen) | No |
| `/api/auth/me` | `GET` | Retrieve authenticated student profile | Yes |
| `/api/auth/profile` | `PUT` | Update profile details and daily study goals | Yes |
| `/api/subjects` | `GET`, `POST` | Fetch or create academic courses | Yes |
| `/api/subjects/:id` | `PUT`, `DELETE` | Update or delete a course | Yes |
| `/api/tasks` | `GET`, `POST` | Fetch or create academic tasks | Yes |
| `/api/tasks/:id` | `PUT`, `DELETE` | Update or delete an academic task | Yes |
| `/api/tasks/:id/toggle` | `PATCH` | Toggle task completion status | Yes |
| `/api/sessions` | `GET`, `POST` | Retrieve study logs or log a new focus session | Yes |
| `/api/notes` | `GET`, `POST` | Fetch or create lecture notes | Yes |
| `/api/notes/:id/summarize` | `POST` | Generate high-yield AI summary for note | Yes |
| `/api/analytics/dashboard` | `GET` | Calculate daily progress, 7-day charts, and streaks | Yes |
| `/api/ai/chat` | `POST` | Query Gemini AI tutor (explain, code, quiz, schedule) | Yes |
| `/api/ai/history` | `GET`, `DELETE` | Retrieve or clear personal AI conversation history | Yes |

---

## 🔒 Security & Data Privacy

1. **Password Encryption**: All student passwords are automatically hashed with `bcryptjs` using a salt work factor of 10 prior to insertion into MongoDB Atlas.
2. **Strict Secret Isolation**: Secrets (`MONGO_URI`, `GEMINI_API_KEY`, `JWT_SECRET`) reside exclusively in environment variables and are excluded from Git via `.gitignore`.
3. **Data Sanitization**: API responses sanitize user documents to guarantee password hashes and sensitive internal keys are never returned.
4. **User-Level Data Isolation**: All database queries enforce `{ userId: req.user.id }` scoping, preventing unauthorized cross-user data access.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
