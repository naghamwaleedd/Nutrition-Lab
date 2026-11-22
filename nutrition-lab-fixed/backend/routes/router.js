
const { Router } = require('express');
const { authenticate } = require('../middleware/auth');

const AuthController     = require('../controllers/authController');
const UserController     = require('../controllers/userController');
const MealController     = require('../controllers/mealController');
const WorkoutController  = require('../controllers/workoutController');
const ProgressController = require('../controllers/progressController');
const CoachController    = require('../controllers/coachController');

const router = Router();

// Auth (public)
router.post('/auth/register', AuthController.register);
router.post('/auth/login',    AuthController.login);
router.post('/auth/logout',   authenticate, AuthController.logout);

// User (protected)
router.get('/user/profile',   authenticate, UserController.getProfile);
router.put('/user/profile',   authenticate, UserController.updateProfile);
router.get('/user/dashboard', authenticate, UserController.getDashboard);

// Meals (protected) — summary MUST come before :id
router.get   ('/meals',         authenticate, MealController.getAll);
router.post  ('/meals',         authenticate, MealController.create);
router.get   ('/meals/summary', authenticate, MealController.summary);
router.delete('/meals/:id',     authenticate, MealController.remove);

// Workouts (protected)
router.get   ('/workouts',      authenticate, WorkoutController.getAll);
router.post  ('/workouts',      authenticate, WorkoutController.create);
router.delete('/workouts/:id',  authenticate, WorkoutController.remove);

// Progress (protected)
router.get ('/progress/weight', authenticate, ProgressController.getWeight);
router.post('/progress/weight', authenticate, ProgressController.logWeight);
router.get ('/progress/water',  authenticate, ProgressController.getWater);
router.post('/progress/water',  authenticate, ProgressController.updateWater);
router.get ('/progress/stats',  authenticate, ProgressController.getStats);

// AI Coach (protected)
router.get ('/coach/insights',  authenticate, CoachController.getInsights);
router.post('/coach/chat',      authenticate, CoachController.chat);

module.exports = router;
