# Nutrition Lab – Full-Stack Web Application

Nutrition Lab is a web application that helps users keep track of their nutrition, workouts, and fitness progress. It includes features such as meal tracking, calorie and macronutrient calculations, workout logging, hydration tracking, and progress reports.

The project was built using Node.js for the backend and vanilla HTML, CSS, and JavaScript for the frontend. The backend uses Node.js built-in modules, so no external npm packages are required.

## Quick Start

```bash
# 1. Start the server
node backend/server.js

# 2. Open the application
http://localhost:3000

# 3. Demo account
Email: alex@nutritionlab.com
Password: demo123
```

## Project Structure

```text
nutrition-lab/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── router.js
│   ├── middleware/
│   │   └── auth.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── mealController.js
│   │   ├── workoutController.js
│   │   ├── progressController.js
│   │   └── coachController.js
│   └── data/
│       └── database.js
│
└── frontend/
    ├── index.html
    ├── css/
    │   └── style.css
    ├── js/
    │   └── api.js
    └── pages/
        ├── login.html
        ├── dashboard.html
        ├── tracker.html
        ├── workout.html
        ├── coach.html
        └── progress.html
```

## Architecture and Design Patterns

The backend is organized into separate layers to keep the code easier to manage and maintain.

- **Inversion of Control (IoC):** The router handles incoming requests and decides which controller should process each one. Middleware functions also pass requests through the pipeline using `next()`.
- **Dependency Injection (DI):** Dependencies such as the session store and user store are passed to the authentication middleware instead of being directly created inside it.
- **Layered Architecture:** The application separates the server, routing, middleware, controllers, and data storage. Each layer has a specific role.
- **Single Responsibility Principle:** Controllers are separated based on their tasks, such as authentication, meals, workouts, and progress tracking.

### Backend Request Flow

```text
HTTP Request
     ↓
Server
     ↓
Router
     ↓
Middleware
     ↓
Controller
     ↓
Data Store
     ↓
HTTP Response
```

## REST API

The backend provides REST API endpoints for the main application features.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new account |
| POST | `/api/auth/login` | Log in |
| POST | `/api/auth/logout` | Log out |
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update profile |
| GET | `/api/user/dashboard` | Get dashboard data |
| GET | `/api/meals?date=` | Retrieve meals |
| POST | `/api/meals` | Add a meal |
| DELETE | `/api/meals/:id` | Delete a meal |
| GET | `/api/meals/summary` | Get daily nutrition totals |
| GET | `/api/workouts` | Retrieve workouts |
| POST | `/api/workouts` | Add a workout |
| DELETE | `/api/workouts/:id` | Delete a workout |
| GET | `/api/progress/weight` | Get weight history |
| POST | `/api/progress/weight` | Record weight |
| GET | `/api/progress/water` | Get water intake |
| POST | `/api/progress/water` | Update water intake |
| GET | `/api/progress/stats` | Get progress statistics |
| GET | `/api/coach/insights` | Get coaching insights |
| POST | `/api/coach/chat` | Send a message to the AI Coach |

## Main Features

- User registration, login, and session management
- Dashboard showing daily nutrition information
- Meal tracking with breakfast, lunch, dinner, and snack categories
- Calorie and macronutrient calculations
- Workout logging and exercise tracking
- AI Coach with personalized insights and chat
- Weight tracking and progress charts
- Daily water intake tracking
- BMI and body fat percentage estimates
- Achievements and XP system
- Responsive interface with dark mode

## Technologies Used

**Backend**
- Node.js
- Built-in HTTP, FS, Crypto, and URL modules

**Frontend**
- HTML5
- CSS3
- Vanilla JavaScript (ES6+)

**Data Storage**
- In-memory database with CRUD operations

**Other**
- Canvas API for charts
- Session-based authentication
- REST APIs

## Team Responsibilities

The project was divided into different components, with each team member responsible for a specific part of the application.

| Component | Main Responsibilities |
|---|---|
| Authentication | Registration, login, and session management |
| Dashboard | Displaying user data and calculating nutrition scores |
| Food Tracker | Adding meals and calculating calories and macros |
| Workout Lab | Logging workouts and exercises |
| AI Coach | Generating insights and handling chat messages |
| Progress Analytics | Tracking weight, water intake, and displaying statistics |
