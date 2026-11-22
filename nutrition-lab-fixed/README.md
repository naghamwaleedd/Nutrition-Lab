# 🔬 Nutrition Lab — Full-Stack Web Application

A science-driven nutrition and fitness tracking application built with a pure Node.js backend (no external dependencies) and a multi-page vanilla JS frontend.

---

## 🚀 Quick Start

```bash
# 1. Run the server (no npm install needed!)
node backend/server.js

# 2. Open in browser
http://localhost:3000

# 3. Demo login
Email:    alex@nutritionlab.com
Password: demo123
```

---

## 📁 Project Structure

```
nutrition-lab/
├── backend/
│   ├── server.js                  # Main HTTP server (Node.js built-in)
│   ├── routes/
│   │   └── router.js              # Custom router — IoC pattern
│   ├── middleware/
│   │   └── auth.js                # Auth middleware — DI pattern
│   ├── controllers/
│   │   ├── authController.js      # Register / Login / Logout
│   │   ├── userController.js      # Profile + Dashboard
│   │   ├── mealController.js      # CRUD for meals
│   │   ├── workoutController.js   # CRUD for workouts
│   │   ├── progressController.js  # Weight + Water + Stats
│   │   └── coachController.js     # AI insights + Chat
│   └── data/
│       └── database.js            # In-memory DB + AI Coach engine
│
└── frontend/
    ├── index.html                 # Landing page
    ├── css/style.css              # Design system
    ├── js/api.js                  # API client + chart utilities
    └── pages/
        ├── login.html             # Login + Register
        ├── dashboard.html         # Main dashboard
        ├── tracker.html           # Food tracker
        ├── workout.html           # Workout lab
        ├── coach.html             # AI Coach chat
        └── progress.html          # Analytics + progress
```

---

## 🏗️ Architecture & Design Patterns

### Inversion of Control (IoC)
- The **Router** controls which handler runs — routes register declaratively, dispatch is handled internally
- **Middleware pipeline**: each function receives `(req, res, next)` and calls `next()` to pass control
- The framework calls your code — you don't call the framework

### Dependency Injection (DI)
- **Auth middleware** receives `SessionStore` and `UserStore` as injected dependencies (not hardcoded)
- **Controllers** receive data stores via `require()` — easily swappable with real DB adapters
- **Router** injects controllers: `AuthController`, `MealController`, etc. are passed in, not coupled

### Layered Architecture
```
HTTP Request
    ↓
Server (server.js)        — transport layer
    ↓
Router (router.js)        — routing layer
    ↓
Middleware (auth.js)      — cross-cutting concerns
    ↓
Controller (*Controller)  — business logic
    ↓
Data Store (database.js)  — data access layer
```

### Single Responsibility Principle
- Each controller handles exactly one resource (meals, workouts, auth, etc.)
- The database module only manages data — no HTTP logic
- The router only maps routes — no business logic

---

## 🔌 REST API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account | No |
| POST | `/api/auth/login` | Log in | No |
| POST | `/api/auth/logout` | Log out | Yes |
| GET | `/api/user/profile` | Get profile | Yes |
| PUT | `/api/user/profile` | Update profile | Yes |
| GET | `/api/user/dashboard` | Full dashboard data | Yes |
| GET | `/api/meals?date=` | Get meals | Yes |
| POST | `/api/meals` | Log a meal | Yes |
| DELETE | `/api/meals/:id` | Delete a meal | Yes |
| GET | `/api/meals/summary` | Daily totals | Yes |
| GET | `/api/workouts` | Get workouts | Yes |
| POST | `/api/workouts` | Log a workout | Yes |
| DELETE | `/api/workouts/:id` | Delete a workout | Yes |
| GET | `/api/progress/weight` | Weight history | Yes |
| POST | `/api/progress/weight` | Log weight | Yes |
| GET | `/api/progress/water` | Water today + history | Yes |
| POST | `/api/progress/water` | Update water | Yes |
| GET | `/api/progress/stats` | Full stats | Yes |
| GET | `/api/coach/insights` | AI insights | Yes |
| POST | `/api/coach/chat` | Chat with AI | Yes |

---

## 🎯 Key Features

- ✅ User registration + login with session tokens
- ✅ Daily Nutrition Score (0–100) weighted algorithm
- ✅ Food tracker with meal types (breakfast/lunch/dinner/snack)
- ✅ Workout logging with exercise builder
- ✅ AI Coach — live insights + interactive chat
- ✅ Progress analytics with weight trend charts
- ✅ Hydration tracker
- ✅ Body composition estimates (BMI, body fat %)
- ✅ Achievements + XP system
- ✅ Responsive dark-mode UI

---

## 🛠️ Tech Stack

**Backend:** Node.js (built-in `http`, `fs`, `crypto`, `url` modules) — zero npm dependencies  
**Frontend:** Vanilla HTML5, CSS3 (custom design system), JavaScript ES6+  
**Data:** In-memory store with full CRUD (ready to swap with MongoDB/PostgreSQL)  
**Charts:** Custom Canvas API rendering (no chart libraries)  
**Auth:** SHA-256 session tokens, Bearer authorization

---

## 👥 Team Responsibilities (Component-Based)

| Component | Responsibility |
|-----------|---------------|
| Auth System | Registration, login, session management |
| Dashboard | Data aggregation, nutrition scoring |
| Food Tracker | Meal CRUD, macro calculations |
| Workout Lab | Exercise logging, fuel efficiency |
| AI Coach | Insight generation, chat engine |
| Progress Analytics | Charts, stats, body composition |
